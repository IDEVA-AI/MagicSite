"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function GitHubCallback() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState("Conectando com GitHub...")

  useEffect(() => {
    const code = searchParams.get("code")
    if (!code) return

    // Try postMessage to opener (popup flow)
    if (window.opener) {
      window.opener.postMessage({ type: "github-oauth-callback", code }, "*")
      setTimeout(() => window.close(), 500)
      return
    }

    // Fallback: if not a popup, call callback API directly
    setStatus("Finalizando conexão...")
    fetch("/api/deploy/github/callback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    })
      .then((res) => {
        if (res.ok) {
          setStatus("GitHub conectado! Redirecionando...")
          setTimeout(() => router.push("/app/deploy/new"), 1000)
        } else {
          setStatus("Erro ao conectar. Tente novamente.")
        }
      })
      .catch(() => setStatus("Erro ao conectar. Tente novamente."))
  }, [searchParams, router])

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground">{status}</p>
      </div>
    </div>
  )
}
