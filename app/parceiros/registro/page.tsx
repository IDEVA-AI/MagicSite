"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserCheck, Loader2, ArrowLeft, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

interface ValidationData {
  validationId: string
  name: string
  email: string
}

export default function PartnershipRegister() {
  const router = useRouter()
  const [validationData, setValidationData] = useState<ValidationData | null>(null)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const stored = sessionStorage.getItem("partnershipValidation")
    if (stored) {
      setValidationData(JSON.parse(stored))
    } else {
      router.replace("/parceiros/validacao")
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password.length < 6) {
      toast.error("Senha deve ter pelo menos 6 caracteres")
      return
    }
    if (password !== confirmPassword) {
      toast.error("Senhas não conferem")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/partnership/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          validationId: validationData!.validationId,
          password,
        }),
      })
      const data = await res.json()

      if (data.success) {
        sessionStorage.setItem("partnershipUser", JSON.stringify(data.user))
        toast.success("Conta criada com sucesso!")
        router.push("/parceiros/planos")
      } else {
        toast.error("Erro ao criar conta", { description: data.error })
      }
    } catch {
      toast.error("Erro inesperado", { description: "Tente novamente." })
    } finally {
      setLoading(false)
    }
  }

  if (!validationData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6">
      <div className="absolute inset-0 tech-grid opacity-20" />
      <div className="absolute inset-0 dot-pattern opacity-20" />
      <div className="absolute inset-0 gradient-bg" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
            <UserCheck className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="mt-6 text-3xl font-black text-foreground">Cadastro</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Dados validados + senha personalizada
          </p>
        </div>

        <Card className="bg-background/80 backdrop-blur-md border-border/60">
          <CardHeader>
            <CardTitle>Seus Dados</CardTitle>
            <CardDescription>Confirme seus dados e crie uma senha</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mb-6">
              <div className="space-y-2">
                <Label>Nome Completo</Label>
                <Input value={validationData.name} disabled className="bg-muted" />
                <p className="text-xs text-muted-foreground">Dados vindos da escola parceira</p>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={validationData.email} disabled className="bg-muted" />
                <p className="text-xs text-muted-foreground">Dados vindos da escola parceira</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirme sua senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  "Avançar"
                )}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <Button
                variant="ghost"
                className="text-sm"
                onClick={() => router.push("/parceiros/validacao")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar à validação
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
