/**
 * Script para actualizar los macros de las recetas desde el CSV
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Load environment variables
const envPath = path.join(process.cwd(), '.env.local')
const envContent = fs.readFileSync(envPath, 'utf-8')
const envVars: Record<string, string> = {}

envContent.split('\n').forEach(line => {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=')
        const value = valueParts.join('=')
        envVars[key] = value
    }
})

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceKey)

function parseCSVLine(line: string): string[] {
    const result: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
        const char = line[i]

        if (char === '"') {
            inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim())
            current = ''
        } else {
            current += char
        }
    }

    result.push(current.trim())
    return result
}

async function updateRecipeMacros() {
    console.log('📊 Updating recipe macros from CSV...\n')

    // Read CSV file
    const csvPath = path.join(process.cwd(), 'orbit_recetas_500.csv')
    const csvContent = fs.readFileSync(csvPath, 'utf-8')
    const lines = csvContent.split('\n').filter(line => line.trim())

    // Skip header
    const dataLines = lines.slice(1)

    let updated = 0
    let notFound = 0
    let errors = 0

    for (const line of dataLines) {
        const fields = parseCSVLine(line)

        if (fields.length < 12) {
            console.log(`⏭️  Skipping invalid line`)
            errors++
            continue
        }

        const [
            recipe_id,
            name,
            _meal_type,
            _servings,
            _prep_time_min,
            _ingredients,
            kcal_per_serving,
            protein_g_per_serving,
            carbs_g_per_serving,
            fat_g_per_serving,
            fiber_g_per_serving,
        ] = fields

        try {
            const calories = parseFloat(kcal_per_serving) || 0
            const protein = parseFloat(protein_g_per_serving) || 0
            const carbs = parseFloat(carbs_g_per_serving) || 0
            const fat = parseFloat(fat_g_per_serving) || 0

            // Update recipe
            const { error: updateError, count } = await supabase
                .from('recipes')
                .update({
                    macros_calories: calories,
                    macros_protein_g: protein,
                    macros_carbs_g: carbs,
                    macros_fat_g: fat,
                })
                .eq('recipe_code', recipe_id)

            if (updateError) {
                console.error(`❌ Error updating ${name.replace(/^"|"$/g, '')}:`, updateError.message)
                errors++
            } else if (count === 0) {
                // Not found
                notFound++
            } else {
                updated++
                if (updated % 50 === 0) {
                    console.log(`   ✅ Updated ${updated} recipes...`)
                }
            }
        } catch (error: any) {
            console.error(`❌ Error processing ${name}:`, error.message)
            errors++
        }
    }

    console.log('\n🎉 Update complete!')
    console.log(`✅ Updated: ${updated}`)
    console.log(`⏭️  Not found: ${notFound}`)
    console.log(`❌ Errors: ${errors}`)
}

updateRecipeMacros().catch(console.error)
