-- Run this in the Supabase SQL editor if your project was created before
-- the friendships table was added to schema.sql.

create table if not exists public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users(id) on delete cascade,
  addressee_id uuid not null references auth.users(id) on delete cascade,
  status text not null check (status in ('pending', 'accepted')) default 'pending',
  created_at timestamptz not null default now(),
  constraint friendships_distinct_users check (requester_id <> addressee_id),
  constraint friendships_unique_pair unique (requester_id, addressee_id)
);

create index if not exists friendships_requester_idx on public.friendships(requester_id);
create index if not exists friendships_addressee_idx on public.friendships(addressee_id);
create index if not exists friendships_status_idx on public.friendships(status);

alter table public.friendships enable row level security;

drop policy if exists "friendships_select_participants" on public.friendships;
drop policy if exists "friendships_insert_requester" on public.friendships;
drop policy if exists "friendships_update_participant" on public.friendships;
drop policy if exists "friendships_delete_participant" on public.friendships;

create policy "friendships_select_participants" on public.friendships
  for select using (requester_id = auth.uid() or addressee_id = auth.uid());

create policy "friendships_insert_requester" on public.friendships
  for insert with check (requester_id = auth.uid());

create policy "friendships_update_participant" on public.friendships
  for update using (requester_id = auth.uid() or addressee_id = auth.uid());

create policy "friendships_delete_participant" on public.friendships
  for delete using (requester_id = auth.uid() or addressee_id = auth.uid());
