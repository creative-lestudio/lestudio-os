// ============================================================================
// LE STUDIO · Social OS  v2.7.0
// Un solo fichero, sin dependencias. Supabase (Auth + PostgREST + Storage).
// ============================================================================
const VERSION = '2.7.0';
const SUPABASE_URL = 'https://nmoxldfgnugoeyawlzhr.supabase.co';
const ANON_KEY = 'sb_publishable_cvbOwwc3rhoh0Ye77lz8Lw_h9UgqEVx';
const SKEY = 'ls-social-session-v25';
const PAGE = 1000;

// ---------- utilidades ----------
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s = '') => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const safeUrl = s => { try { const u = new URL(String(s || '')); return ['https:', 'http:'].includes(u.protocol) ? u.href : '#'; } catch { return '#'; } };
const num = v => Number(v) || 0;
const fNum = v => new Intl.NumberFormat('es-ES', { maximumFractionDigits: 2 }).format(num(v));
const money = (n, c = 'EUR') => new Intl.NumberFormat('es-ES', { style: 'currency', currency: c || 'EUR' }).format(num(n));
const pad = n => String(n).padStart(2, '0');
// Fechas: "YYYY-MM-DD" locales (no UTC) para que un post a las 00:30 caiga en su día real.
const localISO = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const localDay = s => (s ? localISO(new Date(s)) : '');
const asDate = s => new Date(s + 'T12:00:00Z');
const isoUTC = d => d.toISOString().slice(0, 10);
const fmtDay = d => (d ? asDate(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }) : '—');
const fmtDateTime = s => (s ? new Date(s).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—');
const daysBetween = (a, b) => Math.round((asDate(b) - asDate(a)) / 86400000);
const ago = s => { const d = Math.floor((Date.now() - new Date(s)) / 86400000); return d <= 0 ? 'hoy' : d === 1 ? 'ayer' : `hace ${d} días`; };

const LBL = {
  idea: 'Idea', production: 'En producción', review: 'En revisión', approved: 'Aprobado', scheduled: 'Programado', published: 'Publicado',
  pending: 'Pendiente', in_progress: 'En curso', completed: 'Completado', cancelled: 'Cancelado', changes_requested: 'Cambios solicitados',
  low: 'Baja', medium: 'Media', high: 'Alta', included: 'Incluido', extra: 'Extra', adjustment: 'Ajuste', draft: 'Borrador', issued: 'Emitida',
  post: 'Post', reel: 'Reel', story: 'Story', carousel: 'Carrusel', video: 'Vídeo', other: 'Otro',
  instagram: 'Instagram', facebook: 'Facebook', tiktok: 'TikTok', linkedin: 'LinkedIn', pinterest: 'Pinterest', open: 'Abierto', closed: 'Cerrado'
};
const lbl = k => LBL[k] || k || '—';
const TONE = { approved: 'ok', completed: 'ok', published: 'ok', scheduled: 'info', review: 'warn', pending: 'warn', changes_requested: 'bad', cancelled: 'muted', idea: 'muted', production: 'info', in_progress: 'info', high: 'bad', medium: 'warn', low: 'muted', closed: 'muted', open: 'info' };
const pill = (label, tone = '') => `<span class="pill ${tone}">${esc(label)}</span>`;
const sPill = k => pill(lbl(k), TONE[k] || '');

const ICONS = {
  home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',
  users: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M16 5.5a3 3 0 010 5.5M18 14.3c2 .8 3.3 2.7 3.3 5.2"/>',
  layers: '<path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/>',
  check: '<circle cx="12" cy="12" r="9"/><path d="M8 12.5l3 3 5-6"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  wallet: '<rect x="3" y="6" width="18" height="14" rx="3"/><path d="M3 10h18M16 15h2"/>',
  list: '<path d="M9 6h11M9 12h11M9 18h11"/><path d="M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2"/>',
  image: '<rect x="3.5" y="4" width="17" height="16" rx="3"/><circle cx="9" cy="10" r="1.8"/><path d="M4 18l5-5 4 4 3-3 4 4"/>',
  more: '<circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/>',
  chart: '<path d="M4 20V4M4 20h16"/><path d="M8 15l4-4 3 3 5-6"/>',
  plan: '<path d="M7 3h8l4 4v14H7z"/><path d="M15 3v4h4M10 12h6M10 16h6"/>',
  logout: '<path d="M10 4H5v16h5M15 8l4 4-4 4M19 12H9"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  download: '<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>',
  chevron: '<path d="M9 6l6 6-6 6"/>',
  install: '<rect x="7" y="3" width="10" height="18" rx="2.5"/><path d="M12 8v6M9.5 12l2.5 2.5 2.5-2.5"/>',
  content: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 9h8M8 13h8M8 17h5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  moon: '<path d="M20 14.5A8 8 0 019.5 4a8 8 0 1010.5 10.5z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
  grid: '<rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/>'
};
const ic = (n, size = 22) => `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n] || ''}</svg>`;

// ---------- estado ----------
const state = {
  session: null, orgs: [], members: [], clients: [], brands: [], refs: [], content: [], tasks: [], approvals: [], feedback: [],
  org: null, page: 'home', section: 'overview', brand: 'all', month: new Date(), contentView: 'board',
  selPeriod: null, metricPlatform: 'instagram', activity: null, activityError: null
};
const fin = { plans: [], items: [], extras: [], periods: [], deliveries: [], invoices: [], payments: [], metrics: [], valuesTable: false, error: null };
let lastSync = 0;
let installPrompt = null;

const resetState = () => {
  Object.assign(state, { session: null, orgs: [], members: [], clients: [], brands: [], refs: [], content: [], tasks: [], approvals: [], feedback: [], org: null, page: 'home', section: 'overview', brand: 'all', selPeriod: null, activity: null, activityError: null });
  Object.assign(fin, { plans: [], items: [], extras: [], periods: [], deliveries: [], invoices: [], payments: [], metrics: [], valuesTable: false, error: null });
};

const show = s => {
  $('#loader').classList.add('hidden');
  $('#auth').classList.toggle('hidden', s !== 'auth');
  $('#app').classList.toggle('hidden', s !== 'app');
  $('#tabbar').classList.toggle('hidden', s !== 'app');
};
function message(text, tone = '') {
  const root = $('#toast-root');
  root.innerHTML = `<div class="toast ${tone}" role="status">${esc(text)}</div>`;
  clearTimeout(message.t);
  message.t = setTimeout(() => root.replaceChildren(), tone === 'bad' ? 6500 : 4000);
}

// ---------- API ----------
class ApiError extends Error { constructor(m, status) { super(m); this.status = status; } }
const friendly = e => {
  const m = String(e?.message || e || '');
  if (/Invalid login credentials/i.test(m)) return 'Correo o contraseña incorrectos.';
  if (/Failed to fetch|NetworkError|Load failed/i.test(m)) return 'Sin conexión con el servidor. Revisa tu internet.';
  if (/Email not confirmed/i.test(m)) return 'Debes confirmar tu correo antes de entrar.';
  if (/JWT expired/i.test(m)) return 'Tu sesión ha caducado. Vuelve a entrar.';
  if (/row-level security|permission denied/i.test(m)) return 'No tienes permiso para esta acción.';
  if (/duplicate key/i.test(m)) return 'Ya existe un registro igual.';
  if (/media_url/i.test(m)) return 'Falta ejecutar el SQL de la v2.5 en Supabase (columna media_url de content_items).';
  if (/rate limit|too many/i.test(m)) return 'Demasiados intentos. Espera un minuto.';
  return m || 'Error inesperado.';
};

async function raw(path, { method = 'GET', body, auth = true, prefer, range, headers: extra } = {}) {
  const h = { apikey: ANON_KEY, 'Content-Type': 'application/json', Authorization: 'Bearer ' + (auth && state.session?.access_token ? state.session.access_token : ANON_KEY) };
  if (prefer) h.Prefer = prefer;
  if (range) { h.Range = range; h['Range-Unit'] = 'items'; }
  const r = await fetch(SUPABASE_URL + path, { method, headers: { ...h, ...extra }, body: body !== undefined ? JSON.stringify(body) : undefined });
  const txt = await r.text();
  let data = null;
  if (txt) { try { data = JSON.parse(txt); } catch { data = txt; } }
  if (!r.ok) throw new ApiError(data?.msg || data?.message || data?.error_description || data?.error || `Error HTTP ${r.status}`, r.status);
  return data;
}

// ---------- sesión (una sola renovación en vuelo) ----------
const readStored = () => { try { return JSON.parse(localStorage.getItem(SKEY) || 'null'); } catch { return null; } };
function setSession(s) {
  state.session = { ...s, expires_at: s.expires_at || Math.floor(Date.now() / 1000) + (s.expires_in || 3600) };
  try { localStorage.setItem(SKEY, JSON.stringify(state.session)); } catch { /* modo privado */ }
}
function clearSession() { state.session = null; try { localStorage.removeItem(SKEY); } catch { /* */ } }
let refreshing = null;
function refreshSession() {
  refreshing ??= (async () => {
    // Otra pestaña ya pudo renovar el token: adóptalo en vez de gastar el refresh token (que rota).
    const stored = readStored();
    if (stored && stored.refresh_token !== state.session?.refresh_token && stored.expires_at > Date.now() / 1000 + 30) { state.session = stored; return; }
    if (!state.session?.refresh_token) throw new ApiError('La sesión ha caducado', 401);
    const r = await raw('/auth/v1/token?grant_type=refresh_token', { method: 'POST', body: { refresh_token: state.session.refresh_token }, auth: false });
    setSession(r);
  })().finally(() => { refreshing = null; });
  return refreshing;
}
async function active() {
  if (state.session?.expires_at && Date.now() / 1000 > state.session.expires_at - 90) await refreshSession();
}
async function request(path, opts = {}) {
  if (opts.auth !== false) await active();
  try { return await raw(path, opts); } catch (e) {
    if (e.status === 401 && opts.auth !== false && !opts._r && state.session?.refresh_token) { await refreshSession(); return request(path, { ...opts, _r: true }); }
    throw e;
  }
}
// Lectura paginada: PostgREST corta en 1000 filas por defecto.
async function getAll(table, q = 'select=*') {
  const out = [];
  for (let from = 0; ; from += PAGE) {
    let rows;
    try { rows = await request(`/rest/v1/${table}?${q}`, { range: `${from}-${from + PAGE - 1}` }); } catch (e) { if (e.status === 416 && from > 0) break; throw e; }
    if (!Array.isArray(rows)) break;
    out.push(...rows);
    if (rows.length < PAGE) break;
  }
  return out;
}
const write = (table, method, body, q = '', prefer = 'return=representation') => request(`/rest/v1/${table}${q ? '?' + q : ''}`, { method, body, prefer });
const rpc = (fn, args) => request('/rest/v1/rpc/' + fn, { method: 'POST', body: args });
const eq = (col, val) => `${col}=eq.${encodeURIComponent(val)}`;

// ---------- permisos / helpers de datos ----------
const isAdmin = () => state.members.some(m => m.organization_id === state.org && m.user_id === state.session?.user?.id && ['owner', 'admin'].includes(m.role));
const brandById = id => state.brands.find(b => b.id === id);
const nameBrand = id => brandById(id)?.name || 'Marca';
const currentBrand = () => brandById(state.brand) || null;
const byBrand = a => (state.brand === 'all' ? a : a.filter(x => x.brand_id === state.brand));
const colorSafe = s => (/^#[0-9a-fA-F]{6}$/.test(s || '') ? s : '#032167');
const contrastFor = hex => { const n = parseInt(hex.slice(1), 16); const L = (0.2126 * (n >> 16) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255; return L > 0.62 ? '#14203a' : '#ffffff'; };
const pendingApprovals = () => state.approvals.filter(a => a.status === 'pending');

async function hydrate() {
  const [orgs, members] = await Promise.all([getAll('organizations', 'select=id,name,slug,logo_url'), getAll('organization_members', 'select=organization_id,role,user_id')]);
  state.orgs = orgs; state.members = members;
  const mine = members.filter(m => m.user_id === state.session?.user?.id);
  const pref = mine.find(m => ['owner', 'admin'].includes(m.role)) || mine[0];
  state.org = state.org && mine.some(m => m.organization_id === state.org) ? state.org : (pref?.organization_id || null);
  const admin = isAdmin();
  // Un cliente solo necesita el nombre de su empresa: no se piden notas internas ni contactos.
  state.clients = state.org ? await getAll('clients', (admin ? 'select=*' : 'select=id,name') + '&' + eq('organization_id', state.org) + '&order=name') : [];
  const brands = await getAll('brands', 'select=*&order=name');
  state.brands = brands.filter(x => (state.org ? (x.organization_id === state.org || (!x.organization_id && state.clients.some(c => c.id === x.client_id))) : true));
  const ids = new Set(state.brands.map(x => x.id));
  const [refs, content, tasks, approvals, feedback] = await Promise.all([
    getAll('content_references', 'select=*&order=created_at.desc'), getAll('content_items', 'select=*&order=created_at.desc'),
    admin ? getAll('tasks', 'select=*&order=created_at.desc') : Promise.resolve([]),
    getAll('content_approvals', 'select=*&order=created_at.desc'), getAll('approval_comments', 'select=*&order=created_at.asc')]);
  state.refs = refs.filter(x => ids.has(x.brand_id));
  state.content = content.filter(x => ids.has(x.brand_id));
  state.tasks = tasks.filter(x => ids.has(x.brand_id));
  const cids = new Set(state.content.map(x => x.id));
  state.approvals = approvals.filter(x => cids.has(x.content_id));
  const aids = new Set(state.approvals.map(a => a.id));
  state.feedback = feedback.filter(x => aids.has(x.approval_id));
  if (state.brand !== 'all' && !ids.has(state.brand)) state.brand = 'all';
  await loadFinance();
}

async function loadFinance() {
  try {
    const admin = isAdmin();
    const cols = 'id,plan_id,title,category,target_qty,unit_label,active,sort_order';
    const scoped = q => q.filter(x => state.brands.some(b => b.id === x.brand_id));
    let items, values = [];
    fin.valuesTable = false;
    if (admin) {
      // El valor interno (allocation) vive en una tabla solo-admin. Si aún no existe, se cae al esquema antiguo.
      try { [items, values] = await Promise.all([getAll('service_plan_items', `select=${cols}&order=sort_order.asc`), getAll('service_plan_item_values', 'select=item_id,allocation')]); fin.valuesTable = true; } catch { items = await getAll('service_plan_items', 'select=*&order=sort_order.asc'); }
    } else items = await getAll('service_plan_items', `select=${cols}&order=sort_order.asc`);
    const [plans, extras, periods, deliveries, invoices, payments, metrics] = await Promise.all([
      getAll('service_plans', 'select=*&order=started_on.desc'), getAll('service_plan_extras', 'select=*&order=title.asc'),
      getAll('plan_periods', 'select=*&order=starts_on.desc'), getAll('plan_deliveries', 'select=*&order=created_at.asc'),
      getAll('plan_invoices', 'select=*&order=created_at.desc'), getAll('plan_payments', 'select=*&order=paid_on.desc'), getAll('brand_metrics', 'select=*&order=measured_on.desc')]);
    const vmap = new Map(values.map(v => [v.item_id, v.allocation]));
    fin.plans = scoped(plans);
    let ids = new Set(fin.plans.map(p => p.id));
    fin.items = items.filter(x => ids.has(x.plan_id)).map(i => (fin.valuesTable ? { ...i, allocation: vmap.has(i.id) ? vmap.get(i.id) : null } : i));
    fin.extras = extras.filter(x => ids.has(x.plan_id));
    fin.periods = periods.filter(x => ids.has(x.plan_id));
    ids = new Set(fin.periods.map(x => x.id));
    fin.deliveries = deliveries.filter(x => ids.has(x.period_id));
    fin.invoices = invoices.filter(x => ids.has(x.period_id));
    ids = new Set(fin.invoices.map(x => x.id));
    fin.payments = payments.filter(x => ids.has(x.invoice_id));
    fin.metrics = scoped(metrics);
    fin.error = null;
  } catch (e) { fin.error = e.message; console.error('Error cargando plan/facturación', e); }
}

const snapshot = () => JSON.stringify([state.content, state.approvals, state.feedback, state.tasks, state.refs, state.brands, fin.plans, fin.items, fin.extras, fin.periods, fin.deliveries, fin.invoices, fin.payments, fin.metrics]);

// ---------- planes, periodos y facturas ----------
const brandPlan = id => fin.plans.find(p => p.brand_id === id);
const monthPeriods = id => { const p = brandPlan(id); return p ? fin.periods.filter(x => x.plan_id === p.id).sort((a, b) => b.starts_on.localeCompare(a.starts_on)) : []; };
const findPeriod = id => fin.periods.find(p => p.id === id);
const periodDeliveries = id => fin.deliveries.filter(d => d.period_id === id);
const linkedInvoice = id => fin.invoices.find(i => i.period_id === id);
const selectedPeriod = p => { const l = monthPeriods(p.brand_id); return l.find(x => x.id === state.selPeriod) || l.find(x => x.status !== 'closed') || l[0] || null; };
const hasVal = x => x.allocation !== null && x.allocation !== undefined;

// Ciclo mensual anclado al día de inicio del plan (recorta a fin de mes: 31 → 28/30).
function futureCycle(date, start) {
  const d = asDate(start), t = asDate(date), baseDay = d.getUTCDate();
  const lastDay = (y, m) => new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  const at = (y, m) => new Date(Date.UTC(y, m, Math.min(baseDay, lastDay(y, m))));
  let c = at(t.getUTCFullYear(), t.getUTCMonth());
  if (c > t) c = at(t.getUTCFullYear(), t.getUTCMonth() - 1);
  if (c < d) c = d;
  const next = at(c.getUTCFullYear(), c.getUTCMonth() + 1);
  next.setUTCDate(next.getUTCDate() - 1);
  return { start: isoUTC(c), end: isoUTC(next) };
}
function costSnapshot(p, per) {
  const lines = periodDeliveries(per?.id).filter(x => x.status === 'completed');
  const sum = k => lines.filter(x => x.kind === k).reduce((s, d) => s + num(d.unit_price) * num(d.quantity), 0);
  const ext = sum('extra'), adjust = sum('adjustment');
  const base = p?.base_fee === null || p?.base_fee === undefined ? null : num(p.base_fee);
  const subtotal = base === null ? null : base + ext + adjust;
  const tax = subtotal === null ? null : subtotal * num(p.tax_percent) / 100;
  return { base, ext, adjust, subtotal, tax, total: subtotal === null ? null : subtotal + tax };
}
function planProgress(p, per) {
  const deliveries = periodDeliveries(per.id);
  return fin.items.filter(x => x.plan_id === p.id && x.active !== false).map(x => {
    const qty = deliveries.filter(d => d.plan_item_id === x.id && d.status === 'completed').reduce((s, d) => s + num(d.quantity), 0);
    return { ...x, completed: qty, ratio: num(x.target_qty) > 0 ? Math.min(1, qty / num(x.target_qty)) : 0 };
  });
}
const executedValue = items => items.reduce((s, x) => s + (hasVal(x) ? num(x.allocation) * x.ratio : 0), 0);

function invoiceInfo(i) {
  const per = findPeriod(i.period_id), plan = fin.plans.find(p => p.id === per?.plan_id);
  const paid = fin.payments.filter(x => x.invoice_id === i.id).reduce((s, x) => s + num(x.amount), 0);
  const total = num(i.total_amount), left = Math.max(0, total - paid), over = Math.max(0, paid - total);
  let label, tone;
  if (i.status === 'cancelled') { label = 'Anulada'; tone = 'muted'; }
  else if (i.status === 'draft') { label = 'Borrador'; tone = 'muted'; }
  else if (total <= 0.004) { label = 'Sin importe'; tone = 'muted'; }
  else if (over > 0.004) { label = 'Sobrepago'; tone = 'warn'; }
  else if (left <= 0.004) { label = 'Pagada'; tone = 'ok'; }
  else if (i.due_on && i.due_on < localISO()) { label = 'Vencida'; tone = 'bad'; }
  else if (paid > 0) { label = 'Parcial'; tone = 'warn'; }
  else { label = 'Pendiente'; tone = 'warn'; }
  return { i, per, plan, paid, total, left, over, label, tone, cur: plan?.currency || 'EUR', brand: plan?.brand_id };
}
const addTo = (m, c, v) => { m[c] = (m[c] || 0) + v; return m; };
const fmtMap = m => Object.entries(m).filter(([, v]) => Math.abs(v) > 0.004).map(([c, v]) => money(v, c)).join(' · ') || money(0);
function billingTotals(infos) {
  const billed = {}, paid = {}, left = {}, over = {}, overdue = {};
  for (const x of infos) {
    if (x.i.status !== 'issued') continue;
    addTo(billed, x.cur, x.total); addTo(paid, x.cur, x.paid); addTo(left, x.cur, x.left); if (x.over > 0.004) addTo(over, x.cur, x.over);
    if (x.label === 'Vencida') addTo(overdue, x.cur, x.left);
  }
  return { billed, paid, left, over, overdue };
}

// ---------- aviso de prioridades para el panel del admin ----------
function attentionItems() {
  const out = [], today = localISO();
  for (const i of fin.invoices) {
    const x = invoiceInfo(i); if (!x.plan) continue;
    const bn = nameBrand(x.brand);
    if (x.label === 'Vencida') out.push({ w: 0, tone: 'bad', title: `Factura vencida · ${bn}`, sub: `${money(x.left, x.cur)} pendientes desde ${fmtDay(i.due_on)}`, brand: x.brand, section: 'billing' });
    if (i.status === 'draft') out.push({ w: 2, tone: 'warn', title: `Borrador por emitir · ${bn}`, sub: `${fmtDay(x.per?.starts_on)} – ${fmtDay(x.per?.ends_on)} · ${money(i.total_amount, x.cur)}`, brand: x.brand, section: 'billing' });
  }
  for (const per of fin.periods) {
    if (per.status === 'closed') continue;
    const plan = fin.plans.find(p => p.id === per.plan_id); if (!plan) continue;
    const d = daysBetween(today, per.ends_on), bn = nameBrand(plan.brand_id);
    if (d < 0) out.push({ w: 1, tone: 'bad', title: `Periodo sin cerrar · ${bn}`, sub: `Terminó el ${fmtDay(per.ends_on)}. Ciérralo para generar el borrador.`, brand: plan.brand_id, section: 'plan' });
    else if (d <= 7) out.push({ w: 3, tone: 'warn', title: `Cierra ${d === 0 ? 'hoy' : 'en ' + d + ' días'} · ${bn}`, sub: `Periodo ${fmtDay(per.starts_on)} – ${fmtDay(per.ends_on)}`, brand: plan.brand_id, section: 'plan' });
  }
  for (const p of fin.plans) {
    if (p.base_fee === null || p.started_on > today) continue;
    if (!fin.periods.some(x => x.plan_id === p.id && x.status !== 'closed')) out.push({ w: 1, tone: 'warn', title: `Sin periodo abierto · ${nameBrand(p.brand_id)}`, sub: 'Abre el siguiente periodo para registrar entregas.', brand: p.brand_id, section: 'plan' });
  }
  for (const a of pendingApprovals()) {
    const days = Math.floor((Date.now() - new Date(a.created_at)) / 86400000);
    const post = state.content.find(c => c.id === a.content_id);
    if (days >= 3 && post) out.push({ w: 2, tone: 'warn', title: `Sin respuesta ${ago(a.created_at)} · ${post.title}`, sub: nameBrand(post.brand_id), approval: a.id, brand: post.brand_id, section: 'reviews' });
  }
  for (const t of state.tasks) if (t.status !== 'completed' && t.due_date && t.due_date < today) out.push({ w: 2, tone: 'bad', title: `Tarea vencida · ${t.title}`, sub: `${nameBrand(t.brand_id)} · era para el ${fmtDay(t.due_date)}`, brand: t.brand_id, section: 'tasks' });
  return out.sort((a, b) => a.w - b.w);
}

// ============================================================================
// VISTAS
// ============================================================================
const head = (t, s = '', act = '') => `<div class="header"><div><div class="eyebrow">LE STUDIO SOCIAL OS</div><h1>${esc(t)}</h1>${s ? `<div class="subtle">${esc(s)}</div>` : ''}</div>${act ? `<div class="header-actions">${act}</div>` : ''}</div>`;
const secHead = (t, s = '', act = '') => `<div class="sec-head"><div><h2>${esc(t)}</h2>${s ? `<p class="subtle">${esc(s)}</p>` : ''}</div>${act ? `<div class="actions">${act}</div>` : ''}</div>`;
const empty = (s, extra = '') => `<div class="empty">${esc(s)}${extra}</div>`;
const stat = (v, l, tone = '') => `<div class="card stat ${tone}"><strong>${v}</strong><span>${esc(l)}</span></div>`;
const avatar = (b, cls = '') => `<span class="brand-avatar ${cls}">${b?.logo_url ? `<img src="${esc(safeUrl(b.logo_url))}" alt="" loading="lazy" referrerpolicy="no-referrer">` : esc((b?.name || '?').slice(0, 2).toUpperCase())}</span>`;
const finError = () => `<div class="alert"><b>Faltan tablas del módulo Plan/Facturación.</b><br>${esc(fin.error)}<br>Ejecuta primero el SQL de la carpeta <code>sql/</code> en Supabase.</div>`;
const rowBtn = (attrs, inner) => `<button class="row" ${attrs}>${inner}<span class="row-go">${ic('chevron', 18)}</span></button>`;

// ---------- navegación ----------
const CLIENT_SECTIONS = ['overview', 'content', 'reviews', 'calendar', 'plan', 'metrics', 'billing'];

/* ---------- tema claro / oscuro ---------- */
const THEMES = ['auto', 'light', 'dark'];
const themePref = () => { try { const t = localStorage.getItem('ls-theme'); return THEMES.includes(t) ? t : 'auto'; } catch { return 'auto'; } };
const isDark = () => document.documentElement.dataset.theme === 'dark';
function applyTheme() {
  const p = themePref(), dark = p === 'dark' || (p === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  const tc = document.querySelector('meta[name="theme-color"]'); if (tc && dark) tc.setAttribute('content', '#0e1424');
}
function cycleTheme() {
  const next = THEMES[(THEMES.indexOf(themePref()) + 1) % 3];
  try { localStorage.setItem('ls-theme', next); } catch { /* sin almacenamiento */ }
  applyTheme(); render({ keepScroll: true });
  message(next === 'auto' ? 'Tema: automático (según tu dispositivo).' : next === 'dark' ? 'Tema oscuro activado.' : 'Tema claro activado.');
}
const lighten = hex => { const n = parseInt(hex.slice(1), 16), m = c => Math.round(c + (255 - c) * 0.55).toString(16).padStart(2, '0'); const r = n >> 16, g = (n >> 8) & 255, b = n & 255; const L = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255; return L > 0.45 ? hex : '#' + m(r) + m(g) + m(b); };
matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => { if (themePref() === 'auto') { applyTheme(); render({ keepScroll: true }); } });

/* ---------- buscador global (Cmd/Ctrl + K) ---------- */
const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
function searchIndex() {
  const out = [], admin = isAdmin();
  state.brands.forEach(b => out.push({ t: 'Marca', icon: 'layers', title: b.name, sub: b.description || '', run: () => go('workspace', 'overview', b.id), k: norm(b.name + ' ' + (b.description || '')) }));
  state.content.forEach(x => out.push({ t: 'Contenido', icon: 'content', title: x.title, sub: nameBrand(x.brand_id) + ' · ' + lbl(x.status), run: () => go('workspace', admin ? 'content' : 'reviews', x.brand_id), k: norm(x.title + ' ' + (x.caption || '') + ' ' + nameBrand(x.brand_id)) }));
  if (admin) {
    state.clients.forEach(c => out.push({ t: 'Cliente', icon: 'users', title: c.name, sub: c.email || '', run: () => go('clients'), k: norm(c.name + ' ' + (c.email || '')) }));
    state.tasks.forEach(x => out.push({ t: 'Tarea', icon: 'list', title: x.title, sub: nameBrand(x.brand_id), run: () => go('tasks'), k: norm(x.title) }));
    fin.invoices.forEach(i => { const per = fin.periods.find(p => p.id === i.period_id), pl = per && fin.plans.find(p => p.id === per.plan_id); out.push({ t: 'Factura', icon: 'wallet', title: 'Factura ' + (i.number || i.id.slice(0, 6)), sub: pl ? nameBrand(pl.brand_id) : '', run: () => go('workspace', 'billing', pl?.brand_id), k: norm('factura ' + (i.number || '') + ' ' + (pl ? nameBrand(pl.brand_id) : '')) }); });
  }
  return out;
}
let searchHits = [];
function openSearch() {
  const idx = searchIndex();
  openModal({
    title: 'Buscar', cls: 'search-modal',
    body: `<input class="input" id="gs-q" type="search" placeholder="Marcas, contenido, clientes, tareas…" autocomplete="off" aria-label="Buscar"><div class="list" id="gs-res" role="listbox"></div>`,
    onOpen: root => {
      const q = root.querySelector('#gs-q'), res = root.querySelector('#gs-res'); let sel = 0;
      const draw = () => {
        const w = norm(q.value).split(/\s+/).filter(Boolean);
        searchHits = (w.length ? idx.filter(x => w.every(t => x.k.includes(t))) : idx.filter(x => x.t === 'Marca')).slice(0, 12);
        sel = Math.min(sel, Math.max(0, searchHits.length - 1));
        res.innerHTML = searchHits.length ? searchHits.map((h, i) => `<button class="row ${i === sel ? 'sel' : ''}" role="option" data-gs="${i}"><span class="ico">${ic(h.icon, 20)}</span><span class="grow"><b>${esc(h.title)}</b><small>${esc(h.t)}${h.sub ? ' · ' + esc(h.sub) : ''}</small></span></button>`).join('') : '<p class="subtle" style="padding:14px 4px">Sin resultados.</p>';
      };
      q.addEventListener('input', () => { sel = 0; draw(); });
      q.addEventListener('keydown', e => {
        if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(sel + 1, searchHits.length - 1); draw(); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(sel - 1, 0); draw(); }
        else if (e.key === 'Enter') { e.preventDefault(); searchHits[sel]?.run(); }
      });
      res.addEventListener('click', e => { const b = e.target.closest('[data-gs]'); if (b) searchHits[+b.dataset.gs]?.run(); });
      draw();
    }
  });
}

function navModel() {
  const pend = pendingApprovals().length;
  if (isAdmin()) return [
    { id: 'home', icon: 'home', label: 'Inicio', page: 'home', tab: 1 },
    { id: 'brands', icon: 'layers', label: 'Marcas', page: 'brands', tab: 1 },
    { id: 'approvals', icon: 'check', label: 'Aprobar', long: 'Aprobaciones', page: 'approvals', badge: pend, tab: 1 },
    { id: 'calendar', icon: 'calendar', label: 'Calendario', page: 'calendar', tab: 1 },
    { id: 'clients', icon: 'users', label: 'Clientes', page: 'clients' },
    { id: 'finance', icon: 'wallet', label: 'Finanzas', page: 'finance' },
    { id: 'tasks', icon: 'list', label: 'Mi trabajo', page: 'tasks' },
    { id: 'references', icon: 'image', label: 'Biblioteca', page: 'references' },
    { id: 'activity', icon: 'clock', label: 'Actividad', page: 'activity' }];
  const sec = (id, icon, label, tab, badge) => ({ id, icon, label, page: 'workspace', section: id, tab, badge });
  const multi = state.brands.length > 1, out = [];
  if (multi) out.push({ id: 'home', icon: 'layers', label: 'Mis marcas', page: 'home', tab: state.brand === 'all' ? 1 : 0 });
  if (state.brand !== 'all' || !multi) out.push(sec('overview', 'home', 'Resumen', 1), sec('reviews', 'check', 'Aprobar', 1, pend), sec('calendar', 'calendar', 'Calendario', 1), sec('plan', 'plan', 'Plan', 1), sec('content', 'content', 'Contenido'), sec('metrics', 'chart', 'Métricas'), sec('billing', 'wallet', 'Facturación'));
  return out;
}
const isActiveNav = n => (n.section ? state.page === 'workspace' && state.section === n.section : (n.page === state.page || (n.id === 'brands' && state.page === 'workspace')));
const TITLES = { home: 'Inicio', clients: 'Clientes', brands: 'Marcas', workspace: 'Marca', references: 'Biblioteca', calendar: 'Calendario', tasks: 'Mi trabajo', approvals: 'Aprobaciones', finance: 'Finanzas', activity: 'Actividad' };

function renderChrome() {
  const nav = navModel(), admin = isAdmin(), b = currentBrand();
  const btn = (n, tab) => `<button data-act="nav" data-page="${n.page}" ${n.section ? `data-section="${n.section}"` : ''} class="${isActiveNav(n) ? 'active' : ''}" ${isActiveNav(n) ? 'aria-current="page"' : ''}><span class="ico">${ic(n.icon, tab ? 24 : 20)}${n.badge ? `<b class="badge">${n.badge}</b>` : ''}</span><span class="lb">${esc(tab ? n.label : (n.long || n.label))}</span></button>`;
  $('#nav').innerHTML = nav.map(n => btn(n, false)).join('');
  $('#tabbar').innerHTML = nav.filter(n => n.tab).map(n => btn(n, true)).join('') + `<button data-act="more" class="${nav.some(n => !n.tab && isActiveNav(n)) ? 'active' : ''}"><span class="ico">${ic('more', 24)}</span><span class="lb">Más</span></button>`;
  $('#theme-btn').innerHTML = ic(themePref() === 'dark' ? 'moon' : 'sun', 20); $('#theme-btn').title = 'Tema: ' + ({ auto: 'automático', light: 'claro', dark: 'oscuro' })[themePref()];
  $('#current-user').textContent = (state.session?.user?.email || '') + ' · v' + VERSION;
  const sel = $('#global-brand');
  sel.innerHTML = (admin || state.brands.length > 1 ? '<option value="all">Todas las marcas</option>' : '') + state.brands.map(x => `<option value="${esc(x.id)}">${esc(x.name)}</option>`).join('');
  sel.value = state.brand;
  const single = !admin && state.brands.length <= 1;
  sel.classList.toggle('hidden', single);
  $('#active-brand-tag').classList.toggle('hidden', !single);
  $('#active-brand-tag').textContent = b ? b.name : 'LE STUDIO';
  const pageTitle = state.page === 'workspace' && b ? b.name : (TITLES[state.page] || 'Social OS');
  $('#top-title').textContent = pageTitle;
  document.title = `${pageTitle} · LE STUDIO`;
  const brandColor = colorSafe(b?.primary_color), color = isDark() ? lighten(brandColor) : brandColor, root = document.documentElement.style;
  root.setProperty('--accent', color);
  root.setProperty('--accent-contrast', isDark() ? (contrastFor(color) === '#ffffff' && (() => { const n = parseInt(color.slice(1), 16); return (0.2126 * (n >> 16) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255 > 0.5; })() ? '#0e1424' : contrastFor(color)) : contrastFor(color));
  root.setProperty('--accent-soft', b ? 'color-mix(in srgb, var(--accent) 11%, var(--surface))' : 'var(--accent-soft-d)');
  root.setProperty('--accent-border', b ? 'color-mix(in srgb, var(--accent) 20%, var(--surface))' : 'var(--accent-border-d)');
  $('meta[name="theme-color"]')?.setAttribute('content', b ? brandColor : '#032167');
}

function normalizeRoute() {
  if (state.brand !== 'all' && !brandById(state.brand)) state.brand = 'all';
  if (!isAdmin()) {
    if (state.brands.length === 1) state.brand = state.brands[0].id;
    const toSection = { approvals: 'reviews', calendar: 'calendar', content: 'content' };
    if (['approvals', 'calendar', 'content', 'brands', 'finance', 'tasks', 'references', 'clients', 'activity'].includes(state.page)) { if (toSection[state.page]) state.section = toSection[state.page]; state.page = 'home'; }
    if (!CLIENT_SECTIONS.includes(state.section)) state.section = 'overview';
  }
  if (state.page === 'home' && state.brand !== 'all') state.page = 'workspace';
  if (state.page === 'workspace' && state.brand === 'all') state.page = 'home';
}

function render(opts = {}) {
  normalizeRoute();
  const y = window.scrollY;
  try {
    renderChrome();
    $('#view').innerHTML = viewFor();
  } catch (e) {
    console.error(e);
    $('#view').innerHTML = `<div class="panel"><h3>Algo ha fallado al mostrar esta pantalla</h3><p class="subtle">${esc(e.message)}</p><button class="primary" data-act="nav" data-page="home">Volver al inicio</button></div>`;
  }
  window.scrollTo(0, opts.keepScroll ? y : 0);
  const bt = document.querySelector('.brand-tabs'), at = bt && bt.querySelector('button.active');
  if (at) bt.scrollLeft = Math.max(0, at.offsetLeft - (bt.clientWidth - at.offsetWidth) / 2);
}
function viewFor() {
  switch (state.page) {
    case 'clients': return viewClients();
    case 'brands': return viewBrands();
    case 'workspace': return viewWorkspace();
    case 'approvals': return viewApprovals();
    case 'calendar': return head('Calendario editorial', 'Plan de publicaciones de tus marcas.') + calendarView(byBrand(state.content));
    case 'tasks': return viewTasks();
    case 'references': return viewReferences();
    case 'finance': return viewFinance();
    case 'activity': return viewActivity();
    default: return viewHome();
  }
}

// ---------- inicio ----------
function viewHome() {
  if (!isAdmin()) return viewClientHome();
  const today = localISO(), week = localISO(new Date(Date.now() + 7 * 864e5));
  const att = attentionItems(), tot = billingTotals(fin.invoices.map(invoiceInfo));
  const h = new Date().getHours(), hi = h < 6 ? 'Buenas noches.' : h < 13 ? 'Buenos días.' : h < 21 ? 'Buenas tardes.' : 'Buenas noches.';
  const upcoming = state.content.filter(x => x.scheduled_at && localDay(x.scheduled_at) >= today && localDay(x.scheduled_at) <= week).sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at));
  const overdueTxt = fmtMap(tot.overdue) !== money(0) ? fmtMap(tot.overdue) + ' vencido' : 'Sin vencidos';
  const attRow = a => rowBtn(a.approval ? `data-act="open-approval" data-id="${esc(a.approval)}"` : `data-act="focus" data-brand="${esc(a.brand)}" data-section="${a.section}"`, `<span class="dot ${a.tone}"></span><span class="grow"><b>${esc(a.title)}</b><small>${esc(a.sub)}</small></span>`);
  return head(hi, 'Lo que necesita tu atención hoy.', '<button class="primary" data-act="modal" data-type="content">+ Contenido</button>')
    + `<div class="cards auto">${stat(fmtMap(tot.left), 'Por cobrar', tot.overdue && Object.keys(tot.overdue).length ? 'bad' : '')}${stat(pendingApprovals().length, 'Aprobaciones pendientes')}${stat(upcoming.length, 'Publicaciones en 7 días')}${stat(state.tasks.filter(t => t.status !== 'completed').length, 'Tareas abiertas')}</div>`
    + (fmtMap(tot.overdue) !== money(0) ? `<p class="footnote" style="margin-top:8px">${esc(overdueTxt)}</p>` : '')
    + `<div class="grid-two"><section class="panel"><h3 class="section-title">Requiere tu atención</h3><div class="list">${att.slice(0, 8).map(attRow).join('') || empty('Todo al día. No hay nada urgente.')}</div></section>`
    + `<section class="panel"><h3 class="section-title">Próximos 7 días</h3><div class="list">${upcoming.slice(0, 8).map(x => rowBtn(`data-act="modal" data-type="content" data-id="${esc(x.id)}"`, `<span class="grow"><b>${esc(x.title)}</b><small>${esc(nameBrand(x.brand_id))} · ${esc(fmtDateTime(x.scheduled_at))}</small></span>${sPill(x.status)}`)).join('') || empty('Nada programado esta semana.')}</div></section></div>`
    + `<h3 class="section-title" style="margin:26px 0 12px">Marcas</h3><div class="brand-grid">${state.brands.map(brandCard).join('') || empty('Todavía no hay marcas.', '<br><button class="primary" style="margin-top:14px" data-act="modal" data-type="client">+ Crear primer cliente</button>')}</div>`;
}
function brandCard(b) {
  const posts = state.content.filter(c => c.brand_id === b.id), ids = new Set(posts.map(c => c.id));
  const pend = pendingApprovals().filter(a => ids.has(a.content_id)).length, tasks = state.tasks.filter(t => t.brand_id === b.id && t.status !== 'completed').length;
  return `<button class="brand-card tap" data-act="focus" data-brand="${esc(b.id)}"><div class="brand-head">${avatar(b)}<div><strong>${esc(b.name)}</strong><small>${esc(state.clients.find(c => c.id === b.client_id)?.name || '')}</small></div></div><div class="chips">${pend ? pill(`${pend} por aprobar`, 'warn') : ''}${isAdmin() && tasks ? pill(`${tasks} tareas`, 'info') : ''}${!pend && !(isAdmin() && tasks) ? pill('Al día', 'ok') : ''}</div></button>`;
}
function viewClientHome() {
  return head('Bienvenido a tu espacio.', 'Elige una marca para ver propuestas, calendario y plan.') + `<div class="brand-grid">${state.brands.map(brandCard).join('') || empty('Todavía no tienes marcas asignadas. Escribe a LE STUDIO.')}</div>`;
}

// ---------- clientes y marcas ----------
function viewClients() {
  return head('Clientes', 'Empresas, contactos y sus marcas.', '<button class="primary" data-act="modal" data-type="client">+ Nuevo cliente</button>')
    + `<div class="brand-grid">${state.clients.map(c => {
      const owned = state.brands.filter(b => b.client_id === c.id);
      return `<article class="brand-card client-card"><div class="client-top"><div class="brand-avatar">${esc(c.name.slice(0, 2).toUpperCase())}</div>${pill(`${owned.length} ${owned.length === 1 ? 'marca' : 'marcas'}`)}</div><strong>${esc(c.name)}</strong><small>${esc(c.contact_email || 'Sin correo de contacto')}</small>${c.phone ? `<small>${esc(c.phone)}</small>` : ''}${c.notes ? `<p class="subtle client-note">${esc(c.notes)}</p>` : ''}<div class="chips">${owned.map(b => `<button class="chip" data-act="focus" data-brand="${esc(b.id)}">${esc(b.name)} →</button>`).join('') || '<span class="subtle">Sin marcas todavía</span>'}</div><div class="actions card-actions"><button class="muted-btn" data-act="modal" data-type="client" data-id="${esc(c.id)}">Editar</button><button class="muted-btn" data-act="modal" data-type="brand" data-client="${esc(c.id)}">+ Añadir marca</button></div></article>`;
    }).join('') || empty('Aún no hay clientes. Crea el primero y después añade sus marcas.')}</div>`;
}
function viewBrands() {
  return head('Marcas', 'Un espacio independiente para cada identidad.', '<button class="primary" data-act="modal" data-type="brand">+ Nueva marca</button>')
    + `<div class="brand-grid">${state.brands.map(x => `<div class="brand-card"><div class="brand-head">${avatar(x)}<div><strong>${esc(x.name)}</strong><small>${esc(state.clients.find(c => c.id === x.client_id)?.name || 'Marca')}</small></div></div><p class="subtle" style="font-size:13px">${esc(x.description || 'Espacio de marca')}</p><div class="actions card-actions"><button class="secondary" data-act="focus" data-brand="${esc(x.id)}">Abrir espacio</button><button class="muted-btn" data-act="invite" data-id="${esc(x.id)}">Invitar cliente</button><button class="muted-btn" data-act="modal" data-type="brand" data-id="${esc(x.id)}">Editar</button></div></div>`).join('') || empty('No hay marcas todavía. Crea primero un cliente y después su marca.')}</div>`;
}

// ---------- espacio de marca ----------
function viewWorkspace() {
  const b = currentBrand(), admin = isAdmin();
  if (!b) return head('Selecciona una marca', 'Elige una marca arriba o desde Marcas.');
  const posts = state.content.filter(x => x.brand_id === b.id), ids = new Set(posts.map(p => p.id));
  const pend = pendingApprovals().filter(a => ids.has(a.content_id)).length;
  const tabs = [['overview', 'Resumen'], ['content', 'Contenido'], ['reviews', 'Aprobaciones', pend], ['calendar', 'Calendario'], ['plan', 'Plan'], ['metrics', 'Métricas'], ['billing', 'Facturación'], ...(admin ? [['references', 'Referencias'], ['tasks', 'Tareas'], ['identity', 'Identidad']] : [])];
  if (!tabs.some(t => t[0] === state.section)) state.section = 'overview';
  const c = state.clients.find(x => x.id === b.client_id);
  let body;
  switch (state.section) {
    case 'content': body = viewContent(b, posts); break;
    case 'reviews': body = approvalsBlock(state.approvals.filter(a => ids.has(a.content_id))); break;
    case 'calendar': body = calendarView(posts); break;
    case 'plan': body = fin.error ? finError() : viewPlan(b); break;
    case 'metrics': body = fin.error ? finError() : viewMetrics(b); break;
    case 'billing': body = fin.error ? finError() : viewBilling(b); break;
    case 'references': body = secHead('Referencias', 'Inspiración visual de la marca.', '<button class="secondary" data-act="modal" data-type="reference">+ Referencia</button>') + refCards(state.refs.filter(r => r.brand_id === b.id)); break;
    case 'tasks': body = secHead('Tareas', '', '<button class="secondary" data-act="modal" data-type="task">+ Tarea</button>') + taskTable(state.tasks.filter(t => t.brand_id === b.id)); break;
    case 'identity': body = `<div class="brand-metadata"><div class="panel"><h3 class="section-title">Sistema de marca</h3><p>Color principal: <span class="swatch" style="background:${colorSafe(b.primary_color)}"></span> ${esc(b.primary_color || 'Sin definir')}</p><p>Color secundario: ${esc(b.secondary_color || 'Sin definir')}</p><p>Personalidad: ${esc(b.brand_voice || 'Sin definir')}</p></div><div class="panel"><h3 class="section-title">Información</h3><p>Cliente: ${esc(c?.name || '—')}</p><p>Web: ${b.website_url ? `<a href="${esc(safeUrl(b.website_url))}" target="_blank" rel="noopener noreferrer">Abrir sitio ↗</a>` : '—'}</p><p>Instagram: ${esc(b.instagram_url || '—')}</p><p><button class="secondary" data-act="invite" data-id="${esc(b.id)}">Invitar cliente</button></p></div></div>`; break;
    default: body = viewOverview(b, posts, pend);
  }
  return `<section class="workspace-hero"><div class="workspace-identity"><div class="workspace-logo">${b.logo_url ? `<img src="${esc(safeUrl(b.logo_url))}" alt="Logo ${esc(b.name)}" referrerpolicy="no-referrer">` : esc(b.name.slice(0, 2).toUpperCase())}</div><div><div class="eyebrow">ESPACIO DE MARCA</div><h1>${esc(b.name)}</h1><p>${esc(b.description || 'Tu identidad, tus ideas y tus próximos pasos.')}</p></div></div>${admin ? `<button class="secondary" data-act="modal" data-type="brand" data-id="${esc(b.id)}">Editar identidad</button>` : ''}</section>`
    + `<div class="tabs brand-tabs" role="tablist">${tabs.map(([id, label, n]) => `<button role="tab" data-act="section" data-id="${id}" class="${state.section === id ? 'active' : ''}" aria-selected="${state.section === id}">${label}${n ? `<b class="badge">${n}</b>` : ''}</button>`).join('')}</div><div class="workspace-body">${body}</div>`;
}

function viewOverview(b, posts, pend) {
  const admin = isAdmin(), today = localISO();
  const p = brandPlan(b.id), per = p ? selectedPeriod(p) : null;
  let pct = '—';
  if (p && per && !fin.error) { const pr = planProgress(p, per); pct = pr.length ? Math.round(pr.reduce((s, v) => s + v.ratio, 0) / pr.length * 100) + '%' : '—'; }
  const next = posts.filter(x => x.scheduled_at && localDay(x.scheduled_at) >= today).sort((a, c) => a.scheduled_at.localeCompare(c.scheduled_at)).slice(0, 5);
  const pending = state.approvals.filter(a => a.status === 'pending' && posts.some(x => x.id === a.content_id));
  return (admin ? `<div class="quick"><button class="secondary" data-act="modal" data-type="content">+ Contenido</button><button class="secondary" data-act="modal" data-type="task">+ Tarea</button><button class="secondary" data-act="modal" data-type="reference">+ Referencia</button><button class="secondary" data-act="f" data-f="new-metric">+ Métrica</button></div>` : '')
    + `<div class="cards auto">${stat(posts.length, 'Contenidos')}${stat(pend, 'Por aprobar', pend ? 'warn' : '')}${stat(posts.filter(x => x.scheduled_at).length, 'Planificados')}${stat(pct, 'Avance del plan')}</div>`
    + `<div class="grid-two"><section class="panel"><h3 class="section-title">Próximas publicaciones</h3><div class="list">${next.map(x => rowBtn(admin ? `data-act="modal" data-type="content" data-id="${esc(x.id)}"` : 'data-act="noop"', `<span class="grow"><b>${esc(x.title)}</b><small>${esc(fmtDateTime(x.scheduled_at))} · ${esc(lbl(x.platform))}</small></span>${sPill(x.status)}`)).join('') || empty('Sin contenido planificado.')}</div></section><section class="panel"><h3 class="section-title">Pendiente de tu respuesta</h3>${approvalsBlock(pending, true)}</section></div>`;
}

// ---------- contenido ----------
const STATUSES = ['idea', 'production', 'review', 'approved', 'scheduled', 'published'];
const thumb = x => (x.media_url ? `<img class="thumb" src="${esc(safeUrl(x.media_url))}" alt="" loading="lazy" referrerpolicy="no-referrer">` : '');
function viewContent(b, posts) {
  const admin = isAdmin();
  const tog = `<div class="seg" role="group" aria-label="Vista"><button data-act="content-view" data-id="board" class="${state.contentView === 'board' ? 'active' : ''}">Tablero</button><button data-act="content-view" data-id="list" class="${state.contentView === 'list' ? 'active' : ''}">Lista</button></div>`;
  const head2 = secHead('Contenido', 'Tu pipeline editorial. No se publica automáticamente en redes.', `${tog}${admin ? '<button class="primary" data-act="modal" data-type="content">+ Nueva</button>' : ''}`);
  if (state.contentView === 'list' || !admin) return head2 + contentTable(posts);
  return head2 + `<div class="kanban">${STATUSES.map(st => { const col = posts.filter(x => x.status === st); return `<section class="kcol"><h4>${lbl(st)} <span>${col.length}</span></h4>${col.map(kanbanCard).join('') || '<div class="kempty">—</div>'}</section>`; }).join('')}</div>`;
}
function kanbanCard(x) {
  return `<article class="kcard">${thumb(x)}<button class="ktitle" data-act="modal" data-type="content" data-id="${esc(x.id)}">${esc(x.title)}</button><div class="chips">${pill(lbl(x.platform))}${pill(lbl(x.content_type))}</div><small class="subtle">${x.scheduled_at ? esc(fmtDateTime(x.scheduled_at)) : 'Sin fecha'}</small><select class="input compact" data-change="content-status" data-id="${esc(x.id)}" aria-label="Estado de ${esc(x.title)}">${STATUSES.map(s => `<option value="${s}" ${s === x.status ? 'selected' : ''}>${lbl(s)}</option>`).join('')}</select></article>`;
}
function contentTable(items) {
  const admin = isAdmin();
  return `<div class="table-wrap"><table class="data-table stack"><thead><tr><th>Publicación</th><th>Plataforma</th><th>Estado</th><th>Fecha</th><th></th></tr></thead><tbody>${items.map(x => `<tr><td data-label="Publicación"><div class="cell-media">${thumb(x)}<div><b>${esc(x.title)}</b><br><small>${esc(lbl(x.content_type))} · ${esc(nameBrand(x.brand_id))}</small></div></div></td><td data-label="Plataforma">${esc(lbl(x.platform))}</td><td data-label="Estado">${sPill(x.status)}</td><td data-label="Fecha">${x.scheduled_at ? esc(fmtDateTime(x.scheduled_at)) : '—'}</td><td class="act"><div class="actions">${admin ? `<button class="muted-btn" data-act="modal" data-type="content" data-id="${esc(x.id)}">Editar</button><button class="secondary" data-act="send-approval" data-id="${esc(x.id)}">Solicitar aprobación</button>` : ''}</div></td></tr>`).join('') || '<tr><td colspan="5">Todavía no hay contenido.</td></tr>'}</tbody></table></div>`;
}


// ---------- enlace de aprobación sin contraseña ----------
function openShareLink(approvalId) {
  const a = state.approvals.find(x => x.id === approvalId), post = state.content.find(x => x.id === a?.content_id); if (!post) return;
  let last = ''; try { last = localStorage.getItem('ls-link-email') || ''; } catch { /* sin almacenamiento */ }
  openModal({
    title: 'Enlace de aprobación', eyebrow: nameBrand(post.brand_id), submitLabel: 'Crear enlace',
    body: `<p class="subtle" style="grid-column:1/-1;margin:0">El cliente podrá ver la pieza y aprobarla o pedir cambios desde el móvil, sin contraseña. El enlace sirve una sola vez.</p>` + fld('email', 'Email de la cuenta del cliente', last, 'email', { req: 1, full: 1 }) + `<label class="label">Caduca en<select class="input" name="days"><option value="3">3 días</option><option value="7" selected>7 días</option><option value="14">14 días</option></select></label>`,
    onSubmit: async fd => {
      const email = String(fd.get('email')).trim();
      let tok; try { tok = await rpc('create_approval_link', { p_approval: approvalId, p_email: email, p_days: +fd.get('days') }); }
      catch (e) { throw Error(/create_approval_link/i.test(e.message || '') ? 'Falta ejecutar el SQL 05 (enlaces de aprobación) en Supabase.' : friendly(e)); }
      try { localStorage.setItem('ls-link-email', email); } catch { /* sin almacenamiento */ }
      state.__link = `${location.origin}/aprobar.html#t=${tok}`; state.__linkTitle = post.title;
    }
  });
}
function showLinkResult() {
  const url = state.__link, title = state.__linkTitle; state.__link = null; if (!url) return;
  const text = encodeURIComponent(`Hola, tienes una publicación lista para revisar: «${title}». Apruébala o pide cambios aquí: ${url}`);
  openModal({
    title: 'Enlace listo', cls: 'sheet-only',
    body: `<p class="subtle">Cópialo o envíalo ahora: por seguridad no se vuelve a mostrar.</p><input class="input" id="link-url" readonly value="${esc(url)}"><div class="modal-actions wrap-actions"><button class="primary" data-act="copy-link" data-url="${esc(url)}">Copiar enlace</button><a class="secondary" style="display:inline-grid;place-items:center;text-decoration:none;padding:0 16px" target="_blank" rel="noopener" href="https://wa.me/?text=${text}">WhatsApp</a><a class="secondary" style="display:inline-grid;place-items:center;text-decoration:none;padding:0 16px" href="mailto:?subject=${encodeURIComponent('Revisión: ' + title)}&body=${text}">Email</a></div>`
  });
  setTimeout(() => $('#link-url')?.select(), 50);
}

// ---------- aprobaciones ----------
function approvalRow(a) {
  const x = state.content.find(p => p.id === a.content_id);
  const waiting = a.status === 'pending';
  return rowBtn(`data-act="open-approval" data-id="${esc(a.id)}"`, `${thumb(x || {})}<span class="grow"><b>${esc(x?.title || 'Publicación')}</b><small>${esc(nameBrand(x?.brand_id))} · ${esc(lbl(x?.platform))} · ${esc(ago(a.created_at))}</small></span>${waiting ? pill('Revisar', 'warn') : sPill(a.status)}`);
}
function approvalsBlock(items, onlyPending = false) {
  const pend = items.filter(a => a.status === 'pending'), done = items.filter(a => a.status !== 'pending');
  if (onlyPending) return `<div class="list">${pend.map(approvalRow).join('') || empty('Todo revisado. No hay nada pendiente.')}</div>`;
  return `<div class="list">${pend.map(approvalRow).join('') || empty('No hay contenido pendiente de aprobación.')}</div>${done.length ? `<h3 class="section-title" style="margin:24px 0 10px">Historial</h3><div class="list">${done.slice(0, 30).map(approvalRow).join('')}</div>` : ''}`;
}
const viewApprovals = () => head('Aprobaciones', 'Propuestas pendientes de respuesta del cliente.') + approvalsBlock(state.approvals.filter(a => { const c = state.content.find(x => x.id === a.content_id); return c && (state.brand === 'all' || c.brand_id === state.brand); }));

// ---------- calendario ----------
// El cliente ve un calendario de solo lectura. El admin ve el planificador: bandeja «Sin fecha»
// + referencias, arrastrar y soltar (ratón o mantener pulsado en el móvil) y alta rápida por día.
function calendarView(items) {
  const admin = isAdmin();
  const d = state.month, y = d.getFullYear(), m = d.getMonth(), start = (new Date(y, m, 1).getDay() + 6) % 7, count = new Date(y, m + 1, 0).getDate(), today = localISO();
  const byDay = {};
  items.forEach(x => { if (x.scheduled_at) (byDay[localDay(x.scheduled_at)] ||= []).push(x); });
  let cells = ['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(x => `<div class="day-head">${x}</div>`).join('');
  for (let i = 0; i < start; i++) cells += '<div class="day blank"></div>';
  const monthEvents = [], max = admin ? 4 : 3;
  for (let day = 1; day <= count; day++) {
    const date = `${y}-${pad(m + 1)}-${pad(day)}`, ev = (byDay[date] || []).sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at));
    ev.forEach(e => monthEvents.push(e));
    const evBtn = e => admin
      ? `<button class="event ${e.status === 'idea' ? 'tentative' : ''}" style="--b:${colorSafe(brandById(e.brand_id)?.primary_color)}" data-act="open-content" data-id="${esc(e.id)}" data-drag="content" data-title="${esc(e.title)}">${esc(e.title)}</button>`
      : `<button class="event" data-act="open-content" data-id="${esc(e.id)}">${esc(e.title)}</button>`;
    const more = ev.length > max ? (admin ? `<button class="more" data-act="cal-more" data-date="${date}">+${ev.length - max} más</button>` : `<small class="more">+${ev.length - max}</small>`) : '';
    cells += `<div class="day ${date === today ? 'today' : ''} ${ev.length ? 'has' : ''}" ${admin ? `data-act="cal-day" data-date="${date}" data-drop="${date}"` : ''}><span>${day}</span>${ev.slice(0, max).map(evBtn).join('')}${more}${ev.length ? `<i class="dots">${ev.slice(0, 3).map(() => '<b></b>').join('')}</i>` : ''}</div>`;
  }
  const label = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(d);
  const bar = `<div class="toolbar cal-bar"><button class="secondary" data-act="month" data-id="-1" aria-label="Mes anterior">←</button><b class="cal-title">${esc(label)}</b><div class="actions"><button class="muted-btn" data-act="month" data-id="0">Hoy</button><button class="secondary" data-act="month" data-id="1" aria-label="Mes siguiente">→</button>${admin ? '<button class="primary" data-act="cal-add" data-date="">+ Idea</button>' : ''}</div></div>`;
  const grid = `<div class="calendar">${cells}</div>`;
  const agenda = `<h3 class="section-title" style="margin:22px 0 10px">Este mes</h3><div class="list agenda">${monthEvents.map(e => rowBtn(`data-act="open-content" data-id="${esc(e.id)}"`, `<span class="date-chip"><b>${new Date(e.scheduled_at).getDate()}</b><small>${new Date(e.scheduled_at).toLocaleDateString('es-ES', { weekday: 'short' })}</small></span><span class="grow"><b>${esc(e.title)}</b><small>${esc(nameBrand(e.brand_id))} · ${esc(new Date(e.scheduled_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }))} · ${esc(lbl(e.platform))}</small></span>${sPill(e.status)}`)).join('') || empty('Nada planificado este mes.')}</div><p class="footnote">Solo representa fechas planificadas. No publica en las redes sociales.</p>`;
  if (!admin) return bar + grid + agenda;
  const legend = '<div class="cal-legend"><span><i></i>En marcha</span><span><i class="dashed"></i>Idea tentativa</span><span>Ideas y contenido en producción no los ve el cliente.</span></div>';
  return bar + `<div class="planner"><div class="planner-main">${grid}${legend}</div>${plannerTray(items)}</div>` + agenda;
}
function plannerTray(items) {
  const loose = items.filter(x => !x.scheduled_at && x.status !== 'published');
  const refs = byBrand(state.refs), multi = state.brand === 'all';
  const card = (kind, x, img) => `<button class="tray-item" data-act="${kind === 'ref' ? 'ref-plan' : 'open-content'}" data-id="${esc(x.id)}" data-drag="${kind}" data-title="${esc(x.title)}">${img ? `<img src="${esc(safeUrl(img))}" alt="" draggable="false" loading="lazy" referrerpolicy="no-referrer">` : `<i class="tray-ico">${ic(kind === 'ref' ? 'image' : 'content', 16)}</i>`}<span><b>${esc(x.title)}</b><small>${esc((multi ? nameBrand(x.brand_id) + ' · ' : '') + lbl(x.content_type))}</small></span></button>`;
  return `<aside class="tray" aria-label="Bandeja de planificación"><section class="tray-sec" data-drop=""><h4>Sin fecha <span>${loose.length}</span></h4><div class="tray-list">${loose.map(x => card('content', x, x.media_url)).join('') || '<p class="tray-empty">Suelta aquí una publicación para quitarle la fecha.</p>'}</div></section>`
    + `<section class="tray-sec"><h4>Referencias <span>${refs.length}</span></h4><div class="tray-list">${refs.map(r => card('ref', r, r.image_url)).join('') || '<p class="tray-empty">Guarda referencias en la Biblioteca y aparecerán aquí.</p>'}</div></section>`
    + '<p class="tray-hint">Arrastra al día que quieras (en el móvil, mantén pulsado y arrastra). Toca para editar o programar.</p></aside>';
}

