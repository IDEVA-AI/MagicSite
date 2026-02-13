# MagicSite — Auditoria Completa de UI/UX/Arquitetura

> Auditoria realizada em 13/02/2026 sobre o estado atual do codebase.
> Cobre: jornada do usuario, UI, UX, acessibilidade, seguranca, performance, arquitetura.

---

## 1. Resumo Executivo

### Notas por Categoria

| Categoria | Nota | Observacao |
|-----------|------|-----------|
| UI / Design Visual | 8/10 | Sistema de cores consistente, componentes shadcn bem utilizados |
| UX / Fluxo do Wizard | 7/10 | Progressao clara, mas Step 3 sobrecarrega o usuario |
| Responsividade | 8/10 | Mobile-first, bons breakpoints, touch targets adequados |
| Acessibilidade | 4/10 | Faltam ARIA labels, focus management, live regions |
| Seguranca | 4/10 | Prompt injection, sem rate limiting, credenciais hardcoded |
| Performance | 6/10 | Componentes grandes, sem code splitting entre steps |
| Completude | 5/10 | Muitas funcionalidades sao mock (settings, logout, deals) |
| Backend/API | 6/10 | Pattern consistente, mas creditos nao funcionam |

### Top 10 Problemas Criticos

| # | Problema | Severidade | Arquivo |
|---|---------|-----------|---------|
| 1 | Sistema de creditos nao debita | CRITICO | `app/api/credits/route.ts` |
| 2 | Sem rate limiting nas API routes | ALTO | `app/api/agents/*/route.ts` |
| 3 | Prompt injection possivel | ALTO | `lib/openai.ts` |
| 4 | Transacoes nao-atomicas no save | ALTO | `components/create/step-four.tsx` |
| 5 | `ignoreBuildErrors: true` | MEDIO | `next.config.ts` |
| 6 | Logout nao funciona | MEDIO | `components/app/sidebar.tsx`, `header.tsx` |
| 7 | Settings/Profile nao salvam | MEDIO | `app/app/settings/page.tsx` |
| 8 | Links quebrados no footer | BAIXO | `components/footer.tsx` |
| 9 | Dados hardcoded (nome, plano) | MEDIO | `sidebar.tsx`, `header.tsx`, `settings/plan` |
| 10 | Draft do wizard nao persiste briefing | MEDIO | `components/create/wizard.tsx` |

### Top 5 Quick Wins (alto impacto, baixo esforco)

1. **Adicionar handler de logout** — 5 min, afeta sidebar + header + dropdown
2. **Remover links mortos do footer** — 2 min, remove /about, /blog, /contact, /privacy, /terms
3. **Timeout nas chamadas OpenAI** — 10 min, AbortController com 30s timeout
4. **aria-label nos botoes de layout** — 10 min, melhora acessibilidade do wizard
5. **Indicar campos obrigatorios vs opcionais** — 15 min, reduz fricao no Step 3 (briefing)

---

## 2. Jornada do Usuario

### Fluxo Completo

```
Landing (/) → Signup (/signup) → Dashboard (/app) → Novo Projeto → Wizard (5 steps) → Projeto Salvo
     |              |                |                                      |
     |              |                |                                      └→ Copiar Prompt / Baixar PDF
     |              |                └→ Ver Projetos → Detalhe → Exportar
     |              └→ Login (/login)
     └→ Precos, Features (marketing)
```

### Pontos de Friccao por Etapa

**Landing → Signup:**
- Footer tem links mortos (/about, /blog, /privacy, /terms) — gera desconfianca
- Signup nao valida forca da senha
- Signup nao faz auth real com Supabase (TODO no codigo)
- Sem "Esqueci minha senha"
- Stats no hero sao hardcoded ("15+ Usuarios Ativos")

**Dashboard:**
- Dados de projetos vem de localStorage + mock hardcoded
- Logout nao funciona (botao sem handler)
- Nome do usuario hardcoded "Joao Silva"
- Notificacoes (sino) sao apenas visuais
- Creditos mostram 0 para novos usuarios

**Wizard Step 1 (Informacoes):**
- 8+ campos opcionais podem causar paralisia de decisao
- Validacao de telefone aceita 10 digitos (padrao BR e 11)
- Email tem apenas validacao HTML5
- Campo "Endereco" pede "Cidade - UF" mas nao valida formato

