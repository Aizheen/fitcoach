'use client'

import { useRouter } from 'next/navigation'
import { useTransition, useState } from 'react'
import { MoreHorizontal, FileText, Trash, UserCog, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

// We define a type for the client data we expect
interface Client {
    id: string
    full_name: string
    status: 'active' | 'inactive'
    goal_specific: string | null
    next_checkin_date?: string | null
    // For check-in calculation
    checkins?: { date: string }[]
}

interface ClientTableProps {
    clients: Client[]
}

function getGoalLabel(goal: string | null) {
    if (goal === 'lose_fat') return 'Bajar grasa'
    if (goal === 'gain_muscle') return 'Ganar músculo'
    if (goal === 'recomp') return 'Recomposición'
    return '-'
}

export function ClientTable({ clients }: ClientTableProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [navigatingId, setNavigatingId] = useState<string | null>(null)

    // Helper to calculate next check-in
    const getNextCheckin = (client: Client) => {
        // 1. If we have a manually set next_checkin_date, use it.
        if (client.next_checkin_date) {
            return format(new Date(client.next_checkin_date), 'dd/MM/yyyy', { locale: es })
        }

        // 2. Fallback to automatic calculation if no check-ins.
        if (!client.checkins || client.checkins.length === 0) {
            return "Pendiente (Inicio)"
        }

        // 3. Fallback to last check-in + 7 days.
        const lastCheckin = new Date(client.checkins[0].date)
        const nextCheckin = new Date(lastCheckin)
        nextCheckin.setDate(nextCheckin.getDate() + 7)

        return format(nextCheckin, 'dd/MM/yyyy', { locale: es })
    }

    const handleRowClick = (id: string) => {
        setNavigatingId(id)
        startTransition(() => {
            router.push(`/clients/${id}`)
        })
    }

    const handleEditProfile = (e: React.MouseEvent, id: string) => {
        e.stopPropagation()
        setNavigatingId(id)
        startTransition(() => {
            router.push(`/clients/${id}?tab=settings`)
        })
    }

    const ActionMenu = ({ client }: { client: Client }) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Abrir menú</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleRowClick(client.id)}>
                    <FileText className="mr-2 h-4 w-4" /> Ver perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => handleEditProfile(e, client.id)}>
                    <UserCog className="mr-2 h-4 w-4" /> Editar perfil
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    className="text-destructive"
                    onClick={(e) => {
                        e.stopPropagation();
                        // Add delete logic call here if exists
                    }}
                >
                    <Trash className="mr-2 h-4 w-4" /> Eliminar
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )

    if (clients.length === 0) {
        return (
            <div className="rounded-md border p-8 text-center text-muted-foreground">
                No hay asesorados cargados.
            </div>
        )
    }

    return (
        <>
            {/* Desktop Table */}
            <div className="hidden md:block rounded-md border relative">
                {isPending && !navigatingId && (
                    <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-md">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                )}
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent cursor-default">
                            <TableHead className="w-[80px]">Avatar</TableHead>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Objetivo</TableHead>
                            <TableHead>Próximo Check-in</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {clients.map((client) => (
                            <TableRow
                                key={client.id}
                                className="cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => handleRowClick(client.id)}
                            >
                                <TableCell>
                                    <Avatar>
                                        <AvatarImage src={`https://avatar.vercel.sh/${client.id}.png`} alt={client.full_name} />
                                        <AvatarFallback>{client.full_name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                </TableCell>
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">
                                        {client.full_name}
                                        {isPending && navigatingId === client.id && (
                                            <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                                        {client.status === 'active' ? 'Activo' : 'Inactivo'}
                                    </Badge>
                                </TableCell>
                                <TableCell>{getGoalLabel(client.goal_specific)}</TableCell>
                                <TableCell>{getNextCheckin(client)}</TableCell>
                                <TableCell className="text-right">
                                    <ActionMenu client={client} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
                {clients.map((client) => (
                    <div
                        key={client.id}
                        className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleRowClick(client.id)}
                    >
                        <Avatar>
                            <AvatarImage src={`https://avatar.vercel.sh/${client.id}.png`} alt={client.full_name} />
                            <AvatarFallback>{client.full_name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <p className="font-medium truncate">{client.full_name}</p>
                                {isPending && navigatingId === client.id && (
                                    <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                                )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant={client.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                                    {client.status === 'active' ? 'Activo' : 'Inactivo'}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                    {getGoalLabel(client.goal_specific)}
                                </span>
                            </div>
                        </div>
                        <ActionMenu client={client} />
                    </div>
                ))}
            </div>
        </>
    )
}

