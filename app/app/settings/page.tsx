"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Loader2 } from "lucide-react"
import { useProfile } from "@/hooks/use-profile"
import { useRef, useState } from "react"
import { toast } from "sonner"

export default function SettingsPage() {
  const { profile, loading, updateProfile, uploadAvatar } = useProfile()
  const [name, setName] = useState<string | null>(null)
  const [phone, setPhone] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const displayName = name ?? profile?.name ?? ""
  const displayPhone = phone ?? profile?.phone ?? ""

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setAvatarFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (avatarFile) {
        const { error } = await uploadAvatar(avatarFile)
        if (error) {
          console.error("Avatar upload error:", error)
          toast.error(`Erro ao enviar foto: ${error.message}`)
          setSaving(false)
          return
        }
        setAvatarFile(null)
        setAvatarPreview(null)
      }

      const updates: { name?: string; phone?: string } = {}
      if (name !== null) updates.name = name
      if (phone !== null) updates.phone = phone

      if (Object.keys(updates).length > 0) {
        const result = await updateProfile(updates)
        if (result?.error) {
          toast.error("Erro ao salvar alterações")
          setSaving(false)
          return
        }
      }

      toast.success("Alterações salvas com sucesso")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold mb-2">Configurações</h1>
        <p className="text-muted-foreground">Gerencie suas preferências e informações da conta</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
          <CardDescription>Atualize suas informações pessoais</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Upload */}
          <div className="flex items-center gap-6">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <Avatar className="w-20 h-20">
                <AvatarImage src={avatarPreview ?? profile?.avatar_url ?? undefined} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xl">
                  {initials || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarSelect}
              />
            </div>
            <div>
              <p className="font-medium">Foto do perfil</p>
              <p className="text-sm text-muted-foreground">Clique para alterar sua foto</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={displayName}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile?.email ?? ""}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                type="tel"
                value={displayPhone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Salvar Alterações
          </Button>
        </CardContent>
      </Card>

      {/* Password */}
      <Card>
        <CardHeader>
          <CardTitle>Senha</CardTitle>
          <CardDescription>Altere sua senha de acesso</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Senha Atual</Label>
            <Input id="currentPassword" type="password" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">Nova Senha</Label>
            <Input id="newPassword" type="password" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
            <Input id="confirmPassword" type="password" />
          </div>

          <Button>Atualizar Senha</Button>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Notificações</CardTitle>
          <CardDescription>Configure como você deseja receber notificações</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email de Marketing</Label>
              <p className="text-sm text-muted-foreground">Receba novidades e dicas sobre o produto</p>
            </div>
            <Switch defaultChecked />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notificações de Projeto</Label>
              <p className="text-sm text-muted-foreground">Seja notificado quando seus projetos forem concluídos</p>
            </div>
            <Switch defaultChecked />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Alertas de Créditos</Label>
              <p className="text-sm text-muted-foreground">Receba avisos quando seus créditos estiverem acabando</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-500/50">
        <CardHeader>
          <CardTitle className="text-red-500">Zona de Perigo</CardTitle>
          <CardDescription>Ações irreversíveis da conta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Excluir Conta</p>
              <p className="text-sm text-muted-foreground">Exclua permanentemente sua conta e todos os dados</p>
            </div>
            <Button variant="destructive">Excluir Conta</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
