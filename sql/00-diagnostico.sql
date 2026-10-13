-- ============================================================================
-- 00 · DIAGNÓSTICO (solo lectura). Ejecútalo ANTES de la migración y revisa el resultado.
-- No cambia nada. No he podido ver tus políticas RLS ni tus funciones reales,
-- así que esto sirve para comprobar lo que hoy está desplegado.
-- ============================================================================

-- 1) Funciones críticas: ¿comprueban que quien llama es admin DENTRO de la función?
--    Busca algo como ls_is_admin(...) / organization_members con role in ('owner','admin').
--    Si prosecdef = true (SECURITY DEFINER) y NO hay comprobación de rol, cualquier usuario
--    autenticado podría cerrar periodos o decidir aprobaciones ajenas.
select p.proname, p.prosecdef as security_definer, pg_get_functiondef(p.oid) as definicion
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.proname in ('close_plan_period', 'decide_approval');

-- 2) Políticas por tabla. Las escrituras (insert/update/delete) de estas tablas deben ser SOLO de admin.
select tablename, policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('service_plans','service_plan_items','service_plan_extras','plan_periods','plan_deliveries',
                    'plan_invoices','plan_payments','brand_metrics','content_items','content_approvals',
                    'approval_comments','tasks','clients','brands','content_references','organization_members')
order by tablename, cmd, policyname;

-- 3) Tablas del esquema public SIN RLS activado (deberían ser ninguna, salvo catálogos públicos).
select c.relname as tabla_sin_rls
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity
order by 1;

-- 4) Restricciones CHECK de las tablas del módulo (¿hay un unit_price >= 0 que impida descuentos?).
select conrelid::regclass as tabla, conname, pg_get_constraintdef(oid) as definicion
from pg_constraint
where contype = 'c' and conrelid::regclass::text in
  ('public.plan_deliveries','public.service_plans','public.plan_invoices','public.plan_payments','public.plan_periods');

-- 5) Columnas internas que hoy ve un cliente por la API (si 'allocation' aparece aquí, es visible).
select table_name, column_name
from information_schema.columns
where table_schema = 'public' and column_name in ('allocation','notes') 
  and table_name in ('service_plan_items','service_plans','clients','tasks','plan_deliveries');
