import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { callAgent, parseJsonResponse, logGeneration } from "@/lib/openai"
import { checkAndDeductCredits, refundCredits, CREDIT_COSTS } from "@/lib/credits"

export async function POST(request: Request) {
  const startTime = Date.now()

  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Usuário não autenticado." }, { status: 401 })
    }

    const body = await request.json()
    const {
      businessName, segment, segmentKey, customSegment,
      location, description, valueProposition,
      detailedDescription, siteObjective
    } = body

    const resolvedSegment = segmentKey === "outro" ? (customSegment || segment) : segment

    if (!businessName) {
      return NextResponse.json({ error: "Nome do negócio é obrigatório." }, { status: 400 })
    }

    // Credit check
    const cost = CREDIT_COSTS["briefing"]
    const creditResult = await checkAndDeductCredits(
      user.id, cost, "briefing", "Geração de briefing estratégico"
    )
    if (!creditResult.success) {
      return NextResponse.json({ error: creditResult.error }, { status: 402 })
    }

    const userMessage = `Dados do negócio:
- Nome: ${businessName}
- Segmento: ${resolvedSegment}
- Localização: ${location || "Não informado"}
- Descrição: ${description || "Não fornecida"}
- Proposta de valor: ${valueProposition || "Não definida"}
- Descrição detalhada: ${detailedDescription || "Não fornecida"}
- Objetivo do site: ${siteObjective || "Não definido"}

IMPORTANTE: Gere um JSON com TODOS os 24 campos obrigatórios. Campos estratégicos (offering, differential, targetAudience, audienceChallenges, toneOfVoice, strategicObjective, finalPromise, commonObjections) devem ter 2-3 frases. Campos secundários (sector, averageTicket, ctaPrimary, ctaSecondary, ctaAlternative, primaryColor, secondaryColor, theme) podem ser curtos (1 frase ou valor direto). NÃO omita nenhum campo.`

    let content: string
    let model: string
    let usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number }

    try {
      const result = await callAgent({
        promptName: "briefing_v1",
        userMessage,
        maxTokensOverride: 3000,
      })
      content = result.content
      model = result.model
      usage = result.usage
    } catch (aiError) {
      await refundCredits(user.id, cost, "Reembolso: falha na geração de briefing")
      throw aiError
    }

    const briefing = parseJsonResponse(content)

    await logGeneration({
      generationType: "briefing",
      status: "success",
      provider: "openrouter",
      model,
      promptTokens: usage.prompt_tokens,
      completionTokens: usage.completion_tokens,
      totalTokens: usage.total_tokens,
      durationMs: Date.now() - startTime,
    })

    return NextResponse.json({ briefing })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error("Error in briefing:", err)

    await logGeneration({
      generationType: "briefing",
      status: "failed",
      provider: "openrouter",
      model: "google/gemini-3-flash-preview",
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      durationMs: Date.now() - startTime,
      errorMessage: message,
    })

    return NextResponse.json(
      { error: "Não foi possível gerar o briefing estratégico." },
      { status: 500 }
    )
  }
}
