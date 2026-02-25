import { NextResponse } from "next/server"
import { getAdminClient } from "@/utils/supabase/admin"

export async function GET() {
    const admin = await getAdminClient()
    if ("error" in admin) return admin.error
    const { supabase } = admin

    const { data, error } = await supabase
        .from("platform_settings")
        .select("free_mode")
        .eq("id", 1)
        .single()

    if (error) {
        return NextResponse.json({ error: "Erro ao buscar configuração." }, { status: 500 })
    }

    return NextResponse.json({ free_mode: data.free_mode })
}

export async function POST(request: Request) {
    const admin = await getAdminClient()
    if ("error" in admin) return admin.error
    const { supabase } = admin

    const body = await request.json()
    const free_mode = Boolean(body.free_mode)

    const { error } = await supabase
        .from("platform_settings")
        .update({ free_mode, updated_at: new Date().toISOString() })
        .eq("id", 1)

    if (error) {
        return NextResponse.json({ error: "Erro ao atualizar configuração." }, { status: 500 })
    }

    return NextResponse.json({ free_mode })
}
