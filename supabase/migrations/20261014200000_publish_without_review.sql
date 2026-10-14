-- Publish assets immediately: no review step for now.
-- The status column stays, so review can come back later (set an asset to
-- 'pending' or 'rejected' to hide it). Run once in the SQL editor. Safe to re-run.

alter table public.assets alter column status set default 'approved';

-- Publish anything that was waiting for review.
update public.assets set status = 'approved' where status = 'pending';

-- New assets are always published; creators can't choose another status.
create or replace function public.assets_before_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.status := 'approved';
  new.rating_count := 0;
  new.rating_total := 0;
  select (o.metadata ->> 'size')::bigint
    into new.file_size
    from storage.objects o
   where o.bucket_id = 'asset-files'
     and o.name = new.asset;
  return new;
end;
$$;

-- Row level security checks the row after the trigger runs, so the insert
-- rule must allow 'approved' instead of 'pending'.
drop policy if exists "Creators submit pending assets" on public.assets;
drop policy if exists "Creators publish assets" on public.assets;
create policy "Creators publish assets"
  on public.assets for insert
  to authenticated
  with check (
    status = 'approved'
    and creator in (select id from public.creators where user_id = (select auth.uid()))
    and (select public.can_submit_asset())
  );
