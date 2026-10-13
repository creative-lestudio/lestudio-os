-- ============================================================================
-- LE STUDIO · Social OS v2.6 — AVISOS POR EMAIL (cola de envío)
-- Paso 1 de 2. Esto solo CREA la cola y los disparadores. El envío lo hace la Edge Function
-- «notify-outbox» (ver supabase/functions/notify-outbox/index.ts y la guía LEEME). Repetible.
-- Quién recibe qué:
--   · Cliente: nueva publicación por aprobar · comentario del equipo
--   · Equipo (owner/admin): el cliente aprobó o pidió cambios · comentario del cliente
-- ============================================================================
begin;

create table if not exists public.notification_outbox (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  email text not null,
  kind text not null,
  title text not null,
  body text not null default '',
  link text,
  created_at timestamptz not null default now(),
  sent_at timestamptz,
  error text
);
create index if not exists notification_outbox_pending_idx on public.notification_outbox(created_at) where sent_at is null;
alter table public.notification_outbox enable row level security;
revoke all on public.notification_outbox from anon, authenticated;   -- solo la Edge Function (service role)

-- Preferencias: cada usuario puede silenciar los avisos por email.
create table if not exists public.notification_prefs (
  user_id uuid primary key default auth.uid(),
  email_enabled boolean not null default true
);
alter table public.notification_prefs enable row level security;
drop policy if exists ls_prefs_own on public.notification_prefs;
create policy ls_prefs_own on public.notification_prefs for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
grant select, insert, update on public.notification_prefs to authenticated;

-- Clientes de una marca (usa tu función has_brand_access actuando como cada usuario no-admin de la organización).
create or replace function public.ls_brand_clients(p_org uuid, p_brand uuid)
returns setof uuid language plpgsql security definer set search_path = public as $$
declare r record; old text; oldsub text; ok boolean;
begin
  old := current_setting('request.jwt.claims', true); oldsub := current_setting('request.jwt.claim.sub', true);
  for r in select distinct user_id from public.organization_members where organization_id = p_org and role not in ('owner','admin') loop
    perform set_config('request.jwt.claims', json_build_object('sub', r.user_id, 'role', 'authenticated')::text, true);
    perform set_config('request.jwt.claim.sub', r.user_id::text, true);
    select public.has_brand_access(p_brand) into ok;
    if coalesce(ok, false) then return next r.user_id; end if;
  end loop;
  perform set_config('request.jwt.claims', coalesce(old, ''), true); perform set_config('request.jwt.claim.sub', coalesce(oldsub, ''), true);
  return;
end $$;
revoke all on function public.ls_brand_clients(uuid, uuid) from public, anon, authenticated;

create or replace function public.ls_enqueue(p_users uuid[], p_kind text, p_title text, p_body text, p_link text)
returns void language sql security definer set search_path = public as $$
  insert into public.notification_outbox(user_id, email, kind, title, body, link)
  select u.id, u.email, p_kind, p_title, p_body, p_link
  from auth.users u
  where u.id = any(p_users) and u.email is not null
    and coalesce((select email_enabled from public.notification_prefs p where p.user_id = u.id), true);
$$;
revoke all on function public.ls_enqueue(uuid[], text, text, text, text) from public, anon, authenticated;

create or replace function public.ls_trg_approval() returns trigger language plpgsql security definer set search_path = public as $$
declare ci record; br text; admins uuid[]; clients uuid[]; site text := 'https://social.lestudio-crea.com/';
begin
  select c.title, c.brand_id into ci from public.content_items c where c.id = new.content_id;
  select name into br from public.brands where id = ci.brand_id;
  if tg_op = 'INSERT' and new.status = 'pending' then
    select coalesce(array_agg(x), '{}') into clients from public.ls_brand_clients(new.organization_id, ci.brand_id) x;
    perform public.ls_enqueue(clients, 'review_requested', 'Tienes una publicación por aprobar', br || ' · «' || coalesce(ci.title, 'Publicación') || '»', site);
  elsif tg_op = 'UPDATE' and old.status = 'pending' and new.status in ('approved', 'changes_requested') then
    select coalesce(array_agg(user_id), '{}') into admins from public.organization_members where organization_id = new.organization_id and role in ('owner','admin');
    perform public.ls_enqueue(admins, 'decided',
      case when new.status = 'approved' then 'Publicación aprobada' else 'El cliente pide cambios' end,
      br || ' · «' || coalesce(ci.title, 'Publicación') || '»', site);
  end if;
  return new;
end $$;
drop trigger if exists ls_notify_approval on public.content_approvals;
create trigger ls_notify_approval after insert or update of status on public.content_approvals
  for each row execute function public.ls_trg_approval();

create or replace function public.ls_trg_comment() returns trigger language plpgsql security definer set search_path = public as $$
declare ap record; ci record; br text; by_admin boolean; us uuid[]; site text := 'https://social.lestudio-crea.com/';
begin
  select a.organization_id, a.content_id into ap from public.content_approvals a where a.id = new.approval_id;
  if ap.content_id is null then return new; end if;
  select c.title, c.brand_id into ci from public.content_items c where c.id = ap.content_id;
  select name into br from public.brands where id = ci.brand_id;
  select exists(select 1 from public.organization_members where organization_id = ap.organization_id and user_id = new.author_id and role in ('owner','admin')) into by_admin;
  if by_admin then
    select coalesce(array_agg(x), '{}') into us from public.ls_brand_clients(ap.organization_id, ci.brand_id) x;
    perform public.ls_enqueue(us, 'comment', 'Nuevo comentario de LE STUDIO', br || ' · «' || coalesce(ci.title, '') || '»: ' || left(new.body, 160), site);
  else
    select coalesce(array_agg(user_id), '{}') into us from public.organization_members where organization_id = ap.organization_id and role in ('owner','admin');
    perform public.ls_enqueue(us, 'comment', 'Nuevo comentario del cliente', br || ' · «' || coalesce(ci.title, '') || '»: ' || left(new.body, 160), site);
  end if;
  return new;
end $$;
drop trigger if exists ls_notify_comment on public.approval_comments;
create trigger ls_notify_comment after insert on public.approval_comments
  for each row execute function public.ls_trg_comment();

commit;
notify pgrst, 'reload schema';
select 'cola de avisos lista' as resultado, (select count(*) from public.notification_outbox) as pendientes;