**Wizard Step 2 (Analise IA):**
- Barra de progresso e falsa (incrementa por timer, nao pelo API real)
- Fallback silencioso para templates — usuario nao sabe se conteudo veio de IA ou template
- Sem timeout nas chamadas — pode travar indefinidamente
- Sem token de cancelamento (memory leak se usuario volta)

**Wizard Step 3 (Briefing):**
- **MAIOR PONTO DE FRICCAO**: 23+ campos editaveis na mesma tela
- Sem indicacao de obrigatorio vs opcional
- Sem colapso/abas por secao
- Campos de contato sao read-only (por que nao editaveis?)
- PDF exportado inclui campos vazios como "Nao informado"
- Dados editados nao persistem no localStorage (perdidos no refresh)

**Wizard Step 4 (Wireframe/Layout):**
- Thumbnails sao pequenos (76x48px) — dificil distinguir em mobile
- Instrucoes sao longas (150-250 chars) — pode intimidar usuario nao-tecnico
- Sem reordenacao de secoes
- Sem adicionar/remover secoes

**Wizard Step 5 (Prompt Final):**
- Prompt muito longo e nao escaneavel
- Feedback de "Copiado!" dura so 2s
- Botao de salvar sem confirmacao
- Se o save falha, redirect acontece mesmo assim
- Sem retry de salvamento

### Momentos de Abandono Provaveis

1. **Step 1**: Usuario desiste ao ver muitos campos (principalmente se nao tem Instagram/horario)
2. **Step 2**: Loading demorado sem indicacao real de progresso
3. **Step 3**: Sobrecarga cognitiva com 23+ campos — momento mais critico
4. **Step 5**: Confusao sobre o que fazer com o prompt (falta guia pos-geracao)

---

## 3. Analise Detalhada por Step do Wizard

### Step 1 — Informacoes (`step-one.tsx`)

**O que funciona bem:**
- Phone mask automatico `(XX) XXXXX-XXXX`
- Contador de caracteres na descricao com feedback visual (amarelo → verde)
- Botao "AJUDA.AI" para gerar descricao
- Grid responsivo (2 colunas desktop, 1 mobile)
- Labels com icones ajudam compreensao

**Problemas de UX:**
- Campos opcionais sem indicacao clara (Instagram, horario)
- Segmento "Outro" requer input extra sem placeholder de exemplo
- "AJUDA.AI" so habilita com nome + segmento preenchidos — sem feedback do porque esta desabilitado
- Validacao do telefone poderia aceitar formatos internacionais

**Problemas de Acessibilidade:**
- Sem `aria-required` nos campos obrigatorios
- Sem `aria-describedby` para mensagens de erro
- Sem `fieldset`/`legend` agrupando campos relacionados
- Focus nao move para o erro apos submit invalido

**Problemas Tecnicos:**
- `defaultValue` em textareas em vez de `value` controlado
- `autoResize` chamado tanto no `ref` quanto no `onInput` (execucao dupla)

**Sugestoes:**
- Separar campos obrigatorios dos opcionais visualmente
- Adicionar placeholder no campo de segmento customizado
- Mostrar tooltip no botao AJUDA.AI quando desabilitado
- Adicionar `aria-required="true"` nos campos obrigatorios

---

### Step 2 — Analise IA (`step-two-analysis.tsx`)

**O que funciona bem:**
- Chamadas paralelas (`Promise.allSettled`) para value-proposition + strategic-declaration
- Fallback por segmento com 14 templates (consultoria, advocacia, fitness, etc.)
- Loading UI com progresso visual e fases nomeadas
- Campos editaveis apos geracao

**Problemas de UX:**
- **Progresso falso** — incrementa 4% a cada 600ms independente do API
- Usuario nao sabe se conteudo veio de IA ou de template (fallback silencioso)
- Sem indicacao de "parcialmente gerado" se 1 das 2 chamadas falhar
- Botao AJUDA.AI na descricao detalhada sem debounce (multiplos cliques = multiplos requests)
- Se usuario volta pro Step 1 e muda segmento, Step 2 nao regenera

**Problemas de Acessibilidade:**
- Barra de progresso sem `role="progressbar"` ou `aria-valuenow`
- Fases de loading sem `aria-live="polite"`
- Textareas sem `aria-label`

