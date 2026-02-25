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

    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

    if (profileError || profile?.role !== "admin") {
        return NextResponse.json({ error: "Acesso negado." }, { status: 403 })
    }

    try {
        const [alunosRes, projectsRes, creditsRes] = await Promise.all([
            supabase.from("alunos").select("*", { head: true, count: "exact" }),
            supabase.from("projects").select("*", { head: true, count: "exact" }),
            supabase.from("credits_balance").select("total_credits, used_credits, remaining_credits"),
        ])

        if (alunosRes.error) throw alunosRes.error
        if (projectsRes.error) throw projectsRes.error
        if (creditsRes.error) throw creditsRes.error

        const credits = creditsRes.data || []
        const total_credits = credits.reduce((sum, r) => sum + (r.total_credits || 0), 0)
        const used_credits = credits.reduce((sum, r) => sum + (r.used_credits || 0), 0)
        const remaining_credits = credits.reduce((sum, r) => sum + (r.remaining_credits || 0), 0)

        return NextResponse.json({
            total_alunos: alunosRes.count ?? 0,
            total_projects: projectsRes.count ?? 0,
            total_credits,
            used_credits,
            remaining_credits,
        })
    } catch (err: unknown) {
        console.error("Error fetching admin stats:", err)
        return NextResponse.json(
            { error: "Não foi possível buscar as estatísticas." },
            { status: 500 }
        )
    }
}
