import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { encrypt } from "@/lib/deploy/encryption"

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Não autorizado." }, { status: 401 })

  const { code } = await request.json()
  if (!code) return NextResponse.json({ error: "Código não fornecido." }, { status: 400 })

  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      client_id: process.env.DEPLOY_GITHUB_CLIENT_ID,
      client_secret: process.env.DEPLOY_GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: "https://www.criadordesites.app/app/deploy/github-callback",
    }),
  })

  const tokenData = await tokenRes.json()
  if (tokenData.error) {
    console.error("GitHub OAuth error:", tokenData)
    return NextResponse.json({
      error: tokenData.error_description || "Falha na autenticação.",
      github_error: tokenData.error,
      client_id_prefix: process.env.DEPLOY_GITHUB_CLIENT_ID?.slice(0, 8),
    }, { status: 400 })
  }

  const ghUserRes = await fetch("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  })
  const ghUser = await ghUserRes.json()

  const { data, error } = await supabase
    .from("deploy_github_connections")
    .upsert({
      user_id: user.id,
      github_user_id: ghUser.id,
      github_username: ghUser.login,
      encrypted_token: encrypt(tokenData.access_token),
      avatar_url: ghUser.avatar_url,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ username: ghUser.login, avatar_url: ghUser.avatar_url })
}
