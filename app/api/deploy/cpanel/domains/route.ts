import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { decrypt } from "@/lib/deploy/encryption"
import { listDomains } from "@/lib/deploy/cpanel"

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Não autorizado." }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const credentialId = searchParams.get("credentialId")
  if (!credentialId) return NextResponse.json({ error: "credentialId obrigatório." }, { status: 400 })

  const { data: cred } = await supabase
    .from("deploy_cpanel_credentials")
    .select("*")
    .eq("id", credentialId)
    .eq("user_id", user.id)
    .single()

  if (!cred) return NextResponse.json({ error: "Credencial não encontrada." }, { status: 404 })

  const domains = await listDomains({
    host: cred.host,
    port: cred.port,
    username: cred.username,
    password: decrypt(cred.encrypted_password),
  })

  return NextResponse.json({ data: domains })
}
