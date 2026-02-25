"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, Zap, User, Settings, LogOut, Menu } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMemo } from "react"
import { useCredits } from "@/hooks/use-credits"
import { useProfile } from "@/hooks/use-profile"
import { createClient } from "@/utils/supabase/client"

export function AppHeader({
  onMenuClick,
  showMenuButton = false,
}: {
  onMenuClick?: () => void
  showMenuButton?: boolean
}) {
  const router = useRouter()
  const { credits, loading } = useCredits()
  const { profile } = useProfile()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    localStorage.removeItem("magicsite-wizard-draft")
    localStorage.removeItem("magicsite-briefing-draft")
    router.push("/login")
  }

  const remainingLabel = useMemo(() => {
    if (loading) return "..."
    return credits.remaining_credits ?? 0
  }, [credits.remaining_credits, loading])

  const userName = profile?.name || ""
  const userEmail = profile?.email || ""
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <header className="h-16 border-b bg-card px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        {showMenuButton && (
          <Button variant="ghost" size="icon" onClick={onMenuClick}>
            <Menu className="w-5 h-5" />
          </Button>
        )}


      </div>

      <div className="flex items-center gap-4">
        {/* Credits Badge */}
        <Link href="/app/settings/plan">
          <Button variant="outline" className="gap-2 bg-transparent">
            <Zap className="w-4 h-4 text-yellow-500" />
            <span className="font-semibold">{remainingLabel}</span>
            <span className="text-muted-foreground hidden sm:inline">créditos</span>
          </Button>
        </Link>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 pl-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={profile?.avatar_url ?? undefined} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                  {userInitials || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="text-left hidden lg:block">
                <div className="text-sm font-medium">{userName || "..."}</div>
                <div className="text-xs text-muted-foreground">Plano Pro</div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{userName}</p>
                <p className="text-xs text-muted-foreground">{userEmail}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/app/settings" className="cursor-pointer">
                <User className="w-4 h-4 mr-2" />
                Perfil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/app/settings/plan" className="cursor-pointer">
                <Zap className="w-4 h-4 mr-2" />
                Plano & Créditos
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/app/settings" className="cursor-pointer">
                <Settings className="w-4 h-4 mr-2" />
                Configurações
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600 cursor-pointer" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
