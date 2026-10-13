-- LE STUDIO · Social OS v2.7 — vincula cada publicación con la referencia de la que salió.
-- Opcional: el planificador funciona sin esto, pero así la ficha de la publicación muestra
-- su referencia de origen y la Biblioteca marca las referencias «En calendario».
-- Supabase → SQL Editor → pega todo → Run. Repetible (se puede ejecutar varias veces).
-- Seguridad: la columna solo guarda un identificador. La referencia en sí sigue protegida
-- por sus propias reglas (el cliente no la ve salvo que la marques como visible).
begin;

alter table public.content_items
  add column if not exists reference_id uuid references public.content_references(id) on delete set null;

create index if not exists content_items_reference_idx on public.content_items (reference_id);

commit;
notify pgrst, 'reload schema';

-- Comprobación (debe devolver una fila «reference_id»):
select column_name from information_schema.columns
where table_schema = 'public' and table_name = 'content_items' and column_name = 'reference_id';
