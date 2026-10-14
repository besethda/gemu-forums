-- Price, file size and anonymous star ratings for assets.
-- Run once in the Supabase SQL editor. Safe to re-run.

-- ── Columns ───────────────────────────────────────────────────────────────

alter table public.assets
  add column if not exists price numeric(10, 2) not null default 0,
  add column if not exists file_size bigint,
  add column if not exists rating_count integer not null default 0,
  add column if not exists rating_total integer not null default 0;

alter table public.assets drop constraint if exists assets_price_check;
alter table public.assets
  add constraint assets_price_check check (price >= 0 and price <= 10000);

-- ── Server-controlled values on insert ────────────────────────────────────

-- Creators can't choose their own ratings or file size: ratings start at
-- zero and the size is read from the uploaded zip in storage.
create or replace function public.assets_before_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
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

drop trigger if exists assets_before_insert on public.assets;
create trigger assets_before_insert
  before insert on public.assets
  for each row execute function public.assets_before_insert();

-- Fill in the size for assets submitted before this migration.
update public.assets a
   set file_size = (o.metadata ->> 'size')::bigint
  from storage.objects o
 where a.file_size is null
   and o.bucket_id = 'asset-files'
   and o.name = a.asset;

-- ── Ratings ───────────────────────────────────────────────────────────────

-- Adds one 1–5 star rating to an approved asset. Returns false if the asset
-- isn't approved or the stars are out of range.
create or replace function public.rate_asset(target_asset bigint, stars integer)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if stars < 1 or stars > 5 then
    return false;
  end if;
  update public.assets
     set rating_count = rating_count + 1,
         rating_total = rating_total + stars
   where id = target_asset
     and status = 'approved';
  return found;
end;
$$;

-- Only the website's server (secret key) may rate, so it can apply its own
-- one-rating-per-browser check first.
revoke execute on function public.rate_asset(bigint, integer) from public, anon, authenticated;
grant execute on function public.rate_asset(bigint, integer) to service_role;
