import { NextRequest, NextResponse } from "next/server"
import { getAdminClient } from "@/utils/supabase/admin"

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const admin = await getAdminClient()
    if ("error" in admin) return admin.error
    const { supabase } = admin

    const { id } = await params

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
        .update({ name: name.trim(), email: email.trim(), partnership_plan: partnership_plan?.trim() || null })
        .eq("id", parseInt(id, 10))
        .select()
        .single()

    if (error) {
        console.error("Error updating aluno:", error)
        return NextResponse.json(
            { error: "Não foi possível atualizar o aluno.", details: error.message },
            { status: 500 }
        )
    }

    return NextResponse.json(data)
}

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const admin = await getAdminClient()
    if ("error" in admin) return admin.error
    const { supabase } = admin

    const { id } = await params

    const { error } = await supabase
        .from("alunos")
        .delete()
        .eq("id", parseInt(id, 10))

    if (error) {
        console.error("Error deleting aluno:", error)
        return NextResponse.json(
            { error: "Não foi possível remover o aluno.", details: error.message },
            { status: 500 }
        )
    }

    return NextResponse.json({ success: true })
}
