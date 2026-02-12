-- Extensions
create extension if not exists "pgcrypto";

-- Enums
do $$ begin
  create type site_type as enum ('corporativo', 'servicos', 'curso_online');
exception when duplicate_object then null; end $$;

do $$ begin
  create type project_status as enum ('draft', 'briefing_complete', 'content_complete', 'ready');
exception when duplicate_object then null; end $$;

do $$ begin
  create type credits_transaction_type as enum ('purchase', 'bonus', 'debit_project', 'debit_briefing', 'debit_content', 'refund');
exception when duplicate_object then null; end $$;

do $$ begin
  create type generation_source as enum ('ai_openai', 'fallback_rules', 'fallback_template', 'manual');
exception when duplicate_object then null; end $$;

do $$ begin
  create type ai_generation_type as enum (
    'briefing',
    'content_home',
    'content_sobre',
    'content_servicos',
    'content_diferenciais',
    'content_depoimentos',
    'content_contato',
    'content_problema',
    'content_solucao',
    'content_beneficios',
    'content_conteudo',
    'content_instrutor',
    'content_oferta',
    'prompt_pdf'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type ai_generation_status as enum ('pending', 'success', 'failed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type audit_event_type as enum (
    'user_login',
    'user_register',
    'user_logout',
    'project_create',
    'project_update',
    'project_delete',
    'briefing_generate',
    'content_generate',
    'prompt_download',
    'credits_purchase',
    'credits_debit',
    'credits_refund'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type consent_type as enum ('terms_of_service', 'privacy_policy', 'data_processing', 'marketing');
exception when duplicate_object then null; end $$;

-- Core tables
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  phone text,
  partnership_source text,
  partnership_plan text,
  email_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.credits_balance (
  user_id uuid primary key references auth.users (id) on delete cascade,
  total_credits integer not null default 0,
  used_credits integer not null default 0,
  remaining_credits integer generated always as (total_credits - used_credits) stored,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.segments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  is_predefined boolean not null default true,
  usage_count integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  company_name text not null,
  segment_id uuid references public.segments (id),
  custom_segment_name text,
  segment text,
  location text not null,
  email text not null,
  whatsapp text not null,
  site_type site_type not null,
  business_summary text,
  business_proposal text,
  business_description text,
  site_objectives text,
  status project_status not null default 'draft',
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.credits_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  transaction_type credits_transaction_type not null,
  amount integer not null,
  balance_after integer not null,
  project_id uuid references public.projects (id) on delete cascade,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.briefings (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  what_i_offer text,
  business_sector text,
  competitive_differential text,
  target_audience text,
  audience_challenges text,
  audience_aspirations text,
  brand_voice text,
  strategic_objective text,
  core_philosophy text,
  delivery_model text,
  social_proof text,
  non_negotiable_values text,
  market_context text,
  final_promise text,
  common_objections text,
  desired_emotion text,
  third_service text,
  average_ticket text,
  strategic_variables_json jsonb,
  generation_source generation_source,
  generation_metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint briefings_project_unique unique (project_id)
);

create table if not exists public.content_sections (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  section_name text not null,
  content text not null,
  generation_source generation_source,
  generation_metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint content_sections_project_section_unique unique (project_id, section_name)
);

create table if not exists public.ai_generation_logs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects (id) on delete cascade,
  generation_type ai_generation_type not null,
  status ai_generation_status not null default 'pending',
  ai_provider text not null,
  model text,
  prompt_tokens integer,
  completion_tokens integer,
  total_tokens integer,
  temperature numeric,
  duration_ms integer,
  error_message text,
  created_at timestamptz not null default now()
);

create table if not exists public.prompts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  template_version text not null,
  prompt_content text not null,
  pdf_url text,
  download_count integer not null default 0,
  created_at timestamptz not null default now(),
  constraint prompts_project_unique unique (project_id)
);

create table if not exists public.prompt_downloads (
  id uuid primary key default gen_random_uuid(),
  prompt_id uuid not null references public.prompts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  downloaded_at timestamptz not null default now(),
  ip_address text,
  user_agent text
);

create table if not exists public.partner_institutions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  supabase_url text,
  supabase_table text,
  is_active boolean not null default true,
  discount_percentage integer not null default 0 check (discount_percentage >= 0 and discount_percentage <= 100),
  created_at timestamptz not null default now()
);

