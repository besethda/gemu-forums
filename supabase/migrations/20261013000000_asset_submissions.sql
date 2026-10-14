-- Asset submissions: email-verified creators get a 30-minute window to post
-- one asset per sign-in link. Run once in the Supabase SQL editor.
-- Safe to re-run: every statement is idempotent.

-- ── Schema ────────────────────────────────────────────────────────────────

-- Link each creator to the (hidden) Supabase Auth user created by the email link.
alter table public.creators
  add column if not exists user_id uuid unique references auth.users (id) on delete set null;

-- Review state. Only approved assets are visible on the site.
alter table public.assets
  add column if not exists status text not null default 'pending';
alter table public.assets drop constraint if exists assets_status_check;
alter table public.assets
  add constraint assets_status_check check (status in ('pending', 'approved', 'rejected'));

-- Categories the form offers. Skips any that already exist.
insert into public.categories (title)
select t from unnest(array['Models', 'Environments', 'Tools']) as t
where not exists (select 1 from public.categories c where c.title = t);

-- ── Submission window ─────────────────────────────────────────────────────

-- When the current session's email link was clicked (from the JWT's amr claim).
create or replace function public.email_link_signed_in_at()
returns timestamptz
language sql
stable
set search_path = ''
as $$
  select to_timestamp(max((entry ->> 'timestamp')::bigint))
  from jsonb_array_elements(coalesce(auth.jwt() -> 'amr', '[]'::jsonb)) as entry
  where entry ->> 'method' in ('otp', 'magiclink')
$$;

-- True while the link was clicked under 30 minutes ago and nothing has been
-- posted since. Security definer so it can see the caller's pending assets,
-- which the select policy below hides.
create or replace function public.can_submit_asset()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(public.email_link_signed_in_at() > now() - interval '30 minutes', false)
    and not exists (
      select 1
      from public.assets a
      join public.creators c on c.id = a.creator
      where c.user_id = auth.uid()
        and a.created_at >= public.email_link_signed_in_at()
    )
$$;

-- ── Row level security ────────────────────────────────────────────────────

alter table public.categories enable row level security;
alter table public.creators enable row level security;
alter table public.assets enable row level security;

drop policy if exists "Categories are public" on public.categories;
create policy "Categories are public"
  on public.categories for select
  to anon, authenticated
  using (true);

drop policy if exists "Approved assets are public" on public.assets;
create policy "Approved assets are public"
  on public.assets for select
  to anon, authenticated
  using (status = 'approved');

drop policy if exists "Creators submit pending assets" on public.assets;
create policy "Creators submit pending assets"
  on public.assets for insert
  to authenticated
  with check (
    status = 'pending'
    and creator in (select id from public.creators where user_id = (select auth.uid()))
    and (select public.can_submit_asset())
  );

drop policy if exists "Creators read their own row" on public.creators;
create policy "Creators read their own row"
  on public.creators for select
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Creators create their own row" on public.creators;
create policy "Creators create their own row"
  on public.creators for insert
  to authenticated
  with check (user_id = (select auth.uid()));

-- ── Storage ───────────────────────────────────────────────────────────────

-- Model files stay private (reviewers download them from the dashboard).
-- Photos and videos are public so approved listings can show them.
-- file_size_limit null = the project's global limit (50 MB on the free plan).
insert into storage.buckets (id, name, public, allowed_mime_types)
values
  ('asset-files', 'asset-files', false, null),
  ('asset-media', 'asset-media', true, array['image/*', 'video/*'])
on conflict (id) do nothing;

-- Uploads go into a folder named after the user's id, only during their window.
drop policy if exists "Creators upload into their own folder" on storage.objects;
create policy "Creators upload into their own folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id in ('asset-files', 'asset-media')
    and (storage.foldername(name))[1] = (select auth.uid()::text)
    and (select public.can_submit_asset())
  );
