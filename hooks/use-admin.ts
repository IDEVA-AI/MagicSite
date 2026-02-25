"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function checkAdmin() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        if (!cancelled) {
          setIsAdmin(false)
          setLoading(false)
        }
        return
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

      if (!cancelled) {
        setIsAdmin(profile?.role === "admin")
        setLoading(false)
      }
    }

    checkAdmin()

    return () => {
      cancelled = true
    }
  }, [])

  return { isAdmin, loading }
}
