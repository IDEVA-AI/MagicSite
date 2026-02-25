import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js"

export async function getAdminClient() {
    const userClient = await createClient()
    const {
        data: { user },
        error: userError,
    } = await userClient.auth.getUser()

    if (userError || !user) {
        return {
            error: NextResponse.json({ error: "Usuário não autenticado." }, { status: 401 }),
        } as const
    }

    const supabase = createSupabaseAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: { autoRefreshToken: false, persistSession: false },
        }
    )

    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

    if (profileError || profile?.role !== "admin") {
        return {
            error: NextResponse.json({ error: "Acesso negado." }, { status: 403 }),
        } as const
    }

    return { supabase, user } as const
}
