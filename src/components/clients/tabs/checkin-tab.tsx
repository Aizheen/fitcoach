'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AddCheckinDialog } from '../add-checkin-dialog'
import { deleteCheckinAction } from '@/app/(dashboard)/clients/[id]/checkin-actions'
import { MeasuresTable } from '@/components/clients/checkin/measures-table'
import { WeightSummary } from '@/components/clients/checkin/weight-summary'
import { WeightChart } from '@/components/clients/checkin/weight-chart'
import { HistoryTable } from '@/components/clients/checkin/history-table'
import { EditTargetDialog } from '@/components/clients/checkin/edit-target-dialog'

export const METRICS_CONFIG: Record<string, { label: string, unit: string }> = {
    weight: { label: 'Peso', unit: 'kg' },
    body_fat: { label: 'Grasa corporal', unit: '%' },
    lean_mass: { label: 'Masa magra', unit: 'kg' },
    'measurements.chest': { label: 'Medida Pecho', unit: 'cm' },
    'measurements.waist': { label: 'Medida Cintura', unit: 'cm' },
    'measurements.hips': { label: 'Medida Cadera', unit: 'cm' },
    'measurements.arm': { label: 'Medida Brazo', unit: 'cm' },
    'measurements.thigh': { label: 'Medida Muslo', unit: 'cm' },
    'measurements.calves': { label: 'Medida Gemelos', unit: 'cm' },
}

export function CheckinTab({ client }: { client: any }) {
    const [checkins, setCheckins] = useState<any[]>([])
    const [selectedMetric, setSelectedMetric] = useState<string>('weight')

    useEffect(() => {
        fetchCheckins()
    }, [client.id])

    const fetchCheckins = async () => {
        try {
            const supabase = createClient()
            const { data } = await supabase
                .from('checkins')
                .select('*')
                .eq('client_id', client.id)
                .order('date', { ascending: true })

            if (data) setCheckins(data)
        } catch (error) {
            console.error("Error fetching checkins", error)
        }
    }

    const [isEditTargetOpen, setIsEditTargetOpen] = useState(false)
    const [localTargets, setLocalTargets] = useState<Record<string, number>>({})

    // Initial load of targets from client prop if available, or fetch freshly
    // Ideally we should sync this. For now let's assume client prop has it or we rely on revalidate.
    // But since 'targets' is new, we might need to fetch it in fetchCheckins or a new fetchClient.
    // Let's create a fetchClientDetails function to cover ourselves.

    const fetchClientDetails = async () => {
        const supabase = createClient()
        const { data } = await supabase
            .from('clients')
            .select('target_weight, target_fat, targets')
            .eq('id', client.id)
            .single()

        if (data) {
            // Merge all into a unified structure for easier access
            const merged = { ...data.targets, weight: data.target_weight, body_fat: data.target_fat }
            setLocalTargets(merged)
        }
    }

    useEffect(() => {
        fetchCheckins()
        fetchClientDetails()
    }, [client.id])


    // Helper to get series data for selected metric
    const getMetricData = (key: string) => {
        return checkins.map(c => {
            let val = null
            if (key.startsWith('measurements.')) {
                const measKey = key.split('.')[1]
                val = c.measurements?.[measKey]
            } else {
                val = c[key]
            }
            return {
                date: c.date,
                value: val ? Number(val) : null
            }
        }).filter(d => d.value !== null)
    }

    const handleSaveTarget = async (value: number) => {
        const { updateClientTargetAction } = await import('@/app/(dashboard)/clients/[id]/target-actions')
        const result = await updateClientTargetAction(client.id, selectedMetric, value)

        if (result.success) {
            // Optimistic update or refetch
            setLocalTargets(prev => ({
                ...prev,
                [selectedMetric]: value
            }))
            fetchClientDetails() // Ensure sync
        }
    }

    const metricData = getMetricData(selectedMetric)
    const metricConfig = METRICS_CONFIG[selectedMetric] || { label: 'Medida', unit: '' }

    const startVal = metricData.length > 0 ? metricData[0].value : null
    const currentVal = metricData.length > 0 ? metricData[metricData.length - 1].value : null

    // Target logic: unified lookup
    const targetVal = localTargets[selectedMetric] || null

    return (
        <div className="max-w-[1400px] mx-auto space-y-6">
            <div className="flex justify-end mb-2">
                <AddCheckinDialog clientId={client.id} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column (40%) */}
                <div className="lg:col-span-5">
                    <MeasuresTable
                        checkins={checkins}
                        selectedMetric={selectedMetric}
                        onSelect={setSelectedMetric}
                    />
                </div>

                {/* Right Column (60%) */}
                <div className="lg:col-span-7 flex flex-col">
                    <WeightSummary
                        current={currentVal}
                        start={startVal}
                        target={targetVal}
                        label={metricConfig.label}
                        unit={metricConfig.unit}
                        onEditTarget={() => setIsEditTargetOpen(true)}
                    />

                    <WeightChart
                        data={metricData} // Pass normalized {date, value}
                        target={targetVal}
                        unit={metricConfig.unit}
                    />

                    <HistoryTable
                        data={metricData} // Pass normalized
                        unit={metricConfig.unit}
                    />
                </div>
            </div>

            <EditTargetDialog
                open={isEditTargetOpen}
                onOpenChange={setIsEditTargetOpen}
                metricLabel={metricConfig.label}
                metricUnit={metricConfig.unit}
                initialValue={targetVal}
                onSave={handleSaveTarget}
            />
        </div>
    )
}
