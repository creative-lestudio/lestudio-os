// LE STUDIO · Aprobación por enlace (sin contraseña). Solo usa 2 funciones públicas de la BD.
document.documentElement.dataset.theme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
const URL_ = 'https://nmoxldfgnugoeyawlzhr.supabase.co', KEY = 'sb_publishable_cvbOwwc3rhoh0Ye77lz8Lw_h9UgqEVx';
const $ = s => document.querySelector(s), root = $('#ap');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const safeUrl = u => (/^https:\/\//i.test(u || '') ? u : '');
const token = (location.hash.match(/t=([a-f0-9]+)/i) || [])[1] || '';
const L = { instagram: 'Instagram', facebook: 'Facebook', tiktok: 'TikTok', linkedin: 'LinkedIn', pinterest: 'Pinterest', post: 'Post', reel: 'Reel', story: 'Story', carousel: 'Carrusel', video: 'Vídeo' };
const call = async (fn, body) => {
  const r = await fetch(`${URL_}/rest/v1/rpc/${fn}`, { method: 'POST', headers: { apikey: KEY, Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw Error(j.message || 'Error de conexión');
  return j;
};
const fmt = d => (d ? new Date(d).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '');
const msg = (icon, title, text) => { root.innerHTML = `<div class="ap-card ap-center"><div class="ap-ico">${icon}</div><h1>${esc(title)}</h1><p class="subtle">${esc(text)}</p></div>`; };

function draw(d) {
  if (d.color && /^#[0-9a-f]{6}$/i.test(d.color)) document.documentElement.style.setProperty('--accent', d.color);
  const meta = [L[d.platform] || d.platform, L[d.format] || d.format, fmt(d.scheduled_at)].filter(Boolean).join(' · ');
  root.innerHTML = `<div class="ap-card">
    <div class="ap-head">${d.logo && safeUrl(d.logo) ? `<img src="${esc(safeUrl(d.logo))}" alt="" referrerpolicy="no-referrer">` : ''}<div><small>REVISIÓN DE PUBLICACIÓN</small><b>${esc(d.brand)}</b></div></div>
    <h1>${esc(d.title)}</h1>${meta ? `<p class="subtle">${esc(meta)}</p>` : ''}
    ${d.media_url && safeUrl(d.media_url) ? `<img class="ap-media" src="${esc(safeUrl(d.media_url))}" alt="Pieza propuesta" referrerpolicy="no-referrer">` : ''}
    <div class="approval-preview"><div class="eyebrow">TEXTO PROPUESTO</div><p>${esc(d.caption || 'Sin texto adjunto.')}</p></div>
    ${(d.comments || []).length ? `<div class="review-chat"><b>Comentarios</b>${d.comments.map(c => `<div class="comment"><small>${c.mine ? 'Tú' : 'LE STUDIO'} · ${esc(fmt(c.at))}</small><p>${esc(c.body)}</p></div>`).join('')}</div>` : ''}
    <label class="label">¿Quieres cambiar algo? Cuéntanoslo<textarea class="input" id="ap-text" rows="3" maxlength="2000" placeholder="Escribe aquí…"></textarea></label>
    <p class="form-error" id="ap-err" role="alert"></p>
    <div class="ap-actions"><button class="primary ap-ok" data-d="approved">Aprobar</button><button class="secondary" data-d="changes_requested">Pedir cambios</button></div>
    <p class="footnote" style="text-align:center">Enlace privado de un solo uso. No necesitas cuenta.</p></div>`;
  root.querySelectorAll('[data-d]').forEach(b => b.onclick = async () => {
    const decision = b.dataset.d, text = $('#ap-text').value.trim(), err = $('#ap-err');
    if (decision === 'changes_requested' && !text) { err.textContent = 'Cuéntanos qué cambios necesitas.'; $('#ap-text').focus(); return; }
    if (decision === 'approved' && !confirm('¿Aprobar la publicación tal como está?')) return;
    root.querySelectorAll('button').forEach(x => { x.disabled = true; }); err.textContent = '';
    try {
      await call('decide_approval_by_token', { p_token: token, p_decision: decision, p_comment: text || null });
      history.replaceState(null, '', location.pathname);
      msg(decision === 'approved' ? '✓' : '✎', decision === 'approved' ? '¡Aprobada, gracias!' : 'Cambios enviados', decision === 'approved' ? 'LE STUDIO programará la publicación tal como la has visto.' : 'Lo revisamos y te enviamos una nueva versión.');
    } catch (e) { err.textContent = e.message; root.querySelectorAll('button').forEach(x => { x.disabled = false; }); }
  });
}

(async () => {
  if (!token) return msg('?', 'Enlace incompleto', 'Abre el enlace completo que te enviamos.');
  try {
    const d = await call('get_approval_by_token', { p_token: token });
    if (d.state === 'invalid') return msg('?', 'Enlace no válido', 'Pide a LE STUDIO que te envíe uno nuevo.');
    if (d.state === 'expired') return msg('⏱', 'Enlace caducado', 'Pide a LE STUDIO que te envíe uno nuevo.');
    if (d.state === 'done') return msg('✓', 'Ya está resuelto', 'Esta publicación ya fue revisada. ¡Gracias!');
    draw(d);
  } catch (e) { msg('!', 'No se pudo cargar', 'Revisa tu conexión e inténtalo de nuevo.'); }
})();
