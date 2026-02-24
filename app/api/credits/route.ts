import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js"

export async function GET() {
    const userClient = await createClient()
    const {
        data: { user },
        error: userError,
    } = await userClient.auth.getUser()

    if (userError || !user) {
        return NextResponse.json({ error: "Usuário não autenticado." }, { status: 401 })
    }

    const supabase = createSupabaseAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: { autoRefreshToken: false, persistSession: false },
        }
    )

    try {
        const { data: balance, error } = await supabase
            .from("credits_balance")
            .select("total_credits, used_credits, remaining_credits")
            .eq("user_id", user.id)
            .single()

        if (error) {
            if (error.code === "PGRST116") {
                // Auto-create balance with free credits for new users
                const INITIAL_FREE_CREDITS = 10
                const { data: newBalance, error: insertError } = await supabase
                    .from("credits_balance")
                    .insert({ user_id: user.id, total_credits: INITIAL_FREE_CREDITS, used_credits: 0 })
                    .select("total_credits, used_credits, remaining_credits")
                    .single()
                if (insertError) throw insertError
                return NextResponse.json(newBalance)
            }
            throw error
        }

        return NextResponse.json(balance)
    } catch (err: unknown) {
        console.error("Error fetching credits:", err)
        return NextResponse.json(
            { error: "Não foi possível buscar o saldo de créditos." },
            { status: 500 }
        )
    }
}
