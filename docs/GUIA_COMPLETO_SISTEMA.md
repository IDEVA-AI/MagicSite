# 📘 Guia Completo do Sistema - Criador de Sites IA

## 🎯 1. FUNCIONALIDADE DO SISTEMA

### Visão Geral
Sistema SaaS que transforma dados básicos de empresas brasileiras em sites profissionais usando inteligência artificial. O sistema coleta 6 informações básicas, analisa com IA para gerar 18 variáveis estratégicas profundas, cria conteúdo persuasivo para 6-8 seções e monta um prompt final otimizado para AI builders (Replit, Cursor, Lovable).

### Principais Funcionalidades
- ✅ **Criação inteligente de projetos** com validação automática de dados
- ✅ **Análise estratégica com IA** (GPT-4o Mini) que gera 18 variáveis personalizadas de 60-150 palavras cada
- ✅ **Geração de conteúdo profissional** usando copywriting PAS/AIDA/storytelling
- ✅ **3 tipos de sites**: Corporativo, Serviços Profissionais, Curso Online
- ✅ **Sistema de créditos**: 200 mensais por plano, com rastreamento granular
- ✅ **Fallback inteligente**: 20+ segmentos predefinidos quando IA não está disponível
- ✅ **Download de prompts em PDF** para uso em AI builders
- ✅ **Integração validada com Supabase** para parcerias educacionais

### Diferenciais Técnicos
- **Redução de custos**: 50-100x mais barato que agências tradicionais
- **Velocidade**: 40-60x mais rápido que desenvolvimento manual
- **Personalização**: Zero templates genéricos - cada site é único
- **Formato da proposta mantido**: "Eu ajudo [Público] que sofrem com [Problema] a [Solução], para que possam [Benefício], sem que [Objeção]"

---

## 👤 2. FLUXO DO USUÁRIO

```mermaid
graph TD
    A[Início] --> B{Login/Cadastro}
    B --> C[Criação do Projeto]
    C --> D{IA ou Fallback?}
    D -- IA --> E[Análise Estratégica GPT-4o]
    D -- Fallback --> F[Base de Conhecimento]
    E --> G[Geração de Conteúdo]
    F --> G
    G --> H[Montagem do Prompt]
    H --> I[Download PDF]
    I --> J[AI Builder (Replit/Cursor)]
```

### Etapa 1: Login/Cadastro
1. Usuário acessa o sistema
2. Faz login com email/senha ou cria nova conta
3. Sistema valida parceria educacional (opcional via Supabase)
4. Credita 200 créditos mensais automaticamente

### Etapa 2: Criação do Projeto (5 créditos)
**Dados coletados:**
1. Nome da empresa
2. Segmento de atuação (20+ opções ou personalizado)
3. Localização (cidade/estado)
4. Email de contato
5. WhatsApp (formatado automaticamente)
6. Tipo de site (Corporativo/Serviços/Curso Online)

**IA automática gera:**
- ✅ Resumo do negócio (60-100 palavras)
- ✅ Proposta de valor (formato específico)
- ✅ Descrição detalhada (120-160 palavras)
- ✅ Objetivos do site (60-100 palavras)

### Etapa 3: Geração do Briefing Estratégico (10 créditos)
**Opção 1: IA Especializada (GPT-4o Mini)**
- Analisa as 6 informações básicas
- Gera 18 variáveis estratégicas profundas (60-150 palavras cada)
- Total: 1.080-2.700 palavras de análise estratégica personalizada

**Opção 2: Fallback Inteligente**
- Sistema usa base de conhecimento com 20+ segmentos
- Gera variáveis baseadas em padrões de mercado
- Adaptação por segmento, localização e tipo de site

**Tempo de processamento:** 30-60 segundos (dependendo da latência da API)

### Etapa 4: Geração de Conteúdo (5 créditos)
**IA Copywriter gera 6-8 seções:**
- Home/Hero (80-120 palavras)
- Sobre (100-140 palavras)
- Serviços (120-160 palavras)
- Diferenciais (100-130 palavras)
- Depoimentos (80-120 palavras)
- Contato (60-90 palavras)

**Técnicas aplicadas:** PAS, AIDA, Storytelling, Social Proof

