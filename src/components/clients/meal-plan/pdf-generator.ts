import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

// Extend jsPDF type to include autoTable
interface jsPDFWithAutoTable extends jsPDF {
    lastAutoTable: { finalY: number }
}

export function generateWeeklyPlanPDF(plan: any, clientName: string) {
    const doc = new jsPDF() as jsPDFWithAutoTable

    // Header
    doc.setFontSize(20)
    doc.text(`Plan Nutricional Semanal`, 14, 20)

    doc.setFontSize(12)
    doc.text(`Alumno: ${clientName}`, 14, 30)
    if (plan.review_date) {
        doc.text(`Fecha de revisión: ${format(new Date(plan.review_date), "d 'de' MMMM, yyyy", { locale: es })}`, 14, 38)
    }

    let yPos = 45

    // Sort days to be sure (1=Monday ... 7=Sunday)
    // Map day_of_week 1..7 to Lunes..Domingo
    const weekMap: Record<number, string> = {
        1: 'Lunes', 2: 'Martes', 3: 'Miércoles', 4: 'Jueves',
        5: 'Viernes', 6: 'Sábado', 7: 'Domingo'
    }

    const sortedDays = [...plan.days].sort((a: any, b: any) => a.day_of_week - b.day_of_week)

    // Helper to format meals for a day
    // We will create a table for each day or one big table?
    // One big table is hard because meals vary.
    // Let's do one table per day or simply iterate days and list meals.
    // Detailed list is better for readability if there are many ingredients/instructions (though we usually just show dish name).
    // If we want a grid view (Week at a glance), we need a landscape table.
    // The user asked "Todo lo que se come el lunes... y asi consecutivo", implies a sequential list or day-by-day block.

    sortedDays.forEach((day: any) => {
        const dayName = weekMap[day.day_of_week] || `Día ${day.day_of_week}`

        // Check if day has content
        const hasMeals = day.meals.some((m: any) => m.items && m.items.length > 0)
        if (!hasMeals) return

        // Day Header
        // Check if we need new page
        if (yPos > 250) {
            doc.addPage()
            yPos = 20
        }

        doc.setFontSize(16)
        doc.setTextColor(0, 0, 0)
        doc.text(dayName, 14, yPos)
        yPos += 8

        // Prepare table data for the day
        const tableBody = day.meals
            .filter((meal: any) => !meal.is_skipped)
            .map((meal: any) => {
                const dishes = meal.items.map((item: any) => {
                    const name = item.custom_name || item.recipe?.name || "Sin nombre"
                    const portions = item.portions > 1 ? ` (${item.portions} porc.)` : ""
                    // Add basic macros if available?
                    let macroInfo = ""
                    if (item.recipe) {
                        const k = Math.round((item.recipe.kcal_per_serving || item.recipe.macros_calories || 0) * item.portions)
                        if (k > 0) macroInfo = `\n~${k} kcal`
                    }
                    return `• ${name}${portions}${macroInfo}`
                }).join('\n')

                return [meal.name, dishes || "—"]
            })

        autoTable(doc, {
            startY: yPos,
            head: [['Comida', 'Platos']],
            body: tableBody,
            theme: 'grid',
            headStyles: { fillColor: [66, 66, 66] }, // Dark gray
            columnStyles: {
                0: { cellWidth: 40, fontStyle: 'bold' },
                1: { cellWidth: 'auto' }
            },
            styles: { fontSize: 10, cellPadding: 4 },
            margin: { left: 14 }
        })

        // Update yPos for next day
        yPos = doc.lastAutoTable.finalY + 15
    })

    // Footer
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(150)
        doc.text(`Página ${i} de ${pageCount}`, 200, 290, { align: 'right' })
    }

    doc.save(`Plan_Semanal_${clientName.replace(/\s+/g, '_')}.pdf`)
}
