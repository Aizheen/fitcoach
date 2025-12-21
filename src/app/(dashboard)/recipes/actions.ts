'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createRecipeAction(data: {
    name: string
    ingredients: any[]
}) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'No autorizado' }
    }

    if (!data.name || !data.name.trim()) {
        return { error: 'El nombre es requerido' }
    }

    if (!data.ingredients || data.ingredients.length === 0) {
        return { error: 'Debe agregar al menos un ingrediente' }
    }

    const { error } = await supabase.from('recipes').insert({
        trainer_id: user.id,
        name: data.name.trim(),
        ingredients_data: data.ingredients,
    })

    if (error) {
        console.error(error)
        return { error: 'Error al crear la receta' }
    }

    revalidatePath('/recipes')
    return { success: true }
}
