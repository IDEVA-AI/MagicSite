import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Não autorizado." }, { status: 401 })

  const { data } = await supabase
    .from("deploy_github_connections")
    .select("id, github_username, avatar_url, updated_at")
    .eq("user_id", user.id)
    .maybeSingle()

  return NextResponse.json({ connected: !!data, ...(data || {}) })
}