// ---------- planificador: alta rápida, desde referencia, mover ----------
const FORMATS = ['post', 'reel', 'story', 'carousel', 'video', 'other'];
const PLATFORMS = ['instagram', 'facebook', 'tiktok', 'linkedin', 'pinterest', 'other'];
const platformOf = s => { const v = String(s || '').trim().toLowerCase(); return PLATFORMS.includes(v) ? v : v ? 'other' : 'instagram'; };
const atLocal = (date, time = '10:00') => new Date(`${date}T${time}`).toISOString();
const timeOf = s => (s ? new Date(s).toTimeString().slice(0, 5) : '10:00');
const refById = id => state.refs.find(r => r.id === id);
const refBox = r => `<div class="ref-preview full-col">${r.image_url ? `<img src="${esc(safeUrl(r.image_url))}" alt="" referrerpolicy="no-referrer">` : ''}<div><small class="subtle">Referencia</small><b>${esc(r.title)}</b>${r.reference_url ? `<a target="_blank" rel="noopener noreferrer" href="${esc(safeUrl(r.reference_url))}">Ver referencia ↗</a>` : ''}</div></div>`;
// reference_id es opcional (sql/08). Si la columna aún no existe, se guarda sin el vínculo.
async function createContent(row) {
  try { return await saveEntity('content_items', null, row); }
  catch (e) { if (row.reference_id && /reference_id/i.test(e.message || '')) { const { reference_id: _, ...rest } = row; return saveEntity('content_items', null, rest); } throw e; }
}
const ideaFromRef = (r, date) => ({ brand_id: r.brand_id, title: r.title, content_type: FORMATS.includes(r.content_type) ? r.content_type : 'other', platform: platformOf(r.platform), status: 'idea', scheduled_at: date ? atLocal(date) : null, reference_id: r.id });

