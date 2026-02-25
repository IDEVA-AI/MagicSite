import { NextResponse } from "next/server"
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js"
import { getPartnershipPlans } from "@/lib/partnership"

function getAdminClient() {
  return createSupabaseAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST(request: Request) {
  try {
    const { userId, planName } = await request.json()

    if (!userId || !planName) {
      return NextResponse.json(
        { success: false, error: "ID do usuário e nome do plano são obrigatórios" },
        { status: 400 }
      )
    }

    const supabase = getAdminClient()

    // Verify user exists
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .single()

    if (!profile) {
      return NextResponse.json(
        { success: false, error: "Usuário não encontrado" },
        { status: 400 }
      )
    }

    // Find selected plan
    const plans = await getPartnershipPlans()
    const selectedPlan = plans.find((p) => p.plan_name === planName)
    if (!selectedPlan) {
      return NextResponse.json(
        { success: false, error: "Plano não encontrado" },
        { status: 400 }
      )
    }

    // Update profile with partnership plan
    await supabase
      .from("profiles")
      .update({ partnership_plan: planName })
      .eq("id", userId)

    // Create credits balance
    const { error: creditsError } = await supabase
      .from("credits_balance")
      .insert({
        user_id: userId,
        total_credits: selectedPlan.credits_amount,
        used_credits: 0,
      })

    if (creditsError) {
      // May already exist — try updating instead
      await supabase
        .from("credits_balance")
        .update({
          total_credits: selectedPlan.credits_amount,
          used_credits: 0,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
    }

    // Log to ledger
    try {
      await supabase.from("credits_ledger").insert({
        user_id: userId,
        transaction_type: "bonus",
        amount: selectedPlan.credits_amount,
        balance_after: selectedPlan.credits_amount,
        description: `Plano parceria ${planName} ativado`,
      })
    } catch {
      // best-effort
    }

    return NextResponse.json({
      success: true,
      message: "Plano confirmado com sucesso",
      plan: selectedPlan,
    })
  } catch {
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
