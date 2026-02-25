-- Platform-wide settings (single-row table)
create table if not exists public.platform_settings (
  id integer primary key default 1 check (id = 1),
  free_mode boolean not null default false,
  updated_at timestamptz not null default now()
);

-- Seed the single row
insert into public.platform_settings (id, free_mode) values (1, false)
on conflict (id) do nothing;

-- RLS: service_role only
alter table public.platform_settings enable row level security;

create policy platform_settings_select on public.platform_settings
  for select using (true);

create policy platform_settings_update_service on public.platform_settings
  for update using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
