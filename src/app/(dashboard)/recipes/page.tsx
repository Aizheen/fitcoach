'use client'

import { useState, useMemo, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AddRecipeDialog } from '@/components/recipes/add-recipe-dialog'
import { RecipeCard } from '@/components/recipes/recipe-card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Search, Filter, X, Utensils } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface Recipe {
    id: string
    name: string
    meal_type: string | null
    servings: number | null
    prep_time_min: number | null
    image_url: string | null
    ingredients: any
    macros_calories: number | null
    macros_protein_g: number | null
    macros_carbs_g: number | null
    macros_fat_g: number | null
}

export default function RecipesPage() {
    const [recipes, setRecipes] = useState<Recipe[]>([])
    const [loading, setLoading] = useState(true)

    // Filters
    const [searchQuery, setSearchQuery] = useState('')
    const [mealTypeFilter, setMealTypeFilter] = useState('all')
    const [sortBy, setSortBy] = useState('recent')
    const [maxCalories, setMaxCalories] = useState('')
    const [minProtein, setMinProtein] = useState('')

    // Load recipes on mount
    useEffect(() => {
        async function loadRecipes() {
            const supabase = createClient()
            const { data } = await supabase
                .from('recipes')
                .select('*')
                .order('created_at', { ascending: false })

            if (data) setRecipes(data)
            setLoading(false)
        }
        loadRecipes()
    }, [])

    // Filter and sort recipes
    const filteredRecipes = useMemo(() => {
        let filtered = recipes

        // Search by name
        if (searchQuery) {
            filtered = filtered.filter(recipe =>
                recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        // Filter by meal type
        if (mealTypeFilter !== 'all') {
            filtered = filtered.filter(recipe => recipe.meal_type === mealTypeFilter)
        }

        // Filter by max calories
        if (maxCalories) {
            const max = parseFloat(maxCalories)
            filtered = filtered.filter(recipe => {
                const calories = recipe.macros_calories || 0
                const perServing = calories / (recipe.servings || 1)
                return perServing <= max
            })
        }

        // Filter by min protein
        if (minProtein) {
            const min = parseFloat(minProtein)
            filtered = filtered.filter(recipe => {
                const protein = recipe.macros_protein_g || 0
                const perServing = protein / (recipe.servings || 1)
                return perServing >= min
            })
        }

        // Sort
        if (sortBy === 'name') {
            filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name))
        } else if (sortBy === 'calories-asc') {
            filtered = [...filtered].sort((a, b) => {
                const aCalories = (a.macros_calories || 0) / (a.servings || 1)
                const bCalories = (b.macros_calories || 0) / (b.servings || 1)
                return aCalories - bCalories
            })
        } else if (sortBy === 'calories-desc') {
            filtered = [...filtered].sort((a, b) => {
                const aCalories = (a.macros_calories || 0) / (a.servings || 1)
                const bCalories = (b.macros_calories || 0) / (b.servings || 1)
                return bCalories - aCalories
            })
        } else if (sortBy === 'protein') {
            filtered = [...filtered].sort((a, b) => {
                const aProtein = (a.macros_protein_g || 0) / (a.servings || 1)
                const bProtein = (b.macros_protein_g || 0) / (b.servings || 1)
                return bProtein - aProtein
            })
        }

        return filtered
    }, [recipes, searchQuery, mealTypeFilter, sortBy, maxCalories, minProtein])

    const hasActiveFilters = mealTypeFilter !== 'all' || maxCalories || minProtein || sortBy !== 'recent'

    const clearFilters = () => {
        setMealTypeFilter('all')
        setMaxCalories('')
        setMinProtein('')
        setSortBy('recent')
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Recetas</h2>
                    <p className="text-muted-foreground">
                        Creá plantillas de comidas para reutilizar en las dietas de tus asesorados
                    </p>
                </div>
                <AddRecipeDialog />
            </div>

            {/* Search and Filters */}
            <div className="space-y-4">
                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar recetas por nombre..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Filters Row */}
                <div className="flex flex-wrap gap-3 items-center">
                    <Filter className="h-4 w-4 text-muted-foreground" />

                    {/* Meal Type Filter */}
                    <Select value={mealTypeFilter} onValueChange={setMealTypeFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Tipo de comida" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas</SelectItem>
                            <SelectItem value="desayuno">Desayuno</SelectItem>
                            <SelectItem value="almuerzo">Almuerzo</SelectItem>
                            <SelectItem value="cena">Cena</SelectItem>
                            <SelectItem value="snack">Snack</SelectItem>
                            <SelectItem value="postre">Postre</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Max Calories */}
                    <Input
                        type="number"
                        placeholder="Calorías máx."
                        value={maxCalories}
                        onChange={(e) => setMaxCalories(e.target.value)}
                        className="w-[140px]"
                    />

                    {/* Min Protein */}
                    <Input
                        type="number"
                        placeholder="Proteínas mín."
                        value={minProtein}
                        onChange={(e) => setMinProtein(e.target.value)}
                        className="w-[140px]"
                    />

                    {/* Sort */}
                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Ordenar por" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="recent">Más recientes</SelectItem>
                            <SelectItem value="name">Nombre (A-Z)</SelectItem>
                            <SelectItem value="calories-asc">Menos calorías</SelectItem>
                            <SelectItem value="calories-desc">Más calorías</SelectItem>
                            <SelectItem value="protein">Mayor proteína</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Clear Filters */}
                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                            className="gap-2"
                        >
                            <X className="h-4 w-4" />
                            Limpiar filtros
                        </Button>
                    )}
                </div>

                {/* Results Count */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Utensils className="h-4 w-4" />
                    <span>
                        {filteredRecipes.length} {filteredRecipes.length === 1 ? 'receta' : 'recetas'}
                        {searchQuery || hasActiveFilters ? ` encontrada${filteredRecipes.length === 1 ? '' : 's'}` : ''}
                    </span>
                </div>
            </div>

            {/* Recipes Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="flex flex-col items-center gap-2">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                        <p className="text-sm text-muted-foreground">Cargando recetas...</p>
                    </div>
                </div>
            ) : filteredRecipes.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredRecipes.map((recipe) => (
                        <RecipeCard key={recipe.id} recipe={recipe} />
                    ))}
                </div>
            ) : recipes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-lg">
                    <Utensils className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold">No hay recetas aún</h3>
                    <p className="text-muted-foreground">Creá tu primera receta para empezar</p>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-lg">
                    <Search className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold">No se encontraron recetas</h3>
                    <p className="text-muted-foreground">
                        Intentá con otros términos de búsqueda o filtros
                    </p>
                    <Button variant="outline" onClick={clearFilters} className="mt-4">
                        Limpiar filtros
                    </Button>
                </div>
            )}
        </div>
    )
}
