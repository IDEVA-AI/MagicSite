"use client"

import { useCallback, useEffect, useRef, useState } from "react"

export type DealStatus = "lead" | "proposta" | "negociacao" | "fechado" | "entregue"

export interface Deal {
  id: string
  user_id: string
  project_id: string | null
  client_name: string | null
  project_name: string
  segment: string | null
  phone: string | null
  value_cents: number
  status: DealStatus
  notes: string | null
  position: number
  created_at: string
  updated_at: string
}

export type DealCreateInput = {
  project_name: string
  client_name?: string
  segment?: string
  phone?: string
  value_cents?: number
  status?: DealStatus
  notes?: string
  project_id?: string | null
}

export type DealUpdateInput = Partial<Omit<Deal, "id" | "user_id" | "created_at" | "updated_at">>

export function useDeals() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const cancelled = useRef(false)

  const loadDeals = useCallback(async () => {
    setError(null)
    setLoading(true)

    try {
      const res = await fetch("/api/deals")
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Erro ao buscar negócios.")
      }
      const { data } = await res.json()
      if (cancelled.current) return
      setDeals(data || [])
    } catch (err: any) {
      if (cancelled.current) return
      setError(err?.message || "Não foi possível carregar os negócios.")
      setDeals([])
    } finally {
      if (!cancelled.current) {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    cancelled.current = false
    loadDeals()
    return () => {
      cancelled.current = true
    }
  }, [loadDeals])

  const createDeal = useCallback(async (input: DealCreateInput): Promise<Deal> => {
    const res = await fetch("/api/deals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || "Erro ao criar negócio.")
    }
    const deal: Deal = await res.json()
    setDeals((prev) => [...prev, deal])
    return deal
  }, [])

  const updateDeal = useCallback(async (id: string, input: DealUpdateInput): Promise<Deal> => {
    const res = await fetch(`/api/deals/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || "Erro ao atualizar negócio.")
    }
    const updated: Deal = await res.json()
    setDeals((prev) => prev.map((d) => (d.id === id ? updated : d)))
    return updated
  }, [])

  const deleteDeal = useCallback(async (id: string): Promise<void> => {
    const res = await fetch(`/api/deals/${id}`, { method: "DELETE" })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || "Erro ao excluir negócio.")
    }
    setDeals((prev) => prev.filter((d) => d.id !== id))
  }, [])

  const moveDeal = useCallback(async (id: string, newStatus: DealStatus): Promise<void> => {
    // Optimistic update
    setDeals((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: newStatus } : d))
    )
    try {
      await fetch(`/api/deals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
    } catch {
      // Revert on failure
      await loadDeals()
    }
  }, [loadDeals])

  return { deals, loading, error, reload: loadDeals, createDeal, updateDeal, deleteDeal, moveDeal }
}