function openPlanner({ date = '', refId = '' } = {}) {
  if (!isAdmin()) return;
  if (!state.brands.length) { message('Primero debes crear el cliente y su marca.', 'bad'); return; }
  const r = refId ? refById(refId) : null, brand = r?.brand_id || (state.brand !== 'all' ? state.brand : '');
  const opt = a => a.map(v => [v, lbl(v)]);
  const body = (r ? refBox(r) : '')
    + (brand ? `<input type="hidden" name="brand_id" value="${esc(brand)}">` : sel('brand_id', 'Marca', state.brands.map(b => [b.id, b.name]), '', { full: 1 }))
    + fld('title', 'Idea / título', r?.title || '', 'text', { req: 1, full: 1, ph: 'Ej.: Reel detrás de cámaras' })
    + sel('content_type', 'Formato', opt(FORMATS), r?.content_type || 'post') + sel('platform', 'Plataforma', opt(PLATFORMS), platformOf(r?.platform))
    + fld('date', 'Fecha (opcional)', date, 'date') + fld('time', 'Hora', '10:00', 'time')
    + sel('status', 'Estado', [['idea', 'Tentativo · idea'], ['production', 'En producción']], 'idea', { full: 1 })
    + '<p class="subtle full-col" style="margin:0;font-size:12px">Sin fecha, queda en la bandeja «Sin fecha». Después tócala en el calendario para añadir el copy, la pieza o cambiar la fecha.</p>';
  openModal({
    title: r ? 'Pasar al calendario' : 'Planificar idea', eyebrow: date ? fmtDay(date) : 'Planificador', submitLabel: date ? 'Añadir al calendario' : 'Guardar idea', body,
    onSubmit: async fd => {
      const v = Object.fromEntries(fd);
      const row = { brand_id: v.brand_id, title: String(v.title).trim(), content_type: v.content_type, platform: v.platform, status: v.status, scheduled_at: v.date ? atLocal(v.date, v.time || '10:00') : null };
      if (r) row.reference_id = r.id;
      await createContent(row);
    }
  });
}
function openDay(date) {
  const ev = byBrand(state.content).filter(x => x.scheduled_at && localDay(x.scheduled_at) === date).sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at));
  openModal({
    title: fmtDay(date), eyebrow: 'Planificación del día',
    body: `<div class="list">${ev.map(e => rowBtn(`data-act="open-content" data-id="${esc(e.id)}"`, `<span class="grow"><b>${esc(e.title)}</b><small>${esc(nameBrand(e.brand_id))} · ${esc(timeOf(e.scheduled_at))} · ${esc(lbl(e.platform))}</small></span>${sPill(e.status)}`)).join('') || empty('Nada planificado este día.')}</div><div class="modal-actions"><span class="grow"></span><button class="muted-btn" data-act="close-modal">Cerrar</button><button class="primary" data-act="cal-add" data-date="${esc(date)}">+ Añadir aquí</button></div>`
  });
}
// Soltar en un día (date) o en la bandeja (date = '' → sin fecha).
async function dropOn(kind, id, date) {
  if (kind === 'ref') {
    const r = refById(id); if (!r) return;
    await createContent(ideaFromRef(r, date)); await refreshData();
    message(date ? `Idea creada el ${fmtDay(date)}. Tócala para completarla.` : 'Idea creada en «Sin fecha».');
    return;
  }
  const post = state.content.find(x => x.id === id); if (!post) return;
  if ((post.scheduled_at ? localDay(post.scheduled_at) : '') === date) return;
  const prev = post.scheduled_at, next = date ? atLocal(date, timeOf(prev)) : null;
  post.scheduled_at = next; render({ keepScroll: true }); // se ve al instante; si falla, se deshace
  try {
    const rows = await write('content_items', 'PATCH', { scheduled_at: next }, eq('id', id));
    if (!Array.isArray(rows) || rows.length !== 1) throw Error('No se pudo mover. Revisa los permisos de Supabase.');
    message(date ? `«${post.title}» movida al ${fmtDay(date)}.` : `«${post.title}» está ahora en «Sin fecha».`);
  } catch (e) { post.scheduled_at = prev; render({ keepScroll: true }); throw e; }
}

