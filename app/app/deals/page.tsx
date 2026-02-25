"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Plus, Phone, User, Eye, FileText, DollarSign,
  CheckCircle, Package, Loader2, Pencil, Trash2,
  Calendar, StickyNote, LinkIcon,
} from "lucide-react"
import { toast } from "sonner"
import { useDeals, type Deal, type DealStatus, type DealCreateInput } from "@/hooks/use-deals"
import { useProjects } from "@/hooks/use-projects"

const columns: { id: DealStatus; title: string; color: string; bgColor: string; icon: React.ReactNode }[] = [
  {
    id: "lead",
    title: "Lead",
    color: "text-slate-700",
    bgColor: "bg-slate-100/80 border-slate-200",
    icon: <Eye className="w-4 h-4" />,
  },
  {
    id: "proposta",
    title: "Proposta",
    color: "text-blue-700",
    bgColor: "bg-blue-50/80 border-blue-200",
    icon: <FileText className="w-4 h-4" />,
  },
  {
    id: "negociacao",
    title: "Negociação",
    color: "text-amber-700",
    bgColor: "bg-amber-50/80 border-amber-200",
    icon: <DollarSign className="w-4 h-4" />,
  },
  {
    id: "fechado",
    title: "Fechado",
    color: "text-emerald-700",
    bgColor: "bg-emerald-50/80 border-emerald-200",
    icon: <CheckCircle className="w-4 h-4" />,
  },
  {
    id: "entregue",
    title: "Entregue",
    color: "text-purple-700",
    bgColor: "bg-purple-50/80 border-purple-200",
    icon: <Package className="w-4 h-4" />,
  },
]

const emptyForm = {
  project_name: "",
  client_name: "",
  segment: "",
  phone: "",
  value_cents: 0,
  notes: "",
  project_id: "",
}

