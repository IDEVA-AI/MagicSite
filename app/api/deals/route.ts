import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET() {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return NextResponse.json({ error: "Não autorizado." }, { status: 401 })
    }

    const { data, error } = await supabase
        .from("deals")
        .select("*")
        .order("position", { ascending: true })
        .order("created_at", { ascending: true })

    if (error) {
        console.error("Error fetching deals:", error)
        return NextResponse.json(
            { error: "Não foi possível buscar os negócios.", details: error.message },
            { status: 500 }
        )
    }

    return NextResponse.json({ data: data ?? [] })
}

export async function POST(request: NextRequest) {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return NextResponse.json({ error: "Não autorizado." }, { status: 401 })
    }

    let body: {
        project_name?: string
        client_name?: string
        segment?: string
        phone?: string
        value_cents?: number
        status?: string
        notes?: string
        project_id?: string | null
    }
    try {
        body = await request.json()
    } catch {
        return NextResponse.json({ error: "Body inválido." }, { status: 400 })
    }

    if (!body.project_name?.trim()) {
        return NextResponse.json({ error: "Nome do projeto é obrigatório." }, { status: 400 })
    }

    const { data, error } = await supabase
        .from("deals")
        .insert({
            user_id: user.id,
            project_name: body.project_name.trim(),
            client_name: body.client_name?.trim() || null,
            segment: body.segment?.trim() || null,
            phone: body.phone?.trim() || null,
            value_cents: body.value_cents ?? 0,
            status: body.status || "lead",
            notes: body.notes?.trim() || null,
            project_id: body.project_id || null,
        })
        .select()
        .single()

    if (error) {
        console.error("Error creating deal:", error)
        return NextResponse.json(
            { error: "Não foi possível criar o negócio.", details: error.message },
            { status: 500 }
        )
    }

    return NextResponse.json(data, { status: 201 })
}