// Arrastrar y soltar con Pointer Events: ratón (al mover 6 px) y dedo (mantener pulsado 300 ms).
let drag = null, noClickUntil = 0;
function dragStart() {
  drag.on = true;
  const g = document.createElement('div'); g.className = 'drag-ghost'; g.textContent = drag.src.dataset.title || drag.src.textContent.trim();
  document.body.append(g); drag.ghost = g;
  drag.src.classList.add('drag-src'); document.body.classList.add('dragging');
  dragMove(drag.x, drag.y);
  navigator.vibrate?.(12);
}
function dragMove(x, y) {
  drag.ghost.style.transform = `translate(${x + 14}px, ${y + 10}px)`;
  const t = document.elementFromPoint(x, y)?.closest('[data-drop]') || null;
  if (t !== drag.over) { drag.over?.classList.remove('drop-over'); t?.classList.add('drop-over'); drag.over = t; }
  if (y < 70) scrollBy(0, -14); else if (y > innerHeight - 70) scrollBy(0, 14);
}
function dragEnd(commit) {
  const d = drag; drag = null;
  if (!d) return;
  clearTimeout(d.timer);
  if (!d.on) return;
  d.ghost.remove(); d.src.classList.remove('drag-src'); document.body.classList.remove('dragging'); d.over?.classList.remove('drop-over');
  noClickUntil = Date.now() + 300;
  if (commit && d.over) dropOn(d.kind, d.id, d.over.dataset.drop).catch(e => message(friendly(e), 'bad'));
}
document.addEventListener('pointerdown', e => {
  const src = e.target.closest('[data-drag]');
  if (!src || e.button > 0 || !isAdmin()) return;
  drag = { src, kind: src.dataset.drag, id: src.dataset.id, x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, on: false, touch: e.pointerType !== 'mouse' };
  if (drag.touch) drag.timer = setTimeout(() => { if (drag && !drag.on) dragStart(); }, 300);
});
document.addEventListener('pointermove', e => {
  if (!drag) return;
  drag.x = e.clientX; drag.y = e.clientY;
  if (drag.on) { dragMove(e.clientX, e.clientY); return; }
  const dist = Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0);
  if (drag.touch) { if (dist > 10) dragEnd(false); } else if (dist > 6) dragStart();
});
document.addEventListener('pointerup', () => dragEnd(true));
document.addEventListener('pointercancel', () => dragEnd(false));
document.addEventListener('touchmove', e => { if (drag?.on) e.preventDefault(); }, { passive: false });
document.addEventListener('contextmenu', e => { if (drag) e.preventDefault(); });
document.addEventListener('click', e => { if (Date.now() < noClickUntil) { e.preventDefault(); e.stopPropagation(); } }, true);

// ---------- tareas y referencias ----------
function taskTable(items) {
  const today = localISO();
  return `<div class="table-wrap"><table class="data-table stack"><thead><tr><th>Tarea</th><th>Marca</th><th>Prioridad</th><th>Estado</th><th>Entrega</th><th></th></tr></thead><tbody>${items.map(x => `<tr><td data-label="Tarea"><b>${esc(x.title)}</b><br><small>${esc(x.description || '')}</small></td><td data-label="Marca">${esc(nameBrand(x.brand_id))}</td><td data-label="Prioridad">${sPill(x.priority)}</td><td data-label="Estado"><select class="input compact" data-change="task-status" data-id="${esc(x.id)}" aria-label="Estado">${['pending', 'in_progress', 'completed'].map(s => `<option value="${s}" ${s === x.status ? 'selected' : ''}>${lbl(s)}</option>`).join('')}</select></td><td data-label="Entrega" class="${x.due_date && x.due_date < today && x.status !== 'completed' ? 'late' : ''}">${esc(x.due_date ? fmtDay(x.due_date) : '—')}</td><td class="act"><button class="muted-btn" data-act="modal" data-type="task" data-id="${esc(x.id)}">Editar</button></td></tr>`).join('') || '<tr><td colspan="6">Sin tareas todavía.</td></tr>'}</tbody></table></div>`;
}
const viewTasks = () => head('Mi trabajo', 'Tareas del equipo y plazos.', '<button class="primary" data-act="modal" data-type="task">+ Nueva tarea</button>') + taskTable(byBrand(state.tasks));
function refCards(refs) {
  return `<div class="ref-grid">${refs.map(r => `<article class="brand-card">${r.image_url ? `<img class="ref-image" src="${esc(safeUrl(r.image_url))}" loading="lazy" referrerpolicy="no-referrer" alt="Referencia ${esc(r.title)}">` : ''}<strong>${esc(r.title)}</strong><p class="subtle" style="font-size:13px">${esc(r.description || r.notes || '')}</p><div class="chips">${pill(nameBrand(r.brand_id))}${pill(lbl(r.content_type))}${pill(r.platform || 'Otros')}${isAdmin() && state.content.some(c => c.reference_id === r.id) ? pill('En calendario', 'ok') : ''}</div>${r.reference_url ? `<p><a target="_blank" rel="noopener noreferrer" href="${esc(safeUrl(r.reference_url))}">Ver referencia ↗</a></p>` : ''}${isAdmin() ? `<div class="actions card-actions"><button class="primary" data-act="ref-plan" data-id="${esc(r.id)}">→ Calendario</button><button class="secondary" data-act="modal" data-type="reference" data-id="${esc(r.id)}">Editar</button><button class="muted-btn danger" data-act="delete-ref" data-id="${esc(r.id)}">Eliminar</button></div>` : ''}</article>`).join('') || empty('Sin referencias guardadas.')}</div>`;
}
const viewReferences = () => head('Biblioteca de inspiración', 'Referencias visuales por marca.', '<button class="primary" data-act="modal" data-type="reference">+ Guardar referencia</button>') + refCards(byBrand(state.refs));

