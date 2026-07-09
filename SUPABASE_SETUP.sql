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

-- Chat module V4 tables / columns
create table if not exists chat_conversations (
  id bigint generated always as identity primary key,
  swap_id bigint,
  user1_id uuid,
  user2_id uuid,
  last_message text default '',
  last_message_at timestamptz default now(),
  created_at timestamptz default now()
);

create table if not exists chat_messages (
  id bigint generated always as identity primary key,
  conversation_id bigint references chat_conversations(id) on delete cascade,
  sender_id uuid,
  message text default '',
  image_url text default '',
  file_url text default '',
  file_name text default '',
  file_type text default '',
  message_type text default 'text',
  reply_to_id bigint,
  reply_to_text text default '',
  reply_to_sender_id uuid,
  reactions jsonb default '{}'::jsonb,
  is_deleted boolean default false,
  is_pinned boolean default false,
  is_starred boolean default false,
  seen boolean default false,
  voice_url text default '',
  voice_duration integer default 0,
  edited_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists chat_typing (
  conversation_id bigint references chat_conversations(id) on delete cascade,
  user_id uuid,
  is_typing boolean default false,
  updated_at timestamptz default now(),
  primary key (conversation_id, user_id)
);

alter table chat_conversations add column if not exists last_message text default '';
alter table chat_conversations add column if not exists last_message_at timestamptz default now();
alter table chat_messages add column if not exists image_url text default '';
alter table chat_messages add column if not exists file_url text default '';
alter table chat_messages add column if not exists file_name text default '';
alter table chat_messages add column if not exists file_type text default '';
alter table chat_messages add column if not exists message_type text default 'text';
alter table chat_messages add column if not exists reply_to_id bigint;
alter table chat_messages add column if not exists reply_to_text text default '';
alter table chat_messages add column if not exists reply_to_sender_id uuid;
alter table chat_messages add column if not exists reactions jsonb default '{}'::jsonb;
alter table chat_messages add column if not exists is_deleted boolean default false;
alter table chat_messages add column if not exists is_pinned boolean default false;
alter table chat_messages add column if not exists is_starred boolean default false;
alter table chat_messages add column if not exists seen boolean default false;
alter table chat_messages add column if not exists voice_url text default '';
alter table chat_messages add column if not exists voice_duration integer default 0;
alter table chat_messages add column if not exists edited_at timestamptz;
alter table chat_messages add column if not exists deleted_at timestamptz;

create index if not exists chat_conversations_user1_idx on chat_conversations(user1_id);
create index if not exists chat_conversations_user2_idx on chat_conversations(user2_id);
create index if not exists chat_messages_conversation_idx on chat_messages(conversation_id, created_at);

alter table chat_conversations disable row level security;
alter table chat_messages disable row level security;
alter table chat_typing disable row level security;

grant all on table chat_conversations to anon, authenticated;
grant all on table chat_messages to anon, authenticated;
grant all on table chat_typing to anon, authenticated;
DO $$
BEGIN
  GRANT USAGE, SELECT ON SEQUENCE chat_conversations_id_seq TO anon, authenticated;
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;

DO $$
BEGIN
  GRANT USAGE, SELECT ON SEQUENCE chat_messages_id_seq TO anon, authenticated;
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;

-- Storage bucket required: chat-files (create as a public bucket in Supabase Storage)
drop policy if exists "Allow chat file uploads" on storage.objects;
create policy "Allow chat file uploads"
on storage.objects
for all
to anon, authenticated
using (bucket_id = 'chat-files')
with check (bucket_id = 'chat-files');

-- Enable Supabase realtime for chat tables
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE chat_conversations;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE chat_typing;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Swap lifecycle / product availability mechanism
create table if not exists swaps (
  id bigint generated always as identity primary key,
  requester_id uuid,
  owner_id uuid,
  requester_name text,
  owner_name text,
  requester_item_id bigint,
  owner_item_id bigint,
  requester_item jsonb,
  owner_item jsonb,
  status text default 'pending',
  message text default '',
  accepted_at timestamptz,
  completed_at timestamptz,
  delete_eligible_at timestamptz,
  items_deleted_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table swaps add column if not exists requester_item_id bigint;
alter table swaps add column if not exists owner_item_id bigint;
alter table swaps add column if not exists requester_item jsonb;
alter table swaps add column if not exists owner_item jsonb;
alter table swaps add column if not exists accepted_at timestamptz;
alter table swaps add column if not exists completed_at timestamptz;
alter table swaps add column if not exists delete_eligible_at timestamptz;
alter table swaps add column if not exists items_deleted_at timestamptz;
alter table swaps add column if not exists updated_at timestamptz default now();

alter table listings add column if not exists swap_status text default 'available';
alter table listings add column if not exists active_swap_id bigint;
alter table listings add column if not exists swap_completed_at timestamptz;
alter table listings add column if not exists delete_eligible_at timestamptz;

update listings
set swap_status = 'available'
where swap_status is null;

create index if not exists listings_swap_status_idx on listings(swap_status);
create index if not exists listings_active_swap_idx on listings(active_swap_id);
create index if not exists swaps_requester_item_idx on swaps(requester_item_id);
create index if not exists swaps_owner_item_idx on swaps(owner_item_id);
create index if not exists swaps_status_idx on swaps(status);

alter table swaps disable row level security;
grant all on table swaps to anon, authenticated;

DO $$
BEGIN
  GRANT USAGE, SELECT ON SEQUENCE swaps_id_seq TO anon, authenticated;
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;

-- Notifications module
create table if not exists notifications (
  id bigint generated always as identity primary key,
  user_id uuid not null,
  actor_id uuid,
  type text default 'general',
  title text default 'SwapWear update',
  message text default '',
  link text default '',
  data jsonb default '{}'::jsonb,
  is_read boolean default false,
  read_at timestamptz,
  created_at timestamptz default now()
);

alter table notifications add column if not exists actor_id uuid;
alter table notifications add column if not exists type text default 'general';
alter table notifications add column if not exists title text default 'SwapWear update';
alter table notifications add column if not exists message text default '';
alter table notifications add column if not exists link text default '';
alter table notifications add column if not exists data jsonb default '{}'::jsonb;
alter table notifications add column if not exists is_read boolean default false;
alter table notifications add column if not exists read_at timestamptz;
alter table notifications add column if not exists created_at timestamptz default now();

create index if not exists notifications_user_created_idx on notifications(user_id, created_at desc);
create index if not exists notifications_user_unread_idx on notifications(user_id, is_read);
create index if not exists notifications_type_idx on notifications(type);

alter table notifications disable row level security;
grant all on table notifications to anon, authenticated;

DO $$
BEGIN
  GRANT USAGE, SELECT ON SEQUENCE notifications_id_seq TO anon, authenticated;
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
