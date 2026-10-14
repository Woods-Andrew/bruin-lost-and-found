create extension if not exists vector;
create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid primary key,
  email text not null unique,
  name text not null,
  role text not null default 'student' check (role in ('student', 'staff')),
  email_verified boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists items (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('lost', 'found')),
  status text not null check (status in ('draft', 'published', 'claimed', 'resolved', 'removed')),
  title text not null,
  description text not null,
  attributes jsonb not null default '{}'::jsonb,
  location text not null,
  photo_url text not null,
  reporter_id uuid references profiles (id),
  embedding vector(1024),
  ai_source text not null check (ai_source in ('mock', 'qwen')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists claims (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references items (id) on delete cascade,
  claimant_id uuid not null references profiles (id),
  proof text not null,
  identifying_details text not null,
  pickup_preference text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'picked_up')),
  staff_note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  item_id uuid references items (id) on delete set null,
  title text not null,
  body text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists saved_queries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  query text not null,
  embedding vector(1024),
  created_at timestamptz not null default now()
);

create table if not exists ai_cache (
  key text primary key,
  kind text not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists items_embedding_idx on items using ivfflat (embedding vector_cosine_ops) with (lists = 20);

insert into storage.buckets (id, name, public)
values ('item-photos', 'item-photos', true)
on conflict (id) do nothing;