// ---------- PLAN ----------
function viewPlan(b) {
  const admin = isAdmin(), p = brandPlan(b.id), today = localISO();
  let h = secHead('Tu plan', 'Acuerdo, entregables y trabajos realizados.', admin ? `<button class="secondary" data-act="f" data-f="config-plan">${p ? 'Editar plan' : 'Configurar plan'}</button>` : '');
  if (!p) return h + `<section class="panel"><h3>Plan pendiente de configuración</h3><p class="subtle">LE STUDIO debe definir primero el importe mensual, la fecha de inicio y los entregables acordados. No mostramos precios inventados.</p></section>`;
  const per = selectedPeriod(p), cur = p.currency || 'EUR', periods = monthPeriods(b.id), openPer = periods.find(x => x.status !== 'closed');
  h += `<section class="panel plan-cover"><div><div class="eyebrow">${esc(b.name)} · ${esc(p.title)}</div><h2>Tu servicio, claro y transparente.</h2><div class="subtle">Desde el ${fmtDay(p.started_on)} · ciclos de facturación según la fecha de inicio</div></div><div class="plan-cover-price">${p.base_fee === null ? 'Por definir' : money(p.base_fee, cur)}<small>Cuota por ciclo · ${esc(cur)}</small></div></section>`;
  if (admin && p.started_on <= today) {
    if (!openPer) { const c = futureCycle(today, p.started_on); h += `<div class="banner warn"><div><b>No hay un periodo abierto.</b> El siguiente ciclo va del ${fmtDay(c.start)} al ${fmtDay(c.end)}.</div><button class="primary" data-act="f" data-f="create-period">Abrir periodo</button></div>`; }
    else if (openPer.ends_on < today) h += `<div class="banner bad"><div><b>El periodo terminó el ${fmtDay(openPer.ends_on)}.</b> Revisa las entregas y ciérralo para generar el borrador de factura.</div></div>`;
  }
  h += `<div class="toolbar" style="margin-top:20px"><h3 class="section-title" style="margin:0">Periodo de trabajo</h3><div class="actions">${periods.length ? `<select class="input compact" id="period-choice" data-change="period" aria-label="Periodo">${periods.map(x => `<option value="${esc(x.id)}" ${x.id === per?.id ? 'selected' : ''}>${fmtDay(x.starts_on)} → ${fmtDay(x.ends_on)}${x.status === 'closed' ? ' · Cerrado' : ''}</option>`).join('')}</select>` : '<span class="subtle">Todavía no hay periodos</span>'}${admin ? '<button class="secondary" data-act="f" data-f="create-period">+ Abrir periodo</button>' : ''}</div></div>`;
  if (!per) return h + empty('LE STUDIO debe abrir el primer periodo para registrar avances y extras.');
  const lines = periodDeliveries(per.id), progress = planProgress(p, per), c = costSnapshot(p, per), isClosed = per.status === 'closed';
  const pct = progress.length ? progress.reduce((s, v) => s + v.ratio, 0) / progress.length * 100 : 0;
  const inv = linkedInvoice(per.id);
  h += `<div class="cards auto">${stat(Math.round(pct) + '%', 'Avance de entregables')}${admin ? stat(progress.some(hasVal) ? money(executedValue(progress), cur) : 'Sin valorar', 'Valor ejecutado estimado*') : ''}${stat(isClosed && inv ? money(inv.total_amount, cur) : (c.total === null ? 'Por definir' : money(c.total, cur)), isClosed && inv ? 'Importe facturado del ciclo' : 'Importe previsto del ciclo')}</div>`;
  h += `<div class="grid-two"><section class="panel"><h3 class="section-title">Qué incluye tu plan</h3>${progress.length ? progress.map(x => `<div class="plan-item"><div class="plan-item-head"><b>${esc(x.title)}</b><span>${fNum(x.completed)} / ${fNum(x.target_qty)} ${esc(x.unit_label)}</span></div><div class="meter" role="progressbar" aria-valuenow="${Math.round(x.ratio * 100)}" aria-valuemin="0" aria-valuemax="100"><i style="width:${Math.round(x.ratio * 100)}%"></i></div><div class="actions"><small class="subtle">${esc(x.category || '')}</small>${admin && !isClosed ? `<button class="muted-btn" data-act="f" data-f="log-delivery" data-item="${esc(x.id)}">+ Entrega</button><button class="muted-btn" data-act="f" data-f="edit-item" data-item="${esc(x.id)}">Editar</button>` : ''}</div></div>`).join('') : empty('Aún no se han definido los servicios incluidos.')}${admin ? '<div class="actions" style="margin-top:12px"><button class="secondary" data-act="f" data-f="new-item">+ Servicio del plan</button></div>' : ''}</section>`
    + `<section class="panel"><h3 class="section-title">Balance del periodo</h3><div class="sum-row"><span>Cuota del plan</span><b>${c.base === null ? 'Por definir' : money(c.base, cur)}</b></div><div class="sum-row"><span>Extras completados</span><b>${money(c.ext, cur)}</b></div><div class="sum-row"><span>Ajustes completados</span><b>${money(c.adjust, cur)}</b></div>${c.subtotal === null ? '' : `<div class="sum-row"><span>Impuestos (${fNum(p.tax_percent)}%)</span><b>${money(c.tax, cur)}</b></div>`}<div class="sum-row major"><span>Total estimado</span><b>${c.total === null ? 'Por definir' : money(c.total, cur)}</b></div><p class="footnote">${admin ? '* El valor ejecutado es orientativo y solo cuenta entregables con valor asignado. ' : ''}La cuota se factura completa salvo acuerdo distinto; las tareas pendientes no se descuentan automáticamente. ${isClosed ? 'Periodo cerrado: el importe definitivo es el de la factura.' : 'El importe definitivo lo fija el cierre del periodo.'}</p><div class="actions">${admin && !isClosed ? '<button class="secondary" data-act="f" data-f="new-extra">+ Extra</button><button class="secondary" data-act="f" data-f="close-period">Cerrar periodo</button>' : pill(isClosed ? 'Periodo cerrado' : 'En curso', isClosed ? 'muted' : 'info')}<button class="muted-btn" data-act="report">${ic('download', 16)} Informe</button></div></section></div>`;
  if (admin || fin.extras.some(x => x.plan_id === p.id && x.active !== false)) h += `<section class="panel" style="margin-top:16px"><div class="toolbar" style="margin-bottom:6px"><h3 class="section-title" style="margin:0">Tarifas de extras</h3>${admin ? '<button class="secondary" data-act="f" data-f="new-extra-price">+ Definir tarifa</button>' : ''}</div>${fin.extras.filter(x => x.plan_id === p.id && x.active !== false).map(x => `<div class="sum-row"><span>${esc(x.title)} · ${esc(x.unit_label)}</span><b>${money(x.unit_price, cur)} ${admin ? `<button class="muted-btn" data-act="f" data-f="edit-extra-price" data-catalog="${esc(x.id)}">Editar</button>` : ''}</b></div>`).join('') || empty('Sin tarifas predefinidas. Puedes registrar extras con precio manual.')}</section>`;
  h += `<section class="panel" style="margin-top:16px"><h3 class="section-title">Historial de entregas y extras</h3>${lines.length ? `<div class="table-wrap"><table class="data-table stack"><thead><tr><th>Trabajo</th><th>Tipo</th><th>Estado</th><th>Cant.</th><th>Importe</th><th></th></tr></thead><tbody>${lines.map(d => `<tr><td data-label="Trabajo">${esc(d.title)}</td><td data-label="Tipo">${esc(lbl(d.kind))}</td><td data-label="Estado">${sPill(d.status)}</td><td data-label="Cant.">${fNum(d.quantity)}</td><td data-label="Importe">${d.kind === 'included' ? 'Incluido' : money(num(d.unit_price) * num(d.quantity), cur)}</td><td class="act">${admin && !isClosed ? `<button class="muted-btn" data-act="f" data-f="edit-delivery" data-delivery="${esc(d.id)}">Editar</button>` : ''}</td></tr>`).join('')}</tbody></table></div>` : empty('Todavía no hay entregas registradas.')}</section>`;
  return h;
}

// ---------- FACTURACIÓN ----------
function invoiceRows(infos, withBrand) {
  const admin = isAdmin();
  return infos.map(x => `<tr>${withBrand ? `<td data-label="Marca">${esc(nameBrand(x.brand))}</td>` : ''}<td data-label="Periodo">${fmtDay(x.per?.starts_on)} – ${fmtDay(x.per?.ends_on)}</td><td data-label="Documento">${esc(x.i.number || 'Borrador')}</td><td data-label="Total">${money(x.total, x.cur)}</td><td data-label="Pagado">${money(x.paid, x.cur)}</td><td data-label="Pendiente">${x.i.status === 'issued' ? money(x.left, x.cur) : '—'}</td><td data-label="Vence">${x.i.due_on ? fmtDay(x.i.due_on) : '—'}</td><td data-label="Estado">${pill(x.label, x.tone)}</td><td class="act">${admin ? `<button class="secondary" data-act="f" data-f="manage-invoice" data-invoice="${esc(x.i.id)}">Gestionar</button>` : ''}</td></tr>`).join('');
}
const totalsCards = t => `<div class="cards auto">${stat(fmtMap(t.billed), 'Facturado')}${stat(fmtMap(t.paid), 'Cobrado')}${stat(fmtMap(t.left), 'Pendiente de pago', Object.keys(t.overdue).length && fmtMap(t.overdue) !== money(0) ? 'bad' : '')}</div>${fmtMap(t.over) !== money(0) ? `<p class="footnote">Hay pagos por encima del importe facturado (${esc(fmtMap(t.over))}). Revísalos.</p>` : ''}`;
function viewBilling(b) {
  const p = brandPlan(b.id);
  let h = secHead('Facturación', 'Historial de cierres y control de pagos.', `<button class="muted-btn" data-act="export" data-id="billing">${ic('download', 16)} CSV</button>`);
  if (!p) return h + empty('No se ha definido el plan de esta marca.');
  const infos = fin.invoices.map(invoiceInfo).filter(x => x.plan?.id === p.id);
  return h + totalsCards(billingTotals(infos)) + `<section class="panel" style="margin-top:16px"><p class="subtle" style="font-size:13px;margin-top:0">Los importes cerrados no cambian aunque se modifique el plan. Es un control interno; no sustituye una factura fiscal emitida correctamente.</p><div class="table-wrap"><table class="data-table stack"><thead><tr><th>Periodo</th><th>Documento</th><th>Total</th><th>Pagado</th><th>Pendiente</th><th>Vence</th><th>Estado</th><th></th></tr></thead><tbody>${invoiceRows(infos, false) || '<tr><td colspan="8">Sin periodos cerrados todavía.</td></tr>'}</tbody></table></div></section>`;
}
function viewFinance() {
  if (fin.error) return head('Finanzas') + finError();
  const infos = fin.invoices.map(invoiceInfo).filter(x => x.plan && (state.brand === 'all' || x.brand === state.brand)).sort((a, b) => (b.per?.starts_on || '').localeCompare(a.per?.starts_on || ''));
  const att = attentionItems().filter(a => a.section === 'billing' || a.section === 'plan');
  return head('Finanzas', 'Cobros y cierres de todas tus marcas.', `<button class="muted-btn" data-act="export" data-id="finance">${ic('download', 16)} CSV</button>`)
    + totalsCards(billingTotals(infos))
    + (att.length ? `<section class="panel" style="margin-top:16px"><h3 class="section-title">Pendiente de hacer</h3><div class="list">${att.map(a => rowBtn(`data-act="focus" data-brand="${esc(a.brand)}" data-section="${a.section}"`, `<span class="dot ${a.tone}"></span><span class="grow"><b>${esc(a.title)}</b><small>${esc(a.sub)}</small></span>`)).join('')}</div></section>` : '')
    + `<section class="panel" style="margin-top:16px"><h3 class="section-title">Facturas</h3><div class="table-wrap"><table class="data-table stack"><thead><tr><th>Marca</th><th>Periodo</th><th>Documento</th><th>Total</th><th>Pagado</th><th>Pendiente</th><th>Vence</th><th>Estado</th><th></th></tr></thead><tbody>${invoiceRows(infos, true) || '<tr><td colspan="9">Todavía no hay facturas.</td></tr>'}</tbody></table></div></section>`;
}

// ---------- ACTIVIDAD (registro de cambios; requiere el SQL v2.5) ----------
const ENT = { plan_deliveries: 'Entrega', plan_invoices: 'Factura', plan_payments: 'Pago', service_plans: 'Plan', plan_periods: 'Periodo', content_approvals: 'Aprobación', brands: 'Marca', clients: 'Cliente' };
const ACT = { insert: 'creó', update: 'modificó', delete: 'eliminó' };
async function loadActivity() {
  try { state.activity = await request('/rest/v1/activity_log?select=*&order=created_at.desc&limit=200'); state.activityError = null; }
  catch (e) { state.activity = []; state.activityError = e.message; }
}
function viewActivity() {
  const h = head('Actividad', 'Quién cambió qué y cuándo (últimos 200 movimientos).');
  if (state.activity === null) return h + empty('Cargando…');
  if (state.activityError) return h + `<div class="alert">No se pudo leer el registro: ${esc(state.activityError)}.<br>Ejecuta el SQL v2.5 en Supabase para activarlo.</div>`;
  return h + `<div class="panel"><div class="list">${state.activity.map(r => {
    const d = r.detail || {}, o = d.new || d.old || {}, name = o.title || o.number || o.name || (o.amount !== undefined ? money(o.amount) : '') || '';
    const changed = r.action === 'update' && d.new && d.old ? Object.keys(d.new).filter(k => k !== 'updated_at' && JSON.stringify(d.new[k]) !== JSON.stringify(d.old[k])).slice(0, 4).join(', ') : '';
    return `<div class="row static"><span class="dot"></span><span class="grow"><b>${esc(ENT[r.entity] || r.entity)} ${esc(ACT[r.action] || r.action)}${name ? ': ' + esc(name) : ''}</b><small>${r.actor_id === state.session?.user?.id ? 'Tú' : 'Otro miembro'} · ${esc(fmtDateTime(r.created_at))}${changed ? ' · cambió: ' + esc(changed) : ''}</small></span></div>`;
  }).join('') || empty('Todavía no hay movimientos registrados.')}</div></div>`;
}

// ---------- MÉTRICAS ----------
const PLATFORM_LABELS = { instagram: 'Instagram', facebook: 'Facebook', tiktok: 'TikTok', google_business: 'Google Maps / Business Profile', website: 'Sitio web', other: 'Otros' };
const METRIC_LABELS = { followers: 'Seguidores', reach: 'Alcance', views: 'Visualizaciones', engagements: 'Interacciones', profile_visits: 'Visitas al perfil', posts: 'Publicaciones', rating: 'Valoración (estrellas)', reviews: 'Reseñas', calls: 'Llamadas', directions: 'Solicitudes de cómo llegar', clicks: 'Clics en web', impressions: 'Impresiones', other: 'Indicador personalizado' };
function metricSpark(data) {
  if (data.length < 2) return '';
  const pts = [...data].sort((a, b) => a.measured_on.localeCompare(b.measured_on)), v = pts.map(p => num(p.value)), lo = Math.min(...v), hi = Math.max(...v), df = Math.max(1e-9, hi - lo);
  const xy = v.map((n, i) => `${(i / (v.length - 1) * 250).toFixed(1)},${(45 - (n - lo) / df * 36).toFixed(1)}`).join(' ');
  return `<svg viewBox="0 0 250 50" class="metric-spark" role="img" aria-label="Evolución de ${pts.length} mediciones"><polyline points="${xy}" fill="none" stroke="var(--accent)" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/></svg>`;
}
function viewMetrics(b) {
  const admin = isAdmin(), all = fin.metrics.filter(x => x.brand_id === b.id);
  let platform = state.metricPlatform;
  if (!all.some(x => x.platform === platform) && all.length) platform = all[0].platform;
  const rows = all.filter(x => x.platform === platform), keys = [...new Set(rows.map(r => r.metric_key))];
  let h = secHead('Métricas y evolución', 'Punto de partida frente a cada actualización.', `${all.length ? `<button class="muted-btn" data-act="export" data-id="metrics">${ic('download', 16)} CSV</button>` : ''}${admin ? '<button class="primary" data-act="f" data-f="new-metric">+ Registrar</button>' : ''}`);
  h += `<div class="metric-tabs">${Object.entries(PLATFORM_LABELS).map(([k, l]) => `<button data-act="metric-platform" data-id="${k}" class="${k === platform ? 'active' : ''}">${l}${all.some(x => x.platform === k) ? '' : ''}</button>`).join('')}</div>`;
  h += `<div class="panel"><div class="toolbar"><h3 class="section-title" style="margin:0">${esc(PLATFORM_LABELS[platform])} · Antes y ahora</h3><span class="subtle">Datos introducidos por LE STUDIO</span></div>${keys.length ? `<div class="brand-grid">${keys.map(key => {
    const sorted = rows.filter(x => x.metric_key === key).sort((a, c) => a.measured_on.localeCompare(c.measured_on));
    const init = sorted.find(x => x.period_type === 'baseline') || sorted[0], curr = sorted[sorted.length - 1], diff = num(curr.value) - num(init.value);
    const cls = diff > 0 ? 'up' : diff < 0 ? 'down' : 'flat', arrow = diff > 0 ? '▲' : diff < 0 ? '▼' : '■', pctTxt = num(init.value) !== 0 ? ` (${diff > 0 ? '+' : ''}${fNum(diff / num(init.value) * 100)}%)` : '';
    return `<div class="brand-card metric-card"><small>${esc(curr.metric_label || key)}</small><strong>${fNum(curr.value)}</strong>${metricSpark(sorted)}<div class="metric-diff ${cls}">${arrow} ${diff > 0 ? '+' : ''}${fNum(diff)}${pctTxt} desde el inicio</div><div class="subtle">Antes: ${fNum(init.value)} · ${fmtDay(init.measured_on)}</div><div class="subtle">Último: ${fmtDay(curr.measured_on)}</div></div>`;
  }).join('')}</div>` : empty('Aún no hay métricas para esta plataforma. LE STUDIO puede introducir la línea base y los resultados mensuales.')}</div>`;
  h += `<section class="panel" style="margin-top:16px"><h3 class="section-title">Historial de mediciones</h3><div class="table-wrap"><table class="data-table stack"><thead><tr><th>Fecha</th><th>Indicador</th><th>Valor</th><th>Tipo</th><th>Fuente</th><th></th></tr></thead><tbody>${[...rows].sort((a, c) => c.measured_on.localeCompare(a.measured_on)).map(x => `<tr><td data-label="Fecha">${fmtDay(x.measured_on)}</td><td data-label="Indicador">${esc(x.metric_label)}</td><td data-label="Valor">${fNum(x.value)}</td><td data-label="Tipo">${pill(x.period_type === 'baseline' ? 'Antes' : x.period_type === 'month' ? 'Mensual' : 'Actualización')}</td><td data-label="Fuente">${esc(x.source || '')}</td><td class="act">${admin ? `<button class="muted-btn" data-act="f" data-f="edit-metric" data-metric="${esc(x.id)}">Editar</button>` : ''}</td></tr>`).join('') || '<tr><td colspan="6">Sin mediciones.</td></tr>'}</tbody></table></div><p class="footnote">Cifras introducidas manualmente por LE STUDIO. No son estadísticas extraídas en directo de Instagram ni Google.</p></section>`;
  return h;
}

