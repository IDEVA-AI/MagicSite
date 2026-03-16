import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { encrypt } from "@/lib/deploy/encryption"
import { testConnection } from "@/lib/deploy/cpanel"

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Não autorizado." }, { status: 401 })

  const body = await request.json()
  const { label, host, port, username, password } = body

  if (!host || !username || !password) {
    return NextResponse.json({ error: "Host, usuário e senha são obrigatórios." }, { status: 400 })
  }

  const ok = await testConnection({ host, port: port || 2083, username, password })
  if (!ok) {
    return NextResponse.json({ error: "Não foi possível conectar ao cPanel. Verifique as credenciais." }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("deploy_cpanel_credentials")
    .insert({
      user_id: user.id,
      label: label || host,
      host,
      port: port || 2083,
      username,
      encrypted_password: encrypt(password),
      is_active: true,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Não autorizado." }, { status: 401 })

  const { data } = await supabase
    .from("deploy_cpanel_credentials")
    .select("id, label, host, port, username, is_active, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return NextResponse.json({ data: data || [] })
}
