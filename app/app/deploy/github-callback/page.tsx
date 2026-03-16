"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function GitHubCallback() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const code = searchParams.get("code")
    if (code && window.opener) {
      window.opener.postMessage({ type: "github-oauth-callback", code }, window.location.origin)
      window.close()
    }
  }, [searchParams])

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground">Conectando com GitHub...</p>
      </div>
    </div>
  )
}
