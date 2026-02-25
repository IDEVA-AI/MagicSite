"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
    aluno: { id: string; name: string } | null
    onSuccess: () => void
}

export function AlunoDeleteDialog({ open, onOpenChange, aluno, onSuccess }: Props) {
    const [loading, setLoading] = useState(false)

    async function handleDelete() {
        if (!aluno) return
        setLoading(true)
        try {
            const res = await fetch(`/api/alunos/${aluno.id}`, {
                method: "DELETE",
                credentials: "include",
            })

            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error || "Erro ao remover aluno.")
            }

            toast.success("Aluno removido com sucesso!")
            onOpenChange(false)
            onSuccess()
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Erro ao remover aluno.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Remover Aluno</AlertDialogTitle>
                    <AlertDialogDescription>
                        Tem certeza que deseja remover <strong>{aluno?.name}</strong>? Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
                    <Button variant="destructive" onClick={handleDelete} disabled={loading}>
                        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Remover
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
