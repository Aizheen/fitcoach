"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Ruler, Scale } from "lucide-react"
import { createCheckinAction } from "@/app/(dashboard)/clients/[id]/checkin-actions"

interface AddCheckinDialogProps {
    clientId: string
}

export function AddCheckinDialog({ clientId }: AddCheckinDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])

    // Basic
    const [weight, setWeight] = useState("")
    const [bodyFat, setBodyFat] = useState("")
    const [leanMass, setLeanMass] = useState("")
    const [observations, setObservations] = useState("")

    // Measurements
    const [chest, setChest] = useState("")
    const [waist, setWaist] = useState("")
    const [hips, setHips] = useState("")
    const [arm, setArm] = useState("")
    const [thigh, setThigh] = useState("")
    const [calves, setCalves] = useState("")

    const handleSave = async () => {
        setLoading(true)

        // Parse numeric values safely
        const parseNum = (val: string) => val ? parseFloat(val) : undefined

        const result = await createCheckinAction({
            clientId,
            date: date,
            weight: parseFloat(weight) || 0,
            bodyFat: parseNum(bodyFat),
            leanMass: parseNum(leanMass),
            observations,
            measurements: {
                chest: parseNum(chest),
                waist: parseNum(waist),
                hips: parseNum(hips),
                arm: parseNum(arm),
                thigh: parseNum(thigh),
                calves: parseNum(calves)
            },
            photos: [] // Placeholder for now
        })

        if (result.error) {
            alert(result.error)
        } else {
            setOpen(false)
            setWeight("")
            setBodyFat("")
            setLeanMass("")
            setObservations("")
            setChest("")
            setWaist("")
            setHips("")
            setArm("")
            setThigh("")
            setCalves("")
        }
        setLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                    <Plus className="mr-2 h-4 w-4" /> Nuevo Check-in
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Registrar Check-in</DialogTitle>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="date">Fecha</Label>
                            <Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b">
                            <Scale className="h-5 w-5 text-orange-600" />
                            <h4 className="font-semibold text-sm">Composición Corporal</h4>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Peso (kg)</Label>
                                <Input type="number" placeholder="0.0" value={weight} onChange={e => setWeight(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Grasa Corporal (%)</Label>
                                <Input type="number" placeholder="0.0" value={bodyFat} onChange={e => setBodyFat(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Masa Magra (kg)</Label>
                                <Input type="number" placeholder="0.0" value={leanMass} onChange={e => setLeanMass(e.target.value)} />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b">
                            <Ruler className="h-5 w-5 text-orange-600" />
                            <h4 className="font-semibold text-sm">Medidas (cm)</h4>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Pecho</Label>
                                <Input type="number" value={chest} onChange={e => setChest(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Cintura</Label>
                                <Input type="number" value={waist} onChange={e => setWaist(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Cadera</Label>
                                <Input type="number" value={hips} onChange={e => setHips(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Brazo</Label>
                                <Input type="number" value={arm} onChange={e => setArm(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Muslo</Label>
                                <Input type="number" value={thigh} onChange={e => setThigh(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Gemelos</Label>
                                <Input type="number" value={calves} onChange={e => setCalves(e.target.value)} />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Observaciones</Label>
                        <Textarea
                            placeholder="Sensaciones, energía, digestión, etc."
                            value={observations}
                            onChange={e => setObservations(e.target.value)}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                        <Button
                            className="bg-orange-600 hover:bg-orange-700"
                            onClick={handleSave}
                            disabled={loading || !weight}
                        >
                            {loading ? 'Guardando...' : 'Guardar Check-in'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
