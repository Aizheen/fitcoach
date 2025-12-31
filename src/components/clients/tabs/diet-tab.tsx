'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { WeeklyMealPlanContainer } from '../meal-plan/weekly-meal-plan-container'

export function DietTab({ client }: { client: any }) {

    // Prepare read-only data
    const preferenceLabel = client.dietary_preference
        ? client.dietary_preference.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
        : "Sin restricciones"

    const allergensLabel = (client.allergens && client.allergens.length > 0)
        ? client.allergens.map((a: string) => a.charAt(0).toUpperCase() + a.slice(1)).join(", ")
        : "Ninguno"

    return (
        <div className="space-y-6">
            {/* Macronutrients Summary */}
            <Card className="bg-primary/5 border-primary/20">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        Objetivos Nutricionales
                        <span className="text-xs font-normal text-muted-foreground bg-background px-2 py-1 rounded-full border">
                            Calculado automáticamente
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div className="p-3 bg-background rounded-lg border shadow-sm">
                            <div className="text-2xl font-bold text-primary">{client.target_calories || 0}</div>
                            <div className="text-xs text-muted-foreground uppercase font-semibold">Kcal</div>
                        </div>
                        <div className="p-3 bg-background rounded-lg border shadow-sm">
                            <div className="text-2xl font-bold">{client.target_protein || 0}g</div>
                            <div className="text-xs text-muted-foreground uppercase font-semibold">Proteína</div>
                        </div>
                        <div className="p-3 bg-background rounded-lg border shadow-sm">
                            <div className="text-2xl font-bold">{client.target_carbs || 0}g</div>
                            <div className="text-xs text-muted-foreground uppercase font-semibold">Carbos</div>
                        </div>
                        <div className="p-3 bg-background rounded-lg border shadow-sm">
                            <div className="text-2xl font-bold">{client.target_fats || 0}g</div>
                            <div className="text-xs text-muted-foreground uppercase font-semibold">Grasas</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-bold">Preferencia de dieta</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">{preferenceLabel}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-bold">Alergenos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">{allergensLabel}</p>
                    </CardContent>
                </Card>
            </div>

            <WeeklyMealPlanContainer
                clientId={client.id}
                clientName={client.full_name}
                clientAllergens={client.allergens}
                clientPreference={client.dietary_preference} // Assuming this field exists, need to verify or use generic 'preference'
            />
        </div>
    )
}
