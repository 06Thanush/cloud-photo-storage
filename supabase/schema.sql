-- Run this in Supabase Dashboard → SQL Editor

-- 1. Photo metadata table
create table photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  path text not null,           -- storage path, e.g. "<user_id>/1699999999-cat.jpg"
  caption text default '',
  size bigint default 0,
  uploaded_at timestamptz default now()
);

alter table photos enable row level security;

create policy "users read own photos"
  on photos for select
  using (auth.uid() = user_id);

create policy "users insert own photos"
  on photos for insert
  with check (auth.uid() = user_id);

create policy "users delete own photos"
  on photos for delete
  using (auth.uid() = user_id);

-- 2. Storage buckets: create these in Dashboard → Storage
--    - "originals"  (private)
--    - "thumbnails" (public)
-- Then run the policies below (Dashboard → Storage → Policies, or SQL editor):

-- Originals: only the owner can read/write, path must start with their user id
create policy "originals owner access"
  on storage.objects for all
  using (bucket_id = 'originals' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'originals' and (storage.foldername(name))[1] = auth.uid()::text);

-- Thumbnails: public read, owner-only write
create policy "thumbnails public read"
  on storage.objects for select
  using (bucket_id = 'thumbnails');

create policy "thumbnails owner write"
  on storage.objects for insert
  with check (bucket_id = 'thumbnails' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "thumbnails owner delete"
  on storage.objects for delete
  using (bucket_id = 'thumbnails' and (storage.foldername(name))[1] = auth.uid()::text);
