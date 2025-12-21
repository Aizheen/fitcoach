'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, X } from 'lucide-react'
import { IngredientSelector } from './ingredient-selector'

interface SelectedIngredient {
    id: string
    name: string
    kcal_100g: number
    protein_100g: number
    carbs_100g: number
    fat_100g: number
    fiber_100g: number
    quantity_grams: number
}

export function AddRecipeDialog() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [selectedIngredients, setSelectedIngredients] = useState<SelectedIngredient[]>([])
    const [recipeName, setRecipeName] = useState('')
    const router = useRouter()

    const handleAddIngredient = (ingredient: any, quantity: number) => {
        setSelectedIngredients([...selectedIngredients, {
            id: ingredient.id,
            name: ingredient.name,
            kcal_100g: ingredient.kcal_100g,
            protein_100g: ingredient.protein_100g,
            carbs_100g: ingredient.carbs_100g,
            fat_100g: ingredient.fat_100g,
            fiber_100g: ingredient.fiber_100g,
            quantity_grams: quantity,
        }])
    }

    const handleRemoveIngredient = (index: number) => {
        setSelectedIngredients(selectedIngredients.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        const { createRecipeAction } = await import('@/app/(dashboard)/recipes/actions')

        const result = await createRecipeAction({
            name: recipeName,
            ingredients: selectedIngredients,
        })

        if (result?.error) {
            alert(result.error)
        } else {
            setOpen(false)
            setSelectedIngredients([])
            setRecipeName('')
            router.refresh()
        }
        setLoading(false)
    }

    // Calculate total macros
    const totalMacros = selectedIngredients.reduce((totals, ing) => {
        const factor = ing.quantity_grams / 100
        return {
            kcal: totals.kcal + (ing.kcal_100g || 0) * factor,
            protein: totals.protein + (ing.protein_100g || 0) * factor,
            carbs: totals.carbs + (ing.carbs_100g || 0) * factor,
            fat: totals.fat + (ing.fat_100g || 0) * factor,
        }
    }, { kcal: 0, protein: 0, carbs: 0, fat: 0 })

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-white">
                    <Plus className="mr-2 h-4 w-4" /> Añadir ingrediente
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        <Input
                            value={recipeName}
                            onChange={(e) => setRecipeName(e.target.value)}
                            placeholder="Nombre del plato"
                            className="text-lg font-semibold border-none p-0 h-auto focus-visible:ring-0"
                        />
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Ingredientes del plato</h3>
                        <IngredientSelector onAdd={handleAddIngredient} />
                    </div>

                    {selectedIngredients.length > 0 && (
                        <div className="border rounded-lg p-6 min-h-[200px] bg-muted/20">
                            <div className="space-y-3">
                                {selectedIngredients.map((ing, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-background rounded-lg border">
                                        <div className="flex-1">
                                            <p className="font-medium">{ing.name}</p>
                                            <p className="text-sm text-muted-foreground">{ing.quantity_grams}g</p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleRemoveIngredient(index)}
                                            className="hover:bg-destructive/10"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="border-t pt-4">
                        <div className="grid grid-cols-4 gap-6">
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Calorías totales</p>
                                <p className="text-2xl font-bold">{Math.round(totalMacros.kcal)} kcal</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Proteínas</p>
                                <p className="text-2xl font-bold">{Math.round(totalMacros.protein).toFixed(1)} g</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Carbohidratos</p>
                                <p className="text-2xl font-bold">{Math.round(totalMacros.carbs).toFixed(1)} g</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Grasas</p>
                                <p className="text-2xl font-bold">{Math.round(totalMacros.fat).toFixed(1)} g</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex jutify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cerrar
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading || selectedIngredients.length === 0 || !recipeName.trim()}
                            className="bg-primary text-white hover:bg-primary/90"
                        >
                            {loading ? 'Guardando...' : 'Guardar plato'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
