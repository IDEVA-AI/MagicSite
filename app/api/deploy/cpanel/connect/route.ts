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
    return NextResponse.json({ error: "URL, usuário e token são obrigatórios." }, { status: 400 })
  }

  // Save credentials first
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

  // Test connection in background (non-blocking)
  let connected = false
  try {
    connected = await testConnection({ host, port: port || 2083, username, password })
  } catch {}

  return NextResponse.json({ ...data, connected }, { status: 201 })
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

export async function PUT(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Não autorizado." }, { status: 401 })

  const body = await request.json()
  const { id, host, port, username, password } = body

  if (!id) return NextResponse.json({ error: "ID obrigatório." }, { status: 400 })

  const update: Record<string, any> = {}
  if (host) { update.host = host; update.label = host }
  if (port) update.port = port
  if (username) update.username = username
  if (password) update.encrypted_password = encrypt(password)

  const { data, error } = await supabase
    .from("deploy_cpanel_credentials")
    .update(update)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Não autorizado." }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "ID obrigatório." }, { status: 400 })

  const { error } = await supabase
    .from("deploy_cpanel_credentials")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
