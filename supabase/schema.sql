create extension if not exists "pgcrypto";

do $$
begin
  if not exists (select 1 from pg_type where typname = 'topic_visibility') then
    create type topic_visibility as enum (
      'private',
      'topic_only',
      'topic_and_notes',
      'topic_and_resources'
    );
  end if;
  if not exists (select 1 from pg_type where typname = 'topic_status') then
    create type topic_status as enum ('active', 'completed');
  end if;
end $$;

create table if not exists folders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists topics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  folder_id uuid references folders(id) on delete set null,
  title text not null,
  note text,
  status topic_status not null default 'active',
  visibility topic_visibility not null default 'private',
  created_at timestamptz not null default now()
);

create table if not exists resources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  topic_id uuid not null references topics(id) on delete cascade,
  title text not null,
  url text,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists topic_tags (
  topic_id uuid not null references topics(id) on delete cascade,
  tag_id uuid not null references tags(id) on delete cascade,
  primary key (topic_id, tag_id)
);

create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references topics(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Anonymous',
  website_url text,
  twitter_handle text,
  created_at timestamptz not null default now()
);

create table if not exists queue_items (
  user_id uuid not null references auth.users(id) on delete cascade,
  topic_id uuid not null references topics(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, topic_id)
);

create index if not exists topics_user_id_idx on topics(user_id);
create index if not exists topics_visibility_idx on topics(visibility);
create index if not exists resources_topic_id_idx on resources(topic_id);
create index if not exists resources_user_id_idx on resources(user_id);
create index if not exists tags_user_id_idx on tags(user_id);
create index if not exists topic_tags_tag_id_idx on topic_tags(tag_id);
create index if not exists comments_topic_id_idx on comments(topic_id);
create index if not exists queue_items_user_id_idx on queue_items(user_id);
create index if not exists queue_items_topic_id_idx on queue_items(topic_id);

alter table folders enable row level security;
alter table topics enable row level security;
alter table resources enable row level security;
alter table tags enable row level security;
alter table topic_tags enable row level security;
alter table comments enable row level security;
alter table profiles enable row level security;
alter table queue_items enable row level security;

create policy "profiles_select_authenticated" on profiles
  for select using (auth.uid() is not null);

create policy "profiles_owner_insert" on profiles
  for insert with check (user_id = auth.uid());

create policy "profiles_owner_update" on profiles
  for update using (user_id = auth.uid());

create policy "queue_items_owner_select" on queue_items
  for select using (user_id = auth.uid());

create policy "queue_items_owner_insert" on queue_items
  for insert with check (user_id = auth.uid());

create policy "queue_items_owner_delete" on queue_items
  for delete using (user_id = auth.uid());

create policy "folders_owner_select" on folders
  for select using (user_id = auth.uid());

create policy "folders_owner_insert" on folders
  for insert with check (user_id = auth.uid());

create policy "folders_owner_update" on folders
  for update using (user_id = auth.uid());

create policy "folders_owner_delete" on folders
  for delete using (user_id = auth.uid());

create policy "tags_owner_select" on tags
  for select using (user_id = auth.uid());

create policy "tags_shared_select" on tags
  for select using (
    exists (
      select 1
      from topic_tags
      join topics on topics.id = topic_tags.topic_id
      where topic_tags.tag_id = tags.id
        and topics.visibility <> 'private'
    )
  );

create policy "tags_owner_insert" on tags
  for insert with check (user_id = auth.uid());

create policy "tags_owner_update" on tags
  for update using (user_id = auth.uid());

create policy "tags_owner_delete" on tags
  for delete using (user_id = auth.uid());

create policy "topics_owner_select" on topics
  for select using (user_id = auth.uid());

create policy "topics_shared_select" on topics
  for select using (visibility <> 'private');

create policy "topics_owner_insert" on topics
  for insert with check (user_id = auth.uid());

create policy "topics_owner_update" on topics
  for update using (user_id = auth.uid());

create policy "topics_owner_delete" on topics
  for delete using (user_id = auth.uid());

create policy "resources_owner_select" on resources
  for select using (user_id = auth.uid());

create policy "resources_shared_select" on resources
  for select using (
    exists (
      select 1
      from topics
      where topics.id = resources.topic_id
        and topics.visibility = 'topic_and_resources'
    )
  );

create policy "resources_owner_insert" on resources
  for insert with check (user_id = auth.uid());

create policy "resources_owner_update" on resources
  for update using (user_id = auth.uid());

create policy "resources_owner_delete" on resources
  for delete using (user_id = auth.uid());

create policy "topic_tags_owner_select" on topic_tags
  for select using (
    exists (
      select 1
      from topics
      where topics.id = topic_tags.topic_id
        and topics.user_id = auth.uid()
    )
  );

create policy "topic_tags_shared_select" on topic_tags
  for select using (
    exists (
      select 1
      from topics
      where topics.id = topic_tags.topic_id
        and topics.visibility <> 'private'
    )
  );

create policy "topic_tags_owner_insert" on topic_tags
  for insert with check (
    exists (
      select 1
      from topics
      where topics.id = topic_tags.topic_id
        and topics.user_id = auth.uid()
    )
  );

create policy "topic_tags_owner_delete" on topic_tags
  for delete using (
    exists (
      select 1
      from topics
      where topics.id = topic_tags.topic_id
        and topics.user_id = auth.uid()
    )
  );

create policy "comments_shared_select" on comments
  for select using (
    exists (
      select 1
      from topics
      where topics.id = comments.topic_id
        and topics.visibility <> 'private'
    )
  );

create policy "comments_shared_insert" on comments
  for insert with check (
    user_id = auth.uid()
    and exists (
      select 1
      from topics
      where topics.id = comments.topic_id
        and topics.visibility <> 'private'
    )
  );

create policy "comments_owner_update" on comments
  for update using (user_id = auth.uid());

create policy "comments_owner_delete" on comments
  for delete using (user_id = auth.uid());

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id, display_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1),
      'Anonymous'
    )
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Add profile URL fields on existing databases (idempotent)
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'website_url'
  ) then
    alter table public.profiles add column website_url text;
  end if;
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'twitter_handle'
  ) then
    alter table public.profiles add column twitter_handle text;
  end if;
end $$;
