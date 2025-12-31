'use client'

import { cn } from "@/lib/utils"
import { Check, Circle } from "lucide-react"

interface WeekStripProps {
    days: any[]
    selectedDay: number
    onSelectDay: (day: number) => void
}

const WEEKDAYS = [
    { id: 1, label: 'Lunes', short: 'L' },
    { id: 2, label: 'Martes', short: 'M' },
    { id: 3, label: 'Miércoles', short: 'X' },
    { id: 4, label: 'Jueves', short: 'J' },
    { id: 5, label: 'Viernes', short: 'V' },
    { id: 6, label: 'Sábado', short: 'S' },
    { id: 7, label: 'Domingo', short: 'D' },
]

export function WeekStrip({ days, selectedDay, onSelectDay }: WeekStripProps) {

    const getStatus = (dayId: number) => {
        const day = days.find(d => d.day_of_week === dayId)
        if (!day) return 'empty'

        // Logic: Complete if all meals have at least one item? Or just "has items"
        const totalItems = day.meals.reduce((acc: number, m: any) => acc + (m.items?.length || 0), 0)
        return totalItems > 0 ? 'active' : 'empty'
    }

    return (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide snap-x">
            {WEEKDAYS.map((day) => {
                const isSelected = selectedDay === day.id
                const status = getStatus(day.id)

                return (
                    <button
                        key={day.id}
                        onClick={() => onSelectDay(day.id)}
                        className={cn(
                            "flex flex-col items-center justify-center min-w-[3.5rem] md:min-w-[4.5rem] h-14 md:h-16 rounded-lg border transition-all touch-manipulation",
                            isSelected
                                ? "bg-primary text-primary-foreground border-primary shadow-md scale-105"
                                : "bg-card hover:bg-muted text-muted-foreground border-muted-foreground/20"
                        )}
                    >
                        <span className="text-xs font-semibold">{day.short}</span>
                        {/* Status indicator */}
                        <div className="mt-1">
                            {status === 'active' && (
                                <div className={cn("w-1.5 h-1.5 rounded-full", isSelected ? "bg-white" : "bg-primary")} />
                            )}
                        </div>
                    </button>
                )
            })}
        </div>
    )
}
