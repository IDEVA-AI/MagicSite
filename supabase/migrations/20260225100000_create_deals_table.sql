create table if not exists public.deals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  client_name text,
  project_name text not null,
  segment text,
  phone text,
  value_cents integer not null default 0,
  status text not null default 'lead',
  notes text,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS: usuário só vê seus próprios deals
alter table public.deals enable row level security;

-- Policy: service_role bypass
create policy "Service role full access" on public.deals for all using (true) with check (true);

-- Policy: user CRUD own deals
create policy "Users manage own deals" on public.deals for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Indexes
create index if not exists idx_deals_user_id on public.deals(user_id);
create index if not exists idx_deals_status on public.deals(status);
create index if not exists idx_deals_project_id on public.deals(project_id);
