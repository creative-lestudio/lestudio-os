# Social OS v2.5 · Guía de despliegue

## Orden recomendado
1. **Copia de seguridad** de Supabase (Database → Backups) antes de tocar nada.
2. Ejecuta `sql/00-diagnostico.sql` (solo lectura). Revisa que `close_plan_period` y `decide_approval` comprueban que quien llama es admin / cliente de la marca, y que no hay tablas sin RLS.
3. Ejecuta `sql/01-migracion-v2.5.sql` (idempotente). Crea `service_plan_item_values`, `media_url`, `activity_log` + triggers y permite ajustes negativos.
4. Sube a tu hosting: `index.html, app.js, styles.css, sw.js, manifest.webmanifest, _headers`, iconos y logos (raíz del sitio). Borra `billing-module.js` (ya integrado en app.js).
5. Prueba como admin y como cliente (móvil y escritorio). Cierra sesión y vuelve a entrar en los dispositivos que tenían la v2.4 para que se actualice la caché.
6. Solo cuando todo funcione: `sql/02-despues-de-desplegar.sql` (verifica la copia y, si quieres, elimina `allocation` de la tabla visible por clientes).
7. Opcional: `sql/03-periodos-automaticos.sql` (pg_cron; abre periodos, nunca cierra ni factura).

## Comprobar en tu Supabase
- Edge Function `invite-brand-client` desplegada (la usa "Invitar cliente").
- Bucket `brand-public` existente.
- Si tu host no usa `_headers` (Cloudflare Pages / Netlify sí), replica la CSP en su configuración. Si usas otro dominio de Supabase, cámbialo en `connect-src`.

## Qué cambia
Navegación tipo app (barra inferior y hojas en móvil, barra lateral en escritorio), inicio con "requiere tu atención", vista cliente simplificada, token sin carreras, fechas locales, paginación >1000 filas, importes y notas internas ocultos al cliente, PWA con service worker e iconos legibles, CSP, historial de actividad, exportación CSV/informe imprimible.

`_capturas/` son vistas previas; puedes no subirla.
