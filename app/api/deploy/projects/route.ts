import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Não autorizado." }, { status: 401 })

  const { data, error } = await supabase
    .from("deploy_projects")
    .select("*")
    .is("deleted_at", null)
    .order("updated_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data: data || [] })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Não autorizado." }, { status: 401 })

  const body = await request.json()
  const { github_connection_id, github_repo_owner, github_repo_name, github_repo_id, default_branch, name } = body

  if (!github_repo_owner || !github_repo_name) {
    return NextResponse.json({ error: "Repositório é obrigatório." }, { status: 400 })
  }

  // Get github connection id if not provided
  let connId = github_connection_id
  if (!connId) {
    const { data: conn } = await supabase
      .from("deploy_github_connections")
      .select("id")
      .eq("user_id", user.id)
      .single()
    connId = conn?.id
  }

  const { data, error } = await supabase
    .from("deploy_projects")
    .insert({
      user_id: user.id,
      github_connection_id: connId,
      name: name || github_repo_name,
      github_repo_owner,
      github_repo_name,
      github_repo_id,
      default_branch: default_branch || "main",
      selected_branch: default_branch || "main",
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