create table if not exists public.partnership_validations (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid references public.partner_institutions (id) on delete cascade,
  input_email_or_cpf text not null,
  validated_name text,
  validated_email text,
  validated_cpf text,
  student_enrollment text,
  is_used boolean not null default false,
  used_by_user_id uuid references auth.users (id) on delete set null,
  validated_at timestamptz,
  used_at timestamptz
);

create table if not exists public.partnership_plans (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid references public.partner_institutions (id) on delete cascade,
  plan_name text not null,
  credits_amount integer not null,
  original_price_cents integer not null,
  partnership_price_cents integer not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint partnership_plans_unique_per_institution unique (institution_id, plan_name)
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  event_type audit_event_type not null,
  event_data jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_metrics (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  model text not null,
  total_requests integer not null default 0,
  successful_requests integer not null default 0,
  failed_requests integer not null default 0,
  total_tokens integer not null default 0,
  avg_latency_ms integer not null default 0,
  total_cost_usd numeric(10,4) not null default 0,
  constraint ai_metrics_unique_per_day_model unique (date, model)
);

create table if not exists public.user_consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  consent_type consent_type not null,
  consent_given boolean not null,
  consent_version text not null default 'v1.0',
  ip_address text,
  consented_at timestamptz not null default now(),
  constraint user_consents_unique_per_version unique (user_id, consent_type, consent_version)
);

create table if not exists public.user_privacy_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  allow_ai_training boolean not null default false,
  allow_marketing_emails boolean not null default false,
  data_retention_days integer not null default 365,
  updated_at timestamptz not null default now(),
  constraint user_privacy_settings_user_unique unique (user_id)
);

-- Indexes
create index if not exists credits_ledger_user_id_idx on public.credits_ledger (user_id);
create index if not exists credits_ledger_project_id_idx on public.credits_ledger (project_id);
create index if not exists projects_user_id_idx on public.projects (user_id);
create index if not exists projects_segment_id_idx on public.projects (segment_id);
create index if not exists projects_status_idx on public.projects (status);
create index if not exists briefings_project_id_idx on public.briefings (project_id);
create index if not exists content_sections_project_id_idx on public.content_sections (project_id);
create index if not exists ai_generation_logs_project_id_idx on public.ai_generation_logs (project_id);
create index if not exists prompts_project_id_idx on public.prompts (project_id);
create index if not exists prompt_downloads_prompt_id_idx on public.prompt_downloads (prompt_id);
create index if not exists prompt_downloads_user_id_idx on public.prompt_downloads (user_id);
create index if not exists partnership_validations_institution_id_idx on public.partnership_validations (institution_id);
create index if not exists partnership_validations_used_by_user_id_idx on public.partnership_validations (used_by_user_id);
create index if not exists partnership_plans_institution_id_idx on public.partnership_plans (institution_id);
create index if not exists audit_logs_user_id_idx on public.audit_logs (user_id);
create index if not exists user_consents_user_id_idx on public.user_consents (user_id);
create index if not exists user_privacy_settings_user_id_idx on public.user_privacy_settings (user_id);
create index if not exists credits_balance_user_id_idx on public.credits_balance (user_id);

-- RLS
alter table public.profiles enable row level security;
alter table public.credits_balance enable row level security;
alter table public.credits_ledger enable row level security;
alter table public.segments enable row level security;
alter table public.projects enable row level security;
alter table public.briefings enable row level security;
alter table public.content_sections enable row level security;
alter table public.ai_generation_logs enable row level security;
alter table public.prompts enable row level security;
alter table public.prompt_downloads enable row level security;
alter table public.partner_institutions enable row level security;
alter table public.partnership_validations enable row level security;
alter table public.partnership_plans enable row level security;
alter table public.audit_logs enable row level security;
alter table public.ai_metrics enable row level security;
alter table public.user_consents enable row level security;
alter table public.user_privacy_settings enable row level security;

-- Policies: user-owned data
create policy profiles_select_self on public.profiles
  for select using (auth.uid() = id);
create policy profiles_insert_self on public.profiles
  for insert with check (auth.uid() = id);
create policy profiles_update_self on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);
create policy profiles_delete_self on public.profiles
  for delete using (auth.uid() = id);

create policy credits_balance_select_self on public.credits_balance
  for select using (auth.uid() = user_id or auth.role() = 'service_role');
create policy credits_balance_insert_service on public.credits_balance
  for insert with check (auth.role() = 'service_role');
create policy credits_balance_update_service on public.credits_balance
  for update using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create policy credits_ledger_select_self on public.credits_ledger
  for select using (auth.uid() = user_id or auth.role() = 'service_role');
