# Actualización v2.6 — paso a paso

Qué trae: modo oscuro · buscador (Ctrl/Cmd+K) · enlace de aprobación sin contraseña · avisos por email.

## 0. Antes de empezar (2 min)
Supabase → Database → Backups: comprueba que hay copia reciente.

## 1. Subir la web
Sube/sustituye en tu hosting: `index.html, app.js, styles.css, sw.js, aprobar.html, aprobar.js, _headers`
(y el resto igual que antes). Es nuevo: **aprobar.html** y **aprobar.js**.
Si ya hiciste el arreglo `sql/04-arreglo-rapido.sql`, no lo repitas.

## 2. Enlaces de aprobación (SQL)
Supabase → SQL Editor → New query → pega `sql/05-enlaces-aprobacion.sql` → Run.
Resultado esperado: 3 filas (`create_approval_link`, `decide_approval_by_token`, `get_approval_by_token`).
**Cómo se usa:** Aprobaciones → abre una pendiente → «Enviar enlace al cliente» → escribe el email de la cuenta
del cliente → «Crear enlace» → copia o envía por WhatsApp/Email. El cliente abre el enlace y aprueba o pide cambios.
Solo funciona con clientes que ya tengan cuenta y acceso a esa marca. El enlace caduca y sirve una vez.

## 3. Avisos por email
a) SQL: pega `sql/06-avisos-email.sql` → Run. (Crea la cola y los disparadores.)
b) Cuenta de envío: crea cuenta gratis en resend.com, verifica tu dominio (lestudio-crea.com) y copia la API key.
c) Edge Function: Supabase → Edge Functions → Deploy a new function → nombre `notify-outbox` → pega el contenido de
   `supabase/functions/notify-outbox/index.ts`.
d) Secrets (Edge Functions → Secrets): `RESEND_API_KEY` = tu clave · `MAIL_FROM` = `LE STUDIO <avisos@lestudio-crea.com>`.
e) Activar el envío automático: Database → Webhooks → Create → tabla `notification_outbox`, evento INSERT,
   tipo «Supabase Edge Functions», función `notify-outbox`.
Prueba: crea una solicitud de aprobación → debe llegar un email al cliente en menos de un minuto.
Si no llega: tabla `notification_outbox`, columna `error`.

## 4. Comprobar
Recarga con Cmd+Shift+R. Prueba: botón luna/sol (tema), Ctrl/Cmd+K (buscar), y un enlace de aprobación en el móvil.

## Pendiente de tu lado
`sql/00-diagnostico.sql` y `sql/01-migracion-v2.5.sql` (seguridad de importes internos): pásame el resultado del 00 y lo revisamos antes del 01.
