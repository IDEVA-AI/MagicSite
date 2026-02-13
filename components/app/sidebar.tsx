"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import {
  LayoutDashboard,
  FolderKanban,
  Settings,
  CreditCard,
  HelpCircle,
  Sparkles,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Plus,
  Zap,
  User,
  DollarSign,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Progress } from "@/components/ui/progress"
import { useCredits } from "@/hooks/use-credits"

const navigation = [
  {
    name: "Dashboard",
    href: "/app",
    icon: LayoutDashboard,
    section: "main",
  },
  {
    name: "Projetos",
    href: "/app/projects",
    icon: FolderKanban,
    section: "main",
  },
  {
    name: "Negócios",
    href: "/app/deals",
    icon: DollarSign,
    section: "main",
  },
  {
    name: "Plano & Créditos",
    href: "/app/settings/plan",
    icon: CreditCard,
    section: "account",
  },
  {
    name: "Configurações",
    href: "/app/settings",
    icon: Settings,
    section: "account",
  },
  {
    name: "Ajuda",
    href: "/app/help",
    icon: HelpCircle,
    section: "account",
  },
]

export function AppSidebar({
  mobileMenuOpen,
  setMobileMenuOpen,
}: {
  mobileMenuOpen?: boolean
  setMobileMenuOpen?: (open: boolean) => void
}) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const { credits, loading } = useCredits()

  const totalCredits = credits.total_credits ?? 0
  const usedCredits = credits.used_credits ?? 0
  const remainingCredits = credits.remaining_credits ?? 0
  const progressValue = totalCredits > 0 ? (usedCredits / totalCredits) * 100 : 0

  const isProjectRoute = pathname.startsWith("/app/projects/new")

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="relative flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        {(!collapsed || isMobile) && (
          <Link href="/app" className="flex items-center gap-2" onClick={() => isMobile && setMobileMenuOpen?.(false)}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-lg">MagicSite</span>
          </Link>
        )}

        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className={cn(collapsed && "mx-auto")}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        )}
      </div>

      {/* Quick Action Button for New Project */}
      {(!collapsed || isMobile) && (
        <div className="p-3">
          <Link href="/app/projects/new" onClick={() => isMobile && setMobileMenuOpen?.(false)}>
            <Button className="w-full gap-2 font-bold shadow-lg">
              <Plus className="w-4 h-4" />
              Novo Projeto
            </Button>
          </Link>
        </div>
      )}

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-4">
          <div className="space-y-1">
            {(!collapsed || isMobile) && (
              <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Principal</p>
            )}
            {navigation
              .filter((item) => item.section === "main")
              .map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/")

                return (
                  <Link key={item.name} href={item.href} onClick={() => isMobile && setMobileMenuOpen?.(false)}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start gap-3 font-bold transition-all",
                        !isMobile && collapsed && "justify-center px-2",
                        isActive && "shadow-md",
                      )}
                      title={!isMobile && collapsed ? item.name : undefined}
                    >
                      <item.icon className="w-5 h-5 shrink-0" />
                      {(isMobile || !collapsed) && <span className="font-normal">{item.name}</span>}
                    </Button>
                  </Link>
                )
              })}
          </div>

          {(!collapsed || isMobile) && <Separator />}

          <div className="space-y-1">
            {(!collapsed || isMobile) && (
              <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Conta</p>
            )}
            {navigation
              .filter((item) => item.section === "account")
              .map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/")

                return (
                  <Link key={item.name} href={item.href} onClick={() => isMobile && setMobileMenuOpen?.(false)}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start gap-3 font-bold transition-all",
                        !isMobile && collapsed && "justify-center px-2",
                        isActive && "shadow-md",
                      )}
                      title={!isMobile && collapsed ? item.name : undefined}
                    >
                      <item.icon className="w-5 h-5 shrink-0" />
                      {(isMobile || !collapsed) && <span className="font-normal">{item.name}</span>}
                    </Button>
                  </Link>
                )
              })}
          </div>
        </nav>
      </ScrollArea>

      {/* User Info & Credits Section */}
      {(!collapsed || isMobile) && (
        <div className="border-t p-4 space-y-3">
          <div className="px-3 py-3 rounded-lg bg-primary/10 border border-primary/20 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary shrink-0" />
                <p className="text-xs text-muted-foreground">Créditos</p>
              </div>
              <p className="text-sm font-bold">
                {loading ? "..." : `${usedCredits} / ${totalCredits}`}
              </p>
            </div>
            <Progress value={loading ? 0 : progressValue} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {loading ? "Carregando créditos..." : `${remainingCredits} créditos restantes`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">João Silva</p>
              <p className="text-xs text-muted-foreground">Plano Pro</p>
            </div>
          </div>
        </div>
      )}

      {/* Logout Button */}
      <div className="border-t p-3">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 text-muted-foreground hover:text-foreground font-bold",
            !isMobile && collapsed && "justify-center px-2",
          )}
          title={!isMobile && collapsed ? "Sair" : undefined}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {(isMobile || !collapsed) && <span>Sair</span>}
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Menu */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
          <div className="relative h-full">
            <div className="absolute inset-0 tech-grid opacity-20" />
            <SidebarContent isMobile />
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      {!isProjectRoute && (
        <div
          className={cn(
            "relative border-r bg-card/50 backdrop-blur-sm transition-all duration-300 hidden lg:block",
            collapsed ? "w-16" : "w-64",
          )}
        >
          <div className="absolute inset-0 tech-grid opacity-20" />
          <SidebarContent />
        </div>
      )}
    </>
  )
}
