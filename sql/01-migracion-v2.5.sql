-- ============================================================================
-- LE STUDIO · Social OS v2.5 — MIGRACIÓN (ejecutar ANTES de subir la web nueva)
-- Supabase → SQL Editor → pega todo → Run.   Es idempotente (se puede repetir).
-- Haz una copia de seguridad antes (Database → Backups).
-- Supuestos sobre tu esquema (por lo que usa la app): organization_members(organization_id,user_id,role),
-- service_plans(id,organization_id,brand_id,...), service_plan_items(id,plan_id,...),
-- plan_periods(id,plan_id,starts_on,ends_on,status), plan_deliveries(id,period_id,kind,unit_price,...),
-- plan_invoices(id,period_id,...), plan_payments(id,invoice_id,...), content_items, content_approvals(organization_id,...).
-- ============================================================================
begin;

-- 0) Ayudante de rol: ¿el usuario actual es owner/admin de esa organización?
create or replace function public.ls_is_admin(p_org uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.organization_members m
    where m.organization_id = p_org and m.user_id = auth.uid() and m.role in ('owner','admin')
  );
$$;
revoke all on function public.ls_is_admin(uuid) from public, anon;
grant execute on function public.ls_is_admin(uuid) to authenticated;

-- 1) Valor interno de cada servicio (allocation) en una tabla SOLO-ADMIN.
--    Hoy vive en service_plan_items, que también leen los clientes.
create table if not exists public.service_plan_item_values (
  item_id uuid primary key references public.service_plan_items(id) on delete cascade,
  allocation numeric
);
alter table public.service_plan_item_values enable row level security;
drop policy if exists ls_item_values_admin on public.service_plan_item_values;
create policy ls_item_values_admin on public.service_plan_item_values
  for all to authenticated
  using (exists (select 1 from public.service_plan_items i join public.service_plans p on p.id = i.plan_id
                 where i.id = item_id and public.ls_is_admin(p.organization_id)))
  with check (exists (select 1 from public.service_plan_items i join public.service_plans p on p.id = i.plan_id
                 where i.id = item_id and public.ls_is_admin(p.organization_id)));
grant select, insert, update, delete on public.service_plan_item_values to authenticated;

do $$ begin
  if exists (select 1 from information_schema.columns
             where table_schema='public' and table_name='service_plan_items' and column_name='allocation') then
    insert into public.service_plan_item_values (item_id, allocation)
    select id, allocation from public.service_plan_items where allocation is not null
    on conflict (item_id) do nothing;
  end if;
end $$;

-- 2) Imagen / pieza de cada publicación (para que el cliente vea lo que aprueba).
alter table public.content_items add column if not exists media_url text;

-- 3) Permitir descuentos: solo los AJUSTES pueden tener precio negativo.
--    (Elimina cualquier CHECK previo que mencione unit_price y pone uno nuevo.)
do $$ declare c record; begin
  for c in select conname from pg_constraint
           where conrelid = 'public.plan_deliveries'::regclass and contype = 'c'
             and pg_get_constraintdef(oid) ilike '%unit_price%'
  loop execute format('alter table public.plan_deliveries drop constraint %I', c.conname); end loop;
end $$;
alter table public.plan_deliveries
  add constraint plan_deliveries_unit_price_chk check (kind = 'adjustment' or unit_price >= 0);

-- 4) Registro de actividad (quién cambió qué y cuándo). Solo lo leen los admins; solo lo escriben los triggers.
create table if not exists public.activity_log (
  id bigint generated always as identity primary key,
  organization_id uuid,
  actor_id uuid,
  entity text not null,
  entity_id uuid,
  action text not null,
  detail jsonb,
  created_at timestamptz not null default now()
);
create index if not exists activity_log_org_created on public.activity_log (organization_id, created_at desc);
alter table public.activity_log enable row level security;
drop policy if exists ls_activity_read on public.activity_log;
create policy ls_activity_read on public.activity_log for select to authenticated
  using (organization_id is not null and public.ls_is_admin(organization_id));
revoke insert, update, delete on public.activity_log from authenticated, anon;
grant select on public.activity_log to authenticated;

create or replace function public.ls_log_change() returns trigger
language plpgsql security definer set search_path = public as $$
declare r jsonb; d jsonb; org uuid;
begin
  if tg_op = 'DELETE' then r := to_jsonb(old); d := jsonb_build_object('old', r);
  elsif tg_op = 'UPDATE' then r := to_jsonb(new); d := jsonb_build_object('old', to_jsonb(old), 'new', r);
  else r := to_jsonb(new); d := jsonb_build_object('new', r); end if;

  org := nullif(r->>'organization_id', '')::uuid;
  if org is null then
    if tg_table_name = 'plan_periods' then
      select p.organization_id into org from public.service_plans p where p.id = (r->>'plan_id')::uuid;
    elsif tg_table_name in ('plan_invoices','plan_deliveries') then
      select p.organization_id into org from public.plan_periods per join public.service_plans p on p.id = per.plan_id
      where per.id = (r->>'period_id')::uuid;
    elsif tg_table_name = 'plan_payments' then
      select p.organization_id into org from public.plan_invoices i
        join public.plan_periods per on per.id = i.period_id join public.service_plans p on p.id = per.plan_id
      where i.id = (r->>'invoice_id')::uuid;
    end if;
  end if;

  insert into public.activity_log (organization_id, actor_id, entity, entity_id, action, detail)
  values (org, auth.uid(), tg_table_name, nullif(r->>'id','')::uuid, lower(tg_op), d);
  if tg_op = 'DELETE' then return old; else return new; end if;
end $$;
revoke all on function public.ls_log_change() from public, anon, authenticated;

do $$ declare t text; begin
  foreach t in array array['service_plans','plan_periods','plan_deliveries','plan_invoices','plan_payments','content_approvals','brands','clients']
  loop
    if to_regclass('public.' || t) is not null then
      execute format('drop trigger if exists ls_audit on public.%I', t);
      execute format('create trigger ls_audit after insert or update or delete on public.%I for each row execute function public.ls_log_change()', t);
    end if;
  end loop;
end $$;

commit;

-- Comprobación rápida (debe devolver filas/true):
-- select count(*) from public.service_plan_item_values;
-- select column_name from information_schema.columns where table_name='content_items' and column_name='media_url';
