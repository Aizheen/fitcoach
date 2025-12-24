'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useTransition, useState } from 'react'
import { cn } from '@/lib/utils'
import {
    Users,
    Home,
    Utensils,
    Dumbbell,
    CreditCard,
    Settings,
    LogOut,
    PanelLeftClose,
    PanelLeftOpen,
    Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useSidebar } from './sidebar-context'

const navigation = [
    { name: 'Inicio', href: '/', icon: Home },
    { name: 'Mis asesorados', href: '/clients', icon: Users },
    { name: 'Recetas', href: '/recipes', icon: Utensils },
    { name: 'Planes de entrenamiento', href: '/workouts', icon: Dumbbell },
    { name: 'Pagos', href: '/pagos', icon: CreditCard },
    { name: 'Ajustes', href: '/settings', icon: Settings },
]

export function Sidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const { collapsed, toggleSidebar } = useSidebar()
    const [isPending, startTransition] = useTransition()
    const [pendingHref, setPendingHref] = useState<string | null>(null)

    const handleSignOut = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/login')
    }

    const handleNavigation = (href: string) => {
        setPendingHref(href)
        startTransition(() => {
            router.push(href)
        })
    }

    return (
        <div
            className={cn(
                "flex h-full flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out",
                collapsed ? "w-[70px]" : "w-64"
            )}
        >
            <div className={cn(
                "flex h-16 items-center px-4",
                collapsed ? "justify-center" : "justify-start"
            )}>
                {!collapsed && (
                    <div className="flex items-center justify-start px-2 w-full">
                        <Image src="/orbit_logo_v2.png" alt="Orbit" width={120} height={40} className="h-8 w-auto object-contain" priority />
                    </div>
                )}
                {collapsed && (
                    <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">O</div>
                )}
            </div>

            {/* Separator - only visible when not collapsed or always? Styling shows line. */}
            <div className="px-4 mb-2">
                <div className="border-b border-sidebar-border" />
            </div>

            {/* Toggle Button Container - floating or fixed position inside */}
            <div className="flex justify-end px-2 py-2">
                <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-6 w-6 text-muted-foreground hover:text-primary">
                    {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
                </Button>
            </div>


            <div className="flex-1 flex flex-col gap-1 px-3 overflow-y-auto">
                {navigation.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                    const isLoading = isPending && pendingHref === item.href
                    return (
                        <button
                            key={item.name}
                            onClick={() => handleNavigation(item.href)}
                            className={cn(
                                "flex items-center rounded-lg py-2.5 text-sm font-medium transition-colors w-full text-left",
                                collapsed ? "justify-center px-2" : "px-3 gap-3",
                                isActive
                                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                isLoading && "opacity-70"
                            )}
                            title={collapsed ? item.name : undefined}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className={cn("h-5 w-5 animate-spin", !collapsed && "mr-1")} />
                            ) : (
                                <item.icon className={cn("h-5 w-5", !collapsed && "mr-1")} />
                            )}
                            {!collapsed && <span>{item.name}</span>}
                        </button>
                    )
                })}
            </div>

            <div className="p-2 border-t border-sidebar-border">
                <Button
                    variant="ghost"
                    className={cn(
                        "w-full text-sidebar-foreground hover:bg-sidebar-accent hover:text-destructive",
                        collapsed ? "justify-center px-0" : "justify-start"
                    )}
                    onClick={handleSignOut}
                    title={collapsed ? "Cerrar sesión" : undefined}
                >
                    <LogOut className={cn("h-4 w-4", !collapsed && "mr-2")} />
                    {!collapsed && "Cerrar sesión"}
                </Button>
            </div>
        </div>
    )
}
