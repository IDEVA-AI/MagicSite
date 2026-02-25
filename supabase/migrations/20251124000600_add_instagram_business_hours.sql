-- Add missing columns used by the application code
alter table public.projects add column if not exists instagram text;
alter table public.projects add column if not exists business_hours text;
