-- ============================================================================
-- 02 · EJECUTAR SOLO DESPUÉS de subir la web v2.5 y comprobar que "Plan" funciona.
-- Elimina la columna interna 'allocation' de service_plan_items. Mientras exista, un cliente
-- técnico podría leerla directamente por la API (aunque la web no se la muestre).
-- Si ejecutas esto con la web antigua en producción, la web antigua dejará de poder guardar servicios.
-- ============================================================================
-- Antes de borrar, comprueba que todo se copió (los dos números deben coincidir):
select
  (select count(*) from public.service_plan_items where allocation is not null) as con_valor_en_items,
  (select count(*) from public.service_plan_item_values where allocation is not null) as con_valor_en_tabla_nueva;

-- Si coinciden, descomenta y ejecuta:
-- alter table public.service_plan_items drop column allocation;