export default function DealsPage() {
  const { deals, loading, error, createDeal, updateDeal, deleteDeal, moveDeal } = useDeals()
  const { projects } = useProjects()

  const [draggedDeal, setDraggedDeal] = useState<Deal | null>(null)

  // Create dialog
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState(emptyForm)
  const [creating, setCreating] = useState(false)

  // Edit dialog
  const [editDeal, setEditDeal] = useState<Deal | null>(null)
  const [editForm, setEditForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  // Delete dialog
  const [deletingDeal, setDeletingDeal] = useState<Deal | null>(null)
  const [deleting, setDeleting] = useState(false)

  const getDealsByStatus = (status: DealStatus) => {
    return deals.filter((deal) => deal.status === status)
  }

  const getTotalByStatus = (status: DealStatus) => {
    return getDealsByStatus(status).reduce((sum, deal) => sum + deal.value_cents, 0)
  }

  const grandTotal = useMemo(() => {
    return deals.reduce((sum, deal) => sum + deal.value_cents, 0)
  }, [deals])

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100)
  }

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    }).format(new Date(dateStr))
  }

  // Drag and drop
  const handleDragStart = (deal: Deal) => setDraggedDeal(deal)
  const handleDragOver = (e: React.DragEvent) => e.preventDefault()
  const handleDrop = (status: DealStatus) => {
    if (draggedDeal && draggedDeal.status !== status) {
      moveDeal(draggedDeal.id, status)
      toast.success(`Negócio movido para ${columns.find((c) => c.id === status)?.title}`)
    }
    setDraggedDeal(null)
  }

  // Create
  const handleCreate = async () => {
    if (!createForm.project_name.trim()) return
    setCreating(true)
    try {
      const input: DealCreateInput = {
        project_name: createForm.project_name,
        client_name: createForm.client_name || undefined,
        segment: createForm.segment || undefined,
        phone: createForm.phone || undefined,
        value_cents: createForm.value_cents,
        notes: createForm.notes || undefined,
        project_id: createForm.project_id || null,
      }
      await createDeal(input)
      toast.success("Negócio criado com sucesso!")
      setIsCreateOpen(false)
      setCreateForm(emptyForm)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setCreating(false)
    }
  }

  // Edit
  const openEdit = (deal: Deal) => {
    setEditDeal(deal)
    setEditForm({
      project_name: deal.project_name,
      client_name: deal.client_name || "",
      segment: deal.segment || "",
      phone: deal.phone || "",
      value_cents: deal.value_cents,
      notes: deal.notes || "",
      project_id: deal.project_id || "",
    })
  }

  const handleSave = async () => {
    if (!editDeal || !editForm.project_name.trim()) return
    setSaving(true)
    try {
      await updateDeal(editDeal.id, {
        project_name: editForm.project_name,
        client_name: editForm.client_name || null,
        segment: editForm.segment || null,
        phone: editForm.phone || null,
        value_cents: editForm.value_cents,
        notes: editForm.notes || null,
        project_id: editForm.project_id || null,
      })
      toast.success("Negócio atualizado!")
      setEditDeal(null)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  // Delete
  const handleDelete = async () => {
    if (!deletingDeal) return
    setDeleting(true)
    try {
      await deleteDeal(deletingDeal.id)
      toast.success("Negócio excluído!")
      setDeletingDeal(null)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setDeleting(false)
    }
  }

  // Shared form fields component
  const renderFormFields = (
    form: typeof emptyForm,
    setForm: (f: typeof emptyForm) => void
  ) => (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="projectName">Nome do Projeto *</Label>
        <Input
          id="projectName"
          placeholder="Ex: Site Advocacia Santos"
          value={form.project_name}
          onChange={(e) => setForm({ ...form, project_name: e.target.value })}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="clientName">Nome do Cliente</Label>
        <Input
          id="clientName"
          placeholder="Ex: João Silva"
          value={form.client_name}
          onChange={(e) => setForm({ ...form, client_name: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="segment">Segmento</Label>
          <Input
            id="segment"
            placeholder="Ex: Serviços Jurídicos"
            value={form.segment}
            onChange={(e) => setForm({ ...form, segment: e.target.value })}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            placeholder="(11) 99999-9999"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="value">Valor (R$)</Label>
        <Input
          id="value"
          type="number"
          placeholder="0.00"
          value={form.value_cents ? (form.value_cents / 100).toFixed(2) : ""}
          onChange={(e) =>
            setForm({ ...form, value_cents: Math.round((Number.parseFloat(e.target.value) || 0) * 100) })
          }
        />
      </div>
      {projects.length > 0 && (
        <div className="grid gap-2">
          <Label>Vincular a Projeto</Label>
          <Select
            value={form.project_id}
            onValueChange={(v) => setForm({ ...form, project_id: v === "none" ? "" : v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um projeto (opcional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhum</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="grid gap-2">
        <Label htmlFor="notes">Notas</Label>
        <Textarea
          id="notes"
          placeholder="Observações sobre o negócio..."
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          rows={3}
        />
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-destructive">{error}</p>
          <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 lg:gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-black mb-2 gradient-text">Pipeline de Negócios</h1>
            <p className="text-lg text-muted-foreground font-medium">
              Gerencie seus leads e acompanhe suas vendas
              <span className="ml-3 text-sm font-bold text-primary">
                Total: {formatCurrency(grandTotal)}
              </span>
            </p>
          </div>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2 shadow-lg hover:shadow-xl transition-all font-bold w-full sm:w-auto">
                <Plus className="w-5 h-5" />
                Novo Negócio
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Criar Novo Negócio</DialogTitle>
                <DialogDescription>Adicione um novo negócio ao pipeline. Será criado como Lead.</DialogDescription>
              </DialogHeader>
              {renderFormFields(createForm, setCreateForm)}
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)} disabled={creating}>
                  Cancelar
                </Button>
                <Button onClick={handleCreate} disabled={!createForm.project_name.trim() || creating}>
                  {creating && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Criar Negócio
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="overflow-x-auto pb-4 -mx-4 px-4 lg:mx-0 lg:px-0">
          <div className="flex gap-3 lg:gap-4 min-w-max lg:grid lg:grid-cols-5">
            {columns.map((column) => {
              const columnDeals = getDealsByStatus(column.id)
              const total = getTotalByStatus(column.id)

              return (
                <div
                  key={column.id}
                  className="flex-shrink-0 w-[280px] lg:w-auto flex flex-col"
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(column.id)}
                >
                  <div
                    className={`flex items-center justify-between mb-3 px-3 py-2 rounded-lg border ${column.bgColor}`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={column.color}>{column.icon}</div>
                      <h2 className={`font-semibold text-sm ${column.color}`}>{column.title}</h2>
                      <span className={`text-xs ${column.color} opacity-60`}>({columnDeals.length})</span>
                    </div>
                    <span className={`text-xs font-bold ${column.color}`}>{formatCurrency(total)}</span>
                  </div>

                  <div
                    className={`flex-1 space-y-2 min-h-[200px] bg-background/40 rounded-lg p-2 border ${column.bgColor.split(" ")[1]}`}
                  >
                    {columnDeals.length === 0 ? (
                      <div className="h-24 flex items-center justify-center rounded-lg border-2 border-dashed border-border/50">
                        <p className="text-xs text-muted-foreground">Arraste cards aqui</p>
                      </div>
                    ) : (
                      columnDeals.map((deal) => {
                        const linkedProject = deal.project_id
                          ? projects.find((p) => p.id === deal.project_id)
                          : null

                        return (
                          <Card
                            key={deal.id}
                            draggable
                            onDragStart={() => handleDragStart(deal)}
                            className="p-3 cursor-grab active:cursor-grabbing bg-card hover:bg-accent/5 transition-colors border shadow-sm hover:shadow-md group"
                          >
                            <div className="space-y-2">
                              <div className="flex items-start justify-between gap-1">
                                <h3 className="font-medium text-sm text-foreground leading-snug line-clamp-2 flex-1">
                                  {deal.project_name}
                                </h3>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); openEdit(deal) }}
                                    className="p-1 rounded hover:bg-accent"
                                  >
                                    <Pencil className="w-3 h-3 text-muted-foreground" />
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setDeletingDeal(deal) }}
                                    className="p-1 rounded hover:bg-destructive/10"
                                  >
                                    <Trash2 className="w-3 h-3 text-destructive" />
                                  </button>
                                </div>
                              </div>

                              {deal.segment && (
                                <p className="text-xs text-muted-foreground line-clamp-1">{deal.segment}</p>
                              )}

                              <div className="border-t pt-2 space-y-1.5">
                                {deal.client_name && (
                                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <User className="w-3 h-3 shrink-0 opacity-60" />
                                    <span className="truncate">{deal.client_name}</span>
                                  </div>
                                )}
                                {deal.phone && (
                                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <Phone className="w-3 h-3 shrink-0 opacity-60" />
                                    <span className="truncate">{deal.phone}</span>
                                  </div>
                                )}
                                {linkedProject && (
                                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <LinkIcon className="w-3 h-3 shrink-0 opacity-60" />
                                    <span className="truncate">{linkedProject.name}</span>
                                  </div>
                                )}
                                {deal.notes && (
                                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <StickyNote className="w-3 h-3 shrink-0 opacity-60" />
                                    <span className="truncate">{deal.notes}</span>
                                  </div>
                                )}
                              </div>

                              <div className="pt-2 border-t flex items-center justify-between">
                                <span className="text-base font-bold text-primary">
                                  {formatCurrency(deal.value_cents)}
                                </span>
                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                  <Calendar className="w-2.5 h-2.5" />
                                  {formatDate(deal.created_at)}
                                </span>
                              </div>
                            </div>
                          </Card>
                        )
                      })
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editDeal} onOpenChange={(open) => !open && setEditDeal(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Negócio</DialogTitle>
            <DialogDescription>Atualize as informações do negócio.</DialogDescription>
          </DialogHeader>
          {renderFormFields(editForm, setEditForm)}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDeal(null)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={!editForm.project_name.trim() || saving}>
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingDeal} onOpenChange={(open) => !open && setDeletingDeal(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir negócio</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir &quot;{deletingDeal?.project_name}&quot;? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Excluir
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
