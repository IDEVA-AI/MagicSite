import { NextResponse } from "next/server"
import OpenAI from "openai"
import { z } from "zod"
import { createClient } from "@/utils/supabase/server"
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js"

const schema = z.object({
  businessName: z.string().min(2),
  segment: z.string().min(2),
  segmentKey: z.string().optional(),
  customSegment: z.string().optional(),
  location: z.string().min(2),
  siteType: z.string().min(2),
  description: z.string().optional(),
})

const CREDIT_COST = 5

const SYSTEM_PROMPT = `Você é um consultor de negócios que gera 4 variáveis em português para sites brasileiros:
- businessSummary (60-100 palavras)
- businessProposal (1 frase no formato "Eu ajudo [Público] que sofrem com [Problema] a [Solução] para que possam [Benefício], sem que [Objeção].")
- businessDescription (120-160 palavras)
- siteObjectives (60-100 palavras)

Regras:
- Use somente os dados fornecidos; não invente números ou provas sociais.
- Ajuste tom ao tipo de site (corporativo/servicos/curso_online).
- Responda APENAS com um JSON válido, sem texto extra.`

function buildUserPrompt(input: z.infer<typeof schema>, resolvedSegment: string) {
  return `Dados do negócio:
- Nome: ${input.businessName}
- Segmento: ${resolvedSegment}
- Localização: ${input.location}
- Tipo de site: ${input.siteType}
- Descrição fornecida: ${input.description || "não informado"}`
}

function safeParseJson(text: string | null) {
  if (!text) return null
  const cleaned = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim()
  try {
    return JSON.parse(cleaned)
  } catch {
    return null
  }
}

function buildFallback(input: z.infer<typeof schema>, resolvedSegment: string) {
  const summary = `${input.businessName} é um negócio de ${resolvedSegment} localizado em ${input.location}. Atuamos com foco em entregar valor prático aos clientes, alinhando atendimento próximo com soluções personalizadas.`

  const proposal = `Eu ajudo pessoas e empresas de ${resolvedSegment} que sofrem com falta de resultados a conquistar objetivos claros com acompanhamento especializado, para que possam evoluir com segurança, sem desperdício de tempo e recursos.`

  const description = `${input.businessName} atua em ${resolvedSegment} e oferece soluções adaptadas às necessidades de ${input.location}. Nosso foco é entender os desafios dos clientes e entregar respostas rápidas, combinando conhecimento técnico e comunicação transparente. Priorizamos eficiência, experiência do usuário e suporte próximo, para que cada cliente tenha clareza sobre o caminho e os próximos passos.`

  const objectives = `1) Apresentar a proposta de valor de ${input.businessName} em ${resolvedSegment} com clareza e confiança. 2) Facilitar o contato direto por WhatsApp e formulários simples. 3) Exibir serviços e diferenciais com provas sociais e chamadas para ação objetivas.`

  return {
    businessSummary: summary,
    businessProposal: proposal,
    businessDescription: description,
    siteObjectives: objectives,
    generationSource: "fallback_template",
  }
}

async function debitCredits(supabase: any, userId: string): Promise<void> {
  // Garantir que o saldo exista
  const { data: existingBalance } = await supabase
    .from("credits_balance")
    .select("total_credits, used_credits, remaining_credits")
    .eq("user_id", userId)
    .single()

  if (!existingBalance) {
    const { data: createdBalance, error: createError } = await supabase
      .from("credits_balance")
      .insert({ user_id: userId, total_credits: 200, used_credits: 0 })
      .select("total_credits, used_credits, remaining_credits")
      .single()

    if (createError) throw createError
    return debitCredits(supabase, userId)
  }

  if (existingBalance.remaining_credits < CREDIT_COST) {
    throw new Error("Saldo insuficiente para gerar os dados básicos (necessários 5 créditos).")
  }

  const { data: updatedBalance, error: debitError } = await supabase
    .from("credits_balance")
    .update({ used_credits: existingBalance.used_credits + CREDIT_COST })
    .eq("user_id", userId)
    .select("remaining_credits, used_credits")
    .single()

  if (debitError) throw debitError

  const { error: ledgerError } = await supabase.from("credits_ledger").insert({
    user_id: userId,
    transaction_type: "debit_project",
    amount: -CREDIT_COST,
    balance_after: updatedBalance.remaining_credits,
    description: "Etapa 1 - geração de dados básicos",
  })

  if (ledgerError) throw ledgerError

  return updatedBalance.remaining_credits
}