**Problemas Tecnicos:**
- Sem timeout nos fetch requests — pode travar infinitamente
- Sem AbortController — request continua se usuario navega pra tras
- Maps de segmento hardcoded (~250 linhas) — deveria estar no DB
- `defaultValue` anti-pattern nos textareas

**Sugestoes:**
- Adicionar timeout de 30s com fallback automatico
- Mostrar badge "Gerado por IA" vs "Template" no conteudo
- Implementar AbortController no useEffect cleanup
- Mover segment maps para tabela Supabase

---

### Step 3 — Briefing (`briefing-review.tsx`)

**O que funciona bem:**
- Campos organizados por secao com icones coloridos
- Color picker com input hex + picker visual
- Download de PDF do briefing
- Merge inteligente: `{ ...generateBriefing(), ...aiBriefing }`
- Toast de aviso quando AI falha e fallback e usado

**Problemas de UX:**
- **23+ campos na mesma tela** — cognitive overload massivo
- Sem indicacao de obrigatorio vs opcional
- Sem colapso de secoes (accordion)
- Informacoes de contato read-only (por que?)
- Campo FAQ tem formato confuso como exemplo
- Scroll infinito — usuario perde nocao de onde esta

**Problemas de Acessibilidade:**
- Sem `fieldset`/`legend` para agrupar secoes
- Color inputs sem `aria-label` adequado
- Sem skip links entre secoes
- Formulario enorme sem navegacao acessivel

**Problemas Tecnicos:**
- Componente com 926 linhas — deveria ser dividido
- `defaultValue` anti-pattern em todos textareas
- Sem persistencia no localStorage (edits perdidos no refresh)
- `autoResize` chamado duplamente (ref + onInput)
- PDF inclui campos vazios como "Nao informado"

**Sugestoes:**
- **Agrupar campos em accordion colapsavel** (5-6 secoes)
- Marcar campos obrigatorios com asterisco + aria-required
- Persistir briefing editado no localStorage draft
- Dividir componente em sub-componentes por secao
- Tornar contato editavel (usuario pode ter errado no Step 1)
- Omitir campos vazios do PDF

---

### Step 4 — Wireframe/Layout (`step-three.tsx`)

**O que funciona bem:**
- 25 wireframes visuais CSS-only, especificos por secao
- Thumbnails auto-explicativos com label curto
- Estado selecionado claro (borda primary + shadow)
- Hover feedback suave
- Backward compatibility com migracao de layouts antigos

**Problemas de UX:**
- Thumbnails podem ser pequenos em mobile (68px)
- Instrucoes muito verbosas (150-250 chars)
- Sem preview do layout em tamanho maior
- Sem reordenacao de secoes (drag-and-drop)
- Todas as 6 secoes sao obrigatorias (sem opcao de remover)

**Problemas de Acessibilidade:**
- Botoes de layout sem `aria-label` descritivo
- Sem `aria-pressed` para indicar selecao
- Sem `role="radiogroup"` para o conjunto de opcoes

**Problemas Tecnicos:**
- `renderThumbnail()` com 28 cases no switch — grande mas funcional
- CSS hardcoded com pixel values — fragil em resolucoes extremas
- Instrucoes usam `defaultValue` (pode desincronizar)

**Sugestoes:**
- Adicionar `aria-label` + `aria-pressed` nos botoes de layout
- Agrupar opcoes com `role="radiogroup"`
- Considerar modal de preview ao clicar (ver layout maior)
- Permitir remover secoes opcionais (diferenciais, depoimentos)

---

### Step 5 — Prompt Final (`step-four.tsx`)

**O que funciona bem:**
- Prompt completo e abrangente (~2000 palavras)
- Layout descriptions detalhadas para cada wireframe
- Copy com feedback visual
- PDF com contexto completo
- Save to Supabase com fallback para localStorage

**Problemas de UX:**
- Prompt e muito longo e nao escaneavel
- Sem highlight de secoes no prompt
- Feedback "Copiado!" dura apenas 2s
- Sem confirmacao antes de salvar
- Redirect apos save nao espera confirmacao do usuario
- Sem guia "proximos passos" (o que fazer com o prompt?)

