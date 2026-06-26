-- SwapWear required tables / columns for current stable build

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  city text,
  bio text,
  created_at timestamptz default now()
);

create table if not exists listings (
  id bigint generated always as identity primary key,
  title text,
  brand text,
  category text,
  size text,
  condition text default 'Good',
  location text,
  points integer,
  description text,
  image text,
  images jsonb,
  video text,
  owner_name text,
  user_id uuid,
  created_at timestamptz default now()
);

create table if not exists swap_requests (
  id bigint generated always as identity primary key,
  requester_id uuid,
  owner_id uuid,
  requester_name text,
  owner_name text,
  requester_item_id bigint,
  owner_item_id bigint,
  requester_item_title text,
  owner_item_title text,
  requester_item_image text,
  owner_item_image text,
  requester_points integer,
  owner_points integer,
  status text default 'Pending',
  created_at timestamptz default now()
);

create table if not exists messages (
  id bigint generated always as identity primary key,
  sender_name text,
  receiver_name text,
  message text,
  created_at timestamptz default now()
);

alter table profiles disable row level security;
alter table listings disable row level security;
alter table swap_requests disable row level security;
alter table messages disable row level security;

grant all on table profiles to anon, authenticated;
grant all on table listings to anon, authenticated;
grant all on table swap_requests to anon, authenticated;
grant all on table messages to anon, authenticated;

grant usage, select on sequence listings_id_seq to anon, authenticated;
grant usage, select on sequence swap_requests_id_seq to anon, authenticated;
grant usage, select on sequence messages_id_seq to anon, authenticated;

-- Storage buckets required: listings, avatars (create as public buckets in Supabase Storage)
drop policy if exists "Allow listings uploads" on storage.objects;
create policy "Allow listings uploads"
on storage.objects
for all
to anon, authenticated
using (bucket_id = 'listings')
with check (bucket_id = 'listings');

drop policy if exists "Allow avatar uploads" on storage.objects;
create policy "Allow avatar uploads"
on storage.objects
for all
to anon, authenticated
using (bucket_id = 'avatars')
with check (bucket_id = 'avatars');
