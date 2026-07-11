-- SwapWear required tables / columns for current stable build

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  city text,
  bio text,
  created_at timestamptz default now()
);

alter table profiles add column if not exists username text;
alter table profiles add column if not exists email text;
alter table profiles add column if not exists phone text;
alter table profiles add column if not exists location text;
alter table profiles add column if not exists website text;
alter table profiles add column if not exists provider text default 'email';
alter table profiles add column if not exists is_premium boolean default false;
alter table profiles add column if not exists total_swaps integer default 0;
alter table profiles add column if not exists rating numeric default 0;
alter table profiles add column if not exists status text default 'active';
alter table profiles add column if not exists updated_at timestamptz default now();

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
  swap_id uuid,
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

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'chat_conversations'
      AND column_name = 'swap_id'
      AND data_type <> 'uuid'
  ) THEN
    UPDATE chat_conversations SET swap_id = NULL;
    ALTER TABLE chat_conversations
      ALTER COLUMN swap_id TYPE uuid USING NULL;
  END IF;
END $$;

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
create extension if not exists pgcrypto;

create table if not exists swaps (
  id uuid primary key default gen_random_uuid(),
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
  delivery_method text,
  accepted_at timestamptz,
  cancelled_at timestamptz,
  expires_at timestamptz default (now() + interval '7 days'),
  last_action_at timestamptz default now(),
  completed_at timestamptz,
  archive_after timestamptz,
  delete_eligible_at timestamptz,
  items_deleted_at timestamptz,
  archived_at timestamptz,
  cancel_reason text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table swaps add column if not exists requester_item_id bigint;
alter table swaps add column if not exists owner_item_id bigint;
alter table swaps add column if not exists requester_item jsonb;
alter table swaps add column if not exists owner_item jsonb;
alter table swaps add column if not exists delivery_method text;
alter table swaps add column if not exists accepted_at timestamptz;
alter table swaps add column if not exists cancelled_at timestamptz;
alter table swaps add column if not exists expires_at timestamptz default (now() + interval '7 days');
alter table swaps add column if not exists last_action_at timestamptz default now();
alter table swaps add column if not exists completed_at timestamptz;
alter table swaps add column if not exists archive_after timestamptz;
alter table swaps add column if not exists delete_eligible_at timestamptz;
alter table swaps add column if not exists items_deleted_at timestamptz;
alter table swaps add column if not exists archived_at timestamptz;
alter table swaps add column if not exists cancel_reason text;
alter table swaps add column if not exists updated_at timestamptz default now();
alter table swaps alter column id set default gen_random_uuid();

update swaps
set status = lower(status)
where status is not null
  and status <> lower(status);

alter table swaps drop constraint if exists swaps_status_check;
alter table swaps add constraint swaps_status_check
check (
  status in (
    'pending',
    'accepted',
    'rejected',
    'cancelled',
    'expired',
    'shipped',
    'delivered',
    'completed',
    'disputed',
    'failed'
  )
);

alter table listings add column if not exists swap_status text default 'available';
alter table listings add column if not exists active_swap_id uuid;
alter table listings add column if not exists swap_completed_at timestamptz;
alter table listings add column if not exists archive_after timestamptz;
alter table listings add column if not exists archived_at timestamptz;
alter table listings add column if not exists delete_eligible_at timestamptz;
alter table listings add column if not exists is_public boolean default true;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'listings'
      AND column_name = 'active_swap_id'
      AND data_type <> 'uuid'
  ) THEN
    UPDATE listings SET active_swap_id = NULL;
    ALTER TABLE listings
      ALTER COLUMN active_swap_id TYPE uuid USING NULL;
  END IF;
END $$;

update listings
set swap_status = 'available'
where swap_status is null;

update listings
set swap_status = lower(swap_status)
where swap_status is not null
  and swap_status <> lower(swap_status);

update listings
set swap_status = 'reserved'
where swap_status = 'locked';

update listings
set swap_status = 'swapped'
where swap_status = 'completed';

alter table listings drop constraint if exists listings_swap_status_check;
alter table listings add constraint listings_swap_status_check
check (
  swap_status in (
    'available',
    'reserved',
    'swapped',
    'archived',
    'removed',
    'blocked'
  )
);

update swaps
set archive_after = coalesce(archive_after, delete_eligible_at)
where archive_after is null
  and delete_eligible_at is not null;

create index if not exists listings_swap_status_idx on listings(swap_status);
create index if not exists listings_active_swap_idx on listings(active_swap_id);
create index if not exists listings_public_swap_status_idx on listings(is_public, swap_status);
create index if not exists listings_archive_after_idx on listings(archive_after);
create index if not exists swaps_requester_item_idx on swaps(requester_item_id);
create index if not exists swaps_owner_item_idx on swaps(owner_item_id);
create index if not exists swaps_status_idx on swaps(status);
create index if not exists swaps_expires_at_idx on swaps(expires_at);
create index if not exists swaps_archive_after_idx on swaps(archive_after);

