"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"

const promoteSchema = z.object({
    email: z.string().email("Email inválido"),
    role: z.enum(["admin", "user"], { required_error: "Selecione um role" }),
})

type PromoteFormData = z.infer<typeof promoteSchema>

type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function PromoteDialog({ open, onOpenChange }: Props) {
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<PromoteFormData>({
        resolver: zodResolver(promoteSchema),
        defaultValues: { email: "", role: "admin" },
    })

    const role = watch("role")

    async function onSubmit(data: PromoteFormData) {
        try {
            const res = await fetch("/api/admin/promote", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(data),
            })

            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error || "Erro ao alterar role.")
            }

            toast.success(`Role alterado para "${data.role}" com sucesso!`)
            onOpenChange(false)
            reset()
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Erro ao alterar role.")
        }
    }

    return (
        <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset() }}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Promover / Alterar Role</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="promote-email">Email do usuário</Label>
                        <Input id="promote-email" type="email" {...register("email")} />
                        {errors.email && (
                            <p className="text-sm text-destructive">{errors.email.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label>Role</Label>
                        <Select value={role} onValueChange={(v) => setValue("role", v as "admin" | "user")}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="user">User</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.role && (
                            <p className="text-sm text-destructive">{errors.role.message}</p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Confirmar
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