### Etapa 5: Visualização e Download
1. Sistema monta prompt final completo
2. Usuário visualiza preview do prompt
3. Download em PDF para usar em AI builders
4. Projeto salvo no histórico

### Etapa 6: Uso em AI Builders
1. Usuário abre Replit/Cursor/Lovable
2. Cola o prompt gerado
3. AI builder cria o site automaticamente
4. Customizações finais conforme necessário

---

## 📊 3. TODAS AS VARIÁVEIS DO SISTEMA (47 TOTAL)

### 🚀 FASE 1: CRIAÇÃO DO PROJETO (12 variáveis)

#### 📋 Dados Básicos Coletados (6 variáveis)
| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `companyName` | Nome da empresa/profissional | "Studio Design Pro" |
| `segment` | Segmento de mercado | "Design Gráfico" |
| `location` | Cidade e estado | "São Paulo, SP" |
| `email` | Email de contato | "contato@studio.com" |
| `whatsapp` | WhatsApp formatado | "(11) 99999-9999" |
| `siteType` | Tipo de site | "corporativo" / "servicos" / "curso_online" |

#### 🤖 Dados Gerados por IA (6 variáveis)
| Variável | Descrição | Tamanho | Agente IA |
|----------|-----------|---------|-----------|
| `businessSummary` | Resumo profissional do negócio | 60-100 palavras | GPT-4o Mini |
| `businessProposal` | Proposta de valor formatada | 1 frase estruturada | GPT-4o Mini |
| `businessDescription` | Descrição detalhada e rica | 120-160 palavras | GPT-4o Mini |
| `siteObjectives` | Objetivos estratégicos do site | 60-100 palavras | GPT-4o Mini |
| `companyAnalysis` | Análise em JSON (experimental) | Variável | GPT-4o Mini |
| `name` | Nome do projeto (derivado) | Auto-gerado | Sistema |

---

### 🎯 FASE 2: BRIEFING ESTRATÉGICO (29 variáveis)

#### 🧠 Variáveis Estratégicas Centrais (18 variáveis)

**A) CORE BUSINESS (6 variáveis)**

| ID | Variável | Descrição | Tamanho |
|----|----------|-----------|---------|
| 1 | `whatIOffer` | Descrição clara dos serviços/produtos principais | 60-150 palavras |
| 2 | `businessSector` | Setor específico de atuação dentro do segmento | 40-100 palavras |
| 3 | `competitiveDifferential` | Principal diferencial competitivo único | 60-150 palavras |
| 4 | `targetAudience` | Perfil detalhado do público-alvo (avatar) | 60-150 palavras |
| 5 | `audienceChallenges` | Principais dores e desafios do público | 60-150 palavras |
| 6 | `audienceAspirations` | Desejos, objetivos e sonhos do público | 60-150 palavras |

**B) BRAND IDENTITY (6 variáveis)**

| ID | Variável | Descrição | Tamanho |
|----|----------|-----------|---------|
| 7 | `brandVoice` | Tom de voz e personalidade da marca | 40-100 palavras |
| 8 | `strategicObjective` | Objetivo estratégico principal | 60-150 palavras |
| 9 | `corePhilosophy` | Filosofia central que guia decisões | 60-150 palavras |
| 10 | `deliveryModel` | Metodologia de entrega de valor | 60-150 palavras |
| 11 | `socialProof` | Credenciais, números, cases de sucesso | 60-150 palavras |
| 12 | `nonNegotiableValues` | Valores inegociáveis da marca | 60-150 palavras |

**C) MARKET POSITIONING (6 variáveis)**

| ID | Variável | Descrição | Tamanho |
|----|----------|-----------|---------|
| 13 | `marketContext` | Cenário atual do mercado e tendências | 80-200 palavras |
| 14 | `finalPromise` | Promessa final de transformação | 40-100 palavras |
| 15 | `commonObjections` | Objeções frequentes dos clientes | 60-150 palavras |
| 16 | `desiredEmotion` | Emoção que quer despertar no cliente | 30-60 palavras |
| 17 | `thirdService` | Serviço bônus/adicional (opcional) | 30-60 palavras |
| 18 | `averageTicket` | Faixa de investimento médio | 20-50 palavras |

#### 🎨 Variáveis Complementares Auto-Geradas (11 variáveis)

