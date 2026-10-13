// Edge Function «notify-outbox»: envía por email las filas pendientes de notification_outbox usando Resend.
// Secretos necesarios (Supabase → Edge Functions → Secrets):  RESEND_API_KEY, MAIL_FROM  (ej. "LE STUDIO <avisos@lestudio-crea.com>")
// SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY ya existen automáticamente.
// Se activa con un Database Webhook (INSERT en notification_outbox) o con un cron cada minuto.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

Deno.serve(async (req) => {
  const secret = Deno.env.get("WEBHOOK_SECRET");
  if (secret && req.headers.get("x-webhook-secret") !== secret) return new Response("forbidden", { status: 403 });
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const key = Deno.env.get("RESEND_API_KEY"), from = Deno.env.get("MAIL_FROM");
  if (!key || !from) return new Response("Falta RESEND_API_KEY o MAIL_FROM", { status: 500 });

  const { data: rows, error } = await sb.from("notification_outbox").select("*").is("sent_at", null).order("created_at").limit(25);
  if (error) return new Response(error.message, { status: 500 });
  let sent = 0;
  for (const n of rows ?? []) {
    const html = `<div style="font-family:-apple-system,Segoe UI,Arial,sans-serif;max-width:520px;margin:auto;padding:24px">
      <h2 style="margin:0 0 8px;color:#032167">${esc(n.title)}</h2><p style="color:#52627d;font-size:15px;line-height:1.5">${esc(n.body)}</p>
      ${n.link ? `<p><a href="${esc(n.link)}" style="display:inline-block;background:#032167;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:600">Abrir Social OS</a></p>` : ""}
      <p style="color:#8391ab;font-size:12px">LE STUDIO · Social OS</p></div>`;
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [n.email], subject: n.title, html }),
    });
    if (r.ok) { await sb.from("notification_outbox").update({ sent_at: new Date().toISOString(), error: null }).eq("id", n.id); sent++; }
    else { await sb.from("notification_outbox").update({ error: (await r.text()).slice(0, 300) }).eq("id", n.id); }
  }
  return new Response(JSON.stringify({ sent, pending: (rows?.length ?? 0) - sent }), { headers: { "Content-Type": "application/json" } });
});
