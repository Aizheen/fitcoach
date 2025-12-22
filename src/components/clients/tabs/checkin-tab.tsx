'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AddCheckinDialog } from '../add-checkin-dialog'
import { deleteCheckinAction } from '@/app/(dashboard)/clients/[id]/checkin-actions'
import { MeasuresTable } from '@/components/clients/checkin/measures-table'
import { WeightSummary } from '@/components/clients/checkin/weight-summary'
import { WeightChart } from '@/components/clients/checkin/weight-chart'
import { HistoryTable } from '@/components/clients/checkin/history-table'

export function CheckinTab({ client }: { client: any }) {
    const [checkins, setCheckins] = useState<any[]>([])

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
                .order('date', { ascending: true }) // Ascending for simplified logic in charts

            if (data) setCheckins(data)
        } catch (error) {
            console.error("Error fetching checkins", error)
        }
    }

    const startWeight = checkins.length > 0 ? checkins[0].weight : client.initial_weight
    const currentWeight = checkins.length > 0 ? checkins[checkins.length - 1].weight : null

    // Sort logic handled inside components, but for safety pass generic checkins list

    return (
        <div className="max-w-[1400px] mx-auto space-y-6">
            <div className="flex justify-end mb-2">
                <AddCheckinDialog clientId={client.id} />
                {/* Optional: pass a custom Trigger or style AddCheckinDialog button outside if needed to match strictly "arriba a la derecha aligned" */}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column (40%) */}
                <div className="lg:col-span-5">
                    <MeasuresTable checkins={checkins} />
                </div>

                {/* Right Column (60%) */}
                <div className="lg:col-span-7 flex flex-col">
                    <WeightSummary
                        current={currentWeight}
                        start={startWeight}
                        target={client.target_weight}
                    />

                    <WeightChart
                        data={checkins.filter(c => c.weight)}
                        target={client.target_weight}
                    />

                    <HistoryTable checkins={checkins} />
                </div>
            </div>
        </div>
    )
}
