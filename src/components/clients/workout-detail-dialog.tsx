'use client'

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download, MessageCircle, Share2 } from "lucide-react"
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface WorkoutDetailDialogProps {
    isOpen: boolean
    onClose: () => void
    workout: any
    client: any
}

export function WorkoutDetailDialog({ isOpen, onClose, workout, client }: WorkoutDetailDialogProps) {
    if (!workout) return null

    const exercises = Array.isArray(workout.structure) ? workout.structure : []
    const scheduledDays = workout.scheduled_days && workout.scheduled_days.length > 0
        ? workout.scheduled_days.join(" | ")
        : "Sin dias asignados"

    const handleDownloadPDF = () => {
        const doc = new jsPDF()

        // Header
        doc.setFontSize(18)
        doc.text(`Rutina: ${workout.name}`, 14, 20)

        doc.setFontSize(12)
        doc.text(`Cliente: ${client.full_name || 'N/A'}`, 14, 30)
        doc.text(`Días: ${scheduledDays}`, 14, 36)

        // Prepare table data
        const tableBody: any[] = []

        exercises.forEach((ex: any) => {
            // Title row for exercise
            tableBody.push([{ content: ex.name, colSpan: 5, styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } }])

            const setsDetail = ex.sets_detail || []
            if (setsDetail.length > 0) {
                setsDetail.forEach((set: any, idx: number) => {
                    tableBody.push([
                        `Set ${idx + 1}`,
                        `${set.reps}`,
                        `${set.weight}kg`,
                        `${set.rest}s`,
                        ''
                    ])
                })
            } else {
                tableBody.push([
                    'Series Generales',
                    `${ex.reps}`,
                    '-',
                    '-',
                    `${ex.sets} series`
                ])
            }
        })

        autoTable(doc, {
            startY: 45,
            head: [['Detalle', 'Repes', 'Peso', 'Descanso', 'Notas']],
            body: tableBody,
            theme: 'grid',
            headStyles: { fillColor: [234, 88, 12] } // Orange-600 roughly
        })

        if (workout.description) {
            const finalY = (doc as any).lastAutoTable.finalY || 45
            doc.text("Notas generales:", 14, finalY + 10)
            doc.setFontSize(10)
            doc.text(workout.description, 14, finalY + 16, { maxWidth: 180 })
        }

        doc.save(`Rutina_${workout.name.replace(/\s+/g, '_')}.pdf`)
    }

    const handleShareWhatsApp = () => {
        if (!client.phone) {
            alert("El cliente no tiene un número de teléfono registrado.")
            return
        }

        // Clean phone number (remove spaces, dashes, parentheses)
        const cleanPhone = client.phone.replace(/[^0-9]/g, '')

        const message = `Hola ${client.full_name || ''}
Ya tenés lista la nueva rutina "${workout.name}".
Si algo no te cierra o tenés dudas, avisame!.`

        const encoded = encodeURIComponent(message)
        // Check if phone has country code. If not, maybe warn? Or assume local?
        // Usually Supabase inputs might be raw. We'll try passing cleanPhone.
        // Ideally should have country code.

        window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank')
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
                    <DialogTitle className="text-xl font-bold">Detalle de la rutina</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 pt-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">{workout.name}</h2>
                        <div className="flex items-center text-sm text-muted-foreground gap-4">
                            <span className="font-medium text-foreground">{scheduledDays}</span>
                            {/* Duration removed as requested */}
                        </div>
                    </div>

                    <div className="space-y-4">
                        {exercises.map((ex: any, i: number) => {
                            const setsDetail = ex.sets_detail || []
                            const hasDetailedSets = setsDetail.length > 0

                            return (
                                <div key={i} className="border rounded-lg overflow-hidden">
                                    <div className="bg-muted/30 p-3 font-semibold text-sm border-b flex justify-between">
                                        <span>{ex.name}</span>
                                        {!hasDetailedSets && <span className="text-xs font-normal text-muted-foreground">{ex.sets} series x {ex.reps}</span>}
                                    </div>

                                    {hasDetailedSets ? (
                                        <div className="grid grid-cols-4 gap-2 p-3 text-sm text-center">
                                            <div className="text-xs text-muted-foreground font-medium mb-1 border-b pb-1">Serie</div>
                                            <div className="text-xs text-muted-foreground font-medium mb-1 border-b pb-1">Repes</div>
                                            <div className="text-xs text-muted-foreground font-medium mb-1 border-b pb-1">Peso</div>
                                            <div className="text-xs text-muted-foreground font-medium mb-1 border-b pb-1">Desc</div>

                                            {setsDetail.map((set: any, idx: number) => (
                                                <div key={idx} className="contents">
                                                    <div className="py-1 font-medium text-muted-foreground">{idx + 1}</div>
                                                    <div className="py-1">{set.reps}</div>
                                                    <div className="py-1 font-medium">{set.weight}kg</div>
                                                    <div className="py-1 text-muted-foreground">{set.rest}s</div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-4 text-center text-muted-foreground text-sm">
                                            Sin detalle de series individual (formato antiguo).
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                        {exercises.length === 0 && (
                            <div className="p-8 text-center text-muted-foreground border rounded-lg border-dashed">
                                No hay ejercicios en esta rutina.
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-semibold text-base">Notas:</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {(workout.description && workout.description.trim() !== "")
                                ? workout.description
                                : "Sin notas adicionales."
                            }
                        </p>
                    </div>

                    {/* Actions Footer */}
                    <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-background">
                        <Button variant="outline" onClick={handleDownloadPDF}>
                            <Download className="mr-2 h-4 w-4" />
                            Descargar PDF
                        </Button>
                        <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handleShareWhatsApp}>
                            <MessageCircle className="mr-2 h-4 w-4" />
                            Compartir por WhatsApp
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

