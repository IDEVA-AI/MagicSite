"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle, Loader2, Eye, EyeOff } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"

export default function PartnershipLogin() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        toast.error("Erro ao fazer login", { description: error.message })
        return
      }

      toast.success("Login realizado com sucesso!")
      localStorage.setItem("magicsite-authed", "true")
      router.refresh()
      router.replace("/app")
    } catch {
      toast.error("Erro inesperado", { description: "Tente novamente." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6">
      <div className="absolute inset-0 tech-grid opacity-20" />
      <div className="absolute inset-0 dot-pattern opacity-20" />
      <div className="absolute inset-0 gradient-bg" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="mt-6 text-3xl font-black text-foreground">Conta Criada!</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Faça login para acessar seu plano da parceria
          </p>
        </div>

        <Card className="bg-background/80 backdrop-blur-md border-border/60">
          <CardHeader>
            <CardTitle>Entrar no Sistema</CardTitle>
            <CardDescription>Use suas credenciais para acessar sua conta</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  "Entrar no Sistema"
                )}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-green-500/5 border border-green-500/20 rounded-lg">
              <h4 className="text-sm font-medium text-green-700 dark:text-green-400 mb-2">
                Conta da parceria ativa
              </h4>
              <ul className="text-xs text-green-600 dark:text-green-500 space-y-1">
                <li>Plano Smart gratuito ativado</li>
                <li>200 créditos mensais disponíveis</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
