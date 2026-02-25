"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/utils/supabase/client"

export interface Profile {
  name: string
  phone: string | null
  avatar_url: string | null
  email: string
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function loadProfile() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        if (!cancelled) setLoading(false)
        return
      }

      const { data } = await supabase
        .from("profiles")
        .select("name, phone, avatar_url")
        .eq("id", user.id)
        .single()

      if (!cancelled) {
        setProfile(
          data
            ? { ...data, email: user.email ?? "" }
            : { name: "", phone: null, avatar_url: null, email: user.email ?? "" }
        )
        setLoading(false)
      }
    }

    loadProfile()
    return () => { cancelled = true }
  }, [])

  const updateProfile = useCallback(async (updates: { name?: string; phone?: string }) => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from("profiles")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", user.id)

    if (!error) {
      setProfile((prev) => (prev ? { ...prev, ...updates } : prev))
    }

    return { error }
  }, [])

  const uploadAvatar = useCallback(async (file: File) => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { error: new Error("Not authenticated") }

    const ext = file.name.split(".").pop()
    const path = `${user.id}/avatar.${ext}`

    // Remove existing files in user's folder before uploading
    const { data: existingFiles } = await supabase.storage
      .from("avatars")
      .list(user.id)

    if (existingFiles && existingFiles.length > 0) {
      await supabase.storage
        .from("avatars")
        .remove(existingFiles.map((f) => `${user.id}/${f.name}`))
    }

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file)

    if (uploadError) return { error: uploadError }

    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(path)

    const avatar_url = `${urlData.publicUrl}?t=${Date.now()}`

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url, updated_at: new Date().toISOString() })
      .eq("id", user.id)

    if (!updateError) {
      setProfile((prev) => (prev ? { ...prev, avatar_url } : prev))
    }

    return { error: updateError }
  }, [])

  return { profile, loading, updateProfile, uploadAvatar }
}
