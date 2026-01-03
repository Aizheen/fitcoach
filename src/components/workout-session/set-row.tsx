'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Check, Pencil, Trash2 } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface SetRowProps {
    setNumber: number
    previousData: { weight: number; reps: number } | null
    defaultWeight: number
    defaultReps: number
    currentWeight?: number
    currentReps?: number
    isCompleted: boolean
    onSave: (reps: number, weight: number, isCompleted: boolean) => void
    onDelete?: () => void
}

export function SetRow({
    setNumber,
    previousData,
    defaultWeight,
    defaultReps,
    currentWeight,
    currentReps,
    isCompleted: initialCompleted,
    onSave,
    onDelete,
}: SetRowProps) {
    const [weight, setWeight] = useState(currentWeight ?? defaultWeight)
    const [reps, setReps] = useState(currentReps ?? defaultReps)
    const [isCompleted, setIsCompleted] = useState(initialCompleted)
    const [isEditing, setIsEditing] = useState(!initialCompleted)

    // Sync with props changes
    useEffect(() => {
        if (currentWeight !== undefined) setWeight(currentWeight)
        if (currentReps !== undefined) setReps(currentReps)
        setIsCompleted(initialCompleted)
        setIsEditing(!initialCompleted)
    }, [currentWeight, currentReps, initialCompleted])

    const handleComplete = () => {
        const newCompleted = !isCompleted
        setIsCompleted(newCompleted)
        setIsEditing(!newCompleted)
        onSave(reps, weight, newCompleted)
    }

    const handleEdit = () => {
        setIsEditing(true)
        setIsCompleted(false)
    }

    const handleWeightChange = (value: string) => {
        const num = parseFloat(value) || 0
        setWeight(num)
    }

    const handleRepsChange = (value: string) => {
        const num = parseInt(value) || 0
        setReps(num)
    }

    const handleBlur = () => {
        // Auto-save on blur if values changed
        if (!isCompleted) {
            onSave(reps, weight, false)
        }
    }

    return (
        <div className={cn("grid grid-cols-[40px_1fr_70px_60px_40px] items-center gap-2 py-3 border-b border-border/50 last:border-0")}>
            {/* Set Number */}
            <span className="text-sm font-semibold text-center">
                {setNumber}
            </span>

            {/* Previous Data */}
            <span className="text-sm text-muted-foreground text-center">
                {previousData
                    ? `${previousData.weight}kg x${previousData.reps}`
                    : '-'
                }
            </span>

            {/* Weight Input */}
            <div className="flex items-center justify-center relative">
                <Input
                    type="number"
                    value={weight}
                    onChange={(e) => handleWeightChange(e.target.value)}
                    onBlur={handleBlur}
                    disabled={!isEditing}
                    step={0.5}
                    min={0}
                    className={cn(
                        "h-8 w-full text-center font-medium bg-transparent border-none p-0 focus-visible:ring-0",
                        !isEditing && "text-foreground"
                    )}
                />
                <span className="text-xs text-muted-foreground absolute right-0 pointer-events-none">kg</span>
            </div>

            {/* Reps Input */}
            <div className="flex items-center justify-center">
                <Input
                    type="number"
                    value={reps}
                    onChange={(e) => handleRepsChange(e.target.value)}
                    onBlur={handleBlur}
                    disabled={!isEditing}
                    min={0}
                    className={cn(
                        "h-8 w-full text-center font-medium bg-transparent border-none p-0 focus-visible:ring-0",
                        !isEditing && "text-foreground"
                    )}
                />
            </div>

            {/* Check Button / Menu */}
            <div className="flex items-center justify-center">
                {isEditing ? (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleComplete}
                        className="h-8 w-8 rounded-md bg-muted hover:bg-muted-foreground/20 text-muted-foreground"
                    >
                        <Check className="h-4 w-4" />
                    </Button>
                ) : (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="default"
                                size="icon"
                                className="h-8 w-8 rounded-md bg-foreground hover:bg-foreground/90 text-background"
                            >
                                <Check className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={handleEdit}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Editar
                            </DropdownMenuItem>
                            {onDelete && (
                                <DropdownMenuItem
                                    onClick={onDelete}
                                    className="text-destructive"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Eliminar
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
        </div>
    )
}
