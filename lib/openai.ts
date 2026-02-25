import OpenAI from "openai"
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js"

const FALLBACK_MODELS = [
  "google/gemini-3-flash-preview",
  "google/gemini-2.5-flash-preview",
  "meta-llama/llama-4-maverick",
]

const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "https://magicsite.com.br",
    "X-Title": "MagicSite",
  },
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
  model: string
  usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number }
}> {
  const prompt = await fetchAgentPrompt(promptName)

  // Normalize model: map legacy OpenAI models to fallback chain
  const isLegacyModel = ["gpt-5.1-mini", "gpt-4o-mini", "gpt-4o", "gpt-4", "gpt-3.5-turbo"].includes(prompt.model)
  const models = isLegacyModel
    ? FALLBACK_MODELS
    : [prompt.model, ...FALLBACK_MODELS.filter((m) => m !== prompt.model)]

  const errors: string[] = []

  // Try each model once (1 attempt per model)
  for (const model of models) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 20_000)
    try {
      const response = await openrouter.chat.completions.create(
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

      if (!content) {
        errors.push(`${model}: empty response`)
        continue
      }

      return { content, model, usage }
    } catch (err: unknown) {
      clearTimeout(timeout)
      const msg = err instanceof Error ? err.message : String(err)
      errors.push(`${model}: ${msg}`)
    }
  }

  throw new Error(`All models failed:\n${errors.join("\n")}`)
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
