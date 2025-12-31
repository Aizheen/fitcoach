'use client'

import { MealSlot } from './meal-slot'
import { Button } from '@/components/ui/button'
import { Copy, Trash2, RotateCcw } from 'lucide-react'
import { copyDay } from '@/app/(dashboard)/clients/[id]/meal-plan-actions'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useState } from 'react'

interface DayViewProps {
    day: any
    allDays: any[]
    clientId: string
    clientAllergens?: string[]
    clientPreference?: string
    onUpdate: () => void
}

const WEEKDAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

export function DayView({ day, allDays, clientId, clientAllergens, clientPreference, onUpdate }: DayViewProps) {
    const [loading, setLoading] = useState(false)

    if (!day) return null

    const dayLabel = WEEKDAYS[day.day_of_week - 1]

    const handleCopyDay = async (targetDayId: string) => {
        if (!confirm(`¿Copiar todo el contenido de ${dayLabel} al día seleccionado? Esto reemplazará lo que haya en ese día.`)) return

        setLoading(true)
        try {
            await copyDay(day.id, targetDayId, clientId)
            onUpdate()
            alert('Copiado correctamente')
        } catch (error) {
            console.error(error)
            alert('Error al copiar')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">{dayLabel}</h2>

                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" disabled={loading}>
                                <Copy className="mr-2 h-4 w-4" /> Copiar a...
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            {allDays
                                .filter(d => d.id !== day.id)
                                .map(d => (
                                    <DropdownMenuItem key={d.id} onClick={() => handleCopyDay(d.id)}>
                                        {WEEKDAYS[d.day_of_week - 1]}
                                    </DropdownMenuItem>
                                ))
                            }
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {day.meals.map((meal: any) => (
                    <MealSlot
                        key={meal.id}
                        meal={meal}
                        dayName={dayLabel}
                        clientId={clientId}
                        clientAllergens={clientAllergens}
                        clientPreference={clientPreference}
                        onUpdate={onUpdate}
                    />
                ))}

                {day.meals.length === 0 && (
                    <div className="col-span-full border border-dashed p-8 text-center text-muted-foreground rounded-lg">
                        No hay comidas configuradas para este día.
                    </div>
                )}
            </div>
        </div>
    )
}
