"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sparkles, Loader2 } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast.error("Erro ao fazer login", {
          description: error.message,
        })
        return
      }

      toast.success("Login realizado com sucesso!")

      // Set auth flag for client-layout guard
      localStorage.setItem("magicsite-authed", "true")

      // Refresh router to update server components
      router.refresh()

      const redirect = searchParams.get("redirect") || "/dashboard"
      router.replace(redirect)
    } catch (error) {
      toast.error("Erro inesperado", {
        description: "Ocorreu um erro ao tentar fazer login. Tente novamente.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6">
      <div className="absolute inset-0 tech-grid opacity-20" />
      <div className="absolute inset-0 dot-pattern opacity-20" />
      <div className="absolute inset-0 gradient-bg" />

      <Card className="w-full max-w-md bg-background/80 backdrop-blur-md border-border/60">
        <CardHeader className="space-y-2 text-center">
          <div className="flex items-center justify-center gap-2 text-primary font-bold">
            <Sparkles className="w-5 h-5" />
            MagicSite
          </div>
          <CardTitle className="text-2xl font-black">Entrar</CardTitle>
          <CardDescription>Acesse sua conta para continuar criando projetos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="voce@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>
          <p className="text-sm text-center text-muted-foreground">
            Não tem conta?{" "}
            <Link href="/signup" className="text-primary font-semibold hover:underline">
              Criar conta
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
