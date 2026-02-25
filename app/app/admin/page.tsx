"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAdmin } from "@/hooks/use-admin"
import {
    GraduationCap,
    FolderKanban,
    Users,
    Zap,
    TrendingUp,
    ArrowRight,
    Lock,
} from "lucide-react"

type Stats = {
    total_alunos: number
    total_projects: number
    total_credits: number
    used_credits: number
    remaining_credits: number
}

const navCards = [
    {
        name: "Alunos",
        description: "Gerencie os alunos cadastrados na plataforma",
        href: "/app/alunos",
        icon: GraduationCap,
        enabled: true,
    },
    {
        name: "Projetos",
        description: "Visualize todos os projetos criados",
        href: "#",
        icon: FolderKanban,
        enabled: false,
    },
    {
        name: "Usuários",
        description: "Gerencie usuários e permissões",
        href: "#",
        icon: Users,
        enabled: false,
    },
]

export default function AdminPage() {
    const router = useRouter()
    const { isAdmin, loading: adminLoading } = useAdmin()
    const [stats, setStats] = useState<Stats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!adminLoading && !isAdmin) {
            router.push("/app/projects")
        }
    }, [adminLoading, isAdmin, router])

    useEffect(() => {
        if (!isAdmin) return

        async function fetchStats() {
            try {
                const res = await fetch("/api/admin/stats", { credentials: "include" })
                if (!res.ok) throw new Error()
                const data = await res.json()
                setStats(data)
            } catch {
                setStats(null)
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
    }, [isAdmin])

    if (adminLoading || !isAdmin) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-pulse text-muted-foreground">Carregando...</div>
            </div>
        )
    }

    const metricCards = [
        {
            label: "Total Alunos",
            value: stats?.total_alunos ?? 0,
            icon: GraduationCap,
            color: "text-blue-600",
            bg: "bg-blue-50",
        },
        {
            label: "Total Projetos",
            value: stats?.total_projects ?? 0,
            icon: FolderKanban,
            color: "text-purple-600",
            bg: "bg-purple-50",
        },
        {
            label: "Créditos Usados",
            value: stats?.used_credits ?? 0,
            icon: Zap,
            color: "text-orange-600",
            bg: "bg-orange-50",
        },
        {
            label: "Créditos Restantes",
            value: stats?.remaining_credits ?? 0,
            icon: TrendingUp,
            color: "text-green-600",
            bg: "bg-green-50",
        },
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="p-4 lg:p-6 space-y-6 lg:space-y-8">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-black mb-2 gradient-text">
                        Painel Admin
                    </h1>
                    <p className="text-lg text-muted-foreground font-medium">
                        Visão geral da plataforma
                    </p>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {metricCards.map((metric) => (
                        <div
                            key={metric.label}
                            className="rounded-xl border bg-card p-4 lg:p-6 shadow-sm"
                        >
                            {loading ? (
                                <div className="space-y-3">
                                    <div className="h-10 w-10 bg-muted animate-pulse rounded-lg" />
                                    <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                                    <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                                </div>
                            ) : (
                                <>
                                    <div className={`w-10 h-10 rounded-lg ${metric.bg} flex items-center justify-center mb-3`}>
                                        <metric.icon className={`w-5 h-5 ${metric.color}`} />
                                    </div>
                                    <p className="text-sm text-muted-foreground font-medium">
                                        {metric.label}
                                    </p>
                                    <p className="text-2xl lg:text-3xl font-black mt-1">
                                        {metric.value.toLocaleString("pt-BR")}
                                    </p>
                                </>
                            )}
                        </div>
                    ))}
                </div>

                {/* Navigation Cards */}
                <div>
                    <h2 className="text-xl font-bold mb-4">Gerenciamento</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {navCards.map((card) =>
                            card.enabled ? (
                                <Link
                                    key={card.name}
                                    href={card.href}
                                    className="group rounded-xl border bg-card p-6 shadow-sm hover:shadow-md hover:border-primary/30 transition-all"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <card.icon className="w-5 h-5 text-primary" />
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                    </div>
                                    <h3 className="font-bold text-lg">{card.name}</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {card.description}
                                    </p>
                                </Link>
                            ) : (
                                <div
                                    key={card.name}
                                    className="rounded-xl border bg-card/50 p-6 shadow-sm opacity-60 cursor-not-allowed"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                                            <card.icon className="w-5 h-5 text-muted-foreground" />
                                        </div>
                                        <Lock className="w-4 h-4 text-muted-foreground" />
                                    </div>
                                    <h3 className="font-bold text-lg">{card.name}</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {card.description}
                                    </p>
                                    <span className="inline-block mt-2 text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                                        Em breve
                                    </span>
                                </div>
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
