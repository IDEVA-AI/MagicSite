import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { callAgent, parseJsonResponse, logGeneration } from "@/lib/openai"
import { checkAndDeductCredits, refundCredits, CREDIT_COSTS } from "@/lib/credits"

export async function POST(request: Request) {
  const startTime = Date.now()

  try {
    // Auth check
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Usuário não autenticado." }, { status: 401 })
    }

    const body = await request.json()
    const { businessName, segment, location, description } = body

    if (!businessName || !segment) {
      return NextResponse.json({ error: "Nome do negócio e segmento são obrigatórios." }, { status: 400 })
    }

    // Credit check
    const cost = CREDIT_COSTS["description-help"]
    const creditResult = await checkAndDeductCredits(
      user.id, cost, "description-help", "Ajuda IA na descrição do negócio"
    )
    if (!creditResult.success) {
      return NextResponse.json({ error: creditResult.error }, { status: 402 })
    }

    const userMessage = `Nome da empresa: ${businessName}
Segmento: ${segment}
Localização: ${location || "Não informado"}
Descrição atual: ${description || "Não fornecida"}`

    let content: string
    let model: string
    let usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number }

    try {
      const result = await callAgent({
        promptName: "description_help_v1",
        userMessage,
      })
      content = result.content
      model = result.model
      usage = result.usage
    } catch (aiError) {
      // Refund credits if AI fails
      await refundCredits(user.id, cost, "Reembolso: falha na ajuda de descrição")
      throw aiError
    }

    const parsed = parseJsonResponse(content)
    const generatedDescription = parsed.description || content

    await logGeneration({
      generationType: "description_help",
      status: "success",
      provider: "openrouter",
      model,
      promptTokens: usage.prompt_tokens,
      completionTokens: usage.completion_tokens,
      totalTokens: usage.total_tokens,
      durationMs: Date.now() - startTime,
    })

    return NextResponse.json({ description: generatedDescription })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error("Error in description-help:", err)

    await logGeneration({
      generationType: "description_help",
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
      { error: "Não foi possível gerar a descrição. Tente novamente." },
      { status: 500 }
    )
  }
}