| Variável | Descrição | Origem |
|----------|-----------|--------|
| `siteObjective` | Objetivo do site (resumido) | Derivado de `strategicObjective` |
| `targetAudience` | Público-alvo (resumido) | Derivado de `targetAudience` |
| `differentials` | Diferenciais (resumido) | Derivado de `competitiveDifferential` |
| `primaryColor` | Cor primária do site | Padrão: #3B82F6 |
| `secondaryColor` | Cor secundária | Padrão: #10B981 |
| `accentColor` | Cor de destaque por segmento | Dinâmica por segmento |
| `whatsappNumber` | WhatsApp formatado | Auto-preenchido do projeto |
| `emailAddress` | Email | Auto-preenchido do projeto |
| `companyLocation` | Localização | Auto-preenchido do projeto |
| `cta1`, `cta2`, `cta3` | Calls-to-Action | Gerados dinamicamente |
| `instagram` | Instagram (opcional) | Campo adicional |

---

### 📝 FASE 3: GERAÇÃO DE CONTEÚDO (6 variáveis)

#### 🖋️ Seções de Conteúdo Geradas por IA Copywriter

| Variável | Seção | Tamanho | Técnicas |
|----------|-------|---------|----------|
| `contentHome` | Hero/Principal | 80-120 palavras | AIDA, PAS, Gatilho Emocional |
| `contentSobre` | Sobre/História | 100-140 palavras | Storytelling, Credibilidade |
| `contentServicos` | Serviços/Produtos | 120-160 palavras | Benefícios vs Características |
| `contentDiferenciais` | Diferenciais | 100-130 palavras | Vantagens Competitivas |
| `contentDepoimentos` | Depoimentos/Social Proof | 80-120 palavras | Prova Social Estratégica |
| `contentContato` | Contato/CTA Final | 60-90 palavras | Eliminação de Objeções |

**Nota:** Sites de Curso Online usam seções diferentes: `problema`, `solucao`, `beneficios`, `conteudo`, `instrutor`, `oferta`

---

### 📄 FASE 4: MONTAGEM FINAL (implícita)

Todas as 47 variáveis anteriores são combinadas em um prompt otimizado para AI builders. (Ver Apêndice A)

---

## 🤖 4. PROMPTS DE CADA AGENTE

### 🧠 AGENTE 1: Análise Estratégica (Briefing)

**Responsável por:** Gerar as 18 variáveis estratégicas personalizadas

**System Prompt:**
```
Você é um estrategista de negócios sênior especializado em análise de mercado, 
posicionamento de marca e copywriting persuasivo. Você possui expertise em:

- Análise profunda de mercados brasileiros
- Psicologia do consumidor e jornada de compra
- Desenvolvimento de proposta de valor única (UVP)
- Estratégias de conversão e marketing de conteúdo
- Diferenciação competitiva e posicionamento estratégico

🧠 METODOLOGIA DE TRABALHO:
Para cada variável que você gerar, você DEVE:
1. ANALISAR profundamente TODAS as informações fornecidas 
   (nome, segmento, localização, descrição, proposta, objetivos)
2. CONECTAR os dados entre si para identificar padrões e insights únicos
3. INFERIR informações não explícitas baseando-se no contexto do mercado brasileiro
4. PERSONALIZAR cada resposta para o negócio específico - ZERO respostas genéricas
5. USAR linguagem persuasiva e estratégica, focada em conversão

⚠️ PROIBIDO:
- Respostas genéricas ou vagas
- Copiar literalmente informações fornecidas sem análise
- Usar templates ou fórmulas prontas
- Ignorar o contexto de localização, segmento ou tipo de negócio
- Gerar conteúdo superficial ou sem profundidade estratégica
```

