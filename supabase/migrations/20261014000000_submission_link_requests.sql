-- Rate limit for submission sign-in links, which the server now generates and
-- sends itself (via EmailJS) instead of Supabase's built-in mailer.
-- Run once in the Supabase SQL editor. Safe to re-run.

create table if not exists public.submission_link_requests (
  id bigint generated always as identity primary key,
  email text not null,
  created_at timestamptz not null default now()
);

create index if not exists submission_link_requests_email_created_at_idx
  on public.submission_link_requests (email, created_at desc);

-- Row level security with no policies: only the server's secret key can read
-- or write this table.
alter table public.submission_link_requests enable row level security;
