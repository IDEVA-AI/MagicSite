import OpenAI from "openai"
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

function getAdminClient() {
  return createSupabaseAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

interface AgentPrompt {
  system_prompt: string
  model: string
  temperature: number
  max_tokens: number
}

export async function fetchAgentPrompt(name: string): Promise<AgentPrompt> {
  const supabase = getAdminClient()
  const { data, error } = await supabase
    .from("agent_prompts")
    .select("system_prompt, model, temperature, max_tokens")
    .eq("name", name)
    .single()

  if (error || !data) {
    throw new Error(`Agent prompt "${name}" not found: ${error?.message}`)
  }

  return data
}

interface CallAgentOptions {
  promptName: string
  userMessage: string
  maxTokensOverride?: number
}

export async function callAgent({ promptName, userMessage, maxTokensOverride }: CallAgentOptions): Promise<{
  content: string
  usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number }
}> {
  const prompt = await fetchAgentPrompt(promptName)

  // Normalize model name (fix typos like gpt-5.1-mini)
  const model = prompt.model === "gpt-5.1-mini" ? "gpt-4o-mini" : prompt.model

  const startTime = Date.now()
  let lastError: Error | null = null

  // Retry with backoff (up to 2 retries)
  for (let attempt = 0; attempt <= 2; attempt++) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30_000)
    try {
      const response = await openai.chat.completions.create(
        {
          model,
          temperature: prompt.temperature,
          max_tokens: maxTokensOverride ?? prompt.max_tokens,
          messages: [
            { role: "system", content: prompt.system_prompt },
            { role: "user", content: userMessage },
          ],
        },
        { signal: controller.signal },
      )

      clearTimeout(timeout)
      const content = response.choices[0]?.message?.content?.trim() || ""
      const usage = response.usage ?? { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }

      return { content, usage }
    } catch (err: any) {
      clearTimeout(timeout)
      lastError = err
      if (attempt < 2) {
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)))
      }
    }
  }

  throw lastError ?? new Error("Failed to call agent after retries")
}

export function parseJsonResponse(content: string): any {
  // Try direct parse first
  try {
    return JSON.parse(content)
  } catch {
    // Try extracting JSON from markdown code blocks
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1].trim())
    }
    // Try finding JSON object in the content
    const objectMatch = content.match(/\{[\s\S]*\}/)
    if (objectMatch) {
      return JSON.parse(objectMatch[0])
    }
    throw new Error("Could not parse JSON from response")
  }
}

export async function logGeneration(params: {
  generationType: string
  status: "success" | "failed"
  provider: string
  model: string
  promptTokens: number
  completionTokens: number
  totalTokens: number
  durationMs: number
  errorMessage?: string
}) {
  try {
    const supabase = getAdminClient()
    await supabase.from("ai_generation_logs").insert({
      generation_type: params.generationType,
      status: params.status,
      ai_provider: params.provider,
      model: params.model,
      prompt_tokens: params.promptTokens,
      completion_tokens: params.completionTokens,
      total_tokens: params.totalTokens,
      duration_ms: params.durationMs,
      error_message: params.errorMessage || null,
    })
  } catch (err) {
    console.error("Failed to log generation:", err)
  }
}
