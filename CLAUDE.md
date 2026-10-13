# LE STUDIO · Social OS (contexto para Claude Code)

PWA de gestión de clientes y marcas para la agencia LE STUDIO (marketing + IA). Dueño: habla español (Madrid).
Producción: https://social.lestudio-crea.com (Cloudflare Pages) · Backend: Supabase (proyecto nmoxldfgnugoeyawlzhr).
Objetivo a medio plazo: convertirlo en MVP vendible a otras agencias de redes sociales (multi-agencia).

## Stack y reglas
- JS vanilla ES module, sin dependencias ni build. Archivos: index.html, app.js, styles.css, sw.js, aprobar.html/js, manifest, _headers (CSP estricta: nada de scripts/handlers inline).
- Eventos por delegación: tablas ACTIONS / CHANGES con data-act / data-change.
- Supabase vía REST (PostgREST) + RPC; RLS manda. Admin = owner/admin en organization_members; el resto son clientes.
- Responder y comentar siempre en español. Explicar los pasos de forma simple (el dueño no es programador).
- Cada cambio que toque la base de datos debe venir con un SQL repetible en /sql y una guía paso a paso.
- Al subir versión: cambia VERSION en app.js, cache en sw.js y ?v= en index.html.

## Estado (v2.7.0)
Hecho: navegación tipo app móvil/escritorio, tema oscuro, buscador Cmd+K, enlaces de aprobación sin contraseña (sql/05), avisos por email (sql/06 + supabase/functions/notify-outbox, pendiente de desplegar con Resend), borrar publicaciones/tareas (sql/07), plan/facturación/métricas, historial de actividad, planificador de calendario para admin (v2.7: alta rápida por día, arrastrar y soltar con ratón/dedo, bandeja «Sin fecha» + referencias, referencia → idea; ver ACTUALIZAR-v2.7.md).
SQL ya ejecutados por el dueño: REPARAR-SUPABASE (v2.5.1), 04-arreglo-rapido (media_url), 05 (enlaces de aprobación).
Diagnóstico real (sql/00, 13-oct-2026, vía conector Supabase):
- close_plan_period y decide_approval SÍ comprueban rol (can_manage_brand / has_brand_access o is_org_admin). Resuelto.
- Pendiente aplicar: 01 (seguridad + historial; ensayo con rollback OK, 4/4 valores copiados), 06 (avisos email; Edge Function notify-outbox sin desplegar), 07 (falta solo el permiso de borrar TAREAS; borrar publicaciones ya existe).
- Pendiente (opcional): 08 (content_items.reference_id; la app funciona sin él).
- Después del 01 y de comprobar la web: 02 (borra la columna allocation).
- Advisor: activar "Leaked password protection" en Auth; varias funciones SECURITY DEFINER ejecutables por anon (revisar revocar EXECUTE).
- Las escrituras por el conector (apply_migration) dieron timeout de 60 s; si pasa, ejecutar los SQL a mano en el SQL Editor.

## Hoja de ruta acordada (el dueño decide sí/no)
Siguientes: roles de equipo, alta de agencia + marca blanca, informe mensual PDF, plantillas/parrilla mensual, facturas recurrentes. Más adelante: Stripe, métricas Meta API, comentarios sobre imagen, aprobación tipo swipe.

## Pruebas
No hay acceso directo al Supabase real desde la nube; las pruebas usaron backend simulado (jsdom + pglite + puppeteer). Con Claude Code local y conector de Supabase se puede verificar contra el proyecto real.

## Estructura del repositorio
- `public/` → la web que publica Cloudflare Pages (proyecto `lestudio-os`, rama `main`, sin build, carpeta de salida `public`).
- `sql/` → scripts para Supabase (no se publican).
- `supabase/functions/` → Edge Functions de Supabase (fuera de la raíz para que Cloudflare no las confunda con Pages Functions).
- Las capturas `_capturas/` no se suben al repositorio.
