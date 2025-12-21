'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createWorkoutAction(data: {
    name: string
    description?: string
    exercises: any[]
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'No autorizado' }
    }

    if (!data.name?.trim()) {
        return { error: 'El nombre es requerido' }
    }

    // Ensure RLS policy for workouts insert exists!

    const { error } = await supabase.from('workouts').insert({
        trainer_id: user.id,
        name: data.name.trim(),
        description: data.description || null,
        structure: data.exercises, // Saving exercises JSON here
    })

    if (error) {
        console.error('Error creating workout:', error)
        return { error: 'Error al crear la rutina' }
    }

    revalidatePath('/workouts')
    return { success: true }
}