// ============================================================================
// MODALES, FORMULARIOS Y ACCIONES
// ============================================================================
let modalPrev = null;
function closeModal() {
  const root = $('#modal-root');
  if (!root.firstChild) return;
  root.replaceChildren();
  document.body.classList.remove('modal-open');
  modalPrev?.focus?.({ preventScroll: true }); modalPrev = null;
}
function openModal({ title, eyebrow = '', body, onSubmit, submitLabel = 'Guardar', cls = '', extra = '', onOpen }) {
  const root = $('#modal-root');
  if (!root.firstChild) modalPrev = document.activeElement;
  root.innerHTML = `<div class="modal-backdrop" id="mbd"><div class="modal ${cls}" role="dialog" aria-modal="true" aria-labelledby="m-title" tabindex="-1"><div class="grip"></div>${eyebrow ? `<div class="eyebrow">${esc(eyebrow)}</div>` : ''}<h2 id="m-title">${esc(title)}</h2>${onSubmit ? `<form id="modal-form" autocomplete="off"><div class="modal-grid">${body}</div><p class="form-error" id="form-error" role="alert"></p><div class="modal-actions">${extra}<span class="grow"></span><button type="button" class="muted-btn" data-act="close-modal">Cancelar</button><button type="submit" class="primary">${esc(submitLabel)}</button></div></form>` : body}</div></div>`;
  document.body.classList.add('modal-open');
  $('#mbd').addEventListener('mousedown', e => { if (e.target.id === 'mbd') closeModal(); });
  const form = $('#modal-form');
  if (form) form.onsubmit = async e => {
    e.preventDefault();
    const btn = form.querySelector('[type=submit]');
    btn.disabled = true; $('#form-error').textContent = '';
    try { await onSubmit(new FormData(form), form); closeModal(); await refreshData(); if (state.__link) showLinkResult(); else message('Cambios guardados correctamente.'); }
    catch (err) { $('#form-error').textContent = friendly(err); btn.disabled = false; }
  };
  onOpen?.(root);
  const m = root.querySelector('.modal');
  if (matchMedia('(pointer:fine)').matches) (root.querySelector('input:not([type=hidden]):not([type=file]),select,textarea') || m).focus({ preventScroll: true });
  else m.focus({ preventScroll: true });
}
function confirmBox(text, { title = '¿Confirmas?', ok = 'Confirmar', danger = false } = {}) {
  return new Promise(res => {
    const root = $('#confirm-root'), prev = document.activeElement;
    root.innerHTML = `<div class="modal-backdrop top"><div class="modal small" role="alertdialog" aria-modal="true" aria-labelledby="c-title"><h2 id="c-title">${esc(title)}</h2><p class="subtle" style="white-space:pre-line">${esc(text)}</p><div class="modal-actions"><span class="grow"></span><button class="muted-btn" data-c="0">Cancelar</button><button class="primary ${danger ? 'danger-btn' : ''}" data-c="1">${esc(ok)}</button></div></div></div>`;
    const done = v => { root.replaceChildren(); confirmBox.cancel = null; prev?.focus?.({ preventScroll: true }); res(v); };
    root.querySelectorAll('[data-c]').forEach(b => { b.onclick = () => done(b.dataset.c === '1'); });
    root.querySelector('[data-c="1"]').focus();
    confirmBox.cancel = () => done(false);
  });
}
async function refreshData(keep = true) { await hydrate(); lastSync = Date.now(); render({ keepScroll: keep }); }

