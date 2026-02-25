"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"

const alunoSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    email: z.string().email("Email inválido"),
    partnership_plan: z.string().optional(),
})

type AlunoFormData = z.infer<typeof alunoSchema>

type Aluno = {
    id: string
    name: string
    email: string
    partnership_plan: string | null
}

type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
    aluno?: Aluno | null
    onSuccess: () => void
}

export function AlunoFormDialog({ open, onOpenChange, aluno, onSuccess }: Props) {
    const isEdit = !!aluno

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<AlunoFormData>({
        resolver: zodResolver(alunoSchema),
    })

    useEffect(() => {
        if (open) {
            reset({
                name: aluno?.name ?? "",
                email: aluno?.email ?? "",
                partnership_plan: aluno?.partnership_plan ?? "",
            })
        }
    }, [open, aluno, reset])

    async function onSubmit(data: AlunoFormData) {
        try {
            const url = isEdit ? `/api/alunos/${aluno.id}` : "/api/alunos"
            const method = isEdit ? "PUT" : "POST"

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(data),
            })

            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error || "Erro ao salvar aluno.")
            }

            toast.success(isEdit ? "Aluno atualizado com sucesso!" : "Aluno criado com sucesso!")
            onOpenChange(false)
            onSuccess()
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Erro ao salvar aluno.")
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Editar Aluno" : "Novo Aluno"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome</Label>
                        <Input id="name" {...register("name")} />
                        {errors.name && (
                            <p className="text-sm text-destructive">{errors.name.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" {...register("email")} />
                        {errors.email && (
                            <p className="text-sm text-destructive">{errors.email.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="partnership_plan">Plano de Parceria</Label>
                        <Input id="partnership_plan" {...register("partnership_plan")} />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {isEdit ? "Salvar" : "Criar"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
