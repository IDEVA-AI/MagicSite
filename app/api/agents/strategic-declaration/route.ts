import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { callAgent, logGeneration } from "@/lib/openai"
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
    const { businessName, segment, segmentKey, customSegment, location, description, valueProposition } = body

    const resolvedSegment = segmentKey === "outro" ? (customSegment || segment) : segment

    if (!businessName) {
      return NextResponse.json({ error: "Nome do negócio é obrigatório." }, { status: 400 })
    }

    // Credit check
    const cost = CREDIT_COSTS["strategic-declaration"]
    const creditResult = await checkAndDeductCredits(
      user.id, cost, "strategic-declaration", "Geração de declaração estratégica"
    )
    if (!creditResult.success) {
      return NextResponse.json({ error: creditResult.error }, { status: 402 })
    }

    const userMessage = `Dados do negócio:
- Nome: ${businessName}
- Segmento: ${resolvedSegment}
- Localização: ${location || "Não informado"}
- Descrição: ${description || "Não fornecida"}
- Proposta de valor: ${valueProposition || "Não definida"}`

    let content: string
    let model: string
    let usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number }

    try {
      const result = await callAgent({
        promptName: "strategic_declaration_v1",
        userMessage,
      })
      content = result.content
      model = result.model
      usage = result.usage
    } catch (aiError) {
      await refundCredits(user.id, cost, "Reembolso: falha na declaração estratégica")
      throw aiError
    }

    const declaration = content.replace(/^["']|["']$/g, "").trim()

    await logGeneration({
      generationType: "strategic_declaration",
      status: "success",
      provider: "openrouter",
      model,
      promptTokens: usage.prompt_tokens,
      completionTokens: usage.completion_tokens,
      totalTokens: usage.total_tokens,
      durationMs: Date.now() - startTime,
    })

    return NextResponse.json({ declaration })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error("Error in strategic-declaration:", err)

    await logGeneration({
      generationType: "strategic_declaration",
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
      { error: "Não foi possível gerar a declaração estratégica." },
      { status: 500 }
    )
  }
}
