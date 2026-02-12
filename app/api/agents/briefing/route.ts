import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { callAgent, parseJsonResponse, logGeneration } from "@/lib/openai"

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

    const userMessage = `Dados completos do negócio para geração do briefing estratégico:

Nome da Empresa: ${businessName}
Segmento: ${resolvedSegment}
Localização: ${location || "Não informado"}
Descrição do negócio: ${description || "Não fornecida"}
Proposta de valor: ${valueProposition || "Não definida"}
Descrição detalhada: ${detailedDescription || "Não fornecida"}
Objetivo do site: ${siteObjective || "Não definido"}

Gere o JSON com as 21 variáveis estratégicas personalizadas para este negócio específico. Cada campo deve ter conteúdo rico e contextualizado (2-4 frases), não genérico.`

    const { content, usage } = await callAgent({
      promptName: "briefing_v1",
      userMessage,
      maxTokensOverride: 1500,
    })

    const briefing = parseJsonResponse(content)

    await logGeneration({
      generationType: "briefing",
      status: "success",
      provider: "openai",
      model: "gpt-4o-mini",
      promptTokens: usage.prompt_tokens,
      completionTokens: usage.completion_tokens,
      totalTokens: usage.total_tokens,
      durationMs: Date.now() - startTime,
    })

    return NextResponse.json({ briefing })
  } catch (err: any) {
    console.error("Error in briefing:", err)

    await logGeneration({
      generationType: "briefing",
      status: "failed",
      provider: "openai",
      model: "gpt-4o-mini",
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      durationMs: Date.now() - startTime,
      errorMessage: err?.message,
    })

    return NextResponse.json(
      { error: "Não foi possível gerar o briefing estratégico." },
      { status: 500 }
    )
  }
}