DO $$
BEGIN
  create unique index if not exists swaps_unique_active_pair_idx
  on swaps(requester_item_id, owner_item_id)
  where status in ('pending', 'accepted', 'shipped', 'delivered');
EXCEPTION
  WHEN unique_violation THEN
    RAISE NOTICE 'Skipping swaps_unique_active_pair_idx because duplicate active swap pairs already exist.';
END $$;

create table if not exists swap_events (
  id bigint generated always as identity primary key,
  swap_id uuid references swaps(id) on delete cascade,
  actor_id uuid,
  event_type text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists swap_confirmations (
  id bigint generated always as identity primary key,
  swap_id uuid references swaps(id) on delete cascade,
  user_id uuid,
  handover_confirmed_at timestamptz,
  received_confirmed_at timestamptz,
  proof_url text,
  note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (swap_id, user_id)
);

create table if not exists swap_disputes (
  id bigint generated always as identity primary key,
  swap_id uuid references swaps(id) on delete cascade,
  opened_by uuid,
  reason text,
  status text default 'open',
  resolution text,
  created_at timestamptz default now(),
  resolved_at timestamptz
);

create table if not exists reports (
  id bigint generated always as identity primary key,
  reporter_id uuid,
  reported_user_id uuid,
  listing_id bigint,
  swap_id uuid,
  report_type text default 'general',
  reason text,
  status text default 'open',
  created_at timestamptz default now(),
  resolved_at timestamptz
);

create table if not exists reviews (
  id bigint generated always as identity primary key,
  swap_id uuid references swaps(id) on delete set null,
  reviewer_id uuid,
  reviewee_id uuid,
  rating integer,
  comment text,
  created_at timestamptz default now(),
  unique (swap_id, reviewer_id)
);

create index if not exists swap_events_swap_created_idx on swap_events(swap_id, created_at);
create index if not exists swap_confirmations_swap_idx on swap_confirmations(swap_id);
create index if not exists swap_disputes_swap_idx on swap_disputes(swap_id);
create index if not exists reports_status_idx on reports(status);
create index if not exists reviews_reviewee_idx on reviews(reviewee_id);

alter table swaps disable row level security;
alter table swap_events disable row level security;
alter table swap_confirmations disable row level security;
alter table swap_disputes disable row level security;
alter table reports disable row level security;
alter table reviews disable row level security;
grant all on table swaps to anon, authenticated;
grant all on table swap_events to anon, authenticated;
grant all on table swap_confirmations to anon, authenticated;
grant all on table swap_disputes to anon, authenticated;
grant all on table reports to anon, authenticated;
grant all on table reviews to anon, authenticated;

DO $$
BEGIN
  GRANT USAGE, SELECT ON SEQUENCE swaps_id_seq TO anon, authenticated;
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;

DO $$
BEGIN
  GRANT USAGE, SELECT ON SEQUENCE swap_events_id_seq TO anon, authenticated;
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;

DO $$
BEGIN
  GRANT USAGE, SELECT ON SEQUENCE swap_confirmations_id_seq TO anon, authenticated;
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;

DO $$
BEGIN
  GRANT USAGE, SELECT ON SEQUENCE swap_disputes_id_seq TO anon, authenticated;
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;

DO $$
BEGIN
  GRANT USAGE, SELECT ON SEQUENCE reports_id_seq TO anon, authenticated;
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;

DO $$
BEGIN
  GRANT USAGE, SELECT ON SEQUENCE reviews_id_seq TO anon, authenticated;
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;

create or replace function expire_old_swap_requests()
returns integer
language plpgsql
security definer
as $$
declare
  affected_count integer;
begin
  update swaps
  set status = 'expired',
      updated_at = now(),
      last_action_at = now()
  where status = 'pending'
    and expires_at is not null
    and expires_at <= now();

  get diagnostics affected_count = row_count;
  return affected_count;
end;
$$;

create or replace function accept_swap_request(p_swap_id uuid, p_actor_id uuid default auth.uid())
returns swaps
language plpgsql
security definer
as $$
declare
  target_swap swaps;
  requester_listing listings;
  owner_listing listings;
begin
  perform expire_old_swap_requests();

  select * into target_swap
  from swaps
  where id = p_swap_id
  for update;

  if not found then
    raise exception 'Swap request not found';
  end if;

  if target_swap.status <> 'pending' then
    raise exception 'Only pending swap requests can be accepted';
  end if;

  if p_actor_id is not null and target_swap.owner_id <> p_actor_id then
    raise exception 'Only the item owner can accept this swap';
  end if;

  select * into requester_listing
  from listings
  where id = target_swap.requester_item_id
  for update;

  select * into owner_listing
  from listings
  where id = target_swap.owner_item_id
  for update;

  if requester_listing.id is null or owner_listing.id is null then
    raise exception 'One of these swap items no longer exists';
  end if;

  if requester_listing.user_id <> target_swap.requester_id then
    raise exception 'Requester item owner mismatch';
  end if;

  if owner_listing.user_id <> target_swap.owner_id then
    raise exception 'Requested item owner mismatch';
  end if;

  if coalesce(requester_listing.swap_status, 'available') <> 'available'
    or coalesce(owner_listing.swap_status, 'available') <> 'available' then
    raise exception 'One of these items is already reserved or swapped';
  end if;

  update swaps
  set status = 'accepted',
      accepted_at = now(),
      updated_at = now(),
      last_action_at = now()
  where id = target_swap.id
  returning * into target_swap;

  update listings
  set swap_status = 'reserved',
      active_swap_id = target_swap.id,
      is_public = false,
      swap_completed_at = null,
      archive_after = null,
      delete_eligible_at = null
  where id in (target_swap.requester_item_id, target_swap.owner_item_id);

  update swaps
  set status = 'expired',
      updated_at = now(),
      last_action_at = now()
  where id <> target_swap.id
    and status = 'pending'
    and (
      requester_item_id in (target_swap.requester_item_id, target_swap.owner_item_id)
      or owner_item_id in (target_swap.requester_item_id, target_swap.owner_item_id)
    );

  insert into swap_confirmations (swap_id, user_id)
  values (target_swap.id, target_swap.requester_id), (target_swap.id, target_swap.owner_id)
  on conflict (swap_id, user_id) do nothing;

  insert into swap_events (swap_id, actor_id, event_type, metadata)
  values (
    target_swap.id,
    p_actor_id,
    'request_accepted',
    jsonb_build_object('locked_listing_ids', jsonb_build_array(target_swap.requester_item_id, target_swap.owner_item_id))
  );

  return target_swap;
end;
$$;

create or replace function cancel_swap_request(
  p_swap_id uuid,
  p_actor_id uuid default auth.uid(),
  p_next_status text default 'cancelled',
  p_reason text default null
)
returns swaps
language plpgsql
security definer
as $$
declare
  target_swap swaps;
  clean_status text := lower(coalesce(p_next_status, 'cancelled'));
begin
  select * into target_swap
  from swaps
  where id = p_swap_id
  for update;

  if not found then
    raise exception 'Swap request not found';
  end if;

  if p_actor_id is not null
    and p_actor_id not in (target_swap.requester_id, target_swap.owner_id) then
    raise exception 'Only swap participants can update this swap';
  end if;

  if clean_status not in ('cancelled', 'rejected', 'failed') then
    raise exception 'Invalid cancellation status';
  end if;

  if target_swap.status not in ('pending', 'accepted', 'shipped', 'delivered', 'completed') then
    raise exception 'This swap can no longer be cancelled';
  end if;

  update swaps
  set status = clean_status,
      cancelled_at = now(),
      cancel_reason = p_reason,
      updated_at = now(),
      last_action_at = now()
  where id = target_swap.id
  returning * into target_swap;

  update listings
  set swap_status = 'available',
      active_swap_id = null,
      is_public = true,
      swap_completed_at = null,
      archive_after = null,
      delete_eligible_at = null,
      archived_at = null
  where active_swap_id = target_swap.id
    and swap_status in ('reserved', 'swapped', 'archived');

  update swaps pending_swap
  set status = 'pending',
      expires_at = greatest(coalesce(pending_swap.expires_at, now()), now() + interval '7 days'),
      updated_at = now(),
      last_action_at = now()
  from listings requester_listing,
       listings owner_listing
  where pending_swap.id <> target_swap.id
    and pending_swap.status = 'expired'
    and (
      pending_swap.requester_item_id in (target_swap.requester_item_id, target_swap.owner_item_id)
      or pending_swap.owner_item_id in (target_swap.requester_item_id, target_swap.owner_item_id)
    )
    and requester_listing.id = pending_swap.requester_item_id
    and owner_listing.id = pending_swap.owner_item_id
    and coalesce(requester_listing.swap_status, 'available') = 'available'
    and coalesce(owner_listing.swap_status, 'available') = 'available'
    and coalesce(requester_listing.is_public, true) = true
    and coalesce(owner_listing.is_public, true) = true
    and not exists (
      select 1
      from swaps existing_swap
      where existing_swap.id <> pending_swap.id
        and existing_swap.status in ('pending', 'accepted', 'shipped', 'delivered')
        and existing_swap.requester_item_id = pending_swap.requester_item_id
        and existing_swap.owner_item_id = pending_swap.owner_item_id
    );

  insert into swap_events (swap_id, actor_id, event_type, metadata)
  values (
    target_swap.id,
    p_actor_id,
    clean_status,
    jsonb_build_object('reason', p_reason)
  );

  return target_swap;
end;
$$;

create or replace function set_swap_delivery_method(
  p_swap_id uuid,
  p_actor_id uuid default auth.uid(),
  p_delivery_method text default 'local'
)
returns swaps
language plpgsql
security definer
as $$
declare
  target_swap swaps;
  clean_method text := lower(coalesce(p_delivery_method, 'local'));
begin
  select * into target_swap
  from swaps
  where id = p_swap_id
  for update;

  if not found then
    raise exception 'Swap request not found';
  end if;

  if p_actor_id is not null
    and p_actor_id not in (target_swap.requester_id, target_swap.owner_id) then
    raise exception 'Only swap participants can update delivery';
  end if;

  if target_swap.status not in ('accepted', 'shipped', 'delivered') then
    raise exception 'Delivery method can be set only after acceptance';
  end if;

  if clean_method not in ('local', 'courier', 'other') then
    clean_method := 'other';
  end if;

  update swaps
  set delivery_method = clean_method,
      updated_at = now(),
      last_action_at = now()
  where id = target_swap.id
  returning * into target_swap;

  insert into swap_events (swap_id, actor_id, event_type, metadata)
  values (
    target_swap.id,
    p_actor_id,
    'delivery_method_set',
    jsonb_build_object('delivery_method', clean_method)
  );

  return target_swap;
end;
$$;

create or replace function confirm_swap_handover(
  p_swap_id uuid,
  p_actor_id uuid default auth.uid(),
  p_proof_url text default null,
  p_note text default null
)
returns swaps
language plpgsql
security definer
as $$
declare
  target_swap swaps;
begin
  select * into target_swap
  from swaps
  where id = p_swap_id
  for update;

  if not found then
    raise exception 'Swap request not found';
  end if;

  if p_actor_id is null
    or p_actor_id not in (target_swap.requester_id, target_swap.owner_id) then
    raise exception 'Only swap participants can confirm handover';
  end if;

  if target_swap.status not in ('accepted', 'shipped', 'delivered') then
    raise exception 'Handover can be confirmed only after acceptance';
  end if;

  insert into swap_confirmations (
    swap_id,
    user_id,
    handover_confirmed_at,
    proof_url,
    note,
    updated_at
  )
  values (
    target_swap.id,
    p_actor_id,
    now(),
    p_proof_url,
    p_note,
    now()
  )
  on conflict (swap_id, user_id)
  do update set
    handover_confirmed_at = coalesce(swap_confirmations.handover_confirmed_at, excluded.handover_confirmed_at),
    proof_url = coalesce(excluded.proof_url, swap_confirmations.proof_url),
    note = coalesce(excluded.note, swap_confirmations.note),
    updated_at = now();

  update swaps
  set status = case when status = 'accepted' then 'shipped' else status end,
      updated_at = now(),
      last_action_at = now()
  where id = target_swap.id
  returning * into target_swap;

  insert into swap_events (swap_id, actor_id, event_type, metadata)
  values (
    target_swap.id,
    p_actor_id,
    'handover_confirmed',
    jsonb_build_object('proof_url', p_proof_url, 'note', p_note)
  );

  return target_swap;
end;
$$;

create or replace function confirm_swap_received(
  p_swap_id uuid,
  p_actor_id uuid default auth.uid(),
  p_note text default null
)
returns swaps
language plpgsql
security definer
as $$
declare
  target_swap swaps;
  received_count integer;
begin
  select * into target_swap
  from swaps
  where id = p_swap_id
  for update;

  if not found then
    raise exception 'Swap request not found';
  end if;

  if p_actor_id is null
    or p_actor_id not in (target_swap.requester_id, target_swap.owner_id) then
    raise exception 'Only swap participants can confirm receipt';
  end if;

  if target_swap.status not in ('accepted', 'shipped', 'delivered') then
    raise exception 'Receipt can be confirmed only during an active swap';
  end if;

  insert into swap_confirmations (
    swap_id,
    user_id,
    received_confirmed_at,
    note,
    updated_at
  )
  values (
    target_swap.id,
    p_actor_id,
    now(),
    p_note,
    now()
  )
  on conflict (swap_id, user_id)
  do update set
    received_confirmed_at = coalesce(swap_confirmations.received_confirmed_at, excluded.received_confirmed_at),
    note = coalesce(excluded.note, swap_confirmations.note),
    updated_at = now();

  select count(*) into received_count
  from swap_confirmations
  where swap_id = target_swap.id
    and user_id in (target_swap.requester_id, target_swap.owner_id)
    and received_confirmed_at is not null;

  update swaps
  set status = case when received_count >= 2 then 'delivered' else 'shipped' end,
      updated_at = now(),
      last_action_at = now()
  where id = target_swap.id
  returning * into target_swap;

  insert into swap_events (swap_id, actor_id, event_type, metadata)
  values (
    target_swap.id,
    p_actor_id,
    'received_confirmed',
    jsonb_build_object('received_count', received_count, 'note', p_note)
  );

  return target_swap;
end;
$$;

create or replace function complete_swap_request(p_swap_id uuid, p_actor_id uuid default auth.uid())
returns swaps
language plpgsql
security definer
as $$
declare
  target_swap swaps;
  archive_time timestamptz := now() + interval '3 days';
  received_count integer;
begin
  select * into target_swap
  from swaps
  where id = p_swap_id
  for update;

  if not found then
    raise exception 'Swap request not found';
  end if;

  if p_actor_id is not null
    and p_actor_id not in (target_swap.requester_id, target_swap.owner_id) then
    raise exception 'Only swap participants can complete this swap';
  end if;

  if target_swap.status not in ('delivered', 'completed') then
    raise exception 'Swap can be completed only after both users confirm receipt';
  end if;

  select count(*) into received_count
  from swap_confirmations
  where swap_id = target_swap.id
    and user_id in (target_swap.requester_id, target_swap.owner_id)
    and received_confirmed_at is not null;

  if received_count < 2 then
    raise exception 'Both users must confirm receipt before completion';
  end if;

  update swaps
  set status = 'completed',
      completed_at = now(),
      archive_after = archive_time,
      delete_eligible_at = archive_time,
      updated_at = now(),
      last_action_at = now()
  where id = target_swap.id
  returning * into target_swap;

  update listings
  set swap_status = 'swapped',
      active_swap_id = target_swap.id,
      is_public = false,
      swap_completed_at = now(),
      archive_after = archive_time,
      delete_eligible_at = archive_time
  where id in (target_swap.requester_item_id, target_swap.owner_item_id)
    and active_swap_id = target_swap.id;

  insert into swap_events (swap_id, actor_id, event_type, metadata)
  values (
    target_swap.id,
    p_actor_id,
    'swap_completed',
    jsonb_build_object('archive_after', archive_time)
  );

  return target_swap;
end;
$$;

create or replace function open_swap_dispute(
  p_swap_id uuid,
  p_actor_id uuid default auth.uid(),
  p_reason text default 'Swap issue reported'
)
returns swaps
language plpgsql
security definer
as $$
declare
  target_swap swaps;
  clean_reason text := nullif(trim(coalesce(p_reason, '')), '');
begin
  select * into target_swap
  from swaps
  where id = p_swap_id
  for update;

  if not found then
    raise exception 'Swap request not found';
  end if;

  if p_actor_id is null
    or p_actor_id not in (target_swap.requester_id, target_swap.owner_id) then
    raise exception 'Only swap participants can open a dispute';
  end if;

  if target_swap.status not in ('accepted', 'shipped', 'delivered', 'completed') then
    raise exception 'A dispute can be opened only for an active or completed swap';
  end if;

  insert into swap_disputes (
    swap_id,
    opened_by,
    reason,
    status,
    created_at
  )
  values (
    target_swap.id,
    p_actor_id,
    coalesce(clean_reason, 'Swap issue reported'),
    'open',
    now()
  );

  update swaps
  set status = 'disputed',
      updated_at = now(),
      last_action_at = now()
  where id = target_swap.id
  returning * into target_swap;

  insert into swap_events (swap_id, actor_id, event_type, metadata)
  values (
    target_swap.id,
    p_actor_id,
    'dispute_opened',
    jsonb_build_object('reason', coalesce(clean_reason, 'Swap issue reported'))
  );

  return target_swap;
end;
$$;

create or replace function current_user_is_admin()
returns boolean
language plpgsql
stable
security definer
as $$
declare
  admin_claims jsonb := coalesce(auth.jwt() -> 'app_metadata', '{}'::jsonb);
  admin_role text := lower(coalesce(auth.jwt() -> 'app_metadata' ->> 'role', ''));
begin
  return auth.uid() is not null
    and (
      admin_role in ('admin', 'moderator', 'owner')
      or lower(coalesce(admin_claims ->> 'is_admin', 'false')) in ('true', '1', 'yes')
    );
end;
$$;

create or replace function get_open_swap_disputes()
returns table (
  dispute jsonb,
  swap jsonb
)
language plpgsql
security definer
as $$
begin
  if current_user_is_admin() is not true then
    raise exception 'Only admins can view swap disputes';
  end if;

  return query
  select
    to_jsonb(d.*) as dispute,
    to_jsonb(s.*) as swap
  from swap_disputes d
  left join swaps s on s.id = d.swap_id
  where coalesce(d.status, 'open') = 'open'
  order by d.created_at desc;
end;
$$;

create or replace function resolve_swap_dispute(
  p_dispute_id bigint,
  p_actor_id uuid default auth.uid(),
  p_decision text default 'continue',
  p_resolution text default null
)
returns swaps
language plpgsql
security definer
as $$
declare
  target_dispute swap_disputes;
  target_swap swaps;
  clean_decision text := lower(nullif(trim(coalesce(p_decision, '')), ''));
  clean_resolution text := nullif(trim(coalesce(p_resolution, '')), '');
  next_status text := 'accepted';
  handover_count integer := 0;
  received_count integer := 0;
  archive_time timestamptz := now() + interval '3 days';
begin
  if auth.uid() is null or p_actor_id is distinct from auth.uid() then
    raise exception 'Admin session required';
  end if;

  if current_user_is_admin() is not true then
    raise exception 'Only admins can resolve swap disputes';
  end if;

  select * into target_dispute
  from swap_disputes
  where id = p_dispute_id
  for update;

  if not found then
    raise exception 'Dispute not found';
  end if;

  if coalesce(target_dispute.status, 'open') <> 'open' then
    raise exception 'This dispute is already resolved';
  end if;

  select * into target_swap
  from swaps
  where id = target_dispute.swap_id
  for update;

  if not found then
    raise exception 'Swap request not found';
  end if;

  if target_swap.status <> 'disputed' then
    raise exception 'Only disputed swaps can be resolved by admin';
  end if;

  if clean_decision not in ('continue', 'cancel', 'complete') then
    raise exception 'Invalid dispute decision';
  end if;

  update swap_disputes
  set status = 'resolved',
      resolution = coalesce(clean_resolution, clean_decision),
      resolved_at = now()
  where id = target_dispute.id;

  if clean_decision = 'continue' then
    select
      count(*) filter (where handover_confirmed_at is not null),
      count(*) filter (where received_confirmed_at is not null)
    into handover_count, received_count
    from swap_confirmations
    where swap_id = target_swap.id;

    if received_count >= 2 then
      next_status := 'delivered';
    elsif handover_count > 0 or received_count > 0 then
      next_status := 'shipped';
    else
      next_status := 'accepted';
    end if;

    update swaps
    set status = next_status,
        updated_at = now(),
        last_action_at = now()
    where id = target_swap.id
    returning * into target_swap;
  elsif clean_decision = 'cancel' then
    update swaps
    set status = 'cancelled',
        cancelled_at = now(),
        cancel_reason = coalesce(clean_resolution, 'Dispute resolved by admin cancellation'),
        updated_at = now(),
        last_action_at = now()
    where id = target_swap.id
    returning * into target_swap;

    update listings
    set swap_status = 'available',
        active_swap_id = null,
        is_public = true,
        swap_completed_at = null,
        archive_after = null,
        delete_eligible_at = null,
        archived_at = null
    where active_swap_id = target_swap.id
      and swap_status in ('reserved', 'swapped', 'archived');

    update swaps pending_swap
    set status = 'pending',
        expires_at = greatest(coalesce(pending_swap.expires_at, now()), now() + interval '7 days'),
        updated_at = now(),
        last_action_at = now()
    from listings requester_listing,
         listings owner_listing
    where pending_swap.id <> target_swap.id
      and pending_swap.status = 'expired'
      and (
        pending_swap.requester_item_id in (target_swap.requester_item_id, target_swap.owner_item_id)
        or pending_swap.owner_item_id in (target_swap.requester_item_id, target_swap.owner_item_id)
      )
      and requester_listing.id = pending_swap.requester_item_id
      and owner_listing.id = pending_swap.owner_item_id
      and coalesce(requester_listing.swap_status, 'available') = 'available'
      and coalesce(owner_listing.swap_status, 'available') = 'available'
      and coalesce(requester_listing.is_public, true) = true
      and coalesce(owner_listing.is_public, true) = true
      and not exists (
        select 1
        from swaps existing_swap
        where existing_swap.id <> pending_swap.id
          and existing_swap.status in ('pending', 'accepted', 'shipped', 'delivered', 'disputed')
          and existing_swap.requester_item_id = pending_swap.requester_item_id
          and existing_swap.owner_item_id = pending_swap.owner_item_id
      );
  elsif clean_decision = 'complete' then
    update swaps
    set status = 'completed',
        completed_at = coalesce(completed_at, now()),
        archive_after = archive_time,
        delete_eligible_at = archive_time,
        updated_at = now(),
        last_action_at = now()
    where id = target_swap.id
    returning * into target_swap;

    update listings
    set swap_status = 'swapped',
        is_public = false,
        active_swap_id = target_swap.id,
        swap_completed_at = now(),
        archive_after = archive_time,
        delete_eligible_at = archive_time
    where id in (target_swap.requester_item_id, target_swap.owner_item_id);
  end if;

  insert into swap_events (swap_id, actor_id, event_type, metadata)
  values (
    target_swap.id,
    p_actor_id,
    'dispute_resolved',
    jsonb_build_object(
      'dispute_id', target_dispute.id,
      'decision', clean_decision,
      'resolution', coalesce(clean_resolution, clean_decision),
      'status_after', target_swap.status
    )
  );

  return target_swap;
end;
$$;

create or replace function create_marketplace_report(
  p_listing_id bigint default null,
  p_swap_id uuid default null,
  p_reported_user_id uuid default null,
  p_report_type text default 'general',
  p_reason text default null
)
returns reports
language plpgsql
security definer
as $$
declare
  created_report reports;
  target_listing listings;
  clean_reason text := nullif(trim(coalesce(p_reason, '')), '');
  clean_type text := lower(coalesce(nullif(trim(p_report_type), ''), 'general'));
begin
  if auth.uid() is null then
    raise exception 'Login required to report marketplace issues';
  end if;

  if p_listing_id is null and p_swap_id is null and p_reported_user_id is null then
    raise exception 'Report needs a listing, swap, or user target';
  end if;

  if p_listing_id is not null then
    select * into target_listing
    from listings
    where id = p_listing_id;

    if not found then
      raise exception 'Listing not found';
    end if;

    if target_listing.user_id = auth.uid() then
      raise exception 'You cannot report your own listing';
    end if;

    p_reported_user_id := coalesce(p_reported_user_id, target_listing.user_id);
  end if;

  insert into reports (
    reporter_id,
    reported_user_id,
    listing_id,
    swap_id,
    report_type,
    reason,
    status,
    created_at
  )
  values (
    auth.uid(),
    p_reported_user_id,
    p_listing_id,
    p_swap_id,
    clean_type,
    coalesce(clean_reason, 'Marketplace issue reported'),
    'open',
    now()
  )
  returning * into created_report;

  return created_report;
end;
$$;

create or replace function submit_swap_review(
  p_swap_id uuid,
  p_rating integer,
  p_comment text default null
)
returns reviews
language plpgsql
security definer
as $$
declare
  target_swap swaps;
  reviewee uuid;
  saved_review reviews;
begin
  if auth.uid() is null then
    raise exception 'Login required to review a swap';
  end if;

  select * into target_swap
  from swaps
  where id = p_swap_id;

  if not found then
    raise exception 'Swap request not found';
  end if;

  if auth.uid() not in (target_swap.requester_id, target_swap.owner_id) then
    raise exception 'Only swap participants can review this swap';
  end if;

  if target_swap.status <> 'completed' then
    raise exception 'Reviews unlock after swap completion';
  end if;

  if p_rating < 1 or p_rating > 5 then
    raise exception 'Rating must be between 1 and 5';
  end if;

  reviewee := case
    when auth.uid() = target_swap.requester_id then target_swap.owner_id
    else target_swap.requester_id
  end;

  insert into reviews (
    swap_id,
    reviewer_id,
    reviewee_id,
    rating,
    comment,
    created_at
  )
  values (
    target_swap.id,
    auth.uid(),
    reviewee,
    p_rating,
    nullif(trim(coalesce(p_comment, '')), ''),
    now()
  )
  on conflict (swap_id, reviewer_id)
  do update set
    rating = excluded.rating,
    comment = excluded.comment,
    created_at = now()
  returning * into saved_review;

  update profiles profile
  set rating = coalesce((
        select round(avg(rating)::numeric, 1)
        from reviews
        where reviewee_id = reviewee
      ), 0),
      updated_at = now()
  where profile.id = reviewee;

  return saved_review;
end;
$$;

create or replace function resolve_marketplace_report(
  p_report_id bigint,
  p_status text default 'resolved',
  p_note text default null
)
returns reports
language plpgsql
security definer
as $$
declare
  target_report reports;
  clean_status text := lower(coalesce(nullif(trim(p_status), ''), 'resolved'));
begin
  if current_user_is_admin() is not true then
    raise exception 'Only admins can resolve marketplace reports';
  end if;

  if clean_status not in ('resolved', 'dismissed', 'blocked') then
    raise exception 'Invalid report status';
  end if;

  update reports
  set status = clean_status,
      reason = case
        when nullif(trim(coalesce(p_note, '')), '') is null then reason
        else concat(reason, E'\n\nAdmin note: ', trim(p_note))
      end,
      resolved_at = now()
  where id = p_report_id
  returning * into target_report;

  if not found then
    raise exception 'Report not found';
  end if;

  if clean_status = 'blocked' and target_report.listing_id is not null then
    update listings
    set swap_status = 'blocked',
        is_public = false
    where id = target_report.listing_id;
  end if;

  return target_report;
end;
$$;

create or replace function get_admin_dashboard_data()
returns jsonb
language plpgsql
security definer
as $$
declare
  payload jsonb;
begin
  if current_user_is_admin() is not true then
    raise exception 'Only admins can view admin dashboard data';
  end if;

  select jsonb_build_object(
    'stats', jsonb_build_object(
      'users', (select count(*) from profiles),
      'listings', (select count(*) from listings),
      'available_listings', (select count(*) from listings where coalesce(is_public, true) = true and coalesce(swap_status, 'available') = 'available'),
      'successful_swaps', (select count(*) from swaps where status = 'completed'),
      'open_reports', (select count(*) from reports where coalesce(status, 'open') = 'open'),
      'open_disputes', (select count(*) from swap_disputes where coalesce(status, 'open') = 'open'),
      'trust_score', coalesce((select round(avg(rating)::numeric, 1) from reviews), 0)
    ),
    'users', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', p.id,
          'name', coalesce(nullif(p.full_name, ''), nullif(p.username, ''), split_part(coalesce(p.email, ''), '@', 1), 'SwapWear User'),
          'email', p.email,
          'avatar_url', p.avatar_url,
          'status', coalesce(p.status, 'active'),
          'swaps', coalesce(swap_counts.total, 0),
          'rating', coalesce(p.rating, 0),
          'reports', coalesce(report_counts.total, 0)
        )
        order by coalesce(report_counts.total, 0) desc, p.created_at desc
      )
      from profiles p
      left join lateral (
        select count(*) as total
        from swaps s
        where s.requester_id = p.id or s.owner_id = p.id
      ) swap_counts on true
      left join lateral (
        select count(*) as total
        from reports r
        where r.reported_user_id = p.id and coalesce(r.status, 'open') = 'open'
      ) report_counts on true
      limit 20
    ), '[]'::jsonb),
    'reports', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', r.id,
          'reporter_id', r.reporter_id,
          'reported_user_id', r.reported_user_id,
          'listing_id', r.listing_id,
          'swap_id', r.swap_id,
          'report_type', r.report_type,
          'reason', r.reason,
          'status', r.status,
          'created_at', r.created_at,
          'listing_title', l.title,
          'listing_image', l.image,
          'reported_user_name', coalesce(nullif(p.full_name, ''), p.email, 'Reported user')
        )
        order by r.created_at desc
      )
      from reports r
      left join listings l on l.id = r.listing_id
      left join profiles p on p.id = r.reported_user_id
      where coalesce(r.status, 'open') = 'open'
      limit 25
    ), '[]'::jsonb)
  ) into payload;

  return payload;
