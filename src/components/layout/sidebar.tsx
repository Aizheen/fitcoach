'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
    Users,
    LayoutDashboard,
    Utensils,
    Dumbbell,
    CreditCard,
    Settings,
    LogOut,
    PanelLeftClose,
    PanelLeftOpen,
    Menu
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useSidebar } from './sidebar-context'

const navigation = [
    { name: 'Inicio', href: '/', icon: LayoutDashboard },
    { name: 'Mis asesorados', href: '/clients', icon: Users },
    { name: 'Recetas', href: '/recipes', icon: Utensils },
    { name: 'Entrenamientos', href: '/workouts', icon: Dumbbell },
    { name: 'Pagos', href: '/payments', icon: CreditCard },
    { name: 'Ajustes', href: '/settings', icon: Settings },
]

export function Sidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const { collapsed, toggleSidebar } = useSidebar()

    const handleSignOut = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/login')
    }

    return (
        <div
            className={cn(
                "flex h-full flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out",
                collapsed ? "w-[70px]" : "w-64"
            )}
        >
            <div className={cn(
                "flex h-16 items-center border-b border-sidebar-border px-4",
                collapsed ? "justify-center" : "justify-between"
            )}>
                {!collapsed && (
                    <div className="flex items-center">
                        <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center text-white font-bold mr-2">F</div>
                        <span className="font-bold text-xl tracking-tight text-foreground">FITCOACH</span>
                    </div>
                )}
                {collapsed && (
                    <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">F</div>
                )}

                {/* This toggle could be moved to top right of sidebar or outside */}
            </div>

            {/* Toggle Button Container - floating or fixed position inside */}
            <div className="flex justify-end px-2 py-2">
                <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-6 w-6">
                    {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
                </Button>
            </div>


            <div className="flex-1 flex flex-col gap-1 p-2 overflow-y-auto">
                {navigation.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center rounded-md py-2 text-sm font-medium transition-colors",
                                collapsed ? "justify-center px-2" : "px-3 gap-3",
                                isActive
                                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                            )}
                            title={collapsed ? item.name : undefined}
                        >
                            <item.icon className={cn("h-4 w-4", !collapsed && "mr-1")} />
                            {!collapsed && <span>{item.name}</span>}
                        </Link>
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
