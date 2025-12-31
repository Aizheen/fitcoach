'use client'

import { useState, useEffect } from 'react'
import { getWeeklyPlan, createWeeklyPlan, updateReviewDate } from '@/app/(dashboard)/clients/[id]/meal-plan-actions'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Download, Loader2, Calendar, Edit, ChevronLeft, ChevronRight } from 'lucide-react'
import { WeekStrip } from './week-strip'
import { DayView } from './day-view'
import { PlanWizard } from './plan-wizard'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { generateWeeklyPlanPDF } from './pdf-generator'

interface WeeklyMealPlanContainerProps {
    clientId: string
    clientName: string
    clientAllergens?: string[]
    clientPreference?: string
}

export function WeeklyMealPlanContainer({ clientId, clientName, clientAllergens, clientPreference }: WeeklyMealPlanContainerProps) {
    const [loading, setLoading] = useState(true)
    const [plan, setPlan] = useState<any>(null)
    const [selectedDay, setSelectedDay] = useState<number>(1) // 1 = Monday
    const [wizardOpen, setWizardOpen] = useState(false)

    // Refresh trigger
    const [refreshKey, setRefreshKey] = useState(0)

    useEffect(() => {
        fetchPlan()
    }, [clientId, refreshKey])

    const fetchPlan = async () => {
        setLoading(true)
        try {
            const { plan } = await getWeeklyPlan(clientId)
            setPlan(plan)
        } catch (error) {
            console.error("Error fetching plan", error)
        } finally {
            setLoading(false)
        }
    }

    // ... existing handlers ...
    const handleCreatePlan = async (config: string[]) => {
        try {
            const result = await createWeeklyPlan(clientId, config)
            if (result.error) {
                alert(result.error)
                return
            }
            setWizardOpen(false)
            setRefreshKey(prev => prev + 1)
        } catch (error) {
            alert('Error inesperado al crear el plan')
        }
    }

    const handleUpdateReviewDate = async (date: Date | undefined) => {
        if (!plan) return
        const dateStr = date ? format(date, 'yyyy-MM-dd') : null
        await updateReviewDate(plan.id, clientId, dateStr)
        setPlan({ ...plan, review_date: dateStr })
    }

    const handleDownloadPDF = () => {
        if (!plan) return
        generateWeeklyPlanPDF(plan, clientName)
    }

    if (loading) {
        return <div className="flex justify-center p-12"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
    }

    if (!plan) {
        return (
            <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg space-y-4">
                <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center">
                    <Calendar className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="text-center space-y-2">
                    <h3 className="text-lg font-semibold">No hay plan semanal activo</h3>
                    <p className="text-muted-foreground max-w-sm">Configura un plan semanal para organizar las comidas de tu asesorado día por día.</p>
                </div>
                <Button onClick={() => setWizardOpen(true)}>Crear Plan Semanal</Button>

                <PlanWizard
                    open={wizardOpen}
                    onOpenChange={setWizardOpen}
                    onConfirm={handleCreatePlan}
                />
            </div>
        )
    }

    const currentDayData = plan.days.find((d: any) => d.day_of_week === selectedDay)

    return (
        <div className="space-y-6">
            {/* Header: Review Date & Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted/30 p-4 rounded-lg border">
                <div>
                    <h3 className="font-bold text-lg">Plan Nutricional Semanal</h3>
                    <p className="text-xs text-muted-foreground">Planifica la semana completa (Lunes a Domingo)</p>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
                        <Download className="mr-2 h-4 w-4" />
                        Descargar PDF
                    </Button>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className={!plan.review_date ? "text-muted-foreground" : ""}>
                                <Calendar className="mr-2 h-4 w-4" />
                                {plan.review_date ? `Revisión: ${format(new Date(plan.review_date), 'dd MMM', { locale: es })}` : "Sin fecha de revisión"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <CalendarComponent
                                mode="single"
                                selected={plan.review_date ? new Date(plan.review_date) : undefined}
                                onSelect={handleUpdateReviewDate}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            {/* Week Strip */}
            <WeekStrip
                days={plan.days}
                selectedDay={selectedDay}
                onSelectDay={setSelectedDay}
            />

            {/* Day View */}
            <div className="mt-6">
                <DayView
                    day={currentDayData}
                    allDays={plan.days} // For copy functionality
                    clientId={clientId}
                    clientAllergens={clientAllergens}
                    clientPreference={clientPreference}
                    onUpdate={() => setRefreshKey(prev => prev + 1)}
                />
            </div>
        </div>
    )
}
