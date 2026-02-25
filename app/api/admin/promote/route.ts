import { NextRequest, NextResponse } from "next/server"
import { getAdminClient } from "@/utils/supabase/admin"

export async function POST(request: NextRequest) {
    const admin = await getAdminClient()
    if ("error" in admin) return admin.error
    const { supabase } = admin

    let body: { email?: string; role?: string }
    try {
        body = await request.json()
    } catch {
        return NextResponse.json({ error: "Body inválido." }, { status: 400 })
    }

    const { email, role } = body

    if (!email?.trim()) {
        return NextResponse.json({ error: "Email é obrigatório." }, { status: 400 })
    }
    if (role !== "admin" && role !== "user") {
        return NextResponse.json({ error: "Role deve ser 'admin' ou 'user'." }, { status: 400 })
    }

    // Find auth user by email
    const { data: usersData, error: listError } = await supabase.auth.admin.listUsers()

    if (listError) {
        console.error("Error listing users:", listError)
        return NextResponse.json({ error: "Erro ao buscar usuários." }, { status: 500 })
    }

    const targetUser = usersData.users.find(
        (u) => u.email?.toLowerCase() === email.trim().toLowerCase()
    )

    if (!targetUser) {
        return NextResponse.json({ error: "Usuário não encontrado com esse email." }, { status: 404 })
    }

    const { error: updateError } = await supabase
        .from("profiles")
        .update({ role })
        .eq("id", targetUser.id)

    if (updateError) {
        console.error("Error updating role:", updateError)
        return NextResponse.json(
            { error: "Não foi possível atualizar o role.", details: updateError.message },
            { status: 500 }
        )
    }

    return NextResponse.json({ success: true, email: targetUser.email, role })
}