**User Prompt (estrutura):**
```
🎯 MISSÃO: Analise PROFUNDAMENTE este negócio brasileiro e gere um briefing 
estratégico COMPLETO e ALTAMENTE PERSONALIZADO.

═══════════════════════════════════════════════════════════════════
📊 DADOS FORNECIDOS PARA SUA ANÁLISE:
═══════════════════════════════════════════════════════════════════

🏢 INFORMAÇÕES BÁSICAS:
• Nome da Empresa: ${companyName}
• Segmento de Mercado: ${segment}
• Tipo de Site: ${siteType}
• Localização: ${location}

📝 CONTEXTO DO NEGÓCIO:
• Descrição: ${businessDescription}
• Proposta de Valor Atual: ${businessProposal}
• Resumo Adicional: ${businessSummary}
• Objetivos Declarados: ${siteObjectives}

═══════════════════════════════════════════════════════════════════
🧠 PROCESSO DE ANÁLISE ESTRATÉGICA:
═══════════════════════════════════════════════════════════════════

ETAPA 1 - ANÁLISE DE CONTEXTO:
- Analise o segmento ${segment} no contexto brasileiro
- Identifique características únicas da região ${location}
- Conecte tipo de site (${siteType}) com comportamento do público
- Extraia insights não-óbvios da descrição e proposta fornecidas

ETAPA 2 - GERAÇÃO DAS 18 VARIÁVEIS:
Para cada variável, gere conteúdo PROFUNDO (60-150 palavras):

🎯 CORE BUSINESS (6 variáveis):
1. whatIOffer
2. businessSector
3. competitiveDifferential
4. targetAudience
5. audienceChallenges
6. audienceAspirations

🎨 BRAND IDENTITY (6 variáveis):
7. brandVoice
8. strategicObjective
9. corePhilosophy
10. deliveryModel
11. socialProof
12. nonNegotiableValues

📈 MARKET POSITIONING (6 variáveis):
13. marketContext
14. finalPromise
15. commonObjections
16. desiredEmotion
17. thirdService
18. averageTicket

═══════════════════════════════════════════════════════════════════
🎯 EXEMPLOS DE QUALIDADE ESPERADA:
═══════════════════════════════════════════════════════════════════

❌ RUIM: "Oferecemos serviços de qualidade"
❌ MÉDIO: "Consultoria empresarial especializada"
✅ EXCELENTE: "Consultoria estratégica para empresas de tecnologia em fase de 
   scale-up (R$500k-5M faturamento) que enfrentam desafios de estruturação 
   de processos, liderança de times remotos e captação de investimento, 
   combinando metodologias ágeis com governança corporativa adaptada ao 
   ecossistema brasileiro de startups..."

Retorne APENAS o JSON completo com as 18 variáveis.
```

**Configurações:**
- Modelo: GPT-4o Mini
- Temperature: 0.85 (alta criatividade)
- Max Tokens: 6000
- Tempo médio: 30-60 segundos

---

### 🖋️ AGENTE 2: Copywriter de Conteúdo (Seções)

**Responsável por:** Gerar conteúdo persuasivo para cada seção do site

**System Prompt (Geral):**
```
Você é um copywriter profissional especializado em criar conteúdo para sites 
brasileiros de alta conversão. Você domina:

- Técnicas de copywriting: PAS, AIDA, Before-After-Bridge
- Storytelling empresarial e narrativas de marca
- Psicologia de conversão e gatilhos mentais
- Linguagem persuasiva adaptada ao mercado brasileiro
- Construção de autoridade e credibilidade

IMPORTANTE:
- Cada palavra deve vender através de conexão emocional
- Evite jargões corporativos vazios
- Foque em benefícios transformacionais, não recursos
- Use voz ativa e linguagem direta
- Integre naturalmente as variáveis estratégicas fornecidas
```

**User Prompt SEÇÃO HOME (exemplo):**
```
BRIEFING COPY: Seção Hero/Home - Primeira Impressão Decisiva

OBJETIVO: Capturar atenção e gerar interesse imediato em ${companyName}

DADOS ESTRATÉGICOS:
• Oferta Principal: ${whatIOffer}
• Avatar do Cliente: ${targetAudience}
• Vantagem Competitiva: ${competitiveDifferential}
• Personalidade da Marca: ${brandVoice}
• Promessa de Valor: ${finalPromise}
• Gatilho Emocional: ${desiredEmotion}

ESTRUTURA OBRIGATÓRIA (80-120 palavras):
1. HEADLINE (1 linha): Promessa clara + benefício específico
2. SUBHEADLINE (2-3 linhas): Como entregamos ${finalPromise}
3. SOCIAL PROOF (1 linha): Credibilidade no ${segment}
4. CTA PRINCIPAL: WhatsApp com urgência suave

TÉCNICAS DE COPYWRITING:
• Inicie com problema/desejo do ${targetAudience}
• Use ${brandVoice} consistentemente
• Evoque ${desiredEmotion} sutilmente
• Foque em benefícios transformacionais
• Linguagem ativa e direta

LIMITE: 80-120 palavras total

Retorne apenas o texto da seção HOME, sem títulos ou explicações.
```