end;
$$;

create or replace function archive_completed_swap_items(p_swap_id uuid, p_actor_id uuid default auth.uid())
returns swaps
language plpgsql
security definer
as $$
declare
  target_swap swaps;
begin
  select * into target_swap
  from swaps
  where id = p_swap_id
  for update;

  if not found then
    raise exception 'Swap request not found';
  end if;

  if p_actor_id is not null
    and p_actor_id not in (target_swap.requester_id, target_swap.owner_id) then
    raise exception 'Only swap participants can archive this swap';
  end if;

  if target_swap.status <> 'completed' then
    raise exception 'Only completed swap items can be archived';
  end if;

  update listings
  set swap_status = 'archived',
      is_public = false,
      archived_at = now()
  where id in (target_swap.requester_item_id, target_swap.owner_item_id)
    and active_swap_id = target_swap.id;

  update swaps
  set archived_at = now(),
      items_deleted_at = now(),
      updated_at = now(),
      last_action_at = now()
  where id = target_swap.id
  returning * into target_swap;

  insert into swap_events (swap_id, actor_id, event_type)
  values (target_swap.id, p_actor_id, 'items_archived');

  return target_swap;
end;
$$;

create or replace function auto_archive_completed_listings()
returns integer
language plpgsql
security definer
as $$
declare
  affected_count integer;
begin
  update listings
  set swap_status = 'archived',
      is_public = false,
      archived_at = coalesce(archived_at, now())
  where swap_status = 'swapped'
    and archive_after is not null
    and archive_after <= now();

  get diagnostics affected_count = row_count;

  update swaps
  set archived_at = coalesce(archived_at, now()),
      items_deleted_at = coalesce(items_deleted_at, now()),
      updated_at = now()
  where status = 'completed'
    and archive_after is not null
    and archive_after <= now()
    and archived_at is null;

  return affected_count;
end;
$$;

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