async function refundCredits(supabase: any, userId: string, reason: string) {
  const { data: balance } = await supabase
    .from("credits_balance")
    .select("used_credits, remaining_credits")
    .eq("user_id", userId)
    .single()

  if (!balance) return

  const newUsed = Math.max(0, (balance.used_credits ?? 0) - CREDIT_COST)
  const { data: updated } = await supabase
    .from("credits_balance")
    .update({ used_credits: newUsed })
    .eq("user_id", userId)
    .select("remaining_credits")
    .single()

  const { error: ledgerError } = await supabase.from("credits_ledger").insert({
    user_id: userId,
    transaction_type: "refund",
    amount: CREDIT_COST,
    balance_after: updated?.remaining_credits ?? balance.remaining_credits + CREDIT_COST,
    description: `Estorno - ${reason}`,
  })

  if (ledgerError) {
    console.error("Ledger refund error", ledgerError)
  }
}

export async function POST(req: Request) {
  const userClient = await createClient()
  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: "Usuário não autenticado." }, { status: 401 })
  }

  const supabase = createSupabaseAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  let parsed: z.infer<typeof schema>
  try {
    parsed = schema.parse(await req.json())
  } catch (err) {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 })
  }

  const trimmed = {
    ...parsed,
    businessName: parsed.businessName.trim(),
    segment: parsed.segment.trim(),
    customSegment: (parsed.customSegment || "").trim(),
    location: parsed.location.trim(),
    siteType: parsed.siteType.trim(),
    description: (parsed.description || "").trim(),
  }

  const resolvedSegment =
    (trimmed.segmentKey === "outro" ? trimmed.customSegment || trimmed.segment : trimmed.segment) ||
    trimmed.customSegment ||
    trimmed.segment

  // Debitar créditos
  try {
    await debitCredits(supabase, user.id)
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Não foi possível debitar créditos." }, { status: 402 })
  }

  const model = process.env.OPENAI_MODEL || "gpt-4o-mini"
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const userPrompt = buildUserPrompt(trimmed, resolvedSegment)
  const startedAt = Date.now()

  let result:
    | {
        businessSummary: string
        businessProposal: string
        businessDescription: string
        siteObjectives: string
        generationSource: "ai_openai" | "fallback_template"
      }
    | null = null

  try {
    const completion = await openai.chat.completions.create({
      model,
      temperature: 0.65,
      max_tokens: 800,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    })

    const messageContent = completion.choices[0]?.message?.content || ""
    const parsedJson = safeParseJson(messageContent)

    if (!parsedJson) {
      throw new Error("A resposta do modelo não retornou JSON válido.")
    }

    result = {
      businessSummary: parsedJson.businessSummary,
      businessProposal: parsedJson.businessProposal,
      businessDescription: parsedJson.businessDescription,
      siteObjectives: parsedJson.siteObjectives,
      generationSource: "ai_openai",
    }

    await supabase.from("ai_generation_logs").insert({
      generation_type: "briefing",
      status: "success",
      ai_provider: "openai",
      model,
      prompt_tokens: completion.usage?.prompt_tokens ?? null,
      completion_tokens: completion.usage?.completion_tokens ?? null,
      total_tokens: completion.usage?.total_tokens ?? null,
      temperature: 0.65,
      duration_ms: Date.now() - startedAt,
    })
  } catch (err: any) {
    console.error("OpenAI generation error", err)
    const fallback = buildFallback(trimmed, resolvedSegment)
    result = fallback as typeof result

    await supabase.from("ai_generation_logs").insert({
      generation_type: "briefing",
      status: "success",
      ai_provider: fallback.generationSource,
      model,
      error_message: err?.message || "Erro na geração; usado fallback.",
      duration_ms: Date.now() - startedAt,
    })
  }

  if (!result) {
    await refundCredits(supabase, user.id, "erro na geração de dados básicos")
    return NextResponse.json({ error: "Não foi possível gerar os dados básicos. Tente novamente." }, { status: 500 })
  }

  return NextResponse.json(result)
}
