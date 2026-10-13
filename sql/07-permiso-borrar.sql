-- LE STUDIO · Social OS — permiso para que los ADMIN borren publicaciones y tareas de SU organización.
-- Supabase → SQL Editor → pega todo → Run. Repetible.
begin;

drop policy if exists "LS admins delete content" on public.content_items;
create policy "LS admins delete content" on public.content_items
  for delete to authenticated
  using (exists (select 1 from public.brands b where b.id = content_items.brand_id and public.is_org_admin(b.organization_id)));

drop policy if exists "LS admins delete tasks" on public.tasks;
create policy "LS admins delete tasks" on public.tasks
  for delete to authenticated
  using (exists (select 1 from public.brands b where b.id = tasks.brand_id and public.is_org_admin(b.organization_id)));

-- Si la publicación tiene aprobaciones, que se borren con ella (en vez de bloquear el borrado).
do $$
declare c text;
begin
  select conname into c from pg_constraint
   where conrelid = 'public.content_approvals'::regclass and contype = 'f'
     and confrelid = 'public.content_items'::regclass limit 1;
  if c is not null then
    execute format('alter table public.content_approvals drop constraint %I', c);
    alter table public.content_approvals add constraint content_approvals_content_id_fkey
      foreign key (content_id) references public.content_items(id) on delete cascade;
  end if;
end $$;

commit;
notify pgrst, 'reload schema';
select policyname, cmd from pg_policies where schemaname='public' and tablename in ('content_items','tasks') and cmd='DELETE';
