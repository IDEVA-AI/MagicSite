import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { decrypt } from "@/lib/deploy/encryption"
import { listUserRepos } from "@/lib/deploy/github"

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Não autorizado." }, { status: 401 })

  const { data: conn } = await supabase
    .from("deploy_github_connections")
    .select("encrypted_token")
    .eq("user_id", user.id)
    .single()

  if (!conn) return NextResponse.json({ error: "GitHub não conectado." }, { status: 400 })

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get("page") || "1")
  const search = searchParams.get("q") || undefined

  const token = decrypt(conn.encrypted_token)
  const repos = await listUserRepos(token, page, 30, search)
  return NextResponse.json({ data: repos })
}
