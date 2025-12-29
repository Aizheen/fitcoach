import { createClient } from '@/lib/supabase/server'
import { WorkoutDialog } from '@/components/workouts/add-workout-dialog'
import { WorkoutGrid } from '@/components/workouts/workout-grid'

export default async function WorkoutsPage() {
    const supabase = await createClient()

    const { data: workouts } = await supabase
        .from('workouts')
        .select('*')
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Entrenamientos</h2>
                    <p className="text-muted-foreground text-sm md:text-base">
                        Diseñá tus rutinas para asignarlas a los clientes.
                    </p>
                </div>
                <WorkoutDialog />
            </div>

            <WorkoutGrid workouts={workouts || []} />
        </div>
    )
}
