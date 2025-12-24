'use client'

import { Loader2, Utensils } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export default function RecipeDetailLoading() {
    return (
        <div className="space-y-8">
            {/* Back button skeleton */}
            <Skeleton className="h-8 w-24" />

            {/* Header skeleton */}
            <div className="space-y-4">
                <Skeleton className="h-10 w-64" />
                <div className="flex gap-2">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                </div>
            </div>

            {/* Loading indicator */}
            <div className="flex items-center justify-center py-16">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="h-12 w-12 rounded-full border-4 border-primary/20 flex items-center justify-center">
                            <Utensils className="h-5 w-5 text-primary/40" />
                        </div>
                        <Loader2 className="absolute -top-0.5 -left-0.5 h-[52px] w-[52px] animate-spin text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground animate-pulse">
                        Cargando receta...
                    </p>
                </div>
            </div>
        </div>
    )
}
