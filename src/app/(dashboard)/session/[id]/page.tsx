import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSessionWithWorkout, completeSession } from '../actions'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Check } from 'lucide-react'
import { SessionExerciseList } from '@/components/workout-session/session-exercise-list'

interface SessionPageProps {
    params: Promise<{ id: string }>
}

export default async function SessionPage({ params }: SessionPageProps) {
    const { id } = await params
    const { session, error } = await getSessionWithWorkout(id)

    if (error || !session) {
        redirect('/')
    }

    const workout = (session as any).assigned_workouts
    const client = (session as any).clients
    const exercises = workout?.structure || []

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Header - Fixed on mobile, proper stacking */}
            <div className="fixed top-14 left-0 right-0 z-30 bg-background border-b px-4 py-4 md:static md:border-b-0 md:bg-transparent md:mb-6 md:p-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-lg font-bold">{workout?.name}</h1>
                            <p className="text-sm text-muted-foreground">{client?.full_name}</p>
                        </div>
                    </div>
                    <form action={async () => {
                        'use server'
                        await completeSession(id)
                        redirect('/')
                    }}>
                        <Button type="submit" variant="outline" size="sm" className="gap-1">
                            <Check className="h-4 w-4" />
                            Terminar
                        </Button>
                    </form>
                </div>
            </div>

            {/* Spacer for fixed header on mobile */}
            <div className="h-[84px] md:hidden" />

            {/* Exercise List - All exercises in one scrollable view */}
            <div className="p-4 pt-0 md:p-4">
                <SessionExerciseList
                    sessionId={id}
                    exercises={exercises}
                    clientName={client?.full_name || 'Cliente'}
                    workoutName={workout?.name || 'Rutina'}
                />
            </div>
        </div>
    )
}