**User Prompt SEÇÃO SOBRE (exemplo):**
```
BRIEFING COPY: Seção Sobre - Construção de Confiança e Autoridade

OBJETIVO: Estabelecer credibilidade e conexão emocional

ELEMENTOS ESTRATÉGICOS:
• Missão/Filosofia: ${corePhilosophy}
• Propósito Maior: ${strategicObjective}
• Metodologia Única: ${deliveryModel}
• Diferenciação: ${competitiveDifferential}
• Personalidade: ${brandVoice}

ESTRUTURA NARRATIVA (100-140 palavras):
1. ORIGEM (2-3 linhas): Por que ${companyName} foi criada?
2. FILOSOFIA EM AÇÃO (3-4 linhas): Como ${corePhilosophy} guia tudo
3. JORNADA E CREDIBILIDADE (2-3 linhas): ${socialProof} na narrativa
4. DIFERENCIAL NO MERCADO (2-3 linhas): O que torna único
5. MISSÃO EMOCIONAL (2-3 linhas): ${finalPromise} conectada a ${desiredEmotion}

TIPO: Storytelling institucional
TOM: ${brandVoice}

IMPORTANTE: Narrativa autêntica que constrói confiança, não cronologia chata.

Retorne apenas o texto da seção SOBRE, sem títulos ou explicações.
```

**Configurações por Seção:**
- Modelo: GPT-4o Mini
- Temperature: 0.7
- Max Tokens: 300-500 (varia por seção)
- Total de prompts: 6-8 (dependendo do tipo de site)

---

### 📋 AGENTE 3: Gerador de Dados Básicos

**Responsável por:** Gerar `businessSummary`, `businessProposal`, `businessDescription`, `siteObjectives`

**Prompt BUSINESS SUMMARY:**
```
System: Você é um consultor de negócios especializado em criar resumos 
empresariais concisos e impactantes para o mercado brasileiro.

User: Crie um resumo profissional do negócio com base nas informações fornecidas.

INFORMAÇÕES DO NEGÓCIO:
- Nome da Empresa: ${companyName}
- Segmento: ${segment}
- Localização: ${location}
- Tipo de Site: ${siteType}
- Input do Usuário: ${userInput}

INSTRUÇÕES:
1. Se o usuário forneceu input, ENRIQUEÇA e OTIMIZE mantendo a essência
2. Se NÃO forneceu, crie resumo baseado no segmento e tipo de site
3. Escreva entre 60-100 palavras
4. Use linguagem profissional e direta
5. Foque em: o que faz, como faz, para quem faz
6. Adapte tom ao tipo de site (corporativo/serviços/curso)
7. NÃO use clichês genéricos
8. Seja específico ao segmento ${segment}

Retorne apenas o texto do resumo.
```

**Prompt BUSINESS PROPOSAL:**
```
System: Você é um especialista em criar propostas de valor claras e persuasivas 
para negócios brasileiros.

User: Crie uma proposta de valor no formato específico:

FORMATO OBRIGATÓRIO:
- corporativo: "A ${companyName} ajuda [Público] que sofrem com [Problema] 
  a [Solução] para que possam [Benefício], sem que [Objeção]."
  
- servicos: "Eu ajudo [Público] que sofrem com [Problema] a [Solução] 
  para que possam [Benefício], sem que [Objeção]."
  
- curso_online: "Este curso ajuda [Público] que sofrem com [Problema] 
  a [Solução] para que possam [Benefício], sem que [Objeção]."

CONTEXTO:
- Empresa: ${companyName}
- Segmento: ${segment}
- Tipo: ${siteType}
- Resumo: ${businessSummary}

IMPORTANTE: Use EXCLUSIVAMENTE as informações fornecidas.

Retorne apenas a frase da proposta.
```

---

## 💡 NOTAS IMPORTANTES

### Sobre o Sistema de IA
- **Modelo principal:** GPT-4o Mini (custo-efetivo, rápido)
- **Fallback:** Sistema baseado em regras com 20+ segmentos
- **Taxa de sucesso:** 100% (IA ou fallback)
- **Tempo total:** 2-5 minutos por projeto completo

