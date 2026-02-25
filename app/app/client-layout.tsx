"use client"

import type React from "react"
import { AppSidebar } from "@/components/app/sidebar"
import { AppHeader } from "@/components/app/header"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { useRouter } from "next/navigation"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const isProjectRoute = pathname.startsWith("/app/projects/new")
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const authed = typeof window !== "undefined" && localStorage.getItem("magicsite-authed") === "true"
    if (!authed) {
      const redirectTo = encodeURIComponent(pathname || "/app/projects")
      router.replace(`/login?redirect=${redirectTo}`)
      return
    }
    setReady(true)
  }, [pathname, router])

  if (!ready) return null

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar mobileMenuOpen={menuOpen} setMobileMenuOpen={setMenuOpen} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AppHeader onMenuClick={() => setMenuOpen(true)} showMenuButton={isProjectRoute} />

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
