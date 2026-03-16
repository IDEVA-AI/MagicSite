import { NextRequest, NextResponse } from "next/server"

const CALLBACK_PATH = "/app/deploy/github-callback"
const PROD_ORIGIN = "https://www.criadordesites.app"

function getOrigin(request: NextRequest): string {
  // 1. Explicit env var (most reliable for production)
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL
  // 2. Next.js request origin (works in dev)
  const origin = request.nextUrl.origin
  if (origin && !origin.includes("localhost") || process.env.NODE_ENV === "development") return origin
  // 3. Hardcoded fallback
  return PROD_ORIGIN
}

export async function GET(request: NextRequest) {
  const clientId = process.env.DEPLOY_GITHUB_CLIENT_ID
  if (!clientId) {
    return NextResponse.json({ error: "GitHub App not configured" }, { status: 500 })
  }

  const origin = getOrigin(request)
  const callbackUrl = `${origin}${CALLBACK_PATH}`
  const redirectUri = encodeURIComponent(callbackUrl)
  const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=repo,workflow&redirect_uri=${redirectUri}`

  // Debug: log generated URL in production
  console.log("[GitHub OAuth] redirect_uri:", callbackUrl)

  return NextResponse.json({ url })
}