**Problemas de Acessibilidade:**
- Sem `role="alert"` no feedback de copia
- Sem loading state no botao de salvar
- Sem focus management apos acoes

**Problemas Tecnicos:**
- **Insert nao-atomico**: project INSERT + briefing INSERT separados
- Se briefing INSERT falha, project fica orfao
- `generateCompletePrompt()` chamado multiplas vezes (copy + PDF)
- Usuario nao-autenticado perde dados apos redirect para login
- Redirect acontece mesmo se save falhar (toast.error + redirect)

**Sugestoes:**
- Usar Supabase RPC para insert atomico (project + briefing)
- Cachear resultado de `generateCompletePrompt()`
- Aumentar duracao do "Copiado!" para 4s
- Adicionar secao "Proximos Passos" com links para v0/Lovable
- Loading state no botao de salvar

---

## 4. Analise das Paginas do App

### Dashboard (`/app`)

| Aspecto | Status | Detalhe |
|---------|--------|---------|
| Layout | OK | Grid 4 colunas para stats, lista de projetos |
| Dados | MOCK | Projetos vem de localStorage + dados hardcoded |
| Stats | MOCK | "12 Projetos", "10 Completos" sao hardcoded |
| Empty state | FRACO | Mostra mock data em vez de estado vazio real |
| Responsividade | OK | Grid adapta para 2 colunas em mobile |

### Projetos (`/app/projects`)

| Aspecto | Status | Detalhe |
|---------|--------|---------|
| Listagem | OK | Cards com info relevante |
| Busca | MOCK | Input de busca sem funcionalidade |
| Filtros/Tabs | OK | All/In-progress/Completed |
| Acoes | PARCIAL | "Duplicar" e "Excluir" sem handler |
| Paginacao | AUSENTE | Lista todos sem paginacao |

### Detalhe do Projeto (`/app/projects/[id]`)

| Aspecto | Status | Detalhe |
|---------|--------|---------|
| Visualizacao | OK | Mostra proposta, objetivo, descricao |
| Wireframe | READ-ONLY | Nao permite editar secoes |
| Edicao | AUSENTE | Sem botao de editar projeto |
| Fallback | CONFUSO | Mostra mock data se projeto nao encontrado |

### Deals (`/app/deals`)

| Aspecto | Status | Detalhe |
|---------|--------|---------|
| Kanban | OK | 5 colunas com drag-and-drop |
| Persistencia | AUSENTE | Reset ao refresh da pagina |
| CRUD | PARCIAL | Criar funciona, editar/excluir nao |
| Drag-drop | NATIVO | JS Drag API (sem biblioteca) |

### Settings (`/app/settings`)

| Aspecto | Status | Detalhe |
|---------|--------|---------|
| Perfil | MOCK | Dados hardcoded, save sem handler |
| Senha | MOCK | Formulario sem funcionalidade |
| Notificacoes | MOCK | Toggles sem persistencia |
| Excluir conta | PERIGOSO | Botao sem confirmacao, sem handler |

### Plano & Creditos (`/app/settings/plan`)

| Aspecto | Status | Detalhe |
|---------|--------|---------|
| Plano atual | PARCIAL | Creditos reais, plano hardcoded |
| Upgrade | MOCK | Botoes sem handler |
| Historico | MOCK | Dados totalmente hardcoded |

### Ajuda (`/app/help`)

| Aspecto | Status | Detalhe |
|---------|--------|---------|
| FAQ | OK | 6 perguntas em accordion |
| Formulario | MOCK | Sem envio real |
| Quick actions | MOCK | Cards sem onClick |

### Links Quebrados

| Link | Origem | Status |
|------|--------|--------|
| `/about` | Footer | 404 |
| `/blog` | Footer | 404 |
| `/contact` | Footer | 404 |
| `/privacy` | Footer | 404 |
| `/terms` | Footer | 404 |

---

## 5. Arquitetura & Backend

### API Routes — Padrao Consistente

Todas as 4 routes de agentes seguem:
```
Auth check → Validacao basica → callAgent() → logGeneration() → Response
```

**Problemas:**
- Sem rate limiting (usuario pode fazer requests ilimitados)
- Sem verificacao de creditos antes de chamar OpenAI
- Erros genericos para o cliente ("Nao foi possivel gerar...")
- `logGeneration()` falha silenciosamente

