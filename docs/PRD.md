# PRD - MagicSite
## Product Requirements Document

**Versão:** 1.0  
**Data:** Janeiro 2025  
**Produto:** MagicSite - Prompts Mágicos para Gerar Sites Perfeitos e Sem Alteração

---

## 1. VISÃO GERAL DO PRODUTO

### 1.1 Propósito
MagicSite é uma plataforma SaaS que utiliza Inteligência Artificial para gerar prompts estratégicos completos para criação de sites profissionais. O produto transforma informações básicas de negócios em briefings estratégicos detalhados e prompts otimizados para plataformas de geração de código como v0 e Lovable.

### 1.2 Proposta de Valor
"Prompts mágicos para gerar sites perfeitos e sem alteração" - O MagicSite elimina a necessidade de múltiplas iterações ao gerar prompts tão completos e estratégicos que o site gerado não precisa de alterações.

### 1.3 Público-Alvo
- Freelancers e desenvolvedores que criam sites para clientes
- Agências digitais que precisam escalar produção
- Empresas que precisam criar múltiplos sites rapidamente
- Profissionais de marketing que precisam landing pages

---

## 2. FUNCIONALIDADES PRINCIPAIS

### 2.1 Sistema de Autenticação
**Status:** A implementar no backend

**Requisitos:**
- Login com email e senha
- Registro de novos usuários
- Recuperação de senha
- Sessões persistentes
- Proteção de rotas autenticadas

