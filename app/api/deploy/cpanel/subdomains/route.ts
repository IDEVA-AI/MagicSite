import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { decrypt } from "@/lib/deploy/encryption"
import { listSubdomains, createSubdomain } from "@/lib/deploy/cpanel"

async function getCpanelAuth(supabase: any, credentialId: string, userId: string) {
  const { data: cred } = await supabase
    .from("deploy_cpanel_credentials")
    .select("*")
    .eq("id", credentialId)
    .eq("user_id", userId)
    .single()

  if (!cred) return null

  return {
    host: cred.host,
    port: cred.port,
    username: cred.username,
    password: decrypt(cred.encrypted_password),
  }
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Não autorizado." }, { status: 401 })

  const credentialId = request.nextUrl.searchParams.get("credentialId")
  if (!credentialId) return NextResponse.json({ error: "credentialId obrigatório." }, { status: 400 })

  const auth = await getCpanelAuth(supabase, credentialId, user.id)
  if (!auth) return NextResponse.json({ error: "Credencial não encontrada." }, { status: 404 })

  try {
    const subdomains = await listSubdomains(auth)
    return NextResponse.json({ data: subdomains })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Não autorizado." }, { status: 401 })

  const { credentialId, subdomain, domain } = await request.json()
  if (!credentialId || !subdomain || !domain) {
    return NextResponse.json({ error: "credentialId, subdomain e domain são obrigatórios." }, { status: 400 })
  }

  if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(subdomain)) {
    return NextResponse.json({ error: "Subdomínio inválido. Use apenas letras minúsculas, números e hífens." }, { status: 400 })
  }

  const auth = await getCpanelAuth(supabase, credentialId, user.id)
  if (!auth) return NextResponse.json({ error: "Credencial não encontrada." }, { status: 404 })

  try {
    const result = await createSubdomain(auth, subdomain, domain)
    return NextResponse.json({ data: result })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