// ---------- campos ----------
const fld = (name, label, value = '', type = 'text', o = {}) => `<label class="label ${o.full ? 'full-col' : ''}">${esc(label)}<input class="input" name="${name}" type="${type}" value="${esc(value ?? '')}" ${o.req ? 'required' : ''} ${type === 'number' ? `step="${o.step || 'any'}" inputmode="decimal" ${o.min !== undefined ? `min="${o.min}"` : ''}` : ''} ${o.ph ? `placeholder="${esc(o.ph)}"` : ''} ${o.attrs || ''}></label>`;
const area = (name, label, value = '') => `<label class="label full-col">${esc(label)}<textarea class="input" name="${name}" rows="3">${esc(value ?? '')}</textarea></label>`;
const sel = (name, label, options, selected, o = {}) => `<label class="label ${o.full ? 'full-col' : ''}">${esc(label)}<select name="${name}" class="input" ${o.attrs || ''}>${options.map(([v, t]) => `<option value="${esc(v)}" ${String(selected ?? '') === String(v) ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select></label>`;
const fileFld = (name, label) => `<label class="label full-col">${esc(label)}<input name="${name}" type="file" accept="image/png,image/jpeg,image/webp" class="input"></label>`;

async function uploadPublicImage(file, folder) {
  if (!file || !file.size) return null;
  if (file.size > 5 * 1024 * 1024) throw Error('La imagen debe pesar menos de 5 MB.');
  const ext = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' }[file.type];
  if (!ext) throw Error('Formato de imagen no admitido (usa PNG, JPG o WebP).');
  await active();
  const key = `${folder}/${crypto.randomUUID()}.${ext}`;
  const r = await fetch(`${SUPABASE_URL}/storage/v1/object/brand-public/${key}`, { method: 'POST', headers: { apikey: ANON_KEY, Authorization: 'Bearer ' + state.session.access_token, 'Content-Type': file.type, 'x-upsert': 'false' }, body: file });
  if (!r.ok) { const d = await r.json().catch(() => ({})); throw Error(d.message || d.error || 'No se pudo subir la imagen. Comprueba el bucket en Supabase.'); }
  return `${SUPABASE_URL}/storage/v1/object/public/brand-public/${key}`;
}
async function saveEntity(table, id, vals) {
  const rows = id ? await write(table, 'PATCH', vals, eq('id', id)) : await write(table, 'POST', vals);
  if (!Array.isArray(rows) || rows.length !== 1) throw Error(id ? 'No se actualizó el registro. Revisa los permisos de Supabase.' : 'No se pudo crear el registro.');
  return rows[0];
}
async function deleteRow(table, id, text, title = 'Eliminar') {
  if (!(await confirmBox(text, { title, ok: 'Eliminar', danger: true }))) return false;
  const rows = await write(table, 'DELETE', undefined, eq('id', id));
  if (!Array.isArray(rows) || rows.length !== 1) throw Error('No se pudo eliminar. Comprueba los permisos en Supabase.');
  return true;
}

// ---------- entidades (cliente, marca, referencia, contenido, tarea) ----------
function openEntity(type, id, clientDefault) {
  if (!isAdmin()) return;
  if ((type === 'brand' && !state.clients.length) || (!['brand', 'client'].includes(type) && !state.brands.length)) { message('Primero debes crear el cliente y su marca.', 'bad'); return; }
  const defBrand = state.brand !== 'all' ? state.brand : undefined;
  const brandSel = s0 => sel('brand_id', 'Marca', state.brands.map(b => [b.id, b.name]), s0 || defBrand);
  let x = {}, body = '', title = '', table = '';
  const opt = a => a.map(v => [v, lbl(v)]);
  switch (type) {
    case 'client': x = state.clients.find(v => v.id === id) || {}; title = id ? 'Editar cliente' : 'Nuevo cliente'; table = 'clients';
      body = fld('name', 'Empresa / cliente', x.name, 'text', { req: 1, full: 1 }) + fld('contact_email', 'Correo de contacto', x.contact_email, 'email') + fld('phone', 'Teléfono', x.phone, 'tel') + area('notes', 'Notas internas', x.notes); break;
    case 'brand': x = state.brands.find(v => v.id === id) || {}; title = id ? 'Editar marca' : 'Nueva marca'; table = 'brands';
      body = fld('name', 'Nombre de la marca', x.name, 'text', { req: 1 }) + sel('client_id', 'Cliente / empresa', state.clients.map(c => [c.id, c.name]), x.client_id || clientDefault)
        + fld('logo_url', 'URL del logo (https://)', x.logo_url, 'url') + fileFld('logo_file', 'O sube un logo (PNG, JPG o WebP)')
        + fld('primary_color', 'Color principal', x.primary_color || '#032167', 'text', { ph: '#032167', attrs: 'pattern="#[0-9a-fA-F]{6}" title="Formato #RRGGBB"' }) + fld('secondary_color', 'Color secundario', x.secondary_color, 'text', { ph: '#FB72A5', attrs: 'pattern="#[0-9a-fA-F]{6}" title="Formato #RRGGBB"' })
        + fld('website_url', 'Sitio web', x.website_url, 'url') + fld('instagram_url', 'Instagram', x.instagram_url) + fld('brand_voice', 'Personalidad / tono de marca', x.brand_voice, 'text', { full: 1 }) + area('description', 'Descripción', x.description); break;
    case 'reference': x = state.refs.find(v => v.id === id) || {}; title = id ? 'Editar referencia' : 'Guardar referencia'; table = 'content_references';
      body = brandSel(x.brand_id) + fld('title', 'Título', x.title, 'text', { req: 1 }) + sel('content_type', 'Formato', opt(['reel', 'story', 'carousel', 'post', 'video', 'other']), x.content_type) + fld('platform', 'Plataforma (Instagram, Pinterest…)', x.platform)
        + fld('reference_url', 'Enlace de referencia', x.reference_url, 'url', { full: 1 }) + fld('image_url', 'URL de la imagen (opcional)', x.image_url, 'url', { full: 1 }) + fileFld('image_file', 'O sube una imagen de referencia') + area('description', 'Descripción', x.description) + area('notes', 'Notas', x.notes); break;
    case 'content': x = state.content.find(v => v.id === id) || {}; title = id ? 'Editar publicación' : 'Nueva publicación'; table = 'content_items';
      body = (x.reference_id && refById(x.reference_id) ? refBox(refById(x.reference_id)) : '') + brandSel(x.brand_id) + fld('title', 'Título', x.title, 'text', { req: 1 }) + area('caption', 'Copy (texto de la publicación)', x.caption)
        + sel('content_type', 'Formato', opt(['post', 'reel', 'story', 'carousel', 'video', 'other']), x.content_type) + sel('platform', 'Plataforma', opt(['instagram', 'facebook', 'tiktok', 'linkedin', 'pinterest', 'other']), x.platform)
        + sel('status', 'Estado', opt(STATUSES), x.status || 'idea') + fld('scheduled_at', 'Fecha y hora de publicación', x.scheduled_at ? localISO(new Date(x.scheduled_at)) + 'T' + new Date(x.scheduled_at).toTimeString().slice(0, 5) : '', 'datetime-local')
        + fld('media_url', 'Imagen / pieza (URL)', x.media_url, 'url', { full: 1 }) + fileFld('media_file', 'O sube la pieza (PNG, JPG o WebP · máx. 5 MB)'); break;
    case 'task': x = state.tasks.find(v => v.id === id) || {}; title = id ? 'Editar tarea' : 'Nueva tarea'; table = 'tasks';
      body = brandSel(x.brand_id) + fld('title', 'Título', x.title, 'text', { req: 1 }) + area('description', 'Descripción', x.description) + sel('priority', 'Prioridad', opt(['low', 'medium', 'high']), x.priority || 'medium') + sel('status', 'Estado', opt(['pending', 'in_progress', 'completed']), x.status || 'pending') + fld('due_date', 'Fecha límite', x.due_date, 'date'); break;
    default: return;
  }
  const extra = (type === 'content' && id ? `<button type="button" class="secondary" data-act="send-approval" data-id="${esc(id)}">Solicitar aprobación</button>` : '')
    + ((type === 'content' || type === 'task') && id ? `<button type="button" class="muted-btn danger" data-act="delete-entity" data-table="${table}" data-id="${esc(id)}">Eliminar</button>` : '');
  openModal({
    title, body, extra, onSubmit: async fd => {
      const logoFile = fd.get('logo_file'), imageFile = fd.get('image_file'), mediaFile = fd.get('media_file');
      ['logo_file', 'image_file', 'media_file'].forEach(k => fd.delete(k));
      const vals = Object.fromEntries(fd); Object.keys(vals).forEach(k => { if (vals[k] === '') vals[k] = null; });
      for (const k of ['primary_color', 'secondary_color']) if (vals[k] && !/^#[0-9a-fA-F]{6}$/.test(vals[k])) throw Error('Los colores deben tener formato #RRGGBB.');
      if (table === 'clients' || table === 'brands') vals.organization_id = state.org;
      if (table === 'content_references' && !id) vals.created_by = state.session.user.id;
      if (table === 'content_items' && vals.scheduled_at) vals.scheduled_at = new Date(vals.scheduled_at).toISOString();
      const saved = await saveEntity(table, id, vals);
      if (table === 'brands' && logoFile?.size) await write('brands', 'PATCH', { logo_url: await uploadPublicImage(logoFile, saved.id) }, eq('id', saved.id));
      if (table === 'content_references' && imageFile?.size) await write(table, 'PATCH', { image_url: await uploadPublicImage(imageFile, vals.brand_id) }, eq('id', saved.id));
      if (table === 'content_items' && mediaFile?.size) await write(table, 'PATCH', { media_url: await uploadPublicImage(mediaFile, vals.brand_id) }, eq('id', saved.id));
    }
  });
}

// ---------- aprobaciones ----------
async function submitReview(contentId) {
  if (!isAdmin()) return;
  const post = state.content.find(x => x.id === contentId); if (!post) return;
  if (state.approvals.some(x => x.content_id === contentId && x.status === 'pending')) { message('Ya existe una revisión pendiente de este contenido.'); return; }
  await write('content_approvals', 'POST', { content_id: contentId, organization_id: state.org, status: 'pending', requested_by: state.session.user.id });
  if (['idea', 'production'].includes(post.status)) { try { await write('content_items', 'PATCH', { status: 'review' }, eq('id', contentId)); } catch { /* no crítico */ } }
  closeModal(); await refreshData(); message('Solicitud de aprobación creada.');
}
function openReview(id) {
  const a = state.approvals.find(x => x.id === id), post = state.content.find(x => x.id === a?.content_id);
  if (!a || !post) return;
  const notes = state.feedback.filter(f => f.approval_id === a.id);
  const who = uid => (uid === state.session?.user?.id ? 'Tú' : state.members.some(m => m.user_id === uid && ['owner', 'admin'].includes(m.role)) ? 'LE STUDIO' : 'Cliente');
  const body = `<p class="subtle" style="margin:6px 0 0">${esc(lbl(post.platform))} · ${esc(lbl(post.content_type))}${post.scheduled_at ? ' · ' + esc(fmtDateTime(post.scheduled_at)) : ''} · ${sPill(a.status)}</p>`
    + (post.media_url ? `<img class="review-media" src="${esc(safeUrl(post.media_url))}" alt="Pieza propuesta" referrerpolicy="no-referrer">` : '')
    + `<div class="approval-preview"><div class="eyebrow">TEXTO PROPUESTO</div><p>${esc(post.caption || 'Sin texto adjunto.')}</p></div>`
    + `<div class="review-chat"><b>Comentarios (${notes.length})</b>${notes.map(n => `<div class="comment"><small>${esc(who(n.author_id))} · ${esc(fmtDateTime(n.created_at))}</small><p>${esc(n.body)}</p></div>`).join('') || '<p class="subtle">Todavía no hay comentarios.</p>'}</div>`
    + `<form id="comment-form"><label class="label">${a.status === 'pending' ? 'Comentario o cambios que necesitas' : 'Añadir comentario'}<textarea class="input" name="body" rows="3" placeholder="Escribe aquí…"></textarea></label><p class="form-error" id="review-error" role="alert"></p><div class="modal-actions wrap-actions"><button class="muted-btn" type="button" data-act="close-modal">Cerrar</button><button class="secondary" type="submit">Enviar comentario</button>${a.status === 'pending' ? '<button class="secondary" type="button" data-review="changes_requested">Solicitar cambios</button><button class="primary" type="button" data-review="approved">Aprobar</button>' : ''}</div></form>`;
  openModal({
    title: post.title, eyebrow: `APROBACIÓN · ${nameBrand(post.brand_id)}`, cls: 'review-modal', body,
    onOpen: root => {
      if (isAdmin() && a.status === 'pending') { const bx = document.createElement('button'); bx.type = 'button'; bx.className = 'secondary'; bx.textContent = 'Enviar enlace al cliente'; bx.onclick = () => openShareLink(id); root.querySelector('.modal-actions')?.prepend(bx); }
      const err = m => { $('#review-error').textContent = m; };
      const sendComment = async text => { await write('approval_comments', 'POST', { approval_id: a.id, body: text, author_id: state.session.user.id }); };
      $('#comment-form').onsubmit = async e => { e.preventDefault(); const t = new FormData(e.currentTarget).get('body')?.trim(); if (!t) return; try { await sendComment(t); await hydrate(); openReview(id); } catch (x) { err(friendly(x)); } };
      $$('[data-review]', root).forEach(b => { b.onclick = async () => {
        const decision = b.dataset.review, text = ($('#comment-form textarea').value || '').trim();
        if (decision === 'changes_requested' && !text && !notes.some(n => n.author_id === state.session?.user?.id)) { err('Cuéntanos qué cambios necesitas en el cuadro de comentario.'); return; }
        if (decision === 'approved' && !(await confirmBox('Al aprobar, LE STUDIO podrá programar esta publicación tal como está.', { title: '¿Aprobar la propuesta?', ok: 'Aprobar' }))) return;
        b.disabled = true;
        try { if (text) await sendComment(text); await rpc('decide_approval', { p_approval: id, p_decision: decision }); closeModal(); await refreshData(); message(decision === 'approved' ? 'Propuesta aprobada. ¡Gracias!' : 'Cambios solicitados. Lo revisaremos.'); }
        catch (x) { err(friendly(x)); b.disabled = false; }
      }; });
    }
  });
}

// ---------- invitar cliente ----------
function openInvite(id) {
  const brand = brandById(id); if (!isAdmin() || !brand) return;
  openModal({
    title: `Invitar a ${brand.name}`, eyebrow: 'ACCESO DE CLIENTE', submitLabel: 'Enviar invitación',
    body: `<p class="subtle full-col">La persona verá únicamente las marcas que tenga asignadas.</p>${fld('email', 'Correo del cliente', '', 'email', { req: 1, full: 1 })}`,
    onSubmit: async fd => {
      const email = String(fd.get('email') || '').trim().toLowerCase();
      try { await request('/functions/v1/invite-brand-client', { method: 'POST', body: { email, brand_id: id, organization_id: state.org } }); }
      catch (e) { throw Error(`No se pudo enviar: ${friendly(e)} (verifica que la función Edge «invite-brand-client» esté instalada).`); }
    }
  });
}

// ---------- PLAN / FACTURACIÓN / MÉTRICAS: acciones ----------
const planCtx = () => { const b = currentBrand(), plan = b && brandPlan(b.id), per = plan && selectedPeriod(plan); return { b, plan, per }; };
const finVal = v => { if (v === null || v === '' || v === undefined) return null; const n = Number(v); if (!Number.isFinite(n)) throw Error('Importe inválido'); return n; };

const F = {
  'config-plan': ({ b, plan }) => openModal({
    title: 'Configurar plan de ' + b.name,
    body: fld('title', 'Nombre del plan', plan?.title || 'Plan mensual', 'text', { req: 1 }) + fld('started_on', 'Fecha de inicio', plan?.started_on || localISO(), 'date', { req: 1 }) + sel('currency', 'Moneda', [['EUR', 'EUR (€)'], ['USD', 'USD ($)']], plan?.currency || 'EUR')
      + fld('base_fee', 'Cuota por ciclo (vacío si no está acordada)', plan?.base_fee ?? '', 'number', { min: 0 }) + fld('tax_percent', 'Impuestos (%) · según factura real', plan?.tax_percent ?? 0, 'number', { min: 0 }) + fld('notes', 'Condiciones y notas (visibles para el cliente)', plan?.notes || '', 'text', { full: 1 }),
    onSubmit: async fd => {
      const v = Object.fromEntries(fd), body = { title: v.title, started_on: v.started_on, currency: v.currency, base_fee: finVal(v.base_fee), tax_percent: num(v.tax_percent), notes: v.notes };
      if (body.base_fee !== null && body.base_fee < 0) throw Error('La cuota no puede ser negativa.');
      if (plan?.id) await write('service_plans', 'PATCH', body, eq('id', plan.id)); else await write('service_plans', 'POST', { ...body, brand_id: b.id, organization_id: b.organization_id || state.org });
    }
  }),
  'create-period': ({ plan }) => {
    const c = futureCycle(localISO(), plan.started_on);
    openModal({
      title: 'Abrir periodo', body: fld('starts_on', 'Inicio del periodo', c.start, 'date', { req: 1 }) + fld('ends_on', 'Fecha final', c.end, 'date', { req: 1 }),
      onSubmit: async fd => {
        const v = Object.fromEntries(fd); if (v.ends_on < v.starts_on) throw Error('La fecha final debe ser posterior a la inicial.');
        const clash = fin.periods.find(x => x.plan_id === plan.id && x.starts_on <= v.ends_on && x.ends_on >= v.starts_on);
        if (clash) throw Error(`Se solapa con el periodo ${fmtDay(clash.starts_on)} → ${fmtDay(clash.ends_on)}.`);
        const rows = await write('plan_periods', 'POST', { plan_id: plan.id, starts_on: v.starts_on, ends_on: v.ends_on }); state.selPeriod = rows?.[0]?.id || null;
      }
    });
  },
  'new-item': ctx => F['edit-item'](ctx, true),
  'edit-item': ({ plan }, isNew, el) => {
    const id = isNew ? null : el?.dataset.item, x = fin.items.find(y => y.id === id) || {};
    openModal({
      title: id ? 'Editar servicio incluido' : 'Añadir servicio incluido',
      body: fld('title', 'Entregable o servicio', x.title || '', 'text', { req: 1, full: 1 }) + fld('category', 'Categoría', x.category || 'social') + fld('target_qty', 'Cantidad comprometida', x.target_qty ?? 1, 'number', { req: 1, min: 0 }) + fld('unit_label', 'Unidad', x.unit_label || 'entregas') + fld('allocation', 'Valor interno asignado (opcional, solo equipo)', x.allocation ?? '', 'number', { min: 0 }),
      onSubmit: async fd => {
        const v = Object.fromEntries(fd), alloc = finVal(v.allocation), body = { plan_id: plan.id, title: v.title, category: v.category, target_qty: num(v.target_qty), unit_label: v.unit_label };
        if (body.target_qty <= 0) throw Error('La cantidad debe ser mayor que cero.');
        if (alloc !== null && alloc < 0) throw Error('El valor asignado no puede ser negativo.');
        if (!id) body.sort_order = fin.items.filter(i => i.plan_id === plan.id).length + 1;
        if (!fin.valuesTable) body.allocation = alloc;
        const rows = await write('service_plan_items', id ? 'PATCH' : 'POST', body, id ? eq('id', id) : '');
        if (fin.valuesTable) {
          const itemId = id || rows?.[0]?.id;
          if (alloc === null) await write('service_plan_item_values', 'DELETE', undefined, eq('item_id', itemId)).catch(() => { });
          else await write('service_plan_item_values', 'POST', { item_id: itemId, allocation: alloc }, 'on_conflict=item_id', 'resolution=merge-duplicates,return=minimal');
        }
      }
    });
  },
  'log-delivery': (ctx, _n, el) => F.delivery(ctx, 'log', el),
  'new-extra': (ctx, _n, el) => F.delivery(ctx, 'extra', el),
  'edit-delivery': (ctx, _n, el) => F.delivery(ctx, 'edit', el),
  delivery: ({ plan, per }, mode, el) => {
    const itemId = el?.dataset.item, deliveryId = el?.dataset.delivery;
    const item = fin.items.find(x => x.id === itemId), d = fin.deliveries.find(x => x.id === deliveryId) || {};
    const included = mode === 'log' || d.kind === 'included';
    const catalog = fin.extras.filter(x => x.plan_id === plan.id && x.active !== false);
    const cat = !included && mode === 'extra' && catalog.length ? sel('catalog_id', 'Tarifa acordada (opcional)', [['', 'Personalizado'], ...catalog.map(x => [x.id, `${x.title} · ${money(x.unit_price, plan.currency)}`])], '', { full: 1 }) : '';
    openModal({
      title: mode === 'edit' ? 'Editar trabajo' : included ? 'Registrar entrega del plan' : 'Registrar extra o ajuste',
      extra: mode === 'edit' ? `<button type="button" class="muted-btn danger" data-act="delete-delivery" data-id="${esc(deliveryId)}">Eliminar</button>` : '',
      body: cat + fld('title', 'Trabajo realizado', d.title || item?.title || '', 'text', { req: 1, full: 1 }) + sel('kind', 'Tipo', [['included', 'Incluido en el plan'], ['extra', 'Extra fuera de plan'], ['adjustment', 'Ajuste pactado (admite importes negativos)']], d.kind || (included ? 'included' : 'extra'))
        + fld('quantity', 'Cantidad', d.quantity || 1, 'number', { req: 1, min: 0 }) + fld('unit_price', 'Precio unitario (extras y ajustes; en ajustes puede ser negativo)', d.unit_price || 0, 'number') + sel('status', 'Estado', [['pending', 'Pendiente'], ['completed', 'Completado'], ['cancelled', 'Cancelado']], d.status || 'completed') + fld('notes', 'Notas', d.notes || '', 'text', { full: 1 }),
      onOpen: root => { const c = root.querySelector('[name=catalog_id]'); if (c) c.onchange = () => { const t = catalog.find(x => x.id === c.value); if (t) { root.querySelector('[name=title]').value = t.title; root.querySelector('[name=unit_price]').value = t.unit_price; root.querySelector('[name=kind]').value = 'extra'; } }; },
      onSubmit: async fd => {
        const v = Object.fromEntries(fd), price = fin.extras.find(x => x.id === v.catalog_id);
        const body = { period_id: per.id, plan_item_id: mode === 'log' ? item?.id || null : d.plan_item_id || null, title: price?.title || v.title, kind: v.kind, quantity: num(v.quantity), unit_price: v.kind === 'included' ? 0 : price ? num(price.unit_price) : num(v.unit_price), status: v.status, completed_at: v.status === 'completed' ? (d.completed_at || new Date().toISOString()) : null, notes: v.notes };
        if (body.quantity <= 0) throw Error('La cantidad debe ser mayor que cero.');
        if (v.kind === 'extra' && body.unit_price < 0) throw Error('Un extra no puede tener precio negativo. Para un descuento usa «Ajuste pactado».');
        await write('plan_deliveries', deliveryId ? 'PATCH' : 'POST', body, deliveryId ? eq('id', deliveryId) : '');
      }
    });
  },
  'new-extra-price': ctx => F['edit-extra-price'](ctx),
  'edit-extra-price': ({ plan }, _n, el) => {
    const cat = fin.extras.find(x => x.id === el?.dataset.catalog) || {};
    openModal({
      title: cat.id ? 'Editar tarifa de extra' : 'Nueva tarifa de extra', body: fld('title', 'Nombre del extra', cat.title || '', 'text', { req: 1, full: 1 }) + fld('unit_price', 'Precio unitario', cat.unit_price ?? 0, 'number', { req: 1, min: 0 }) + fld('unit_label', 'Unidad', cat.unit_label || 'unidad'),
      onSubmit: async fd => { const v = Object.fromEntries(fd); await write('service_plan_extras', cat.id ? 'PATCH' : 'POST', { plan_id: plan.id, title: v.title, unit_price: num(v.unit_price), unit_label: v.unit_label }, cat.id ? eq('id', cat.id) : ''); }
    });
  },
  'close-period': async ({ plan, per }) => {
    if (plan.base_fee === null) { message('Define la cuota del plan antes de cerrar el periodo.', 'bad'); return; }
    const c = costSnapshot(plan, per);
    if (!(await confirmBox(`Periodo ${fmtDay(per.starts_on)} → ${fmtDay(per.ends_on)}\nTotal estimado: ${money(c.total, plan.currency)}\n\nSe creará el borrador de facturación (el importe definitivo lo calcula el servidor) y los trabajos quedarán bloqueados.`, { title: '¿Cerrar el periodo?', ok: 'Cerrar periodo' }))) return;
    await rpc('close_plan_period', { p_period: per.id });
    await hydrate(); state.page = 'workspace'; state.section = 'billing'; render();
    const inv = linkedInvoice(per.id);
    message(inv && Math.abs(num(inv.total_amount) - num(c.total)) > 0.005 ? `Periodo cerrado. El servidor calculó ${money(inv.total_amount, plan.currency)} (estimado ${money(c.total, plan.currency)}). Revísalo.` : 'Periodo cerrado. Borrador de facturación creado.', inv && Math.abs(num(inv.total_amount) - num(c.total)) > 0.005 ? 'bad' : '');
  },
  'manage-invoice': (_c, _n, el) => {
    const invoice = fin.invoices.find(x => x.id === el?.dataset.invoice); if (!invoice) return;
    const info = invoiceInfo(invoice), pays = fin.payments.filter(p => p.invoice_id === invoice.id);
    openModal({
      title: 'Control de facturación', eyebrow: `${nameBrand(info.brand)} · ${fmtDay(info.per?.starts_on)} – ${fmtDay(info.per?.ends_on)}`,
      body: `<p class="subtle full-col" style="margin:0">Total ${money(info.total, info.cur)} · Pagado ${money(info.paid, info.cur)} · ${pill(info.label, info.tone)}</p>` + fld('number', 'Nº de factura', invoice.number || '') + sel('status', 'Estado de emisión', [['draft', 'Borrador'], ['issued', 'Emitida'], ['cancelled', 'Anulada']], invoice.status)
        + fld('issued_on', 'Fecha de emisión', invoice.issued_on || localISO(), 'date') + fld('due_on', 'Vencimiento', invoice.due_on || '', 'date')
        + `<div class="full-col sep"></div>` + fld('payment', 'Registrar nuevo pago (opcional)', '', 'number', { min: 0 }) + fld('paid_on', 'Fecha del pago', localISO(), 'date') + fld('method', 'Medio de pago', 'Transferencia', 'text', { full: 1 })
        + (pays.length ? `<div class="full-col"><b style="font-size:12px">Pagos registrados</b>${pays.map(p => `<div class="sum-row"><span>${fmtDay(p.paid_on)} · ${esc(p.method || '')}</span><b>${money(p.amount, info.cur)}</b></div>`).join('')}</div>` : ''),
      onSubmit: async fd => {
        const v = Object.fromEntries(fd), pay = num(v.payment);
        if (v.status === 'issued' && !v.number.trim()) throw Error('Indica el número de factura para marcarla como emitida.');
        if (pay > 0 && v.status !== 'issued') throw Error('Marca la factura como emitida antes de registrar pagos.');
        if (pay > 0 && pay > info.left + 0.005) throw Error(`El pago (${money(pay, info.cur)}) supera lo pendiente (${money(info.left, info.cur)}).`);
        await write('plan_invoices', 'PATCH', { number: v.number.trim() || null, status: v.status, issued_on: v.issued_on || null, due_on: v.due_on || null }, eq('id', invoice.id));
        if (pay > 0) await write('plan_payments', 'POST', { invoice_id: invoice.id, amount: pay, paid_on: v.paid_on, method: v.method });
      }
    });
  },
  'new-metric': ctx => F['edit-metric'](ctx),
  'edit-metric': ({ b }, _n, el) => {
    const m = fin.metrics.find(x => x.id === el?.dataset.metric) || {};
    openModal({
      title: m.id ? 'Editar medición' : 'Registrar métrica', extra: m.id ? `<button type="button" class="muted-btn danger" data-act="delete-metric" data-id="${esc(m.id)}">Eliminar</button>` : '',
      body: sel('platform', 'Plataforma', Object.entries(PLATFORM_LABELS), m.platform || state.metricPlatform) + sel('metric_key', 'Indicador', Object.entries(METRIC_LABELS), m.metric_key || 'followers') + fld('metric_label', 'Nombre visible de la métrica', m.metric_label || 'Seguidores', 'text', { req: 1, full: 1 })
        + fld('value', 'Valor numérico', m.value ?? '', 'number', { req: 1 }) + fld('measured_on', 'Fecha de medición', m.measured_on || localISO(), 'date', { req: 1 }) + sel('period_type', 'Tipo de medición', [['baseline', 'Antes · Inicio'], ['month', 'Cierre mensual'], ['snapshot', 'Actualización']], m.period_type || 'month') + fld('source', 'Fuente de la cifra', m.source || 'manual') + fld('notes', 'Notas / contexto', m.notes || '', 'text', { full: 1 }),
      onOpen: root => { const k = root.querySelector('[name=metric_key]'), l = root.querySelector('[name=metric_label]'); if (k && !m.id) k.onchange = () => { l.value = METRIC_LABELS[k.value] || l.value; }; },
      onSubmit: async fd => {
        const v = Object.fromEntries(fd), body = { brand_id: b.id, platform: v.platform, metric_key: v.metric_key, metric_label: v.metric_label, value: Number(v.value), measured_on: v.measured_on, period_type: v.period_type, source: v.source, notes: v.notes };
        if (!Number.isFinite(body.value)) throw Error('Valor inválido.');
        await write('brand_metrics', m.id ? 'PATCH' : 'POST', body, m.id ? eq('id', m.id) : ''); state.metricPlatform = v.platform;
      }
    });
  }
};

// ---------- exportaciones ----------
function downloadCSV(name, rows) {
  const q = v => { if (typeof v === 'number') return String(v).replace('.', ','); let s = String(v ?? ''); if (/^[=+\-@]/.test(s)) s = "'" + s; return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  const url = URL.createObjectURL(new Blob(['﻿' + rows.map(r => r.map(q).join(';')).join('\r\n')], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 3000);
}
function exportData(kind) {
  const b = currentBrand(), slug = s => String(s || 'marca').toLowerCase().replace(/[^a-z0-9]+/g, '-'), day = localISO();
  if (kind === 'metrics' && b) return downloadCSV(`metricas-${slug(b.name)}-${day}.csv`, [['Plataforma', 'Indicador', 'Valor', 'Fecha', 'Tipo', 'Fuente'], ...fin.metrics.filter(x => x.brand_id === b.id).sort((a, c) => a.measured_on.localeCompare(c.measured_on)).map(x => [PLATFORM_LABELS[x.platform] || x.platform, x.metric_label, num(x.value), x.measured_on, x.period_type, x.source || ''])]);
  const infos = fin.invoices.map(invoiceInfo).filter(x => x.plan && (kind === 'finance' ? (state.brand === 'all' || x.brand === state.brand) : x.brand === b?.id));
  downloadCSV(`facturacion-${kind === 'finance' ? 'todas' : slug(b?.name)}-${day}.csv`, [['Marca', 'Periodo inicio', 'Periodo fin', 'Documento', 'Estado emisión', 'Estado cobro', 'Total', 'Pagado', 'Pendiente', 'Moneda', 'Vencimiento'], ...infos.map(x => [nameBrand(x.brand), x.per?.starts_on, x.per?.ends_on, x.i.number || '', x.i.status, x.label, num(x.total), num(x.paid), x.i.status === 'issued' ? num(x.left) : 0, x.cur, x.i.due_on || ''])]);
}
function printReport() {
  const { b, plan, per } = planCtx();
  if (!b || !plan || !per) { message('No hay un periodo para generar el informe.', 'bad'); return; }
  const cur = plan.currency || 'EUR', progress = planProgress(plan, per), c = costSnapshot(plan, per), lines = periodDeliveries(per.id).filter(x => x.kind !== 'included' && x.status === 'completed');
  const mets = fin.metrics.filter(x => x.brand_id === b.id), groups = {};
  mets.forEach(m => { (groups[m.platform + '|' + m.metric_key] ||= []).push(m); });
  const mrows = Object.values(groups).map(g => { g.sort((a, z) => a.measured_on.localeCompare(z.measured_on)); const i = g.find(x => x.period_type === 'baseline') || g[0], l = g[g.length - 1], d = num(l.value) - num(i.value); return `<tr><td>${esc(PLATFORM_LABELS[l.platform] || l.platform)}</td><td>${esc(l.metric_label)}</td><td>${fNum(i.value)}</td><td>${fNum(l.value)}</td><td>${d > 0 ? '+' : ''}${fNum(d)}</td></tr>`; }).join('');
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Informe · ${esc(b.name)}</title><style>
body{font:14px/1.5 -apple-system,Segoe UI,Arial,sans-serif;color:#17223c;max-width:780px;margin:30px auto;padding:0 22px}h1{font-size:26px;margin:4px 0 2px;letter-spacing:-.03em}h2{font-size:15px;margin:26px 0 8px;border-bottom:2px solid #032167;padding-bottom:4px;color:#032167}.k{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#7b8bad;font-weight:700}table{border-collapse:collapse;width:100%}th,td{text-align:left;padding:7px 8px;border-bottom:1px solid #e4e8f0;font-size:13px}th{font-size:11px;color:#7b8bad}.bar{height:7px;background:#e9edf5;border-radius:9px;overflow:hidden}.bar i{display:block;height:100%;background:#032167}.tot{font-weight:700;font-size:15px}.f{margin-top:30px;font-size:11px;color:#8e9aaa}@media print{body{margin:0}}</style></head><body>
<div class="k">LE STUDIO · Informe del periodo</div><h1>${esc(b.name)}</h1><div>${esc(plan.title)} · ${fmtDay(per.starts_on)} – ${fmtDay(per.ends_on)}</div>
<h2>Entregables</h2><table><tr><th>Servicio</th><th>Hecho / acordado</th><th style="width:30%">Avance</th></tr>${progress.map(x => `<tr><td>${esc(x.title)}</td><td>${fNum(x.completed)} / ${fNum(x.target_qty)} ${esc(x.unit_label)}</td><td><div class="bar"><i style="width:${Math.round(x.ratio * 100)}%"></i></div></td></tr>`).join('') || '<tr><td colspan="3">Sin servicios definidos.</td></tr>'}</table>
${lines.length ? `<h2>Extras y ajustes</h2><table>${lines.map(d => `<tr><td>${esc(d.title)}</td><td>${esc(lbl(d.kind))}</td><td>${fNum(d.quantity)}</td><td>${money(num(d.unit_price) * num(d.quantity), cur)}</td></tr>`).join('')}</table>` : ''}
<h2>Balance</h2><table><tr><td>Cuota del plan</td><td>${c.base === null ? 'Por definir' : money(c.base, cur)}</td></tr><tr><td>Extras</td><td>${money(c.ext, cur)}</td></tr><tr><td>Ajustes</td><td>${money(c.adjust, cur)}</td></tr>${c.subtotal === null ? '' : `<tr><td>Impuestos (${fNum(plan.tax_percent)}%)</td><td>${money(c.tax, cur)}</td></tr>`}<tr class="tot"><td>Total estimado</td><td>${c.total === null ? 'Por definir' : money(c.total, cur)}</td></tr></table>
${mrows ? `<h2>Métricas: antes y ahora</h2><table><tr><th>Plataforma</th><th>Indicador</th><th>Inicio</th><th>Último</th><th>Cambio</th></tr>${mrows}</table>` : ''}
<div class="f">Cifras de métricas introducidas manualmente por LE STUDIO. Este documento es un resumen informativo y no sustituye a una factura. Generado el ${fmtDay(localISO())}.</div></body></html>`;
  const w = window.open('', '_blank');
  if (!w) { message('Permite las ventanas emergentes para ver el informe.', 'bad'); return; }
  w.document.write(html); w.document.close(); setTimeout(() => { w.focus(); w.print(); }, 400);
}

