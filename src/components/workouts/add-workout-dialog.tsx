'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea' // Note: Ensure Textarea exists or use Input
import { Plus, X, GripVertical } from 'lucide-react'
import { ExerciseSelector } from './exercise-selector'
import { createWorkoutAction } from '@/app/(dashboard)/workouts/actions'

export function AddWorkoutDialog() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [exercises, setExercises] = useState<any[]>([])

    const router = useRouter()

    const handleAddExercise = (exercise: any, details: any) => {
        setExercises([...exercises, {
            exercise_id: exercise.id,
            name: exercise.name,
            ...details
        }])
    }

    const handleRemoveExercise = (index: number) => {
        setExercises(exercises.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const result = await createWorkoutAction({
            name,
            description,
            exercises
        })

        if (result?.error) {
            alert(result.error)
        } else {
            setOpen(false)
            resetForm()
            router.refresh()
        }
        setLoading(false)
    }

    const resetForm = () => {
        setName('')
        setDescription('')
        setExercises([])
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-white">
                    <Plus className="mr-2 h-4 w-4" /> Nuevo Entrenamiento
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Crear Rutina de Entrenamiento</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre de la Rutina</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Ej: Pierna Hipertrofia A"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Descripción (opcional)</Label>
                            <Input
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Notas sobre la rutina..."
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Ejercicios</h3>

                        <ExerciseSelector onAdd={handleAddExercise} />

                        {/* List of added exercises */}
                        <div className="space-y-2 mt-4">
                            {exercises.map((ex, index) => (
                                <div key={index} className="flex items-center gap-4 p-3 bg-muted rounded-md border">
                                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                                    <div className="flex-1">
                                        <p className="font-medium">{ex.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {ex.sets} x {ex.reps} | Descanso: {ex.rest}s {ex.rpe && `| RPE: ${ex.rpe}`}
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleRemoveExercise(index)}
                                        className="text-destructive hover:bg-destructive/10"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            {exercises.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4">No hay ejercicios agregados aún.</p>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading || !name}
                            className="bg-primary text-white hover:bg-primary/90"
                        >
                            {loading ? 'Guardando...' : 'Guardar Rutina'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