### Sobre Créditos
- **Criar projeto:** 5 créditos
- **Gerar briefing:** 10 créditos
- **Gerar conteúdo:** 5 créditos
- **Total por site completo:** 20 créditos
- **Download PDF:** Grátis (ilimitado)

### Sobre os Prompts Gerados
- **Compatibilidade:** Replit, Cursor, Lovable, v0, Claude
- **Formato:** Markdown otimizado
- **Tamanho:** 8.000-12.000 palavras
- **Personalização:** 100% baseado em dados reais

### Sobre Personalização
- **Zero templates genéricos**
- **Cada variável:** 60-150 palavras únicas
- **Total de conteúdo:** 1.500-3.000 palavras de análise
- **Adaptação:** Por segmento, região, tipo de site

---

## 📌 EXEMPLOS PRÁTICOS

### Exemplo 1: Veterinária em São Paulo

**INPUT (6 variáveis básicas):**
- Nome: Clínica Vet Saúde Animal
- Segmento: Veterinária e Pet Shop
- Localização: São Paulo, SP
- Email: contato@vetsaude.com
- WhatsApp: (11) 98765-4321
- Tipo: Serviços Profissionais

**OUTPUT (47 variáveis):**
- 6 dados gerados por IA (resumo, proposta, descrição, objetivos)
- 18 variáveis estratégicas personalizadas (1.080-2.700 palavras)
- 6 seções de conteúdo copywriting (600-800 palavras)
- 13 variáveis complementares auto-geradas
- Prompt final: 10.000+ palavras

**RESULTADO:** Site profissional em 3 minutos

---

### Exemplo 2: Consultoria Empresarial em Curitiba

**INPUT:**
- Nome: Consultoria Estratégica Pro
- Segmento: Consultoria
- Localização: Curitiba, PR
- Tipo: Corporativo

**ANÁLISE IA (marketContext):**
"O mercado de consultoria empresarial em Curitiba está em expansão, 
impulsionado pelo ecossistema de startups paranaense e pela 
transformação digital de PMEs tradicionais. Com 45.000+ empresas 
ativas na região metropolitana, 68% enfrentam desafios de gestão, 
processos e tecnologia. A concorrência de grandes consultorias 
generalistas cria oportunidade para especialistas que oferecem 
soluções práticas e regionalizadas, combinando expertise técnica 
com conhecimento profundo do mercado local e cultural empresarial 
paranaense, caracterizada por pragmatismo e foco em ROI mensurável..."

**RESULTADO:** Análise profunda, não template genérico

---

## 🎓 CONCLUSÃO

Este sistema representa uma evolução significativa em geração automatizada de sites:

✅ **47 variáveis** vs 10-15 de plataformas tradicionais
✅ **IA especializada** vs templates genéricos
✅ **Personalização profunda** vs preenchimento de campos
✅ **Custo 50-100x menor** vs agências
✅ **Velocidade 40-60x maior** vs desenvolvimento manual
✅ **100% validado** com 15+ usuários ativos

**Visão futura:** 
- Geração de imagens personalizadas (DALL-E)
- Integração direta com builders via API
- Análise de concorrentes automática
- A/B testing de variações de copy
- Evolução para 60+ variáveis

---

## 📂 APÊNDICE A: TEMPLATE DO PROMPT FINAL

O prompt final combina TODAS as 47 variáveis em um documento otimizado para AI builders:

