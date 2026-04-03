import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { decrypt } from "@/lib/deploy/encryption"
import { listSubdomains, createSubdomain } from "@/lib/deploy/cpanel"

async function getCpanelAuth(supabase: any, project: any) {
  const { data: cred } = await supabase
    .from("deploy_cpanel_credentials")
    .select("*")
    .eq("id", project.cpanel_credential_id)
    .single()

  if (!cred) return null

  return {
    host: cred.host,
    port: cred.port,
    username: cred.username,
    password: decrypt(cred.encrypted_password),
  }
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Não autorizado." }, { status: 401 })

  const { data: project } = await supabase
    .from("deploy_projects")
    .select("*")
    .eq("id", id)
    .single()

  if (!project) return NextResponse.json({ error: "Projeto não encontrado." }, { status: 404 })
  if (!project.cpanel_credential_id) {
    return NextResponse.json({ error: "Servidor cPanel não configurado." }, { status: 400 })
  }

  const auth = await getCpanelAuth(supabase, project)
  if (!auth) return NextResponse.json({ error: "Credencial cPanel não encontrada." }, { status: 404 })

  try {
    const subdomains = await listSubdomains(auth)
    return NextResponse.json({ data: subdomains })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Não autorizado." }, { status: 401 })

  const { subdomain, domain } = await request.json()
  if (!subdomain || typeof subdomain !== "string") {
    return NextResponse.json({ error: "Nome do subdomínio é obrigatório." }, { status: 400 })
  }
  if (!domain || typeof domain !== "string") {
    return NextResponse.json({ error: "Domínio é obrigatório." }, { status: 400 })
  }

  // Validate subdomain format: only lowercase alphanumeric and hyphens
  if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(subdomain)) {
    return NextResponse.json({ error: "Subdomínio inválido. Use apenas letras minúsculas, números e hífens." }, { status: 400 })
  }

  const { data: project } = await supabase
    .from("deploy_projects")
    .select("*")
    .eq("id", id)
    .single()

  if (!project) return NextResponse.json({ error: "Projeto não encontrado." }, { status: 404 })
  if (!project.cpanel_credential_id) {
    return NextResponse.json({ error: "Servidor cPanel não configurado." }, { status: 400 })
  }

  const auth = await getCpanelAuth(supabase, project)
  if (!auth) return NextResponse.json({ error: "Credencial cPanel não encontrada." }, { status: 404 })

  try {
    const result = await createSubdomain(auth, subdomain, domain)
    return NextResponse.json({ data: result })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
