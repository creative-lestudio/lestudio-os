-- ============================================================================
-- LE STUDIO · Social OS v2.6 — ENLACES DE APROBACIÓN (el cliente aprueba sin contraseña)
-- Supabase → SQL Editor → pega todo → Run. Es repetible.
-- Requiere: tablas content_approvals, content_items, approval_comments, la función
-- public.decide_approval(p_approval, p_decision) y public.has_brand_access(brand_id) (ya las tienes).
-- Seguridad: el enlace lleva un código aleatorio de 192 bits; en la BD solo se guarda su huella (hash).
-- Caduca (7 días por defecto) y se invalida tras usarse. Solo permite aprobar / pedir cambios de UNA pieza.
-- ============================================================================
begin;
create extension if not exists pgcrypto with schema extensions;

create or replace function public.ls_is_admin(p_org uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.organization_members m
    where m.organization_id = p_org and m.user_id = auth.uid() and m.role in ('owner','admin'));
$$;
revoke all on function public.ls_is_admin(uuid) from public, anon;
grant execute on function public.ls_is_admin(uuid) to authenticated;

create table if not exists public.approval_links (
  id uuid primary key default gen_random_uuid(),
  approval_id uuid not null references public.content_approvals(id) on delete cascade,
  user_id uuid not null,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now()
);
create index if not exists approval_links_approval_idx on public.approval_links(approval_id);
alter table public.approval_links enable row level security;
revoke all on public.approval_links from anon, authenticated;
grant select on public.approval_links to authenticated;
drop policy if exists ls_links_admin_read on public.approval_links;
create policy ls_links_admin_read on public.approval_links for select to authenticated
  using (exists (select 1 from public.content_approvals a where a.id = approval_id and public.ls_is_admin(a.organization_id)));

-- Admin: crea un enlace para una aprobación y devuelve el código (solo se ve una vez).
create or replace function public.create_approval_link(p_approval uuid, p_email text, p_days int default 7)
returns text language plpgsql security definer set search_path = public, extensions as $$
declare a record; uid uuid; tok text; ok boolean; old text; oldsub text;
begin
  select ap.id, ap.organization_id, ap.status, ci.brand_id into a
    from public.content_approvals ap join public.content_items ci on ci.id = ap.content_id where ap.id = p_approval;
  if a.id is null then raise exception 'Aprobación no encontrada'; end if;
  if not public.ls_is_admin(a.organization_id) then raise exception 'No autorizado'; end if;
  if a.status <> 'pending' then raise exception 'Esta aprobación ya no está pendiente'; end if;
  select id into uid from auth.users where lower(email) = lower(trim(p_email));
  if uid is null then raise exception 'No existe ninguna cuenta con ese email. Invita primero al cliente.'; end if;
  old := current_setting('request.jwt.claims', true); oldsub := current_setting('request.jwt.claim.sub', true);
  perform set_config('request.jwt.claims', json_build_object('sub', uid, 'role', 'authenticated')::text, true);
  perform set_config('request.jwt.claim.sub', uid::text, true);
  select public.has_brand_access(a.brand_id) into ok;
  perform set_config('request.jwt.claims', coalesce(old, ''), true); perform set_config('request.jwt.claim.sub', coalesce(oldsub, ''), true);
  if not coalesce(ok, false) then raise exception 'Ese usuario no tiene acceso a esta marca'; end if;
  tok := encode(gen_random_bytes(24), 'hex');
  insert into public.approval_links(approval_id, user_id, token_hash, expires_at)
    values (p_approval, uid, encode(digest(tok, 'sha256'), 'hex'), now() + make_interval(days => greatest(1, least(coalesce(p_days, 7), 30))));
  return tok;
end $$;
revoke all on function public.create_approval_link(uuid, text, int) from public, anon;
grant execute on function public.create_approval_link(uuid, text, int) to authenticated;

-- Público: lee lo necesario para mostrar la pieza (nada más).
create or replace function public.get_approval_by_token(p_token text)
returns jsonb language plpgsql security definer set search_path = public, extensions as $$
declare l record; r jsonb;
begin
  select * into l from public.approval_links where token_hash = encode(digest(coalesce(p_token,''), 'sha256'), 'hex');
  if l.id is null then return jsonb_build_object('state', 'invalid'); end if;
  if l.expires_at < now() then return jsonb_build_object('state', 'expired'); end if;
  select jsonb_build_object(
    'state', case when ap.status = 'pending' and l.used_at is null then 'open' else 'done' end,
    'status', ap.status,
    'title', ci.title, 'caption', ci.caption, 'platform', ci.platform, 'format', ci.content_type,
    'scheduled_at', ci.scheduled_at, 'media_url', ci.media_url,
    'brand', b.name, 'color', b.primary_color, 'logo', b.logo_url,
    'comments', coalesce((select jsonb_agg(jsonb_build_object('body', c.body, 'at', c.created_at, 'mine', c.author_id = l.user_id) order by c.created_at)
                          from public.approval_comments c where c.approval_id = ap.id), '[]'::jsonb))
  into r
  from public.content_approvals ap join public.content_items ci on ci.id = ap.content_id
  join public.brands b on b.id = ci.brand_id where ap.id = l.approval_id;
  return r;
end $$;
revoke all on function public.get_approval_by_token(text) from public;
grant execute on function public.get_approval_by_token(text) to anon, authenticated;

-- Público: decide. Reutiliza TU función decide_approval, actuando como el usuario cliente del enlace.
create or replace function public.decide_approval_by_token(p_token text, p_decision text, p_comment text default null)
returns jsonb language plpgsql security definer set search_path = public, extensions as $$
declare l record; old text; oldsub text; txt text := nullif(trim(coalesce(p_comment, '')), '');
begin
  if p_decision not in ('approved', 'changes_requested') then raise exception 'Decisión no válida'; end if;
  if p_decision = 'changes_requested' and txt is null then raise exception 'Cuéntanos qué cambios necesitas'; end if;
  if txt is not null and length(txt) > 2000 then raise exception 'Comentario demasiado largo'; end if;
  select * into l from public.approval_links where token_hash = encode(digest(coalesce(p_token,''), 'sha256'), 'hex') for update;
  if l.id is null or l.expires_at < now() or l.used_at is not null then raise exception 'Enlace no válido o caducado'; end if;
  old := current_setting('request.jwt.claims', true); oldsub := current_setting('request.jwt.claim.sub', true);
  perform set_config('request.jwt.claims', json_build_object('sub', l.user_id, 'role', 'authenticated')::text, true);
  perform set_config('request.jwt.claim.sub', l.user_id::text, true);
  if txt is not null then
    insert into public.approval_comments(approval_id, body, author_id) values (l.approval_id, txt, l.user_id);
  end if;
  perform public.decide_approval(l.approval_id, p_decision);
  perform set_config('request.jwt.claims', coalesce(old, ''), true); perform set_config('request.jwt.claim.sub', coalesce(oldsub, ''), true);
  update public.approval_links set used_at = now() where id = l.id;
  return jsonb_build_object('ok', true, 'decision', p_decision);
end $$;
revoke all on function public.decide_approval_by_token(text, text, text) from public;
grant execute on function public.decide_approval_by_token(text, text, text) to anon, authenticated;

commit;
notify pgrst, 'reload schema';

select proname as funcion_creada from pg_proc where proname in ('create_approval_link','get_approval_by_token','decide_approval_by_token') order by 1;
