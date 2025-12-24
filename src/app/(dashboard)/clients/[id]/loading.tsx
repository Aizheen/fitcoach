'use client'

import { Loader2, User } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export default function ClientDetailLoading() {
    return (
        <div className="space-y-8">
            {/* Back button skeleton */}
            <Skeleton className="h-8 w-24" />

            {/* Header skeleton */}
            <div className="flex items-start gap-6">
                {/* Avatar skeleton */}
                <Skeleton className="h-20 w-20 rounded-full" />
                <div className="space-y-2 flex-1">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-32" />
                </div>
            </div>

            {/* Tabs skeleton */}
            <div className="flex gap-4 border-b pb-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
            </div>

            {/* Loading indicator */}
            <div className="flex items-center justify-center py-16">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="h-12 w-12 rounded-full border-4 border-primary/20 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary/40" />
                        </div>
                        <Loader2 className="absolute -top-0.5 -left-0.5 h-[52px] w-[52px] animate-spin text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground animate-pulse">
                        Cargando perfil...
                    </p>
                </div>
            </div>
        </div>
    )
}
