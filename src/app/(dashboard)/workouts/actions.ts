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

    const { error } = await supabase.from('workouts').insert({
        trainer_id: user.id,
        name: data.name.trim(),
        description: data.description || null,
        structure: data.exercises,
    })

    if (error) {
        console.error('Error creating workout:', error)
        return { error: 'Error al crear la rutina' }
    }

    revalidatePath('/workouts')
    return { success: true }
}

export async function deleteWorkoutAction(workoutId: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('workouts').delete().eq('id', workoutId)

    if (error) {
        console.error("Error deleting workout:", error)
        return { error: "Error al eliminar la rutina" }
    }

    revalidatePath('/workouts')
    return { success: true }
}

export async function updateWorkoutAction(id: string, name: string, description: string, exercises: any[]) {
    const supabase = await createClient()
    const { error } = await supabase.from('workouts').update({
        name,
        description,
        structure: exercises
    }).eq('id', id)

    if (error) return { error: "Error actualizando rutina" }
    revalidatePath('/workouts')
    return { success: true }
}

export async function assignWorkoutToClientsAction(templateId: string, clientIds: string[], name: string, structure: any[]) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "No autorizado" }

    const inserts = clientIds.map(clientId => ({
        trainer_id: user.id,
        client_id: clientId,
        name: name,
        origin_template_id: templateId,
        structure: structure,
        is_customized: false,
        scheduled_days: [] // Default empty
    }))

    const { error } = await supabase.from('assigned_workouts').insert(inserts)

    if (error) {
        console.error("Error mass assigning workout:", error)
        return { error: "Error al asignar rutina" }
    }

    // Revalidate client paths? Hard to know all IDs. 
    // Usually fetching in tabs is dynamic so it's fine.
    revalidatePath('/workouts')
    return { success: true }
}
