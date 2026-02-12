"use client"

import { useCallback, useEffect, useRef, useState } from "react"

type CreditsResponse = {
  total_credits: number
  used_credits: number
  remaining_credits: number
}

export function useCredits() {
  const [credits, setCredits] = useState<CreditsResponse>({
    total_credits: 0,
    used_credits: 0,
    remaining_credits: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const cancelled = useRef(false)

  const loadCredits = useCallback(async () => {
    setError(null)
    setLoading(true)

    try {
      const response = await fetch("/api/credits", {
        cache: "no-store",
        credentials: "include",
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(payload?.error || "Não foi possível carregar os créditos.")
      }

      const data = await response.json()

      if (cancelled.current) return

      setCredits({
        total_credits: Number(data.total_credits) || 0,
        used_credits: Number(data.used_credits) || 0,
        remaining_credits: Number(data.remaining_credits) || 0,
      })
    } catch (err: any) {
      if (cancelled.current) return
      setError(err?.message || "Não foi possível carregar os créditos.")
      setCredits({ total_credits: 0, used_credits: 0, remaining_credits: 0 })
    } finally {
      if (!cancelled.current) {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    cancelled.current = false
    loadCredits()
    return () => {
      cancelled.current = true
    }
  }, [loadCredits])

  return { credits, loading, error, reload: loadCredits }
}
