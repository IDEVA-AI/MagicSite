import { NextResponse } from "next/server"

export async function GET() {
  const clientId = process.env.DEPLOY_GITHUB_CLIENT_ID
  if (!clientId) {
    return NextResponse.json({ error: "GitHub App not configured" }, { status: 500 })
  }

  const redirectUri = encodeURIComponent("https://www.criadordesites.app/app/deploy/github-callback")
  const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=repo,workflow&redirect_uri=${redirectUri}`
  return NextResponse.json({ url })
}
