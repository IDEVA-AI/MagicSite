-- Add value for description helper logs
do $$ begin
  alter type ai_generation_type add value if not exists 'description_help';
exception when duplicate_object then null end $$;

-- Agent prompts table
create table if not exists public.agent_prompts (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  system_prompt text not null,
  user_template text,
  model text default 'gpt-4o-mini',
  temperature numeric default 0.7,
  max_tokens integer default 400,
  created_at timestamptz not null default now()
);

alter table public.agent_prompts enable row level security;

create policy if not exists agent_prompts_select_any on public.agent_prompts
  for select using (true);

create policy if not exists agent_prompts_service_write on public.agent_prompts
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- Seed initial prompt for description helper
insert into public.agent_prompts (name, system_prompt, model, temperature, max_tokens)
values (
  'description_help_v1',
  'Você é um copywriter brasileiro especializado em sites de serviços. Gere uma descrição do negócio entre 120 e 160 palavras que explique o que a empresa faz e para quem, destaque benefícios e diferenciais sem inventar números ou prêmios, use tom profissional, claro e direto. Retorne apenas JSON: {"description": "<texto>"}',
  'gpt-5.1-mini',
  0.65,
  500
)
on conflict (name) do nothing;
