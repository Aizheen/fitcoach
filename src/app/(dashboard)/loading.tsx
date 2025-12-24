'use client'

import { Loader2 } from 'lucide-react'

export default function DashboardLoading() {
    return (
        <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    <div className="h-16 w-16 rounded-full border-4 border-primary/20" />
                    <Loader2 className="absolute top-0 left-0 h-16 w-16 animate-spin text-primary" />
                </div>
                <p className="text-sm text-muted-foreground animate-pulse">
                    Cargando...
                </p>
            </div>
        </div>
    )
}
