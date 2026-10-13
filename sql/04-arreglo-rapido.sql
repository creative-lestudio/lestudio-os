-- LE STUDIO Social OS · ARREGLO RÁPIDO (seguro, se puede repetir)
-- Supabase → SQL Editor → pega todo → Run.
-- Soluciona: "Falta ejecutar el SQL ... media_url" al guardar contenido con imagen.

alter table public.content_items add column if not exists media_url text;

-- Permite ajustes negativos en el plan (descuentos/abonos) y mantiene precios normales >= 0
do $$
declare c text;
begin
  for c in select conname from pg_constraint
           where conrelid = 'public.plan_deliveries'::regclass and contype = 'c'
             and pg_get_constraintdef(oid) ilike '%unit_price%'
  loop execute format('alter table public.plan_deliveries drop constraint %I', c); end loop;
  alter table public.plan_deliveries add constraint plan_deliveries_unit_price_chk
    check (kind = 'adjustment' or unit_price >= 0);
exception when undefined_table or undefined_column then
  raise notice 'plan_deliveries no encontrada: omitido (no es grave)';
end $$;

notify pgrst, 'reload schema';

-- Comprobación: debe devolver una fila con correcto = true
select 'content_items.media_url' as comprobacion,
  exists(select 1 from information_schema.columns
         where table_schema='public' and table_name='content_items' and column_name='media_url') as correcto;
