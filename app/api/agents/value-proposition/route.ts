import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { callAgent, logGeneration } from "@/lib/openai"

export async function POST(request: Request) {
  const startTime = Date.now()

  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Usuário não autenticado." }, { status: 401 })
    }

    const body = await request.json()
    const { businessName, segment, segmentKey, customSegment, location, description } = body

    const resolvedSegment = segmentKey === "outro" ? (customSegment || segment) : segment

    if (!businessName) {
      return NextResponse.json({ error: "Nome do negócio é obrigatório." }, { status: 400 })
    }

    const userMessage = `Meu negócio é ${businessName}, do segmento de ${resolvedSegment}, localizado em ${location || "não informado"}. ${description || ""}`

    const { content, usage } = await callAgent({
      promptName: "value_proposition_v1",
      userMessage,
    })

    // The response should be a single sentence - use it directly
    const valueProposition = content.replace(/^["']|["']$/g, "").trim()

    await logGeneration({
      generationType: "value_proposition",
      status: "success",
      provider: "openai",
      model: "gpt-4o-mini",
      promptTokens: usage.prompt_tokens,
      completionTokens: usage.completion_tokens,
      totalTokens: usage.total_tokens,
      durationMs: Date.now() - startTime,
    })

    return NextResponse.json({ valueProposition })
  } catch (err: any) {
    console.error("Error in value-proposition:", err)

    await logGeneration({
      generationType: "value_proposition",
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
      { error: "Não foi possível gerar a proposta de valor." },
      { status: 500 }
    )
  }
}
