'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { registerPayment, type ClientWithPayment } from '@/app/(dashboard)/pagos/actions'
import { toast } from 'sonner'

interface RegisterPaymentDialogProps {
    client: ClientWithPayment
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
}

export function RegisterPaymentDialog({
    client,
    open,
    onOpenChange,
    onSuccess,
}: RegisterPaymentDialogProps) {
    const [loading, setLoading] = useState(false)
    const [paidAt, setPaidAt] = useState(new Date().toISOString().split('T')[0])
    const [amount, setAmount] = useState(client.price_monthly?.toString() || '')
    const [method, setMethod] = useState<string>('bank_transfer')
    const [note, setNote] = useState('')

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        if (!paidAt || !amount || !method) {
            toast.error('Por favor completa todos los campos requeridos')
            return
        }

        try {
            setLoading(true)
            await registerPayment({
                clientId: client.id,
                paidAt,
                amount: parseFloat(amount),
                method,
                note: note || undefined,
            })

            toast.success(`Pago de ${client.full_name} registrado exitosamente`)

            onOpenChange(false)
            onSuccess()

            // Reset form
            setPaidAt(new Date().toISOString().split('T')[0])
            setAmount(client.price_monthly?.toString() || '')
            setMethod('bank_transfer')
            setNote('')
        } catch (error) {
            console.error('Error registering payment:', error)
            toast.error('No se pudo registrar el pago')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Registrar pago</DialogTitle>
                    <DialogDescription>
                        Registra un pago para {client.full_name}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="paid_at">Fecha de pago *</Label>
                        <Input
                            id="paid_at"
                            type="date"
                            value={paidAt}
                            onChange={(e) => setPaidAt(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="amount">Monto *</Label>
                        <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            min="0"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="method">Método de pago *</Label>
                        <Select value={method} onValueChange={setMethod} required>
                            <SelectTrigger id="method">
                                <SelectValue placeholder="Selecciona un método" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="cash">Efectivo</SelectItem>
                                <SelectItem value="bank_transfer">Transferencia bancaria</SelectItem>
                                <SelectItem value="mercado_pago">Mercado Pago</SelectItem>
                                <SelectItem value="other">Otro</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="note">Nota (opcional)</Label>
                        <Textarea
                            id="note"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Agrega una nota sobre este pago..."
                            rows={3}
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Registrar pago
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
