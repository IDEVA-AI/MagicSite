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
            // Se não existir saldo, retornar valores padrão
            if (error.code === "PGRST116") {
                return NextResponse.json({
                    total_credits: 0,
                    used_credits: 0,
                    remaining_credits: 0,
                })
            }
            throw error
        }

        return NextResponse.json(balance)
    } catch (err: any) {
        console.error("Error fetching credits:", err)
        return NextResponse.json(
            { error: "Não foi possível buscar o saldo de créditos." },
            { status: 500 }
        )
    }
}