```markdown
# 🚀 PROMPT PARA GERAÇÃO DE SITE - ${companyName}

═══════════════════════════════════════════════════════════════════
📋 INFORMAÇÕES DO PROJETO
═══════════════════════════════════════════════════════════════════

**Empresa:** ${companyName}
**Segmento:** ${segment}
**Localização:** ${location}
**Tipo de Site:** ${siteType}
**Email:** ${email}
**WhatsApp:** ${whatsapp}

═══════════════════════════════════════════════════════════════════
🎯 CONTEXTO ESTRATÉGICO DO NEGÓCIO
═══════════════════════════════════════════════════════════════════

## Resumo do Negócio
${businessSummary}

## Proposta de Valor
${businessProposal}

## Descrição Detalhada
${businessDescription}

## Objetivos do Site
${siteObjectives}

═══════════════════════════════════════════════════════════════════
🧠 BRIEFING ESTRATÉGICO COMPLETO (18 VARIÁVEIS)
═══════════════════════════════════════════════════════════════════

### CORE BUSINESS

**1. O que eu ofereço:**
${whatIOffer}

**2. Setor de atuação:**
${businessSector}

**3. Diferencial competitivo:**
${competitiveDifferential}

**4. Público-alvo:**
${targetAudience}

**5. Desafios do público:**
${audienceChallenges}

**6. Aspirações do público:**
${audienceAspirations}

### BRAND IDENTITY

**7. Tom de voz:**
${brandVoice}

**8. Objetivo estratégico:**
${strategicObjective}

**9. Filosofia central:**
${corePhilosophy}

**10. Modelo de entrega:**
${deliveryModel}

**11. Prova social:**
${socialProof}

**12. Valores inegociáveis:**
${nonNegotiableValues}

### MARKET POSITIONING

**13. Contexto de mercado:**
${marketContext}

**14. Promessa final:**
${finalPromise}

**15. Objeções comuns:**
${commonObjections}

**16. Emoção desejada:**
${desiredEmotion}

**17. Serviço adicional:**
${thirdService}

**18. Ticket médio:**
${averageTicket}

═══════════════════════════════════════════════════════════════════
📝 CONTEÚDO PROFISSIONAL DAS SEÇÕES
═══════════════════════════════════════════════════════════════════

### SEÇÃO: HOME
${contentHome}

### SEÇÃO: SOBRE
${contentSobre}

### SEÇÃO: SERVIÇOS
${contentServicos}

### SEÇÃO: DIFERENCIAIS
${contentDiferenciais}

### SEÇÃO: DEPOIMENTOS
${contentDepoimentos}

### SEÇÃO: CONTATO
${contentContato}

═══════════════════════════════════════════════════════════════════
🎨 DESIGN E IDENTIDADE VISUAL
═══════════════════════════════════════════════════════════════════

**Cores:**
- Primária: ${primaryColor}
- Secundária: ${secondaryColor}
- Destaque: ${accentColor}

**Estilo Visual:**
- Tom: ${brandVoice}
- Emoção: ${desiredEmotion}
- Personalidade: Profissional, moderno, confiável

═══════════════════════════════════════════════════════════════════
📞 INFORMAÇÕES DE CONTATO
═══════════════════════════════════════════════════════════════════

**WhatsApp:** ${whatsappNumber}
**Email:** ${emailAddress}
**Localização:** ${companyLocation}
**Instagram:** ${instagram}

═══════════════════════════════════════════════════════════════════
🚀 INSTRUÇÕES PARA GERAÇÃO DO SITE
═══════════════════════════════════════════════════════════════════

## 🎯 Objetivo Principal
Criar um site ${siteType} de alta conversão para ${companyName}, focado em:
- ${siteObjective}
- Público-alvo: ${targetAudience}
- Diferenciais: ${differentials}

## 🎨 Especificações Técnicas

### Stack Recomendada
- **Frontend:** React 18 + TypeScript + Vite
- **Estilização:** Tailwind CSS + shadcn/ui
- **Formulários:** React Hook Form + Zod
- **Ícones:** Lucide React
- **Responsividade:** Mobile-first

### Estrutura de Páginas

#### SITE CORPORATIVO:
1. **Home (Hero)**
   - Headline impactante
   - Subheadline com proposta de valor
   - CTA principal para WhatsApp
   - Imagem/vídeo hero
   
2. **Sobre**
   - História da empresa
   - Missão e valores
   - Equipe (opcional)
   - Prova social

3. **Serviços**
   - Cards com serviços principais
   - Benefícios claros
   - CTAs secundários

4. **Diferenciais**
   - Grid com vantagens competitivas
   - Ícones ilustrativos
   - Prova social integrada

5. **Depoimentos**
   - Carrossel de testemunhos
   - Fotos dos clientes (placeholder)
   - Ratings visuais

6. **Contato**
   - Formulário de contato
   - Botão WhatsApp fixo
   - Mapa (opcional)
   - Redes sociais

### Elementos de Conversão

**CTAs Primários:**
- ${cta1}
- ${cta2}
- ${cta3}

**Integração WhatsApp:**
- Botão flutuante fixo no canto inferior direito
- Link direto: https://wa.me/55${whatsappNumber}
- Mensagem pré-preenchida: "Olá! Vim pelo site e gostaria de saber mais sobre..."

**Prova Social:**
- Exibir: ${socialProof}
- Usar badges, números, logos de clientes (placeholder)
- Seção de depoimentos destacada

### Design Guidelines

**Cores:**
```css
:root {
  --color-primary: ${primaryColor};
  --color-secondary: ${secondaryColor};
  --color-accent: ${accentColor};
  --color-text: #1a1a1a;
  --color-background: #ffffff;
}
```

**Tipografia:**
- Headings: Inter ou Poppins (bold)
- Body: Inter ou Open Sans (regular)
- Hierarquia clara: H1 > H2 > H3

**Espaçamento:**
- Seções: padding 80px vertical (desktop), 40px (mobile)
- Containers: max-width 1200px, padding lateral 20px
- Cards: gap 24px entre elementos

**Responsividade:**
- Breakpoints: 640px (sm), 768px (md), 1024px (lg), 1280px (xl)
- Layout: 1 coluna (mobile), 2-3 colunas (desktop)
- Menu: hamburger em mobile, horizontal em desktop

### Componentes Obrigatórios

1. **Header/Navbar**
   - Logo (placeholder ou texto)
   - Menu de navegação
   - Botão CTA destacado

2. **Hero Section**
   - Background: gradiente ou imagem
   - Headline: ${businessProposal}
   - CTA duplo: WhatsApp + Saiba Mais

3. **Cards de Serviços**
   - Ícone + Título + Descrição
   - Hover effects suaves
   - CTA em cada card

4. **Seção de Diferenciais**
   - Grid 2x2 ou 3 colunas
   - Ícones + títulos curtos
   - Texto explicativo

5. **Carrossel de Depoimentos**
   - Auto-play opcional
   - Foto + Nome + Depoimento
   - Controles de navegação

6. **Footer**
   - Informações de contato
   - Links importantes
   - Redes sociais
   - Copyright

### SEO e Performance

**Meta Tags:**
```html
<title>${companyName} - ${segment} em ${location}</title>
<meta name="description" content="${businessSummary}">
<meta name="keywords" content="${segment}, ${location}, ...">
```

**Open Graph:**
```html
<meta property="og:title" content="${companyName}">
<meta property="og:description" content="${businessProposal}">
<meta property="og:type" content="website">
```

**Performance:**
- Lazy loading de imagens
- Code splitting
- Minificação de CSS/JS
- Cache de assets

### Acessibilidade
- Contraste de cores WCAG AA
- Alt text em imagens
- Navegação por teclado
- Labels em formulários
- ARIA labels quando necessário

═══════════════════════════════════════════════════════════════════
✅ CHECKLIST FINAL
═══════════════════════════════════════════════════════════════════

Antes de considerar o site completo, verifique:

- [ ] Todas as seções implementadas (Home, Sobre, Serviços, etc.)
- [ ] Conteúdo REAL integrado (não lorem ipsum)
- [ ] WhatsApp funcionando em todos os CTAs
- [ ] Site 100% responsivo (mobile + desktop)
- [ ] Cores da marca aplicadas corretamente
- [ ] Formulário de contato funcional
- [ ] Performance otimizada (< 3s carregamento)
- [ ] SEO básico implementado
- [ ] Cross-browser compatível
- [ ] Acessibilidade básica (contraste, alt text)

═══════════════════════════════════════════════════════════════════
🎯 RESULTADO ESPERADO
═══════════════════════════════════════════════════════════════════

Um site profissional de alta conversão que:
✅ Comunica claramente a proposta de valor
✅ Estabelece autoridade e credibilidade
✅ Facilita o contato via WhatsApp
✅ Supera objeções do público-alvo
✅ Desperta ${desiredEmotion}
✅ Diferencia de concorrentes
✅ Converte visitantes em leads qualificados

**Mensagem de marca:** ${finalPromise}

═══════════════════════════════════════════════════════════════════
📊 FIM DO PROMPT - Gerado pelo Criador de Sites IA
═══════════════════════════════════════════════════════════════════
```

**Documento gerado em:** 2025-11-24
**Versão do sistema:** 3.2
**Status:** ✅ Produção validada