### OpenAI (`lib/openai.ts`)

**Funciona bem:**
- Retry com backoff exponencial (3 tentativas)
- Parser JSON resiliente (JSON direto, markdown blocks, regex)
- Fallback de modelo: corrige `gpt-5.1-mini` → `gpt-4o-mini`

**Problemas:**
- Sem timeout — pode travar indefinidamente
- Token limit default 400 pode truncar respostas
- Input do usuario vai direto no prompt sem sanitizacao

### Sistema de Creditos

**Status: NAO FUNCIONAL**

- Tabela `credits_balance` existe com campos corretos
- Tabela `credits_ledger` existe para historico
- Endpoint GET `/api/credits` funciona (retorna saldo)
- **MAS**: nenhum endpoint/logica para:
  - Debitar creditos em uso
  - Verificar saldo antes de operacao
  - Comprar creditos
  - Conceder creditos iniciais no signup

### Persistencia de Dados

| Dado | Storage | Persistencia |
|------|---------|-------------|
| Draft wizard (step 1) | localStorage | 24h, depois expira |
| Draft wizard (briefing) | Nenhum | Perdido no refresh |
| Projeto finalizado | Supabase | Permanente |
| Briefing estrategico | Supabase (JSONB) | Permanente |
| Projetos (nao logado) | localStorage | Ate limpar browser |
| Deals pipeline | State React | Perdido no refresh |
| Settings usuario | Nenhum | Nao salva |

---

## 6. Seguranca

### Vulnerabilidades Encontradas

| Vulnerabilidade | Severidade | Detalhe |
|----------------|-----------|---------|
| Prompt injection | ALTA | Input usuario vai direto para system prompt OpenAI |
| Sem rate limiting | ALTA | API routes podem ser abusadas |
| Credenciais teste hardcoded | MEDIA | `TEST_USER_EMAIL` e `TEST_USER_PASSWORD` em `.env.local` |
| Service role key em API routes | MEDIA | Bypass completo de RLS se exposta |
| XSS via briefing data | MEDIA | Dados do usuario armazenados sem sanitizacao |
| Sem CSRF visible | BAIXA | Assumido tratado pelo middleware Supabase |
| localStorage nao encriptado | BAIXA | Dados pessoais (telefone, email) em plain text |

### Recomendacoes de Seguranca

1. **Sanitizar inputs** antes de enviar para OpenAI (escapar aspas, limitar tamanho)
2. **Rate limiter** via middleware (ex: 10 requests/min por usuario)
3. **Remover credenciais de teste** do `.env.local` ou usar vault
4. **Validar ownership** em todas API routes (usuario so acessa seus dados)
5. **Encriptar dados sensiveis** no localStorage ou usar session storage

---

## 7. Performance

### Preocupacoes

| Item | Impacto | Detalhe |
|------|---------|---------|
| Componente BriefingReview | MEDIO | 926 linhas, deveria ser dividido |
| Segment maps hardcoded | BAIXO | ~250 linhas em memoria |
| jsPDF no bundle | MEDIO | ~200KB adicionais |
| Sem code splitting | MEDIO | Todos 5 steps carregados juntos |
| renderThumbnail 28 cases | BAIXO | Renderiza em todo re-render |
| Overlays CSS (grid + dots + gradient) | BAIXO | Repaint desnecessario |
| Sem paginacao de projetos | MEDIO | Escala mal com muitos projetos |
| `ignoreBuildErrors: true` | ALTO | Erros TS escondidos podem causar bugs runtime |

### Recomendacoes

1. Lazy load steps do wizard com `React.lazy()` + `Suspense`
2. Memoizar `renderThumbnail()` com `React.memo`
3. Dynamic import de jsPDF (so carrega quando usuario clica download)
4. Dividir BriefingReview em sub-componentes
5. Remover `ignoreBuildErrors` e corrigir erros TS

---

## 8. Matriz de Prioridades

### Prioridade 1 — Critico (fazer antes do lancamento)

