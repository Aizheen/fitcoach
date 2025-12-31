'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
    DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, ChevronRight, ChevronLeft, Loader2, User, Ruler, Activity, Target, Utensils } from 'lucide-react'
import { createClientAction } from '@/app/(dashboard)/clients/actions'
import { ALLERGEN_OPTIONS, DIETARY_PREFERENCES } from '@/components/clients/allergen-selector'
import { cn } from '@/lib/utils'
import { Textarea } from '@/components/ui/textarea'

// Steps definition
const STEPS = [
    { id: 1, title: 'Identificación', icon: User, description: 'Datos básicos de contacto' },
    { id: 2, title: 'Datos Corporales', icon: Ruler, description: 'Medidas iniciales' },
    { id: 3, title: 'Estilo de Vida', icon: Activity, description: 'Rutina y actividad' },
    { id: 4, title: 'Objetivos', icon: Target, description: 'Metas a alcanzar' },
    { id: 5, title: 'Nutrición', icon: Utensils, description: 'Dieta y preferencias' }
]

export function AddClientDialog() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [currentStep, setCurrentStep] = useState(1)
    const router = useRouter()
    const searchParams = useSearchParams()

    // Form State
    const [formData, setFormData] = useState({
        // Step 1: Identification
        full_name: '',
        email: '',
        phone: '',
        birth_date: '',
        gender: '',

        // Step 2: Body Data
        initial_weight: '',
        height: '',
        initial_body_fat: '',
        waist_circumference: '',

        // Step 3: Lifestyle
        activity_level: '',
        work_type: '',
        training_frequency: '3',
        training_duration_minutes: '',

        // Step 4: Goals
        goal_specific: '',
        goal_text: '',
        target_weight: '',
        target_fat: '',
        goal_deadline: '',

        // Step 5: Nutrition
        dietary_preference: 'sin_restricciones',
        meals_per_day: '4',
        diet_experience: '',
    })

    const [selectedAllergens, setSelectedAllergens] = useState<string[]>([])

    useEffect(() => {
        if (searchParams.get('new') === 'true') {
            setOpen(true)
        }
    }, [searchParams])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const validateStep = (step: number) => {
        switch (step) {
            case 1:
                return !!formData.full_name // Minimum required
            case 2:
                // Require weight and height as per request
                return !!formData.initial_weight && !!formData.height
            case 3:
                return true // All optional or have defaults? Request said "Validate only mandatory fields" -> Lifestyle didn't mark any as mandatory explicitly in prompt lists, but Selectors usually need value.
            case 4:
                return true
            case 5:
                return true
            default:
                return false
        }
    }

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, STEPS.length))
        } else {
            // Simple alert or toast could be better, but for now relying on HTML5 validation or simple check
            alert("Por favor completá los campos obligatorios de este paso.")
        }
    }

    const handleBack = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1))
    }

    const handleSubmit = async () => {
        setLoading(true)

        const submitData = new FormData()
        Object.entries(formData).forEach(([key, value]) => {
            if (value) submitData.append(key, value)
        })
        submitData.append('allergens', JSON.stringify(selectedAllergens))

        const result = await createClientAction(submitData)

        if (result?.error) {
            alert(result.error)
        } else {
            setOpen(false)
            resetForm()
            router.refresh()
        }
        setLoading(false)
    }

    const resetForm = () => {
        setFormData({
            full_name: '', email: '', phone: '', birth_date: '', gender: '',
            initial_weight: '', height: '', initial_body_fat: '', waist_circumference: '',
            activity_level: '', work_type: '', training_frequency: '3', training_duration_minutes: '',
            goal_specific: '', goal_text: '', target_weight: '', target_fat: '', goal_deadline: '',
            dietary_preference: 'sin_restricciones', meals_per_day: '4', diet_experience: '',
        })
        setSelectedAllergens([])
        setCurrentStep(1)
    }

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen)
        if (!newOpen) {
            resetForm()
        }
    }

    // Render Steps
    const renderStepContent = () => {
        switch (currentStep) {
            case 1: // Identificación
                return (
                    <div className="grid gap-4 py-4 animate-in slide-in-from-right-4 fade-in duration-300">
                        <div className="grid gap-2">
                            <Label htmlFor="full_name">Nombre completo *</Label>
                            <Input id="full_name" name="full_name" value={formData.full_name} onChange={handleInputChange} autoFocus />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Teléfono</Label>
                                <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="birth_date">Fecha de nacimiento</Label>
                                <Input id="birth_date" name="birth_date" type="date" value={formData.birth_date} onChange={handleInputChange} />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label>Sexo</Label>
                            <RadioGroup value={formData.gender} onValueChange={(val) => handleSelectChange('gender', val)} className="flex gap-4">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="male" id="male" />
                                    <Label htmlFor="male">Masculino</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="female" id="female" />
                                    <Label htmlFor="female">Femenino</Label>
                                </div>
                            </RadioGroup>
                        </div>
                    </div>
                )
            case 2: // Datos Corporales
                return (
                    <div className="grid gap-4 py-4 animate-in slide-in-from-right-4 fade-in duration-300">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="initial_weight">Peso inicial (kg) *</Label>
                                <Input id="initial_weight" name="initial_weight" type="number" step="0.1" value={formData.initial_weight} onChange={handleInputChange} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="height">Altura (cm) *</Label>
                                <Input id="height" name="height" type="number" value={formData.height} onChange={handleInputChange} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="initial_body_fat">Grasa corporal (%) <span className="text-muted-foreground text-xs">(Opcional)</span></Label>
                                <Input id="initial_body_fat" name="initial_body_fat" type="number" step="0.1" value={formData.initial_body_fat} onChange={handleInputChange} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="waist_circumference">Cintura (cm) <span className="text-muted-foreground text-xs">(Opcional)</span></Label>
                                <Input id="waist_circumference" name="waist_circumference" type="number" step="0.1" value={formData.waist_circumference} onChange={handleInputChange} />
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                            * Completar estos datos ayuda a calcular mejores estimaciones de macronutrientes.
                        </p>
                    </div>
                )
            case 3: // Estilo de Vida
                return (
                    <div className="grid gap-4 py-4 animate-in slide-in-from-right-4 fade-in duration-300">
                        <div className="grid gap-2">
                            <Label htmlFor="activity_level">Nivel de actividad</Label>
                            <Select value={formData.activity_level} onValueChange={(val) => handleSelectChange('activity_level', val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="sedentary">Sedentario (Poco o nada)</SelectItem>
                                    <SelectItem value="light">Ligero (1-3 días)</SelectItem>
                                    <SelectItem value="moderate">Moderado (3-5 días)</SelectItem>
                                    <SelectItem value="active">Activo (6-7 días)</SelectItem>
                                    <SelectItem value="very_active">Muy activo</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="work_type">Tipo de trabajo</Label>
                            <Select value={formData.work_type} onValueChange={(val) => handleSelectChange('work_type', val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="home_office">Home Office / Sentado</SelectItem>
                                    <SelectItem value="active">Activo / De pie</SelectItem>
                                    <SelectItem value="physical">Trabajo Físico Intenso</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="training_frequency">Días de entreno / semana</Label>
                                <Select value={formData.training_frequency} onValueChange={(val) => handleSelectChange('training_frequency', val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[1, 2, 3, 4, 5, 6, 7].map(d => (
                                            <SelectItem key={d} value={d.toString()}>{d} días</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="training_duration_minutes">Duración promedio (min)</Label>
                                <Input id="training_duration_minutes" name="training_duration_minutes" type="number" placeholder="Ej: 60" value={formData.training_duration_minutes} onChange={handleInputChange} />
                            </div>
                        </div>
                    </div>
                )
            case 4: // Objetivos
                return (
                    <div className="grid gap-4 py-4 animate-in slide-in-from-right-4 fade-in duration-300">
                        <div className="grid gap-2">
                            <Label htmlFor="goal_specific">Objetivo estructurado</Label>
                            <Select value={formData.goal_specific} onValueChange={(val) => handleSelectChange('goal_specific', val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="lose_fat">Bajar grasa</SelectItem>
                                    <SelectItem value="gain_muscle">Ganar masa muscular</SelectItem>
                                    <SelectItem value="recomp">Recomposición corporal</SelectItem>
                                    <SelectItem value="maintenance">Mantenimiento</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="goal_text">Objetivo personal</Label>
                            <Textarea id="goal_text" name="goal_text" placeholder="Ej: Quiero correr mi primer maratón..." value={formData.goal_text} onChange={handleInputChange} />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="target_weight">Peso Meta <span className="text-[10px] text-muted-foreground">(Kg)</span></Label>
                                <Input id="target_weight" name="target_weight" type="number" step="0.1" value={formData.target_weight} onChange={handleInputChange} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="target_fat">Grasa Meta <span className="text-[10px] text-muted-foreground">(%)</span></Label>
                                <Input id="target_fat" name="target_fat" type="number" step="0.1" value={formData.target_fat} onChange={handleInputChange} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="goal_deadline">Plazo estimado</Label>
                                <Select value={formData.goal_deadline} onValueChange={(val) => handleSelectChange('goal_deadline', val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1_month">1 mes</SelectItem>
                                        <SelectItem value="3_months">3 meses</SelectItem>
                                        <SelectItem value="6_months">6 meses</SelectItem>
                                        <SelectItem value="1_year">1 año</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                )
            case 5: // Nutrición
                return (
                    <div className="grid gap-4 py-4 animate-in slide-in-from-right-4 fade-in duration-300">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="dietary_preference">Preferencia de Dieta</Label>
                                <Select value={formData.dietary_preference} onValueChange={(val) => handleSelectChange('dietary_preference', val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {DIETARY_PREFERENCES.map(p => (
                                            <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="meals_per_day">Comidas al día</Label>
                                <Select value={formData.meals_per_day} onValueChange={(val) => handleSelectChange('meals_per_day', val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[3, 4, 5, 6].map(n => (
                                            <SelectItem key={n} value={n.toString()}>{n} comidas</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="diet_experience">Experiencia con dietas</Label>
                            <Select value={formData.diet_experience} onValueChange={(val) => handleSelectChange('diet_experience', val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar (Opcional)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Ninguna (Principiante)</SelectItem>
                                    <SelectItem value="intermediate">Intermedio (He seguido dietas antes)</SelectItem>
                                    <SelectItem value="advanced">Avanzado (Cuento macros/kal)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2 pt-2">
                            <Label>Alergias / Restricciones</Label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 border p-3 rounded-md bg-muted/20">
                                {ALLERGEN_OPTIONS.map(opt => (
                                    <div key={opt.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`allergen-${opt.id}`}
                                            checked={selectedAllergens.includes(opt.id) || selectedAllergens.includes(opt.label)}
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    setSelectedAllergens([...selectedAllergens, opt.id])
                                                } else {
                                                    setSelectedAllergens(selectedAllergens.filter(a => a !== opt.id))
                                                }
                                            }}
                                        />
                                        <Label htmlFor={`allergen-${opt.id}`} className="text-sm font-normal cursor-pointer">
                                            {opt.label}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )
            default:
                return null
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-white shadow-md">
                    <Plus className="mr-2 h-4 w-4" /> Nuevo asesorado
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="p-0 space-y-0">
                    <div className="px-6 py-4">
                        <div className="flex items-center justify-between mb-1">
                            <DialogTitle className="text-xl">Nuevo Asesorado</DialogTitle>
                            <span className="text-sm font-semibold text-primary bg-primary/10 px-2 py-1 rounded-md">
                                Paso {currentStep} de {STEPS.length}
                            </span>
                        </div>
                        <DialogDescription className="text-sm font-medium text-foreground">
                            {STEPS[currentStep - 1].title} — <span className="text-muted-foreground font-normal">{STEPS[currentStep - 1].description}</span>
                        </DialogDescription>
                    </div>
                    {/* Full-width Progress Bar */}
                    <div className="w-full h-1.5 bg-muted overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-500 ease-out"
                            style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
                        />
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto px-6">
                    {renderStepContent()}
                </div>

                <DialogFooter className="px-6 py-4 border-t gap-2 sm:gap-0">
                    {currentStep > 1 && (
                        <Button variant="outline" onClick={handleBack} disabled={loading} className="mr-auto">
                            <ChevronLeft className="mr-2 h-4 w-4" /> Anterior
                        </Button>
                    )}

                    {currentStep < STEPS.length ? (
                        <Button onClick={handleNext}>
                            Continuar <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                    ) : (
                        <Button onClick={handleSubmit} disabled={loading} className="bg-primary">
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Finalizar y Crear"}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
