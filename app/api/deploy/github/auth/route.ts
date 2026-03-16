import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const clientId = process.env.DEPLOY_GITHUB_CLIENT_ID
  if (!clientId) {
    return NextResponse.json({ error: "GitHub App not configured" }, { status: 500 })
  }

  const origin = request.headers.get("origin") || request.headers.get("referer")?.replace(/\/[^/]*$/, "") || process.env.NEXT_PUBLIC_APP_URL || "https://criadordesites.app"
  const redirectUri = encodeURIComponent(`${origin}/app/deploy/github-callback`)
  const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=repo,workflow&redirect_uri=${redirectUri}`
  return NextResponse.json({ url })
}
