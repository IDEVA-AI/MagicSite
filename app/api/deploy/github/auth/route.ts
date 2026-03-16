import { NextRequest, NextResponse } from "next/server"

function normalizeOrigin(origin: string): string {
  // Always use www for criadordesites.app to match GitHub App callback URL
  return origin.replace("://criadordesites.app", "://www.criadordesites.app")
}

export async function GET(request: NextRequest) {
  const clientId = process.env.DEPLOY_GITHUB_CLIENT_ID
  if (!clientId) {
    return NextResponse.json({ error: "GitHub App not configured" }, { status: 500 })
  }

  const referer = request.headers.get("referer")
  const refererOrigin = referer ? new URL(referer).origin : undefined
  const raw = request.headers.get("origin") || refererOrigin || process.env.NEXT_PUBLIC_APP_URL || "https://www.criadordesites.app"
  const origin = normalizeOrigin(raw)
  const redirectUri = encodeURIComponent(`${origin}/app/deploy/github-callback`)
  const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=repo,workflow&redirect_uri=${redirectUri}`
  return NextResponse.json({ url })
}