**Dados do Usuário:**
\`\`\`typescript
interface User {
  id: string
  name: string
  email: string
  plan: 'Smart' | 'Pro' | 'Plus'
  credits: number
  totalCredits: number
  createdAt: Date
  updatedAt: Date
}
\`\`\`

### 2.2 Sistema de Créditos
**Status:** A implementar no backend

**Regras de Negócio:**
- Cada ação consome créditos específicos:
  - Informações Básicas: 5 créditos
  - Análise IA: 10 créditos
  - Briefing Estratégico: 5 créditos
  - Geração de Conteúdo: 5 créditos
  - Download/Prompt: GRÁTIS
- Créditos renovam mensalmente conforme plano
- Sistema de tracking de uso de créditos por projeto
- Alertas quando créditos estão baixos

**Planos Disponíveis:**
- **Smart:** R$ 27/mês - 200 créditos (~10 sites/mês)
- **Pro:** R$ 49/mês - 500 créditos (~25 sites/mês)
- **Plus:** R$ 97/mês - 1200 créditos (~60 sites/mês)

### 2.3 Wizard de Criação de Projetos (5 Etapas)

#### Etapa 1: Informações Básicas
**Campos:**
- Nome do negócio (obrigatório)
- Segmento de atuação (select com opções predefinidas)
- Telefone/WhatsApp (obrigatório)
- Endereço completo (obrigatório)
- Descrição do negócio (textarea com botão AJUDA.AI)

**Funcionalidade AJUDA.AI:**
- Gera descrição profissional baseada no segmento
- Usa informações já preenchidas como contexto
- Edição inline do resultado

#### Etapa 2: Análise IA
**Geração Automática de 3 Componentes:**

1. **Proposta de Valor**
   - Formato: "Eu ajudo [Público] que sofrem com [Problema] a [Solução], para que possam [Benefício], sem que [Objeção]."
   - Gerada com base nas informações da Etapa 1
   - Edição inline

2. **Descrição Detalhada do Negócio**
   - Template: "O meu negócio é [categoria] que [transformação]. Eu atuo no setor de [indústria], e meu diferencial é [proposta única]. Meu público-alvo são [perfil] que enfrentam [dores]. Eles desejam [resultado]. A comunicação da minha marca é [estilo]. O objetivo principal dela é [posicionamento]. É importante considerar que o mercado está em [contexto], criando [oportunidade]."
   - Botão AJUDA.AI para regenerar
   - Edição inline

3. **Objetivo do Site**
   - 3 objetivos principais adaptados ao segmento
   - Formato estruturado em tópicos
   - Edição inline

#### Etapa 3: Briefing Estratégico
**18 Variáveis Estratégicas Universais:**

1. O que eu ofereço
2. Setor de atuação
3. Diferencial competitivo
4. Público-alvo
5. Desafios do público
6. Aspirações do público
7. Tom de voz
8. Objetivo estratégico
9. Filosofia central
10. Modelo de entrega
11. Prova social
12. Valores inegociáveis
13. Contexto de mercado
14. Promessa final
15. Objeções comuns
16. Emoção desejada
17. Serviço adicional
18. Ticket médio

**CTAs (Chamadas para Ação):**
- CTA Principal
- CTA Secundário
- CTA Alternativo

**Paleta de Cores:**
- Cor Primária (color picker)
- Cor Secundária (color picker)
- Cor Accent (color picker)

**Características:**
- Todas as variáveis são editáveis inline
- Geração automática baseada nas etapas anteriores
- Não regenera ao navegar entre etapas (dados persistidos)

#### Etapa 4: Wireframe e Conteúdo
**Seções Geradas:**

1. **Hero Section**
   - Instruções detalhadas
   - Layout visual
   - Conteúdo sugerido

2. **Sobre Nós**
   - Instruções detalhadas
   - Layout visual
   - Conteúdo sugerido

3. **Serviços/Produtos**
   - Instruções detalhadas
   - Layout visual
   - Conteúdo sugerido

4. **Diferenciais**
   - Instruções detalhadas
   - Layout visual
   - Conteúdo sugerido

5. **Depoimentos**
   - Instruções detalhadas
   - Layout visual
   - Conteúdo sugerido

6. **CTA Final**
   - Instruções detalhadas
   - Layout visual
   - Conteúdo sugerido

**Características:**
- Wireframe visual de cada seção
- Instruções editáveis inline
- Baseado em todo contexto anterior

#### Etapa 5: Geração de Prompt
**2 Modelos de Export:**

1. **Prompt Completo**
   - Todo contexto incluído no texto
   - Pronto para copiar e colar
   - Otimizado para v0/Lovable

2. **Prompt Simples + Arquivo**
   - Prompt resumido
   - Arquivo JSON com contexto completo
   - Botão de download do arquivo

**Funcionalidades:**
- Botão "Copiar Prompt"
- Botão "Baixar Contexto" (modelo 2)
- Botão "Salvar Projeto"
- Redirecionamento para dashboard após salvar

### 2.4 Dashboard
**Componentes:**

**Header:**
- Saudação personalizada
- Botão "Novo Projeto"

**Card de Créditos:**
- Créditos disponíveis
- Barra de progresso visual
- Informação de renovação
- Link para upgrade

**Estatísticas:**
- Projetos criados
- Sites completos
- Tempo médio
- Economia total

**Lista de Projetos:**
- Projetos recentes (últimos 3)
- Status (completo/em progresso)
- Fase atual
- Créditos usados
- Data de criação
- Botões de ação (Continuar/Baixar)
- Barra de progresso para projetos em andamento

### 2.5 Navegação entre Etapas
**Características:**
- Step indicator clicável
- Permite voltar para etapas anteriores
- Dados persistidos ao navegar
- Não regenera conteúdo IA ao voltar
- Validação antes de avançar

### 2.6 Sidebar (Menu Lateral)
**Estrutura:**

**Topo:**
- Logo MagicSite
- Botão "Novo Projeto" (ação rápida)

**Navegação Principal:**
- Dashboard
- Projetos

**Navegação Conta:**
- Plano & Créditos
- Configurações
- Ajuda

**Rodapé:**
- Informações do usuário (nome, plano)
- Créditos disponíveis com barra de uso
- Botão Sair

**Comportamento:**
- Oculta automaticamente em rotas de criação de projetos
- Menu hamburguer no header para abrir em mobile/desktop
- Overlay em mobile

---

## 3. ESTRUTURA DE DADOS

### 3.1 Modelo de Dados - Usuário
\`\`\`typescript
interface User {
  id: string
  name: string
  email: string
  password: string // hashed
  plan: 'Smart' | 'Pro' | 'Plus'
  credits: number
  totalCredits: number
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  createdAt: Date
  updatedAt: Date
}
\`\`\`

### 3.2 Modelo de Dados - Projeto
\`\`\`typescript
interface Project {
  id: string
  userId: string
  name: string
  status: 'draft' | 'in-progress' | 'completed'
  currentStep: 1 | 2 | 3 | 4 | 5
  creditsUsed: number
  
  // Etapa 1: Informações Básicas
  businessName: string
  segment: string
  phone: string
  address: string
  description: string
  
  // Etapa 2: Análise IA
  valueProposition: string
  detailedDescription: string
  siteObjectives: string
  
  // Etapa 3: Briefing Estratégico
  briefing: {
    whatIOffer: string
    sector: string
    competitive: string
    targetAudience: string
    audienceChallenges: string
    audienceAspirations: string
    toneOfVoice: string
    strategicObjective: string
    centralPhilosophy: string
    deliveryModel: string
    socialProof: string
    nonNegotiableValues: string
    marketContext: string
    finalPromise: string
    commonObjections: string
    desiredEmotion: string
    additionalService: string
    averageTicket: string
  }
  
  ctas: {
    primary: string
    secondary: string
    alternative: string
  }
  
  colors: {
    primary: string
    secondary: string
    accent: string
  }
  
  // Etapa 4: Wireframe
  wireframe: {
    hero: string
    about: string
    services: string
    differentials: string
    testimonials: string
    cta: string
  }
  
  // Etapa 5: Prompt Gerado
  generatedPrompt?: string
  
  createdAt: Date
  updatedAt: Date
}
\`\`\`

### 3.3 Modelo de Dados - Transação de Créditos
\`\`\`typescript
interface CreditTransaction {
  id: string
  userId: string
  projectId?: string
  amount: number // negativo para consumo, positivo para adição
  type: 'usage' | 'purchase' | 'renewal' | 'refund'
  description: string
  createdAt: Date
}
\`\`\`

---

## 4. REQUISITOS TÉCNICOS

### 4.1 Stack Tecnológico

**Frontend (Já Implementado):**
- Next.js 15+ (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Lucide Icons

**Backend (A Implementar):**
- Next.js API Routes ou
- Node.js + Express
- PostgreSQL (banco de dados)
- Prisma ORM
- NextAuth.js (autenticação)
- Stripe (pagamentos)

**Infraestrutura:**
- Vercel (hosting)
- Vercel Postgres ou Supabase
- Vercel Blob (armazenamento de arquivos)

### 4.2 APIs Necessárias

**Autenticação:**
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- POST /api/auth/forgot-password
- GET /api/auth/me

**Usuários:**
- GET /api/users/me
- PATCH /api/users/me
- GET /api/users/credits

**Projetos:**
- GET /api/projects (listar projetos do usuário)
- GET /api/projects/:id (buscar projeto específico)
- POST /api/projects (criar novo projeto)
- PATCH /api/projects/:id (atualizar projeto)
- DELETE /api/projects/:id (deletar projeto)
- POST /api/projects/:id/save (salvar e consumir créditos)

**Créditos:**
- GET /api/credits/balance (saldo atual)
- GET /api/credits/transactions (histórico)
- POST /api/credits/consume (consumir créditos)

**Pagamentos:**
- POST /api/payments/create-checkout (criar sessão Stripe)
- POST /api/payments/webhook (webhook Stripe)
- GET /api/payments/portal (portal do cliente)

### 4.3 Integrações Externas

**Stripe:**
- Checkout Sessions
- Customer Portal
- Webhooks para renovação automática
- Gerenciamento de assinaturas

**IA (Futuro):**
- OpenAI API para geração de conteúdo
- Anthropic Claude para análise estratégica

---

## 5. FLUXOS DE USUÁRIO

### 5.1 Fluxo de Onboarding
1. Usuário acessa landing page
2. Clica em "Começar Agora"
3. Preenche formulário de registro
4. Escolhe plano (Smart/Pro/Plus)
5. Realiza pagamento via Stripe
6. Recebe créditos iniciais
7. Redirecionado para dashboard

### 5.2 Fluxo de Criação de Projeto
1. Usuário clica em "Novo Projeto"
2. Seleciona tipo de site
3. **Etapa 1:** Preenche informações básicas (5 créditos)
4. **Etapa 2:** IA gera análise estratégica (10 créditos)
5. **Etapa 3:** IA gera briefing completo (5 créditos)
6. **Etapa 4:** IA gera wireframe e conteúdo (5 créditos)
7. **Etapa 5:** Gera prompt final (grátis)
8. Copia prompt ou baixa arquivo
9. Salva projeto
10. Retorna ao dashboard

### 5.3 Fluxo de Navegação entre Etapas
1. Usuário pode clicar em qualquer etapa anterior no step indicator
2. Dados são carregados do banco de dados
3. Não há regeneração de conteúdo IA
4. Usuário pode editar e avançar novamente
5. Alterações são salvas automaticamente

### 5.4 Fluxo de Gerenciamento de Créditos
1. Usuário visualiza créditos na sidebar
2. Barra de progresso mostra uso
3. Ao criar projeto, créditos são consumidos por etapa
4. Quando créditos acabam, usuário é notificado
5. Pode fazer upgrade de plano
6. Créditos renovam automaticamente no ciclo mensal

---

## 6. REGRAS DE NEGÓCIO

### 6.1 Consumo de Créditos
- Créditos são consumidos ao **avançar** de cada etapa
- Se usuário voltar e avançar novamente, não consome novamente
- Projeto salvo mantém registro de créditos já consumidos
- Usuário não pode avançar sem créditos suficientes

### 6.2 Persistência de Dados
- Todos os dados do projeto são salvos no banco
- Navegação entre etapas não perde dados
- Dados são carregados ao retornar ao projeto
- IA não regenera conteúdo já gerado

### 6.3 Planos e Limites
- Cada plano tem limite mensal de créditos
- Créditos não utilizados não acumulam
- Renovação automática no mesmo dia do mês
- Downgrade só ocorre no próximo ciclo
- Upgrade é imediato com créditos proporcionais

### 6.4 Projetos
- Usuário pode ter projetos ilimitados
- Projetos podem ser salvos como rascunho
- Projetos completos podem ser reabertos
- Prompt pode ser regenerado sem custo adicional
- Edições em projetos salvos não consomem créditos

---

## 7. MÉTRICAS E KPIs

### 7.1 Métricas de Produto
- Número de projetos criados por usuário
- Taxa de conclusão de projetos (etapa 5)
- Tempo médio para completar um projeto
- Taxa de uso de créditos por plano
- Taxa de conversão de trial para pago

### 7.2 Métricas de Negócio
- MRR (Monthly Recurring Revenue)
- Churn rate
- LTV (Lifetime Value)
- CAC (Customer Acquisition Cost)
- Taxa de upgrade entre planos

### 7.3 Métricas de Uso
- Etapas mais editadas
- Uso do botão AJUDA.AI
- Tempo gasto em cada etapa
- Taxa de uso de cada modelo de prompt

---

## 8. ROADMAP

### Fase 1: MVP Backend (Prioridade Alta)
- [ ] Implementar autenticação
- [ ] Criar banco de dados e modelos
- [ ] APIs de CRUD de projetos
- [ ] Sistema de créditos
- [ ] Integração com Stripe

### Fase 2: Melhorias de IA (Prioridade Média)
- [ ] Integrar OpenAI para geração real
- [ ] Melhorar qualidade dos prompts gerados
- [ ] Adicionar mais templates de segmentos
- [ ] Sistema de aprendizado baseado em feedback

### Fase 3: Funcionalidades Avançadas (Prioridade Baixa)
- [ ] Histórico de versões de projetos
- [ ] Compartilhamento de projetos
- [ ] Templates salvos
- [ ] Biblioteca de componentes
- [ ] Exportação direta para v0/Lovable via API

### Fase 4: Escala e Otimização
- [ ] Cache de respostas IA
- [ ] Otimização de performance
- [ ] Analytics avançado
- [ ] A/B testing de prompts
- [ ] White label para agências

---

## 9. CONSIDERAÇÕES DE SEGURANÇA

### 9.1 Autenticação e Autorização
- Senhas hasheadas com bcrypt
- Tokens JWT com expiração
- Rate limiting em APIs
- Proteção contra CSRF
- Validação de inputs

### 9.2 Dados Sensíveis
- Dados de pagamento nunca armazenados
- Stripe gerencia informações de cartão
- Logs não contêm dados sensíveis
- Backup regular do banco de dados

### 9.3 Compliance
- LGPD compliance
- Termos de uso claros
- Política de privacidade
- Direito ao esquecimento
- Exportação de dados do usuário

---

## 10. SUPORTE E DOCUMENTAÇÃO

### 10.1 Documentação Necessária
- Guia de início rápido
- Tutoriais em vídeo
- FAQ completo
- Documentação de API
- Changelog de atualizações

### 10.2 Canais de Suporte
- Email (todos os planos)
- Chat (planos Pro e Plus)
- Suporte prioritário (plano Plus)
- Base de conhecimento
- Comunidade/Discord

---

## CONCLUSÃO

Este PRD define a estrutura completa do MagicSite, uma plataforma SaaS inovadora que utiliza IA para gerar prompts estratégicos para criação de sites. O frontend está 100% implementado e funcional. O próximo passo é implementar o backend seguindo as especificações deste documento, priorizando autenticação, banco de dados, sistema de créditos e integração com Stripe.

O produto tem potencial de mercado significativo ao resolver um problema real: a dificuldade de criar briefings estratégicos completos que resultem em sites de qualidade sem necessidade de múltiplas iterações.
