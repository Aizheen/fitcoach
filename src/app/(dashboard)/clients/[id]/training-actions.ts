'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function assignWorkoutAction(data: {
    clientId: string
    name: string
    exercises: any[]
    originTemplateId?: string
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'No autorizado' }
    }

    const { error } = await supabase.from('assigned_workouts').insert({
        trainer_id: user.id,
        client_id: data.clientId,
        name: data.name,
        structure: data.exercises,
        origin_template_id: data.originTemplateId || null,
        is_customized: true // Always true if we are saving a copy
    })

    if (error) {
        console.error('Error assigning workout:', error)
        return { error: 'Error al asignar el entrenamiento' }
    }

    revalidatePath(`/clients/${data.clientId}`)
    return { success: true }
}

export async function deleteAssignedWorkoutAction(id: string, clientId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('assigned_workouts')
        .delete()
        .eq('id', id)

    if (error) {
        return { error: 'Error al eliminar' }
    }

    revalidatePath(`/clients/${clientId}`)
    return { success: true }
}
