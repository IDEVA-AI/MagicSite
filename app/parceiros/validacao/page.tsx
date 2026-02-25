"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { School, Loader2, ArrowLeft } from "lucide-react"
import { toast } from "sonner"

export default function PartnershipValidation() {
  const router = useRouter()
  const [emailOrCpf, setEmailOrCpf] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!emailOrCpf.trim()) return

    setLoading(true)
    try {
      const res = await fetch("/api/partnership/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrCpf: emailOrCpf.trim() }),
      })
      const data = await res.json()

      if (data.success) {
        sessionStorage.setItem("partnershipValidation", JSON.stringify(data.data))
        toast.success("Validação realizada com sucesso!")
        router.push("/parceiros/registro")
      } else {
        toast.error("Erro na validação", { description: data.error })
      }
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
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <School className="h-6 w-6 text-primary" />
          </div>
          <h2 className="mt-6 text-3xl font-black text-foreground">Acesso Parceria</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Valide seu acesso como aluno da escola parceira
          </p>
        </div>

        <Card className="bg-background/80 backdrop-blur-md border-border/60">
          <CardHeader>
            <CardTitle>Validação de Acesso</CardTitle>
            <CardDescription>Digite seu email ou CPF cadastrado na escola</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="emailOrCpf">Email ou CPF</Label>
                <Input
                  id="emailOrCpf"
                  placeholder="seu@email.com ou 000.000.000-00"
                  value={emailOrCpf}
                  onChange={(e) => setEmailOrCpf(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Validando...
                  </>
                ) : (
                  "Validar Acesso"
                )}
              </Button>
            </form>
            <div className="mt-4 text-center">
              <Link href="/login">
                <Button variant="ghost" className="text-sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar ao login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
