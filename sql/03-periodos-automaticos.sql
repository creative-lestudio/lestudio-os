-- ============================================================================
-- 03 · OPCIONAL — Apertura automática del siguiente periodo de cada plan.
-- Crea el periodo del ciclo actual si un plan (con cuota definida) no tiene ninguno que cubra hoy.
-- NO cierra periodos ni factura nada: cerrar sigue siendo una decisión tuya.
-- Requiere la extensión pg_cron: Supabase → Database → Extensions → pg_cron → Enable.
-- ============================================================================
create or replace function public.ls_open_due_periods() returns integer
language plpgsql security definer set search_path = public as $$
declare r record; d int; m0 date; s date; nm date; ns date; e date; n int := 0;
begin
  for r in select id, started_on from public.service_plans where base_fee is not null and started_on <= current_date loop
    if exists (select 1 from public.plan_periods where plan_id = r.id and starts_on <= current_date and ends_on >= current_date) then continue; end if;
    d  := extract(day from r.started_on)::int;
    m0 := date_trunc('month', current_date)::date;
    s  := m0 + (least(d, extract(day from (m0 + interval '1 month - 1 day'))::int) - 1);
    if s > current_date then
      m0 := (m0 - interval '1 month')::date;
      s  := m0 + (least(d, extract(day from (m0 + interval '1 month - 1 day'))::int) - 1);
    end if;
    if s < r.started_on then s := r.started_on; end if;
    nm := (date_trunc('month', s) + interval '1 month')::date;
    ns := nm + (least(d, extract(day from (nm + interval '1 month - 1 day'))::int) - 1);
    e  := ns - 1;
    if not exists (select 1 from public.plan_periods where plan_id = r.id and starts_on <= e and ends_on >= s) then
      insert into public.plan_periods (plan_id, starts_on, ends_on) values (r.id, s, e);
      n := n + 1;
    end if;
  end loop;
  return n;
end $$;
revoke all on function public.ls_open_due_periods() from public, anon, authenticated;

-- Programarlo cada día a las 05:10 UTC (descomenta tras activar pg_cron):
-- select cron.schedule('ls-open-periods', '10 5 * * *', $$select public.ls_open_due_periods()$$);
-- Para probarlo a mano una vez:   select public.ls_open_due_periods();
