'use client'

import { Loader2, Settings } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export default function SettingsLoading() {
    return (
        <div className="space-y-8">
            {/* Header skeleton */}
            <div className="space-y-2">
                <Skeleton className="h-9 w-32" />
                <Skeleton className="h-4 w-56" />
            </div>

            {/* Loading indicator */}
            <div className="flex items-center justify-center py-16">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="h-12 w-12 rounded-full border-4 border-primary/20 flex items-center justify-center">
                            <Settings className="h-5 w-5 text-primary/40" />
                        </div>
                        <Loader2 className="absolute -top-0.5 -left-0.5 h-[52px] w-[52px] animate-spin text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground animate-pulse">
                        Cargando ajustes...
                    </p>
                </div>
            </div>
        </div>
    )
}
