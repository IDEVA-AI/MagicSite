"use client"

import type React from "react"
import { useState } from "react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Phone, User, Eye, FileText, DollarSign, CheckCircle, Package } from "lucide-react"

type DealStatus = "lead" | "proposta" | "negociacao" | "fechado" | "entregue"

interface Deal {
  id: string
  clientName: string
  projectName: string
  segment: string
  phone: string
  value: number
  status: DealStatus
  projectId?: string // Optional link to project
}

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

export default function DealsPage() {
  const mockProjects = [
    {
      id: "1",
      name: "Consultoria Financeira Silva",
      segment: "Serviços Financeiros",
      phone: "(11) 99999-9999",
    },
    {
      id: "2",
      name: "Academia Fitness Pro",
      segment: "Saúde e Bem-estar",
      phone: "(11) 98888-8888",
    },
    {
      id: "3",
      name: "Advocacia Oliveira & Associados",
      segment: "Serviços Jurídicos",
      phone: "(11) 97777-7777",
    },
  ]

  const [deals, setDeals] = useState<Deal[]>([
    ...mockProjects.map((project, index) => ({
      id: project.id,
      clientName: "",
      projectName: project.name,
      segment: project.segment,
      phone: project.phone,
      value: 0,
      status: "lead" as DealStatus,
      projectId: project.id,
    })),
  ])

  const [draggedDeal, setDraggedDeal] = useState<Deal | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newDeal, setNewDeal] = useState({
    clientName: "",
    projectName: "",
    segment: "",
    phone: "",
    value: 0,
  })

  const handleDragStart = (deal: Deal) => {
    setDraggedDeal(deal)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (status: DealStatus) => {
    if (draggedDeal) {
      setDeals((prev) => prev.map((deal) => (deal.id === draggedDeal.id ? { ...deal, status } : deal)))
      setDraggedDeal(null)
    }
  }

  const getDealsByStatus = (status: DealStatus) => {
    return deals.filter((deal) => deal.status === status)
  }

  const getTotalByStatus = (status: DealStatus) => {
    return getDealsByStatus(status).reduce((sum, deal) => sum + deal.value, 0)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const handleCreateDeal = () => {
    const deal: Deal = {
      id: Date.now().toString(),
      ...newDeal,
      status: "lead",
    }
    setDeals((prev) => [...prev, deal])
    setIsDialogOpen(false)
    setNewDeal({
      clientName: "",
      projectName: "",
      segment: "",
      phone: "",
      value: 0,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 lg:gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-black mb-2 gradient-text">Pipeline de Negócios</h1>
            <p className="text-lg text-muted-foreground font-medium">Gerencie seus leads e acompanhe suas vendas</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="projectName">Nome do Projeto *</Label>
                  <Input
                    id="projectName"
                    placeholder="Ex: Site Advocacia Santos"
                    value={newDeal.projectName}
                    onChange={(e) => setNewDeal({ ...newDeal, projectName: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="clientName">Nome do Cliente</Label>
                  <Input
                    id="clientName"
                    placeholder="Ex: João Silva"
                    value={newDeal.clientName}
                    onChange={(e) => setNewDeal({ ...newDeal, clientName: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="segment">Segmento</Label>
                  <Input
                    id="segment"
                    placeholder="Ex: Serviços Jurídicos"
                    value={newDeal.segment}
                    onChange={(e) => setNewDeal({ ...newDeal, segment: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    placeholder="(11) 99999-9999"
                    value={newDeal.phone}
                    onChange={(e) => setNewDeal({ ...newDeal, phone: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="value">Valor (R$)</Label>
                  <Input
                    id="value"
                    type="number"
                    placeholder="0.00"
                    value={newDeal.value || ""}
                    onChange={(e) => setNewDeal({ ...newDeal, value: Number.parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateDeal} disabled={!newDeal.projectName}>
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
                      columnDeals.map((deal) => (
                        <Card
                          key={deal.id}
                          draggable
                          onDragStart={() => handleDragStart(deal)}
                          className="p-3 cursor-grab active:cursor-grabbing bg-card hover:bg-accent/5 transition-colors border shadow-sm hover:shadow-md group"
                        >
                          <div className="space-y-2">
                            <h3 className="font-medium text-sm text-foreground leading-snug line-clamp-2">
                              {deal.projectName}
                            </h3>

                            <p className="text-xs text-muted-foreground line-clamp-1">{deal.segment}</p>

                            <div className="border-t pt-2 space-y-1.5">
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <User className="w-3 h-3 shrink-0 opacity-60" />
                                <span className="truncate">{deal.clientName}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Phone className="w-3 h-3 shrink-0 opacity-60" />
                                <span className="truncate">{deal.phone}</span>
                              </div>
                            </div>

                            <div className="pt-2 border-t">
                              <span className="text-base font-bold text-primary">{formatCurrency(deal.value)}</span>
                            </div>
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
