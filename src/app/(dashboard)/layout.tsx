import { Sidebar } from '@/components/layout/sidebar'
import { SidebarProvider } from '@/components/layout/sidebar-context'
import { Toaster } from '@/components/ui/sonner'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <SidebarProvider>
            <div className="flex h-screen overflow-hidden bg-background">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-8">
                    {children}
                </main>
            </div>
            <Toaster />
        </SidebarProvider>
    )
}
