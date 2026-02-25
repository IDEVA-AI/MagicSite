import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return NextResponse.json({ error: "Não autorizado." }, { status: 401 })
    }

    const { id } = await params

    let body: Record<string, unknown>
    try {
        body = await request.json()
    } catch {
        return NextResponse.json({ error: "Body inválido." }, { status: 400 })
    }

    const allowedFields = [
        "project_name", "client_name", "segment", "phone",
        "value_cents", "status", "notes", "position", "project_id"
    ]
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }

    for (const field of allowedFields) {
        if (field in body) {
            updates[field] = body[field]
        }
    }

    const { data, error } = await supabase
        .from("deals")
        .update(updates)
        .eq("id", id)
        .select()
        .single()

    if (error) {
        console.error("Error updating deal:", error)
        return NextResponse.json(
            { error: "Não foi possível atualizar o negócio.", details: error.message },
            { status: 500 }
        )
    }

    return NextResponse.json(data)
}

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return NextResponse.json({ error: "Não autorizado." }, { status: 401 })
    }

    const { id } = await params

    const { error } = await supabase
        .from("deals")
        .delete()
        .eq("id", id)

    if (error) {
        console.error("Error deleting deal:", error)
        return NextResponse.json(
            { error: "Não foi possível remover o negócio.", details: error.message },
            { status: 500 }
        )
    }

    return NextResponse.json({ success: true })
}
