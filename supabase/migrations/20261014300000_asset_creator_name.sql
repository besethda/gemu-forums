-- Creator display name, shown on asset cards and pages.
-- Stored on the asset (not on creators, which holds private emails and isn't
-- publicly readable). Run once in the SQL editor. Safe to re-run.

alter table public.assets
  add column if not exists creator_name text not null default '';

alter table public.assets drop constraint if exists assets_creator_name_check;
alter table public.assets
  add constraint assets_creator_name_check check (char_length(creator_name) <= 60);