| # | Problema | Esforco | Arquivo |
|---|---------|---------|---------|
| 1 | Implementar debito de creditos | 4h | `app/api/credits/`, `lib/openai.ts` |
| 2 | Rate limiting nas API routes | 2h | `middleware.ts` ou route handlers |
| 3 | Sanitizar input para OpenAI | 1h | `lib/openai.ts` |
| 4 | Insert atomico project + briefing | 1h | `step-four.tsx` + Supabase RPC |
| 5 | Handler de logout funcional | 15min | `sidebar.tsx`, `header.tsx` |

### Prioridade 2 — Importante (primeiras semanas)

| # | Problema | Esforco | Arquivo |
|---|---------|---------|---------|
| 6 | Timeout nas chamadas OpenAI | 30min | `lib/openai.ts` |
| 7 | Colapsar secoes do briefing (accordion) | 2h | `briefing-review.tsx` |
| 8 | Persistir draft do briefing | 1h | `wizard.tsx` |
| 9 | Remover dados hardcoded (usuario, plano) | 2h | `sidebar.tsx`, `header.tsx`, `settings/` |
| 10 | Settings reais (perfil, senha) | 3h | `app/app/settings/page.tsx` |
| 11 | Remover links mortos do footer | 5min | `components/footer.tsx` |
| 12 | Remover `ignoreBuildErrors` | 2h | `next.config.ts` + fixes |

### Prioridade 3 — Melhorias (proximo ciclo)

| # | Problema | Esforco | Arquivo |
|---|---------|---------|---------|
| 13 | Acessibilidade ARIA completa | 4h | Wizard steps, layout buttons |
| 14 | Code splitting dos wizard steps | 1h | `wizard.tsx` |
| 15 | Signup real com Supabase | 2h | `app/signup/page.tsx` |
| 16 | Reordenacao de secoes (drag-drop) | 4h | `step-three.tsx` |
| 17 | Adicionar/remover secoes opcionais | 3h | `step-three.tsx` |
| 18 | Mover segment maps para DB | 2h | `step-two-analysis.tsx` |
| 19 | Deals com persistencia | 3h | `app/app/deals/page.tsx` |
| 20 | Paginacao de projetos | 2h | `app/app/projects/page.tsx` |

### Prioridade 4 — Nice to Have

| # | Problema | Esforco | Arquivo |
|---|---------|---------|---------|
| 21 | Progresso real (SSE) no Step 2 | 4h | `step-two-analysis.tsx` + API |
| 22 | Preview maior de layout | 3h | `step-three.tsx` |
| 23 | Undo/redo no wizard | 6h | `wizard.tsx` |
| 24 | Tema escuro | 4h | `globals.css` + ThemeProvider |
| 25 | Testes unitarios | 8h+ | Todos componentes |

---

## 9. O Que Esta Funcionando Bem

Para balancear a analise, aqui esta o que o MagicSite faz **muito bem**:

1. **Wizard progressivo** — fluxo de 5 passos claro com indicador de progresso
2. **AI fallbacks inteligentes** — se OpenAI falha, templates por segmento salvam a experiencia
3. **Draft auto-save** — localStorage com expiracao de 24h e banner de recuperacao
4. **Wireframes visuais** — 25 thumbnails CSS-only, especificos por secao, auto-explicativos
5. **Prompt final abrangente** — cobre identidade, estrategia, wireframe, design, CTAs
6. **PDF export** — briefing completo + contexto para referencia offline
7. **Design system consistente** — cores OKLch, Geist font, shadcn components
8. **Responsividade solida** — sidebar → sheet no mobile, grids adaptaveis
9. **Merge de dados inteligente** — `{ ...generateBriefing(), ...aiBriefing }` preserva defaults
10. **UX de loading** — spinners, progress bars, fases nomeadas durante geracao

---

## 10. Conclusao

O MagicSite tem uma **base solida** com design visual consistente e fluxo de wizard bem pensado. Os principais gaps sao:

- **Funcionalidades mock** precisam virar reais (logout, settings, creditos, deals)
- **Seguranca** precisa de atencao antes do lancamento (rate limiting, sanitizacao, creditos)
- **Step 3 (Briefing)** e o maior gargalo de UX — precisa de accordion/colapso
- **Acessibilidade** esta abaixo do aceitavel — ARIA labels e focus management sao essenciais

Com as **5 prioridades criticas** resolvidas e as **7 melhorias importantes**, o app estara em condicoes de lancamento para usuarios iniciais.
