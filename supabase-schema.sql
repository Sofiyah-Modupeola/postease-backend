-- Run this in Supabase SQL Editor

create table users (
  id text primary key,
  fb_user_token text,
  fb_page_id text,
  fb_page_token text,
  fb_page_name text,
  ig_user_id text,
  connected_at timestamptz default now()
);

create table queue (
  id uuid primary key default gen_random_uuid(),
  user_id text references users(id) on delete cascade,
  caption text,
  imageUrl text,
  platforms text[] default array['Facebook Page'],
  scheduledAt timestamptz,
  price text,
  productName text,
  status text default 'queued',
  postedAt timestamptz,
  error text,
  createdAt timestamptz default now()
);

-- Enable RLS for security
alter table users enable row level security;
alter table queue enable row level security;

-- For demo, allow all (replace with proper auth later)
create policy "Allow all" on users for all using (true) with check (true);
create policy "Allow all" on queue for all using (true) with check (true);
