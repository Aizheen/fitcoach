'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dumbbell, Trash2, ChevronRight } from 'lucide-react'
import { AssignWorkoutDialog } from '../assign-workout-dialog'
import { deleteAssignedWorkoutAction } from '@/app/(dashboard)/clients/[id]/training-actions'

interface TrainingTabProps {
    clientId: string
}

export function TrainingTab({ clientId }: TrainingTabProps) {
    const [workouts, setWorkouts] = useState<any[]>([])

    // Realtime subscription or simple fetch on mount
    useEffect(() => {
        fetchAssignedWorkouts()
    }, [clientId])

    const fetchAssignedWorkouts = async () => {
        const supabase = createClient()
        const { data } = await supabase
            .from('assigned_workouts')
            .select('*')
            .eq('client_id', clientId)
            .order('created_at', { ascending: false })

        if (data) setWorkouts(data)
    }

    const handleDelete = async (id: string) => {
        if (confirm('¿Estás seguro de eliminar esta rutina asignada?')) {
            await deleteAssignedWorkoutAction(id, clientId)
            fetchAssignedWorkouts() // Refresh list
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium">Plan de Entrenamiento</h3>
                    <p className="text-sm text-muted-foreground">Rutinas asignadas actualmente.</p>
                </div>
                <AssignWorkoutDialog clientId={clientId} />
            </div>

            <div className="grid gap-4">
                {workouts.map((workout) => {
                    const exercises = Array.isArray(workout.structure) ? workout.structure : []
                    return (
                        <Card key={workout.id} className="relative group">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-primary/10 rounded-lg">
                                            <Dumbbell className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base">{workout.name}</CardTitle>
                                            <CardDescription className="text-xs">
                                                Asignado el {new Date(workout.created_at).toLocaleDateString()}
                                            </CardDescription>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-muted-foreground hover:text-destructive"
                                        onClick={() => handleDelete(workout.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <p className="text-xs font-medium text-muted-foreground uppercase mb-2">Ejercicios</p>
                                    {exercises.slice(0, 4).map((ex: any, i: number) => (
                                        <div key={i} className="flex justify-between text-sm border-b last:border-0 pb-1 last:pb-0">
                                            <span>{ex.name}</span>
                                            <span className="text-muted-foreground">{ex.sets}x{ex.reps}</span>
                                        </div>
                                    ))}
                                    {exercises.length > 4 && (
                                        <p className="text-xs text-muted-foreground pt-1">
                                            + {exercises.length - 4} ejercicios más
                                        </p>
                                    )}
                                    {exercises.length === 0 && <p className="text-sm text-muted-foreground">Sin ejercicios</p>}
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}

                {workouts.length === 0 && (
                    <div className="text-center py-10 border-2 border-dashed rounded-lg">
                        <Dumbbell className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground">No hay rutinas asignadas a este cliente.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
