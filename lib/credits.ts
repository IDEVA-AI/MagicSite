import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js"

function getAdminClient() {
  return createSupabaseAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

const INITIAL_FREE_CREDITS = 10

export const CREDIT_COSTS: Record<string, number> = {
  "description-help": 1,
  "value-proposition": 1,
  "strategic-declaration": 1,
  briefing: 2,
}

const TRANSACTION_TYPE_MAP: Record<string, string> = {
  "description-help": "debit_content",
  "value-proposition": "debit_content",
  "strategic-declaration": "debit_content",
  briefing: "debit_briefing",
}

export async function isFreeModeActive(): Promise<boolean> {
  const supabase = getAdminClient()
  const { data } = await supabase
    .from("platform_settings")
    .select("free_mode")
    .eq("id", 1)
    .single()
  return data?.free_mode === true
}

export async function checkAndDeductCredits(
  userId: string,
  amount: number,
  type: string,
  description: string,
  projectId?: string
): Promise<{ success: boolean; remaining: number; error?: string }> {
  const supabase = getAdminClient()

  // Skip credit deduction when free mode is active
  if (await isFreeModeActive()) {
    return { success: true, remaining: Infinity }
  }

  const maxRetries = 5

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    // Fetch current balance
    const { data: balance, error: fetchError } = await supabase
      .from("credits_balance")
      .select("total_credits, used_credits")
      .eq("user_id", userId)
      .single()

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        // Auto-create balance with free credits for new users
        const { error: insertError } = await supabase
          .from("credits_balance")
          .insert({ user_id: userId, total_credits: INITIAL_FREE_CREDITS, used_credits: 0 })
        if (insertError) {
          return { success: false, remaining: 0, error: "Erro ao criar saldo de créditos." }
        }
        // Retry with the newly created balance
        continue
      }
      return { success: false, remaining: 0, error: "Erro ao verificar créditos." }
    }

    const remaining = balance.total_credits - balance.used_credits
    if (remaining < amount) {
      return { success: false, remaining, error: "Créditos insuficientes." }
    }

    // Optimistic locking: only update if used_credits hasn't changed
    const { data: updated, error: updateError } = await supabase
      .from("credits_balance")
      .update({
        used_credits: balance.used_credits + amount,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("used_credits", balance.used_credits)
      .select("used_credits, total_credits")
      .single()

    if (updateError || !updated) {
      // Conflict: another request changed the balance. Retry after a randomized delay.
      if (attempt < maxRetries - 1) {
        await new Promise((r) => setTimeout(r, 150 + Math.random() * 300 * (attempt + 1)))
        continue
      }
      return { success: false, remaining, error: "Conflito ao deduzir créditos. Tente novamente." }
    }

    const newRemaining = updated.total_credits - updated.used_credits
    const transactionType = TRANSACTION_TYPE_MAP[type] || "debit_content"

    // Log to ledger (best-effort)
    try {
      await supabase.from("credits_ledger").insert({
        user_id: userId,
        transaction_type: transactionType,
        amount: -amount,
        balance_after: newRemaining,
        project_id: projectId || null,
        description,
      })
    } catch {
      // best-effort logging
    }

    return { success: true, remaining: newRemaining }
  }

  return { success: false, remaining: 0, error: "Conflito ao deduzir créditos. Tente novamente." }
}

export async function refundCredits(
  userId: string,
  amount: number,
  description: string,
  projectId?: string
): Promise<void> {
  const supabase = getAdminClient()

  const { data: balance } = await supabase
    .from("credits_balance")
    .select("used_credits, total_credits")
    .eq("user_id", userId)
    .single()

  if (!balance) return

  const newUsed = Math.max(0, balance.used_credits - amount)

  await supabase
    .from("credits_balance")
    .update({ used_credits: newUsed, updated_at: new Date().toISOString() })
    .eq("user_id", userId)

  const newRemaining = balance.total_credits - newUsed

  try {
    await supabase.from("credits_ledger").insert({
      user_id: userId,
      transaction_type: "refund",
      amount,
      balance_after: newRemaining,
      project_id: projectId || null,
      description,
    })
  } catch {
    // best-effort logging
  }
}
