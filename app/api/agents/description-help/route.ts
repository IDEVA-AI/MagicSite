import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { callAgent, parseJsonResponse, logGeneration } from "@/lib/openai"

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

    const userMessage = `Nome da empresa: ${businessName}
Segmento: ${segment}
Localização: ${location || "Não informado"}
Descrição atual: ${description || "Não fornecida"}`

    const { content, usage } = await callAgent({
      promptName: "description_help_v1",
      userMessage,
    })

    const parsed = parseJsonResponse(content)
    const generatedDescription = parsed.description || content

    await logGeneration({
      generationType: "description_help",
      status: "success",
      provider: "openai",
      model: "gpt-4o-mini",
      promptTokens: usage.prompt_tokens,
      completionTokens: usage.completion_tokens,
      totalTokens: usage.total_tokens,
      durationMs: Date.now() - startTime,
    })

    return NextResponse.json({ description: generatedDescription })
  } catch (err: any) {
    console.error("Error in description-help:", err)

    await logGeneration({
      generationType: "description_help",
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
      { error: "Não foi possível gerar a descrição. Tente novamente." },
      { status: 500 }
    )
  }
}
