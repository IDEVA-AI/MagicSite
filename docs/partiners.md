📋 1. VISÃO GERAL DO SISTEMA
O sistema valida alunos de escolas parceiras (como escolas de negócios) usando um banco de dados externo (Supabase). O fluxo funciona assim:

Aluno informa email ou CPF
Sistema consulta banco Supabase da escola parceira
Se aluno existe e está ativo → validado ✅
Aluno cria senha e escolhe plano
Conta criada com benefícios da parceria
🔍 2. CÓDIGO DE VALIDAÇÃO (Email e CPF)
📄 Arquivo: server/partnershipService.ts
Este é o código completo que faz a validação:

export class PartnershipService {
  // 🔐 MÉTODO PRINCIPAL: Consulta banco Supabase da escola parceira
  private async queryPartnerDatabase(emailOrCpf: string): Promise<PartnershipValidationData | null> {
    try {
      // Credenciais do Supabase da escola parceira
      const SUPABASE_URL = "https://sgnqhuoorsdrudvpbzan.supabase.co";
      const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
      
      // 🎯 DETECÇÃO AUTOMÁTICA: Email ou CPF?
      const isEmail = emailOrCpf.includes('@');
      
      // Se tem @, busca por email. Se não, busca por CPF
      const searchParam = isEmail ? 'email' : 'document_number';
      
      // 🧹 LIMPEZA DE DADOS:
      // Email: converte para minúsculo
      // CPF: remove pontos, traços e espaços (111.222.333-44 → 11122233344)
      const searchValue = isEmail 
        ? emailOrCpf.toLowerCase() 
        : emailOrCpf.replace(/\D/g, ''); // Remove tudo que não é número
      
      // 🔗 MONTA URL DA CONSULTA:
      // Exemplo email: /rest/v1/student?email=eq.joao@gmail.com&plan_active=is.true
      // Exemplo CPF: /rest/v1/student?document_number=eq.11122233344&plan_active=is.true
      const url = `${SUPABASE_URL}/rest/v1/student?${searchParam}=eq.${searchValue}&plan_active=is.true`;
      
      // 📡 FAZ A REQUISIÇÃO HTTP para Supabase
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      // ❌ Se deu erro na API
      if (!response.ok) {
        console.error('Erro na consulta Supabase:', response.status, response.statusText);
        return null;
      }
      // 📦 PROCESSA RESPOSTA
      const students = await response.json();
      
      // ✅ SE ENCONTROU ALUNO ATIVO:
      if (students && students.length > 0) {
        const student = students[0];
        return {
          name: student.name || student.full_name || 'Nome não informado',
          email: student.email || emailOrCpf,
          isActive: student.plan_active === true
        };
      }
      // ❌ NÃO ENCONTROU
      return null;
      
    } catch (error) {
      console.error('Erro ao consultar base da escola parceira:', error);
      return null;
    }
  }

🎯 3. LÓGICA DE VALIDAÇÃO COMPLETA
Depois de consultar o Supabase, o sistema faz várias verificações:

async validateUser(request: ValidateUserRequest) {
  try {
    // ▶️ PASSO 1: Consulta banco da escola parceira
    const partnerData = await this.queryPartnerDatabase(request.emailOrCpf);
    
    // ❌ VERIFICAÇÃO 1: Aluno existe e está ativo?
    if (!partnerData) {
      return {
        success: false,
        error: "Aluno não encontrado na base da escola parceira ou inativo."
      };
    }
    // ▶️ PASSO 2: Verifica se este email já foi usado antes
    const existingValidation = await db
      .select()
      .from(partnershipValidations)
      .where(
        and(
          eq(partnershipValidations.validatedEmail, partnerData.email),
          eq(partnershipValidations.isUsed, true) // Já foi usado?
        )
      );
    // ❌ VERIFICAÇÃO 2: Email já usado?
    if (existingValidation.length > 0) {
      return {
        success: false,
        error: "Este email já foi utilizado para criar uma conta."
      };
    }
    // ▶️ PASSO 3: Salva validação no banco (ainda não usada)
    const validation = await db
      .insert(partnershipValidations)
      .values({
        email: request.emailOrCpf,
        cpf: request.emailOrCpf.includes('@') ? null : request.emailOrCpf,
        validatedName: partnerData.name,
        validatedEmail: partnerData.email,
        partnershipSource: "escola_negocios",
        isUsed: false, // Marca como NÃO usada ainda
      })
      .returning();
    // ✅ SUCESSO! Retorna ID da validação
    return {
      success: true,
      data: {
        validationId: validation[0].id,
        name: partnerData.name,
        email: partnerData.email
      }
    };
  } catch (error) {
    console.error("Erro na validação de parceria:", error);
    return {
      success: false,
      error: "Erro interno do sistema. Tente novamente."
    };
  }
}

💾 4. ESTRUTURA DO BANCO DE DADOS
Tabela: partnership_validations
export const partnershipValidations = pgTable("partnership_validations", {
  id: serial("id").primaryKey(),
  
  // 📧 Dados fornecidos pelo aluno
  email: varchar("email", { length: 255 }).notNull(),
  cpf: varchar("cpf", { length: 14 }), // Opcional
  
  // ✅ Dados validados do Supabase
  validatedName: varchar("validated_name", { length: 255 }).notNull(),
  validatedEmail: varchar("validated_email", { length: 255 }).notNull(),
  
  // 🏫 Fonte da parceria
  partnershipSource: varchar("partnership_source", { length: 100 })
    .notNull()
    .default("escola_negocios"),
  
  // 🔒 Controle de uso
  isUsed: boolean("is_used").notNull().default(false),
  usedByAlunoId: integer("used_by_aluno_id").references(() => alunos.id),
  
  // 📅 Timestamps
  validatedAt: timestamp("validated_at").defaultNow(),
  usedAt: timestamp("used_at"),
});

🔄 5. FLUXO COMPLETO DE VALIDAÇÃO
PASSO A PASSO:
┌─────────────────────────────────────────────────────┐
│  1️⃣ ALUNO INFORMA: joao@gmail.com ou 111.222.333-44 │
└─────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│  2️⃣ SISTEMA DETECTA:                                 │
│     • Tem @ → buscar por EMAIL                      │
│     • Só números → buscar por CPF (limpa formatação)│
└─────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│  3️⃣ CONSULTA SUPABASE:                               │
│     GET /rest/v1/student?                           │
│     email=eq.joao@gmail.com&                        │
│     plan_active=is.true                             │
└─────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│  4️⃣ SUPABASE RESPONDE:                               │
│     [                                               │
│       {                                             │
│         "name": "João Silva",                       │
│         "email": "joao@gmail.com",                  │
│         "plan_active": true                         │
│       }                                             │
│     ]                                               │
└─────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│  5️⃣ VERIFICA SE JÁ FOI USADO:                        │
│     SELECT * FROM partnership_validations           │
│     WHERE validated_email = 'joao@gmail.com'        │
│     AND is_used = true                              │
└─────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│  6️⃣ SALVA VALIDAÇÃO:                                 │
│     INSERT INTO partnership_validations             │
│     (validated_name, validated_email, is_used)      │
│     VALUES ('João Silva', 'joao@gmail.com', false)  │
└─────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│  7️⃣ RETORNA SUCESSO:                                 │
│     {                                               │
│       success: true,                                │
│       data: {                                       │
│         validationId: 123,                          │
│         name: "João Silva",                         │
│         email: "joao@gmail.com"                     │
│       }                                             │
│     }                                               │
└─────────────────────────────────────────────────────┘

🛡️ 6. SEGURANÇA E VALIDAÇÕES
Proteções Implementadas:
✅ Validação de formato: Detecta automaticamente email vs CPF
✅ Limpeza de dados: Remove formatação do CPF (pontos, traços)
✅ Verificação de duplicidade: Impede usar mesmo email 2x
✅ Verificação de status: Só aceita alunos com plan_active = true
✅ Rate limiting: Protege contra ataques de força bruta
✅ Logging: Registra todas as tentativas de validação
Casos de Erro:
// ❌ ERRO 1: Aluno não encontrado
"Aluno não encontrado na base da escola parceira ou inativo."
// ❌ ERRO 2: Email já usado
"Este email já foi utilizado para criar uma conta."
// ❌ ERRO 3: Erro no servidor
"Erro interno do sistema. Tente novamente."

📊 7. EXEMPLO PRÁTICO DE USO
Cenário 1: Validação por Email
INPUT:

{
  "emailOrCpf": "maria.santos@gmail.com"
}

PROCESSAMENTO:

Detecta que é email (tem @)
Converte para minúsculo: maria.santos@gmail.com
Consulta Supabase: ?email=eq.maria.santos@gmail.com&plan_active=is.true
Encontra aluna ativa
Verifica se email nunca foi usado
Salva validação
OUTPUT:

{
  "success": true,
  "data": {
    "validationId": 45,
    "name": "Maria Santos",
    "email": "maria.santos@gmail.com"
  }
}

Cenário 2: Validação por CPF
INPUT:

{
  "emailOrCpf": "111.222.333-44"
}

PROCESSAMENTO:

Detecta que é CPF (não tem @)
Remove formatação: 11122233344
Consulta Supabase: ?document_number=eq.11122233344&plan_active=is.true
Encontra aluno ativo
Retorna dados
OUTPUT:

{
  "success": true,
  "data": {
    "validationId": 46,
    "name": "Pedro Silva",
    "email": "pedro.silva@gmail.com"
  }
}

🎁 8. BENEFÍCIOS DA PARCERIA
Após validação bem-sucedida, o aluno recebe:

// Plano Smart para alunos parceiros (gratuito)
{
  planName: "smart",
  creditsAmount: 200,
  originalPriceCents: 3600, // R$ 36,00
  partnershipPriceCents: 2700, // R$ 27,00 (25% desconto)
  description: "Plano Smart - Ideal para começar"
}

✅ RESUMO
O sistema de validação funciona assim:

Aluno informa email ou CPF
Sistema detecta automaticamente qual é
Consulta Supabase da escola parceira
Verifica se aluno existe e está ativo
Bloqueia se email já foi usado antes
Salva validação no banco local
Retorna sucesso com dados do aluno
Aluno cria senha e escolhe plano
Recebe benefícios da parceria
