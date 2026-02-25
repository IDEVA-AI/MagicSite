import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js"

export async function GET(request: NextRequest) {
    const userClient = await createClient()
    const {
        data: { user },
        error: userError,
    } = await userClient.auth.getUser()

    if (userError || !user) {
        return NextResponse.json({ error: "Usuário não autenticado." }, { status: 401 })
    }

    // Check if user is admin
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

    const searchParams = request.nextUrl.searchParams
    const q = searchParams.get("q")?.trim() || ""

    let query = supabase
        .from("alunos")
        .select("id, name, email, partnership_plan, created_at")
        .order("name", { ascending: true })

    if (q) {
        query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%`)
    }

    const { data: alunos, error } = await query

    if (error) {
        console.error("Error fetching alunos:", error)
        return NextResponse.json(
            { error: "Não foi possível buscar os alunos.", details: error.message },
            { status: 500 }
        )
    }

    return NextResponse.json(alunos)
}
