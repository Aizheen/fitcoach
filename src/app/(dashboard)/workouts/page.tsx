import { createClient } from '@/lib/supabase/server'
import { AddWorkoutDialog } from '@/components/workouts/add-workout-dialog'
import { Dumbbell } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

export default async function WorkoutsPage() {
    const supabase = await createClient()

    // Creating RLS policy for workouts if it doesn't exist is handled in SQL usually, 
    // but I assume user will fix it if it fails like Recipes. 
    // For now let's just fetch.
    const { data: workouts } = await supabase
        .from('workouts')
        .select('*')
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Entrenamientos</h2>
                    <p className="text-muted-foreground">
                        Diseñá tus rutinas para asignarlas a los clientes.
                    </p>
                </div>
                <AddWorkoutDialog />
            </div>

            {workouts && workouts.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {workouts.map((workout) => {
                        // Safe parsing of structure if needed, though supabase returns jsonb as object usually
                        const exercises = Array.isArray(workout.structure) ? workout.structure : [];
                        const exerciseCount = exercises.length;

                        return (
                            <Link href={`/workouts/${workout.id}`} key={workout.id} className="block group">
                                <Card className="h-full transition-all hover:border-primary/50 hover:shadow-md cursor-pointer">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <Dumbbell className="h-8 w-8 text-primary mb-2" />
                                        </div>
                                        <CardTitle className="group-hover:text-primary transition-colors">{workout.name}</CardTitle>
                                        {workout.description && (
                                            <CardDescription className="line-clamp-2">{workout.description}</CardDescription>
                                        )}
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium">Ejercicios destacados:</p>
                                            <ul className="text-sm text-muted-foreground list-disc list-inside">
                                                {exercises.slice(0, 3).map((ex: any, i: number) => (
                                                    <li key={i} className="truncate">{ex.name}</li>
                                                ))}
                                                {exercises.length > 3 && <li>... y {exercises.length - 3} más</li>}
                                                {exercises.length === 0 && <li>Sin ejercicios</li>}
                                            </ul>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="pt-0 border-t mt-auto p-6 flex justify-between items-center bg-muted/20">
                                        <span className="text-xs text-muted-foreground">
                                            {exerciseCount} ejercicios
                                        </span>
                                    </CardFooter>
                                </Card>
                            </Link>
                        )
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-lg">
                    <Dumbbell className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold">No hay rutinas creadas</h3>
                    <p className="text-muted-foreground mb-4">Empezá creando tu primera rutina de entrenamiento.</p>
                </div>
            )}
        </div>
    )
}
