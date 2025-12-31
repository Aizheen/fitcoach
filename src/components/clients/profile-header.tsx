'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface ProfileHeaderProps {
    client: {
        full_name: string
        status: 'active' | 'inactive'
        email: string | null
    },
    className?: string
}

export function ProfileHeader({ client, className }: ProfileHeaderProps) {
    return (
        <div className={cn("flex items-center gap-3 md:gap-4", className)}>
            <Button variant="ghost" size="icon" className="-ml-2" asChild>
                <Link href="/clients">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
            </Button>
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <h2 className="text-xl md:text-2xl font-bold tracking-tight truncate">{client.full_name}</h2>
                    <Badge variant={client.status === 'active' ? 'secondary' : 'outline'} className={client.status === 'active' ? "bg-green-100 text-green-700 hover:bg-green-100" : ""}>
                        {client.status === 'active' ? 'ACTIVO' : 'INACTIVO'}
                    </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                    Perfil completo del asesorado
                </p>
            </div>
        </div>
    )
}
