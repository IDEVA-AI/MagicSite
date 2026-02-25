-- Migration: Enable RLS on alunos table
-- Date: 2026-02-25

alter table public.alunos enable row level security;

-- Read: only service_role (admin/backend)
create policy alunos_select_service on public.alunos
  for select using (auth.role() = 'service_role');

-- Write: only service_role
create policy alunos_write_service on public.alunos
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
