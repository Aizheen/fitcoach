'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Check, ChevronsUpDown, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface IngredientSelectorProps {
    onAdd: (ingredient: any, quantity: number) => void
}

export function IngredientSelector({ onAdd }: IngredientSelectorProps) {
    const [ingredients, setIngredients] = useState<any[]>([])
    const [open, setOpen] = useState(false)
    const [selectedIngredient, setSelectedIngredient] = useState<any>(null)
    const [quantity, setQuantity] = useState('')

    useEffect(() => {
        fetchIngredients()
    }, [])

    const fetchIngredients = async () => {
        const supabase = createClient()
        const { data } = await supabase
            .from('ingredients')
            .select('*')
            .order('name')

        if (data) {
            setIngredients(data)
        }
    }

    const handleAdd = () => {
        if (selectedIngredient && quantity && parseFloat(quantity) > 0) {
            onAdd(selectedIngredient, parseFloat(quantity))
            setSelectedIngredient(null)
            setQuantity('')
        }
    }

    // Calculate macros for selected ingredient with current quantity
    const calculateMacros = () => {
        if (!selectedIngredient || !quantity) return null
        const factor = parseFloat(quantity) / 100
        return {
            kcal: Math.round((selectedIngredient.kcal_100g || 0) * factor),
            protein: Math.round((selectedIngredient.protein_100g || 0) * factor),
            carbs: Math.round((selectedIngredient.carbs_100g || 0) * factor),
            fat: Math.round((selectedIngredient.fat_100g || 0) * factor),
        }
    }

    const macros = calculateMacros()

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-[2fr_1fr_auto] gap-4 items-end">
                <div className="space-y-2">
                    <Label>Nombre del ingrediente</Label>
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={open}
                                className="w-full justify-between"
                            >
                                {selectedIngredient ? selectedIngredient.name : "Seleccionar ingrediente"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[400px] p-0">
                            <Command>
                                <CommandInput placeholder="Buscar ingrediente..." />
                                <CommandEmpty>No se encontraron ingredientes.</CommandEmpty>
                                <CommandGroup className="max-h-[300px] overflow-y-auto">
                                    {ingredients.map((ing) => (
                                        <CommandItem
                                            key={ing.id}
                                            value={`${ing.name} ${ing.state || ''}`}
                                            onSelect={() => {
                                                setSelectedIngredient(ing)
                                                setOpen(false)
                                            }}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    selectedIngredient?.id === ing.id ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            {ing.name} {ing.state && `(${ing.state})`}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="quantity">Cantidad (g)</Label>
                    <Input
                        id="quantity"
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        placeholder="100"
                        min="1"
                    />
                </div>

                <Button
                    type="button"
                    onClick={handleAdd}
                    disabled={!selectedIngredient || !quantity || parseFloat(quantity) <= 0}
                    className="bg-primary hover:bg-primary/90 text-white h-10 w-10 p-0"
                >
                    <Plus className="h-5 w-5" />
                </Button>
            </div>

            {macros && (
                <div className="grid grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
                    <div>
                        <p className="text-xs text-muted-foreground">Kcal</p>
                        <p className="text-lg font-semibold">{macros.kcal}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Proteína (g)</p>
                        <p className="text-lg font-semibold">{macros.protein}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Carbs (g)</p>
                        <p className="text-lg font-semibold">{macros.carbs}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Grasas (g)</p>
                        <p className="text-lg font-semibold">{macros.fat}</p>
                    </div>
                </div>
            )}
        </div>
    )
}