// ---------- menú «Más» ----------
function openMore() {
  const items = navModel().filter(n => !n.tab);
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !matchMedia('(display-mode: standalone)').matches;
  openModal({
    title: 'Más', cls: 'sheet-only',
    body: `<div class="list">${items.map(n => `<button class="row" data-act="nav" data-page="${n.page}" ${n.section ? `data-section="${n.section}"` : ''}><span class="ico">${ic(n.icon)}</span><span class="grow"><b>${esc(n.long || n.label)}</b></span><span class="row-go">${ic('chevron', 18)}</span></button>`).join('')}${installPrompt ? `<button class="row" data-act="install"><span class="ico">${ic('install')}</span><span class="grow"><b>Instalar como app</b><small>Acceso directo en tu pantalla de inicio</small></span></button>` : ''}<button class="row" data-act="theme"><span class="ico">${ic(themePref() === 'dark' ? 'moon' : 'sun')}</span><span class="grow"><b>Tema</b><small>${({ auto: 'Automático', light: 'Claro', dark: 'Oscuro' })[themePref()]} · toca para cambiar</small></span></button>${ios ? `<div class="row static"><span class="ico">${ic('install')}</span><span class="grow"><b>Instalar en iPhone</b><small>Compartir → «Añadir a pantalla de inicio»</small></span></div>` : ''}<button class="row" data-act="logout"><span class="ico">${ic('logout')}</span><span class="grow"><b>Cerrar sesión</b><small>${esc(state.session?.user?.email || '')}</small></span></button></div><p class="footnote" style="text-align:center">Social OS v${VERSION}</p>`
  });
}

// ---------- navegación ----------
function pushUrl() { const h = `#/${state.page}/${state.section}/${state.brand}`; if (location.hash !== h) history.pushState(null, '', h); }
function applyHash() {
  const m = location.hash.match(/^#\/([a-z]+)\/([a-z]+)\/([\w-]+)$/); if (!m) return false;
  const [, page, section, brand] = m;
  if (!['home', 'clients', 'brands', 'workspace', 'references', 'calendar', 'tasks', 'approvals', 'finance', 'activity'].includes(page)) return false;
  state.page = page; state.section = section; state.brand = brand === 'all' || brandById(brand) ? brand : 'all';
  return true;
}
function go(page, section, brand) {
  if (brand !== undefined) state.brand = brand;
  state.page = page;
  if (page === 'home') state.brand = 'all';
  if (section) state.section = section; else if (page === 'workspace') state.section = 'overview';
  closeModal(); pushUrl(); render();
  if (page === 'activity') loadActivity().then(() => { if (state.page === 'activity') render({ keepScroll: true }); });
}

// ---------- tabla de acciones (delegación de eventos) ----------
const ACTIONS = {
  noop: () => { },
  nav: el => go(el.dataset.page, el.dataset.section),
  focus: el => go('workspace', el.dataset.section || 'overview', el.dataset.brand),
  section: el => { state.section = el.dataset.id; pushUrl(); render(); },
  more: () => openMore(),
  search: () => openSearch(),
  'copy-link': async el => { try { await navigator.clipboard.writeText(el.dataset.url); message('Enlace copiado.'); } catch { $('#link-url')?.select(); message('Selecciónalo y cópialo (Ctrl/Cmd+C).'); } },
  theme: () => cycleTheme(),
  'close-modal': () => closeModal(),
  modal: el => openEntity(el.dataset.type, el.dataset.id, el.dataset.client),
  invite: el => openInvite(el.dataset.id),
  'open-approval': el => openReview(el.dataset.id),
  'send-approval': el => submitReview(el.dataset.id),
  'open-content': el => {
    const id = el.dataset.id;
    if (isAdmin()) return openEntity('content', id);
    const a = state.approvals.find(x => x.content_id === id && x.status === 'pending') || state.approvals.find(x => x.content_id === id);
    if (a) openReview(a.id); else { const post = state.content.find(x => x.id === id); if (post) openModal({ title: post.title, eyebrow: nameBrand(post.brand_id), body: `<p class="subtle">${esc(lbl(post.platform))} · ${sPill(post.status)}${post.scheduled_at ? ' · ' + esc(fmtDateTime(post.scheduled_at)) : ''}</p>${post.media_url ? `<img class="review-media" src="${esc(safeUrl(post.media_url))}" alt="" referrerpolicy="no-referrer">` : ''}<div class="approval-preview"><p>${esc(post.caption || 'Sin texto.')}</p></div><div class="modal-actions"><span class="grow"></span><button class="primary" data-act="close-modal">Cerrar</button></div>` }); }
  },
  'cal-day': el => {
    const d = el.dataset.date, has = byBrand(state.content).some(x => x.scheduled_at && localDay(x.scheduled_at) === d);
    if (has && matchMedia('(max-width:860px)').matches) openDay(d); else openPlanner({ date: d });
  },
  'cal-more': el => openDay(el.dataset.date),
  'cal-add': el => openPlanner({ date: el.dataset.date || '' }),
  'ref-plan': el => openPlanner({ refId: el.dataset.id }),
  month: el => { const d = Number(el.dataset.id); state.month = d === 0 ? new Date() : new Date(state.month.getFullYear(), state.month.getMonth() + d, 1); render({ keepScroll: true }); },
  'content-view': el => { state.contentView = el.dataset.id; render({ keepScroll: true }); },
  'metric-platform': el => { state.metricPlatform = el.dataset.id; render({ keepScroll: true }); },
  'delete-entity': async el => {
    const t = el.dataset.table, isC = t === 'content_items';
    try { if (await deleteRow(t, el.dataset.id, isC ? 'Se eliminará esta publicación y sus comentarios. No se puede deshacer.' : 'Se eliminará esta tarea.', isC ? '¿Eliminar la publicación?' : '¿Eliminar la tarea?')) { closeModal(); await refreshData(); message(isC ? 'Publicación eliminada.' : 'Tarea eliminada.'); } }
    catch (e) { message(/permis|policy|violat|foreign/i.test(e.message) ? 'No se pudo eliminar: falta ejecutar el SQL 07 en Supabase (permiso de borrado).' : friendly(e), 'bad'); }
  },
  'delete-ref': async el => { if (await deleteRow('content_references', el.dataset.id, 'Esta acción no se puede deshacer.', '¿Eliminar la referencia?')) { await refreshData(); message('Referencia eliminada.'); } },
  'delete-delivery': async el => { if (await deleteRow('plan_deliveries', el.dataset.id, 'Se quitará este trabajo del periodo.', '¿Eliminar el trabajo?')) { closeModal(); await refreshData(); message('Trabajo eliminado.'); } },
  'delete-metric': async el => { if (await deleteRow('brand_metrics', el.dataset.id, 'Se borrará esta medición del historial.', '¿Eliminar la medición?')) { closeModal(); await refreshData(); message('Medición eliminada.'); } },
  f: async el => {
    if (!isAdmin()) { message('Acceso de solo lectura para clientes.'); return; }
    const ctx = planCtx(), name = el.dataset.f, fn = F[name];
    if (!fn) return;
    if (name === 'manage-invoice') return fn(ctx, false, el);
    if (!ctx.b) { message('Abre primero una marca.', 'bad'); return; }
    if (name === 'config-plan') return fn(ctx, false, el);
    if (name === 'new-metric' || name === 'edit-metric') return fn(ctx, false, el);
    if (!ctx.plan) { message('Configura primero el plan de esta marca.', 'bad'); return; }
    if (['create-period', 'new-item', 'edit-item', 'new-extra-price', 'edit-extra-price'].includes(name)) return fn(ctx, name === 'new-item', el);
    if (!ctx.per) { message('Abre primero un periodo del plan.', 'bad'); return; }
    if (ctx.per.status === 'closed') { message('Este periodo está cerrado y no puede modificarse.', 'bad'); return; }
    return fn(ctx, name === 'new-extra' ? 'extra' : name === 'log-delivery' ? 'log' : 'edit', el);
  },
  export: el => exportData(el.dataset.id),
  report: () => printReport(),
  install: async () => { if (!installPrompt) return; installPrompt.prompt(); await installPrompt.userChoice.catch(() => { }); installPrompt = null; closeModal(); },
  logout: async () => { closeModal(); try { await raw('/auth/v1/logout', { method: 'POST' }); } catch { /* sin red */ } clearSession(); resetState(); history.replaceState(null, '', location.pathname); show('auth'); },
  retry: () => enter(),
  forgot: () => { $('#login-form').classList.add('hidden'); $('#forgot-form').classList.remove('hidden'); $('#forgot-form input')?.focus(); },
  'back-login': () => { $('#forgot-form').classList.add('hidden'); $('#login-form').classList.remove('hidden'); },
  'toggle-pass': el => { const i = el.parentElement.querySelector('input'); i.type = i.type === 'password' ? 'text' : 'password'; el.textContent = i.type === 'password' ? 'Mostrar' : 'Ocultar'; }
};

const CHANGES = {
  'content-status': async (el) => { await write('content_items', 'PATCH', { status: el.value }, eq('id', el.dataset.id)); await refreshData(); message('Estado actualizado.'); },
  'task-status': async (el) => { await write('tasks', 'PATCH', { status: el.value }, eq('id', el.dataset.id)); await refreshData(); message('Tarea actualizada.'); },
  period: el => { state.selPeriod = el.value; render({ keepScroll: true }); }
};

// ============================================================================
// AUTENTICACIÓN, EVENTOS Y ARRANQUE
// ============================================================================
const showAuthMessage = (text, tone = '') => { $('#login-msg').innerHTML = text ? `<div class="message ${tone}">${esc(text)}</div>` : ''; };
async function login(email, password) { setSession(await raw('/auth/v1/token?grant_type=password', { method: 'POST', body: { email, password }, auth: false })); }

async function acceptAuthLink() {
  const hash = new URLSearchParams(location.hash.replace(/^#/, ''));
  if (hash.get('error_description')) {
    history.replaceState(null, '', location.pathname + location.search); show('auth');
    showAuthMessage(/expired|invalid/i.test(hash.get('error_description')) ? 'El enlace ha caducado o ya se usó. Solicita uno nuevo.' : hash.get('error_description'), 'error');
    return false;
  }
  const type = hash.get('type');
  if (!['invite', 'recovery'].includes(type) || !hash.get('access_token')) return false;
  state.session = { access_token: hash.get('access_token'), refresh_token: hash.get('refresh_token'), expires_at: Math.floor(Date.now() / 1000) + Number(hash.get('expires_in') || 3600) };
  history.replaceState(null, '', location.pathname + location.search);
  show('auth'); $('#login-form').classList.add('hidden'); $('#forgot-form').classList.add('hidden');
  const f = $('#setup-form'); f.classList.remove('hidden');
  f.querySelector('.eyebrow').textContent = type === 'invite' ? 'INVITACIÓN A SOCIAL OS' : 'RECUPERAR ACCESO';
  f.querySelector('h2').textContent = type === 'invite' ? 'Crea tu contraseña' : 'Elige una nueva contraseña';
  f.onsubmit = async e => {
    e.preventDefault();
    const fd = new FormData(f), pw = String(fd.get('password')), pw2 = String(fd.get('password2')), out = $('#setup-error'), btn = f.querySelector('[type=submit]');
    out.textContent = '';
    if (pw !== pw2) { out.textContent = 'Las contraseñas no coinciden.'; return; }
    btn.disabled = true;
    try {
      await raw('/auth/v1/user', { method: 'PUT', body: { password: pw } });
      state.session.user = await raw('/auth/v1/user'); setSession(state.session);
      f.classList.add('hidden'); $('#login-form').classList.remove('hidden'); await enter();
    } catch (err) { out.textContent = friendly(err); btn.disabled = false; }
  };
  return true;
}

async function enter() {
  try {
    await active(); await hydrate(); lastSync = Date.now();
    show('app');
    if (!applyHash()) { state.page = 'home'; }
    render();
    history.replaceState(null, '', `#/${state.page}/${state.section}/${state.brand}`);
  } catch (e) {
    console.warn(e);
    if (e.status === 401 || e.status === 403 || /caducado|refresh_token|JWT/i.test(e.message)) { clearSession(); resetState(); show('auth'); showAuthMessage('Tu sesión ha caducado. Vuelve a entrar.', 'error'); }
    else { show('app'); $('#view').innerHTML = `<div class="panel center"><h3>No pudimos cargar tus datos</h3><p class="subtle">${esc(friendly(e))}</p><button class="primary" data-act="retry">Reintentar</button></div>`; }
  }
}

// ---------- eventos globales ----------
document.addEventListener('click', async e => {
  const el = e.target.closest('[data-act]');
  if (!el || el.disabled) return;
  const fn = ACTIONS[el.dataset.act];
  if (!fn) return;
  try { await fn(el, e); } catch (err) { console.error(err); message(friendly(err), 'bad'); }
});
document.addEventListener('change', async e => {
  const el = e.target.closest('[data-change]');
  if (el) { try { await CHANGES[el.dataset.change](el); } catch (err) { message(friendly(err), 'bad'); render({ keepScroll: true }); } return; }
  if (e.target.id === 'global-brand') {
    const id = e.target.value;
    if (id !== 'all' && !brandById(id)) { message('La marca no está disponible para esta cuenta.', 'bad'); return; }
    const wasWs = state.page === 'workspace';
    state.brand = id;
    if (id === 'all') { if (state.page === 'workspace') state.page = 'home'; }
    else if (['home', 'workspace', 'brands'].includes(state.page)) { state.page = 'workspace'; if (!wasWs) state.section = 'overview'; }
    pushUrl(); render();
  }
});
document.addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k' && state.session) { e.preventDefault(); if ($('#modal-root').firstChild) closeModal(); else openSearch(); return; }
  if (e.key === 'Escape') { if ($('#confirm-root').firstChild) { confirmBox.cancel?.(); return; } if ($('#modal-root').firstChild) closeModal(); }
  if (e.key === 'Tab') {
    const root = $('#confirm-root').firstChild ? $('#confirm-root') : $('#modal-root');
    if (!root.firstChild) return;
    const f = $$('button:not([disabled]),input:not([disabled]),select,textarea,a[href]', root).filter(x => x.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});
window.addEventListener('popstate', () => { if (state.session && !$('#app').classList.contains('hidden')) { applyHash(); closeModal(); render(); } });

// ---------- formularios de acceso ----------
$('#login-form').onsubmit = async e => {
  e.preventDefault();
  const f = e.currentTarget, b = f.querySelector('[type=submit]');
  b.disabled = true; showAuthMessage('');
  try { await login(f.elements.email.value.trim(), f.elements.password.value); f.elements.password.value = ''; await enter(); }
  catch (err) { showAuthMessage(friendly(err), 'error'); }
  b.disabled = false;
};
$('#forgot-form').onsubmit = async e => {
  e.preventDefault();
  const f = e.currentTarget, b = f.querySelector('[type=submit]'), out = $('#forgot-msg');
  b.disabled = true; out.textContent = '';
  try { await raw('/auth/v1/recover?redirect_to=' + encodeURIComponent(location.origin), { method: 'POST', body: { email: f.elements.email.value.trim() }, auth: false }); out.className = 'message'; out.textContent = 'Si el correo está registrado, recibirás un enlace para elegir una nueva contraseña.'; }
  catch (err) { out.className = 'message error'; out.textContent = friendly(err); }
  b.disabled = false;
};

// ---------- red, sincronización y PWA ----------
const setNet = () => $('#net-banner').classList.toggle('hidden', navigator.onLine);
window.addEventListener('online', () => { setNet(); silentRefresh(); }); window.addEventListener('offline', setNet); setNet();

async function silentRefresh() {
  if (!state.session || $('#app').classList.contains('hidden') || $('#modal-root').firstChild || $('#confirm-root').firstChild) return;
  const ae = document.activeElement;
  if (ae && ['INPUT', 'TEXTAREA', 'SELECT'].includes(ae.tagName) && $('#view').contains(ae)) return;
  const before = snapshot();
  try { await hydrate(); lastSync = Date.now(); if (snapshot() !== before) render({ keepScroll: true }); else renderChrome(); }
  catch (e) {
    console.warn('Sincronización demorada:', e.message);
    if (e.status === 401) { clearSession(); resetState(); show('auth'); showAuthMessage('Tu sesión ha caducado. Vuelve a entrar.', 'error'); }
  }
}
setInterval(() => { if (document.visibilityState === 'visible') silentRefresh(); }, 90000);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && Date.now() - lastSync > 60000) silentRefresh(); });
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); installPrompt = e; });
window.addEventListener('appinstalled', () => { installPrompt = null; });
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => { }));

applyTheme();
(async function init() {
  try {
    if (await acceptAuthLink()) return;
    state.session = readStored();
    if (state.session) await enter(); else show('auth');
  } catch (e) { console.warn(e); show('auth'); }
})();
