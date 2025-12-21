'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AddCheckinDialog } from '../add-checkin-dialog'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Trash2 } from 'lucide-react'
import { deleteCheckinAction } from '@/app/(dashboard)/clients/[id]/checkin-actions'

export function CheckinTab({ client }: { client: any }) {
    const [checkins, setCheckins] = useState<any[]>([])

    useEffect(() => {
        fetchCheckins()
    }, [client.id])

    const fetchCheckins = async () => {
        const supabase = createClient()
        const { data } = await supabase
            .from('checkins')
            .select('*')
            .eq('client_id', client.id)
            .order('date', { ascending: true }) // Ascending for chart

        if (data) setCheckins(data)
    }

    const handleDelete = async (id: string) => {
        if (confirm('Eliminar registro?')) {
            await deleteCheckinAction(id, client.id)
            fetchCheckins()
        }
    }

    // Filter valid data for chart
    const chartData = checkins.map(c => ({
        date: format(new Date(c.date), 'dd/MM'),
        weight: c.weight,
        bodyFat: c.body_fat
    }))

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Progreso</h2>
                <AddCheckinDialog clientId={client.id} />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Chart Section */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Evolución de Peso Corporal</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            {chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="date" tickLine={false} axisLine={false} />
                                        <YAxis
                                            domain={['auto', 'auto']}
                                            tickLine={false}
                                            axisLine={false}
                                            padding={{ top: 20, bottom: 20 }}
                                        />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="weight"
                                            stroke="#ea580c"
                                            strokeWidth={3}
                                            dot={{ fill: '#ea580c', r: 4 }}
                                            activeDot={{ r: 6 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-muted-foreground">
                                    No hay suficientes datos para mostrar el gráfico
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* History List */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Historial de Registros</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[...checkins].reverse().map((checkin) => (
                                <div key={checkin.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                                    <div className="grid gap-1">
                                        <span className="font-semibold text-base">
                                            {format(new Date(checkin.date), "EEEE d 'de' MMMM, yyyy", { locale: es })}
                                        </span>
                                        <div className="flex gap-4 text-sm text-muted-foreground">
                                            <span>Peso: <strong className="text-foreground">{checkin.weight} kg</strong></span>
                                            {checkin.body_fat && <span>Grasa: <strong className="text-foreground">{checkin.body_fat}%</strong></span>}
                                        </div>
                                        {checkin.measurements && (
                                            <div className="text-xs text-muted-foreground mt-1">
                                                Cintura: {checkin.measurements.waist || '-'} | Cadera: {checkin.measurements.hips || '-'}
                                            </div>
                                        )}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-muted-foreground hover:text-destructive"
                                        onClick={() => handleDelete(checkin.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            {checkins.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    No hay registros de check-in aun.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
