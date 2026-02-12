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
    const { businessName, segment, segmentKey, customSegment, location, description, valueProposition } = body

    const resolvedSegment = segmentKey === "outro" ? (customSegment || segment) : segment

    if (!businessName) {
      return NextResponse.json({ error: "Nome do negócio é obrigatório." }, { status: 400 })
    }

    const userMessage = `Dados do negócio:
- Nome: ${businessName}
- Segmento: ${resolvedSegment}
- Localização: ${location || "Não informado"}
- Descrição: ${description || "Não fornecida"}
- Proposta de valor: ${valueProposition || "Não definida"}`

    const { content, usage } = await callAgent({
      promptName: "strategic_declaration_v1",
      userMessage,
    })

    const declaration = content.replace(/^["']|["']$/g, "").trim()

    await logGeneration({
      generationType: "strategic_declaration",
      status: "success",
      provider: "openai",
      model: "gpt-4o-mini",
      promptTokens: usage.prompt_tokens,
      completionTokens: usage.completion_tokens,
      totalTokens: usage.total_tokens,
      durationMs: Date.now() - startTime,
    })

    return NextResponse.json({ declaration })
  } catch (err: any) {
    console.error("Error in strategic-declaration:", err)

    await logGeneration({
      generationType: "strategic_declaration",
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
      { error: "Não foi possível gerar a declaração estratégica." },
      { status: 500 }
    )
  }
}
