'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    DollarSign,
    Users,
    CheckCircle2,
    Clock,
    AlertCircle,
    Search,
    Mail,
    Plus,
    Loader2,
} from 'lucide-react'
import {
    getClientsWithPayments,
    getPaymentStats,
    updatePaymentStatuses,
    sendPaymentReminder,
    sendBulkReminders,
    type ClientWithPayment,
    type PaymentStats,
} from './actions'
import { RegisterPaymentDialog } from '@/components/payments/register-payment-dialog'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils'

export default function PagosPage() {
    const [clients, setClients] = useState<ClientWithPayment[]>([])
    const [stats, setStats] = useState<PaymentStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [sortBy, setSortBy] = useState<string>('due_date')
    const [selectedClient, setSelectedClient] = useState<ClientWithPayment | null>(null)
    const [registerDialogOpen, setRegisterDialogOpen] = useState(false)
    const [sendingReminder, setSendingReminder] = useState<string | null>(null)

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        try {
            setLoading(true)
            await updatePaymentStatuses()
            const [clientsData, statsData] = await Promise.all([
                getClientsWithPayments(),
                getPaymentStats(),
            ])
            setClients(clientsData)
            setStats(statsData)
        } catch (error) {
            console.error('Error loading data:', error)
            toast.error('No se pudieron cargar los datos')
        } finally {
            setLoading(false)
        }
    }

    // Filter and sort clients
    const filteredClients = useMemo(() => {
        let filtered = clients

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(client =>
                client.full_name.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(client => client.payment_status === statusFilter)
        }

        // Sort
        filtered = [...filtered].sort((a, b) => {
            switch (sortBy) {
                case 'due_date':
                    if (!a.next_due_date) return 1
                    if (!b.next_due_date) return -1
                    return new Date(a.next_due_date).getTime() - new Date(b.next_due_date).getTime()
                case 'most_overdue':
                    if (!a.next_due_date) return 1
                    if (!b.next_due_date) return -1
                    return new Date(b.next_due_date).getTime() - new Date(a.next_due_date).getTime()
                case 'name':
                    return a.full_name.localeCompare(b.full_name)
                default:
                    return 0
            }
        })

        return filtered
    }, [clients, searchQuery, statusFilter, sortBy])

    async function handleSendReminder(clientId: string) {
        try {
            setSendingReminder(clientId)
            const result = await sendPaymentReminder(clientId)
            toast.success(result.message)
        } catch (error) {
            toast.error('No se pudo enviar el recordatorio')
        } finally {
            setSendingReminder(null)
        }
    }

    async function handleBulkReminders() {
        const clientsToRemind = clients
            .filter(c => c.payment_status === 'pending' || c.payment_status === 'overdue')
            .map(c => c.id)

        if (clientsToRemind.length === 0) {
            toast.info('No hay clientes con pagos pendientes o vencidos')
            return
        }

        try {
            const result = await sendBulkReminders(clientsToRemind)
            toast.success(result.message)
        } catch (error) {
            toast.error('No se pudieron enviar los recordatorios')
        }
    }

    function getStatusBadge(status: string) {
        switch (status) {
            case 'paid':
                return <Badge variant="default" className="bg-green-500">Pagado</Badge>
            case 'pending':
                return <Badge variant="secondary">Pendiente</Badge>
            case 'overdue':
                return <Badge variant="destructive">Vencido</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    function formatDate(date: string | null) {
        if (!date) return '-'
        return new Date(date).toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        })
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Pagos</h1>
                    <p className="text-muted-foreground">
                        Gestiona los pagos de tus asesorados
                    </p>
                </div>
                <Button onClick={handleBulkReminders} variant="outline">
                    <Mail className="mr-2 h-4 w-4" />
                    Enviar recordatorios
                </Button>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Asesorados activos
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.activeClients || 0}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Pagos al día
                        </CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.paidClients || 0}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Pagos pendientes
                        </CardTitle>
                        <Clock className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.pendingClients || 0}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Pagos vencidos
                        </CardTitle>
                        <AlertCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.overdueClients || 0}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Ingresos estimados
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(stats?.estimatedMonthlyIncome || 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">por mes</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar por nombre..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full md:w-[180px]">
                                <SelectValue placeholder="Estado" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="paid">Pagado</SelectItem>
                                <SelectItem value="pending">Pendiente</SelectItem>
                                <SelectItem value="overdue">Vencido</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="w-full md:w-[200px]">
                                <SelectValue placeholder="Ordenar por" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="due_date">Vencimiento próximo</SelectItem>
                                <SelectItem value="most_overdue">Más vencidos</SelectItem>
                                <SelectItem value="name">Nombre (A-Z)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Clients Table */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        {filteredClients.length} {filteredClients.length === 1 ? 'asesorado' : 'asesorados'}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {filteredClients.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                No se encontraron asesorados
                            </div>
                        ) : (
                            filteredClients.map((client) => (
                                <div
                                    key={client.id}
                                    className="flex flex-col gap-4 p-4 border rounded-lg md:flex-row md:items-center"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium truncate">{client.full_name}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {client.plan_name || 'Sin plan'}
                                        </div>
                                    </div>
                                    <div className="text-sm font-medium md:w-32">
                                        {formatCurrency(client.price_monthly || 0)}
                                    </div>
                                    <div className="md:w-24">
                                        {getStatusBadge(client.payment_status)}
                                    </div>
                                    <div className="text-sm text-muted-foreground md:w-32">
                                        {formatDate(client.next_due_date)}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            onClick={() => {
                                                setSelectedClient(client)
                                                setRegisterDialogOpen(true)
                                            }}
                                        >
                                            <Plus className="mr-2 h-4 w-4" />
                                            Registrar
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleSendReminder(client.id)}
                                            disabled={sendingReminder === client.id}
                                        >
                                            {sendingReminder === client.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Mail className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Register Payment Dialog */}
            {selectedClient && (
                <RegisterPaymentDialog
                    client={selectedClient}
                    open={registerDialogOpen}
                    onOpenChange={setRegisterDialogOpen}
                    onSuccess={loadData}
                />
            )}
        </div>
    )
}
