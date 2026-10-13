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

## Estado (v2.6.1)
Hecho: navegación tipo app móvil/escritorio, tema oscuro, buscador Cmd+K, enlaces de aprobación sin contraseña (sql/05), avisos por email (sql/06 + supabase/functions/notify-outbox, pendiente de desplegar con Resend), borrar publicaciones/tareas (sql/07), plan/facturación/métricas, historial de actividad.
SQL ya ejecutados por el dueño: REPARAR-SUPABASE (v2.5.1), 04-arreglo-rapido (media_url). Pendiente confirmar: 05, 06, 07.
Pendiente: pasar sql/00-diagnostico.sql y revisar su resultado ANTES de sql/01-migracion-v2.5.sql (oculta importes internos a clientes; seguridad). Verificar que close_plan_period y decide_approval comprueben rol.

## Hoja de ruta acordada (el dueño decide sí/no)
Siguientes: roles de equipo, alta de agencia + marca blanca, informe mensual PDF, plantillas/parrilla mensual, facturas recurrentes. Más adelante: Stripe, métricas Meta API, comentarios sobre imagen, calendario arrastrable, aprobación tipo swipe.

## Pruebas
No hay acceso directo al Supabase real desde la nube; las pruebas usaron backend simulado (jsdom + pglite + puppeteer). Con Claude Code local y conector de Supabase se puede verificar contra el proyecto real.

## Estructura del repositorio
- `public/` → la web que publica Cloudflare Pages (proyecto `lestudio-os`, rama `main`, sin build, carpeta de salida `public`).
- `sql/` → scripts para Supabase (no se publican).
- `supabase/functions/` → Edge Functions de Supabase (fuera de la raíz para que Cloudflare no las confunda con Pages Functions).
- Las capturas `_capturas/` no se suben al repositorio.
