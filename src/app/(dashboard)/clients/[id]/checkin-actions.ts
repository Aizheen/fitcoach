'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createCheckinAction(data: {
    clientId: string
    date: string
    weight: number
    bodyFat?: number
    leanMass?: number
    measurements: any // { chest, waist, hips, etc }
    observations?: string
    photos?: string[]
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'No autorizado' }
    }

    const { error } = await supabase.from('checkins').insert({
        trainer_id: user.id,
        client_id: data.clientId,
        date: data.date,
        weight: data.weight,
        body_fat: data.bodyFat,
        lean_mass: data.leanMass,
        measurements: data.measurements,
        observations: data.observations,
        photos: data.photos || []
    })

    if (error) {
        console.error('Error creating checkin:', error)
        return { error: 'Error al registrar check-in' }
    }

    revalidatePath(`/clients/${data.clientId}`)
    return { success: true }
}

export async function deleteCheckinAction(id: string, clientId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('checkins')
        .delete()
        .eq('id', id)

    if (error) {
        return { error: 'Error al eliminar' }
    }

    revalidatePath(`/clients/${clientId}`)
    return { success: true }
}