create policy credits_ledger_insert_service on public.credits_ledger
  for insert with check (auth.role() = 'service_role');
create policy credits_ledger_update_service on public.credits_ledger
  for update using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy credits_ledger_delete_service on public.credits_ledger
  for delete using (auth.role() = 'service_role');

create policy projects_user_access on public.projects
  for all using (auth.uid() = user_id or auth.role() = 'service_role')
  with check (auth.uid() = user_id or auth.role() = 'service_role');

create policy segments_public_select on public.segments
  for select using (true);
create policy segments_service_write on public.segments
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create policy briefings_user_access on public.briefings
  for select using (
    auth.role() = 'service_role' or exists (
      select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid()
    )
  );
create policy briefings_user_write on public.briefings
  for insert with check (
    auth.role() = 'service_role' or exists (
      select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid()
    )
  );
create policy briefings_user_update on public.briefings
  for update using (
    auth.role() = 'service_role' or exists (
      select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid()
    )
  ) with check (
    auth.role() = 'service_role' or exists (
      select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid()
    )
  );

create policy content_sections_user_access on public.content_sections
  for select using (
    auth.role() = 'service_role' or exists (
      select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid()
    )
  );
create policy content_sections_user_write on public.content_sections
  for insert with check (
    auth.role() = 'service_role' or exists (
      select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid()
    )
  );
create policy content_sections_user_update on public.content_sections
  for update using (
    auth.role() = 'service_role' or exists (
      select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid()
    )
  ) with check (
    auth.role() = 'service_role' or exists (
      select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid()
    )
  );

create policy ai_generation_logs_user_select on public.ai_generation_logs
  for select using (
    auth.role() = 'service_role' or exists (
      select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid()
    )
  );
create policy ai_generation_logs_insert_service on public.ai_generation_logs
  for insert with check (auth.role() = 'service_role');
create policy ai_generation_logs_update_service on public.ai_generation_logs
  for update using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy ai_generation_logs_delete_service on public.ai_generation_logs
  for delete using (auth.role() = 'service_role');

create policy prompts_user_access on public.prompts
  for select using (
    auth.role() = 'service_role' or exists (
      select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid()
    )
  );
create policy prompts_user_write on public.prompts
  for insert with check (
    auth.role() = 'service_role' or exists (
      select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid()
    )
  );
create policy prompts_user_update on public.prompts
  for update using (
    auth.role() = 'service_role' or exists (
      select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid()
    )
  ) with check (
    auth.role() = 'service_role' or exists (
      select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid()
    )
  );

create policy prompt_downloads_select on public.prompt_downloads
  for select using (auth.role() = 'service_role' or auth.uid() = user_id);
create policy prompt_downloads_insert on public.prompt_downloads
  for insert with check (auth.role() = 'service_role' or auth.uid() = user_id);
create policy prompt_downloads_delete_service on public.prompt_downloads
  for delete using (auth.role() = 'service_role');

create policy partner_institutions_select_active on public.partner_institutions
  for select using (is_active = true or auth.role() = 'service_role');
create policy partner_institutions_write_service on public.partner_institutions
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create policy partnership_validations_service_only on public.partnership_validations
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create policy partnership_plans_select_active on public.partnership_plans
  for select using (is_active = true or auth.role() = 'service_role');
create policy partnership_plans_write_service on public.partnership_plans
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create policy audit_logs_service_only on public.audit_logs
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create policy ai_metrics_service_only on public.ai_metrics
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create policy user_consents_user_access on public.user_consents
  for select using (auth.uid() = user_id or auth.role() = 'service_role');
create policy user_consents_user_write on public.user_consents
  for insert with check (auth.uid() = user_id or auth.role() = 'service_role');
create policy user_consents_user_update on public.user_consents
  for update using (auth.uid() = user_id or auth.role() = 'service_role')
  with check (auth.uid() = user_id or auth.role() = 'service_role');

create policy user_privacy_settings_user_access on public.user_privacy_settings
  for select using (auth.uid() = user_id or auth.role() = 'service_role');
create policy user_privacy_settings_user_write on public.user_privacy_settings
  for insert with check (auth.uid() = user_id or auth.role() = 'service_role');
create policy user_privacy_settings_user_update on public.user_privacy_settings
  for update using (auth.uid() = user_id or auth.role() = 'service_role')
  with check (auth.uid() = user_id or auth.role() = 'service_role');
