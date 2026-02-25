import { NextRequest, NextResponse } from "next/server"
import { getAdminClient } from "@/utils/supabase/admin"

export async function GET(request: NextRequest) {
    const admin = await getAdminClient()
    if ("error" in admin) return admin.error
    const { supabase } = admin

    const searchParams = request.nextUrl.searchParams
    const q = searchParams.get("q")?.trim() || ""
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)))

    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = supabase
        .from("alunos")
        .select("id, name, email, partnership_plan, created_at", { count: "exact" })
        .order("name", { ascending: true })
        .range(from, to)

    if (q) {
        query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%`)
    }

    const { data, count, error } = await query

    if (error) {
        console.error("Error fetching alunos:", error)
        return NextResponse.json(
            { error: "Não foi possível buscar os alunos.", details: error.message },
            { status: 500 }
        )
    }

    return NextResponse.json({ data: data ?? [], total: count ?? 0, page, limit })
}

export async function POST(request: NextRequest) {
    const admin = await getAdminClient()
    if ("error" in admin) return admin.error
    const { supabase } = admin

    let body: { name?: string; email?: string; partnership_plan?: string }
    try {
        body = await request.json()
    } catch {
        return NextResponse.json({ error: "Body inválido." }, { status: 400 })
    }

    const { name, email, partnership_plan } = body

    if (!name?.trim()) {
        return NextResponse.json({ error: "Nome é obrigatório." }, { status: 400 })
    }
    if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json({ error: "Email inválido." }, { status: 400 })
    }

    const { data, error } = await supabase
        .from("alunos")
        .insert({ name: name.trim(), email: email.trim(), partnership_plan: partnership_plan?.trim() || null })
        .select()
        .single()

    if (error) {
        console.error("Error creating aluno:", error)
        return NextResponse.json(
            { error: "Não foi possível criar o aluno.", details: error.message },
            { status: 500 }
        )
    }

    return NextResponse.json(data, { status: 201 })
}
