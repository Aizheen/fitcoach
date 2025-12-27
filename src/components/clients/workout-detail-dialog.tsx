'use client'

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { generateWorkoutPDF } from '@/lib/pdf-utils'

interface WorkoutDetailDialogProps {
    isOpen: boolean
    onClose: () => void
    workout: any
    client?: any
}

export function WorkoutDetailDialog({ isOpen, onClose, workout, client }: WorkoutDetailDialogProps) {
    if (!workout) return null

    const exercises = Array.isArray(workout.structure) ? workout.structure : []

    // Only show scheduled days if client context exists and they are scheduled
    const scheduledDays = client && workout.scheduled_days && workout.scheduled_days.length > 0
        ? workout.scheduled_days.join(" | ")
        : null

    const handleDownloadPDF = () => {
        generateWorkoutPDF({ workout, client })
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
                            {scheduledDays && (
                                <span className="font-medium text-foreground">{scheduledDays}</span>
                            )}
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

                    {/* Only show notes section if notes exist */}
                    {workout.notes && workout.notes.trim() !== "" && (
                        <div className="space-y-2">
                            <h3 className="font-semibold text-base">Notas:</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {workout.notes}
                            </p>
                        </div>
                    )}

                    {/* Actions Footer */}
                    <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-background">
                        <Button variant="outline" onClick={handleDownloadPDF}>
                            <Download className="mr-2 h-4 w-4" />
                            Descargar PDF
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
