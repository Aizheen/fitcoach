'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

type SidebarContextType = {
    collapsed: boolean
    toggleSidebar: () => void
    mobileOpen: boolean
    setMobileOpen: (open: boolean) => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    const [collapsed, setCollapsed] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)

    // Optional: Persist to localStorage
    useEffect(() => {
        const saved = localStorage.getItem('sidebar-collapsed')
        if (saved) {
            setCollapsed(JSON.parse(saved))
        }
    }, [])

    const toggleSidebar = () => {
        setCollapsed(prev => {
            const newState = !prev
            localStorage.setItem('sidebar-collapsed', JSON.stringify(newState))
            return newState
        })
    }

    return (
        <SidebarContext.Provider value={{ collapsed, toggleSidebar, mobileOpen, setMobileOpen }}>
            {children}
        </SidebarContext.Provider>
    )
}

export const useSidebar = () => {
    const context = useContext(SidebarContext)
    if (!context) throw new Error('useSidebar must be used within SidebarProvider')
    return context
}
