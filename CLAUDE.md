# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Project Overview

**MagicSite** (criadordesites.app) — SaaS de criação de sites com IA. Wizard de 5 etapas gera briefing estratégico, conteúdo e prompt final. Inclui sistema **Deploy** integrado que provisiona projetos GitHub em hospedagem cPanel compartilhada via FTP automatizado.

**Stack:** Next.js 16 + React 19 + TypeScript + Tailwind CSS v4 + Supabase (auth + DB) + shadcn/ui

## Development Commands

```bash
npm run dev          # Dev server na porta 9005
npm run build        # Build de produção
npm run lint         # ESLint
```

## Production

- **Domain:** criadordesites.app (www.criadordesites.app)
- **Hosting:** Vercel (org: idevaauth-9089s-projects, project: magic-site)
- **Database:** Supabase project xnbfkvogodyamqfshbre
- **Deploy:** Push to main → Vercel auto-deploy
- **DNS:** Cloudflare (redireciona criadordesites.app → www.criadordesites.app)

## Architecture

### App Router (`app/`)

**Pages autenticadas** (`app/app/`):
- `/app` — Dashboard (stats, projetos recentes)
- `/app/projects` — CRUD de projetos de site
- `/app/deploy` — Sistema de deploy (GitHub + cPanel)
- `/app/deploy/new` — Wizard 3 passos: GitHub → Servidor → Deploy
- `/app/deploy/[id]` — Detalhes do projeto + botão "Fazer Deploy"
- `/app/deals` — Pipeline de vendas (Kanban)
- `/app/settings` — Configurações do usuário
- `/app/admin` — Painel admin

**API Routes** (`app/api/`):
- `agents/` — Geração IA (briefing, value-prop, strategic-declaration)
- `deploy/github/` — OAuth flow (auth → callback → status → repos → disconnect)
- `deploy/cpanel/` — Conexão cPanel (CRUD credentials, list domains)
- `deploy/projects/[id]/` — detect, provision (SSE), deploys (GitHub Actions API)
- `credits/` — Sistema de créditos
- `deals/` — Pipeline CRUD
- `admin/` — Promote, stats, free-mode
- `partnership/` — Validação de parceiros/alunos

### Sistema Deploy (`lib/deploy/`)

Fluxo completo de deploy para cPanel compartilhado:

1. **GitHub OAuth** (`github.ts`) — Conecta conta, lista repos, cria secrets, commita workflow
2. **cPanel API** (`cpanel.ts`) — Token auth (`cpanel user:TOKEN`), cria conta FTP, lista domínios
3. **Detecção de Stack** (`detection.ts`) — Analisa package.json do repo, detecta framework
4. **Provisionamento** (`provisioning.ts`) — Cria FTP, seta secrets, commita workflow YAML
5. **Workflow** (`workflow.ts`) — Gera GitHub Actions YAML (SamKirkland/FTP-Deploy-Action@v4.3.5)
6. **Encriptação** (`encryption.ts`) — AES-256-CBC para tokens armazenados

**Detalhes críticos do cPanel FTP:**
- `Ftp::add_ftp` espera `homedir` **relativo** ao home do cPanel user (ex: `aula14`, não `/home2/user/aula14`)
- Username FTP real vem de `Ftp::list_ftp` (formato varia por host, ex: `user@longdomain.meusitehostgator.com.br`)
- Sempre chamar `changeFtpPassword` ao reprovisionar (senha gerada != senha anterior)
- Workflow usa `protocol: ftps` + `security: loose` para compatibilidade com shared hosting
- `server-dir: ./` (FTP já conecta no homedir da conta)

**Provisionamento SSE:** A rota `/provision` retorna Server-Sent Events com progresso step-by-step:
```
data: {"step":"ftp","status":"running","detail":"Verificando conta FTP..."}
data: {"step":"secrets","status":"done","detail":"4 secrets configurados"}
data: {"done":true}
```

### Wizard de Criação (`components/create/`)

5 etapas: Info do Negócio → Análise IA → Briefing Review → Layout → Prompt Final

- `wizard.tsx` — Orquestrador principal
- `step-one.tsx` — Dados do negócio
- `step-two-analysis.tsx` — Análise IA (value-prop + strategic-declaration)
- `briefing-review.tsx` — 23+ campos editáveis (maior componente: 1029 LOC)
- `step-three.tsx` — Seleção de layout (25 wireframes)
- `step-four.tsx` — Prompt final + salvar + PDF

### Components (`components/`)

- `ui/` — shadcn/ui (50+ componentes Radix)
- `create/` — Wizard de criação de site
- `deploy/` — cpanel-form, repo-selector, domain-selector, provision-progress
- `dashboard/` — Widgets do dashboard
- `app/` — Sidebar, header

### Hooks (`hooks/`)

- `use-credits.ts`, `use-projects.ts`, `use-project.ts`, `use-profile.ts`
- `use-deals.ts`, `use-deploy-projects.ts`, `use-deploy-project.ts`, `use-admin.ts`

## Database (Supabase)

**Tabelas principais:**
- `profiles` — Perfis de usuário
- `projects` — Projetos de site (wizard)
- `briefings` — Briefings estratégicos
- `content_sections` — Conteúdo gerado por IA
- `credits_balance` / `credits_ledger` — Sistema de créditos
- `segments` — Segmentos de negócio
- `prompts` / `prompt_downloads` — Prompts gerados

**Tabelas deploy:**
- `deploy_github_connections` — Tokens OAuth (encrypted)
- `deploy_cpanel_credentials` — Credenciais cPanel (encrypted)
- `deploy_projects` — Projetos de deploy (repo + domain + config)
- `deploy_ftp_accounts` — Contas FTP criadas (project_id unique)
- `deploy_runs` — Histórico de runs (não usado ativamente — API busca do GitHub)

**Migrações:** `supabase/migrations/`

**RLS:** Users acessam apenas seus próprios dados. Service role tem acesso total.

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL          # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY     # Public anon key
SUPABASE_SERVICE_ROLE_KEY         # Backend service role
NEXT_PUBLIC_APP_URL               # https://www.criadordesites.app
OPENROUTER_API_KEY                # OpenRouter (proxy OpenAI)
DEPLOY_GITHUB_CLIENT_ID           # GitHub OAuth App
DEPLOY_GITHUB_CLIENT_SECRET       # GitHub OAuth Secret
DEPLOY_ENCRYPTION_KEY             # AES-256 hex key (64 chars)
```

## Code Conventions

- TypeScript strict mode
- Path alias: `@/*` → `./`
- shadcn/ui pattern: Radix + CVA + tailwind-merge em `components/ui/`
- Supabase auth via SSR cookies (`@supabase/ssr`)
- API routes usam `createClient()` de `@/utils/supabase/server`
- Encriptação de tokens com AES-256-CBC (`lib/deploy/encryption.ts`)
- GitHub secrets encriptados com tweetsodium (libsodium sealed box)

## LLM / AI

- **Provider:** OpenRouter (`OPENROUTER_API_KEY`)
- **Model:** gpt-5.1-mini (fallback: gpt-4o-mini)
- **Client:** `lib/openai.ts` — retry com backoff, parser JSON resiliente
- **Agents:** briefing, value-proposition, strategic-declaration, description-help

## Known Issues

- Credit debit não implementado (créditos não diminuem)
- Settings save incompleto (endpoints mock)
- Deals resetam ao refresh (sem persistência Supabase)
- User name hardcoded "João Silva" em alguns lugares
- `ignoreBuildErrors: true` no next.config — verificar TS errors
