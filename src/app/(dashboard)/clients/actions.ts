'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createClientAction(formData: FormData) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'No autorizado' }
    }

    const full_name = formData.get('full_name') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const birth_date = formData.get('birth_date') as string
    const gender = formData.get('gender') as string
    const initial_weight = formData.get('initial_weight')
    const initial_body_fat = formData.get('initial_body_fat')
    const height = formData.get('height')
    const goal_text = formData.get('goal_text') as string
    const goal_specific = formData.get('goal_specific') as string
    const activity_level = formData.get('activity_level') as string
    const work_type = formData.get('work_type') as string
    const target_weight = formData.get('target_weight')
    const target_fat = formData.get('target_fat')

    const { error } = await supabase.from('clients').insert({
        trainer_id: user.id,
        full_name,
        email: email || null,
        phone: phone || null,
        birth_date: birth_date || null,
        gender: gender || null,
        initial_weight: initial_weight ? parseFloat(initial_weight.toString()) : null,
        initial_body_fat: initial_body_fat ? parseFloat(initial_body_fat.toString()) : null,
        height: height ? parseFloat(height.toString()) : null,
        goal_text: goal_text || null,
        goal_specific: goal_specific || null,
        activity_level: activity_level || null,
        work_type: work_type || null,
        target_weight: target_weight ? parseFloat(target_weight.toString()) : null,
        target_fat: target_fat ? parseFloat(target_fat.toString()) : null,
        status: 'active'
    })

    if (error) {
        console.error(error)
        return { error: 'Error al crear el cliente' }
    }

    revalidatePath('/clients')
    return { success: true }
}

export async function updateClientAction(clientId: string, data: any) {
    const supabase = await createClient()

    // Security check: Handled by RLS (assuming "Trainers can manage own clients")
    // data should be sanitized/validated ideally.

    const { error } = await supabase.from('clients').update(data).eq('id', clientId)

    if (error) {
        console.error("Error updating client:", error)
        return { error: "Error al actualizar la información" }
    }

    revalidatePath(`/clients/${clientId}`)
    revalidatePath('/clients')
    return { success: true }
}

export async function deleteClientAction(clientId: string) {
    const supabase = await createClient()

    const { error } = await supabase.from('clients').delete().eq('id', clientId)

    if (error) {
        console.error("Error deleting client:", error)
        return { error: "Error al eliminar el cliente" }
    }

    revalidatePath('/clients')
    return { success: true }
}
