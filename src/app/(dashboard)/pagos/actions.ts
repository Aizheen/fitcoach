'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface ClientWithPayment {
    id: string
    full_name: string
    email: string | null
    plan_name: string | null
    price_monthly: number | null
    billing_frequency: string
    payment_status: string
    next_due_date: string | null
    last_paid_at: string | null
    status: string
}

export interface Payment {
    id: string
    client_id: string
    paid_at: string
    amount: number
    method: string
    note: string | null
    created_at: string
}

export interface PaymentStats {
    activeClients: number
    paidClients: number
    pendingClients: number
    overdueClients: number
    estimatedMonthlyIncome: number
}

// Get all clients with payment info
export async function getClientsWithPayments() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('trainer_id', user.id)
        .is('deleted_at', null)
        .order('full_name')

    if (error) throw error
    return data as ClientWithPayment[]
}

// Get payment statistics
export async function getPaymentStats(): Promise<PaymentStats> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data: clients, error } = await supabase
        .from('clients')
        .select('*')
        .eq('trainer_id', user.id)
        .is('deleted_at', null)

    if (error) throw error

    const activeClients = clients?.filter(c => c.status === 'active').length || 0
    const paidClients = clients?.filter(c => c.payment_status === 'paid').length || 0
    const pendingClients = clients?.filter(c => c.payment_status === 'pending').length || 0
    const overdueClients = clients?.filter(c => c.payment_status === 'overdue').length || 0

    const estimatedMonthlyIncome = clients
        ?.filter(c => c.status === 'active')
        .reduce((sum, c) => sum + (c.price_monthly || 0), 0) || 0

    return {
        activeClients,
        paidClients,
        pendingClients,
        overdueClients,
        estimatedMonthlyIncome
    }
}

// Register a new payment
export async function registerPayment(data: {
    clientId: string
    paidAt: string
    amount: number
    method: string
    note?: string
}) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Insert payment
    const { error: paymentError } = await supabase
        .from('payments')
        .insert({
            trainer_id: user.id,
            client_id: data.clientId,
            paid_at: data.paidAt,
            amount: data.amount,
            method: data.method,
            note: data.note || null
        })

    if (paymentError) throw paymentError

    // Get client to calculate next due date
    const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('billing_frequency')
        .eq('id', data.clientId)
        .single()

    if (clientError) throw clientError

    // Calculate next due date
    const paidDate = new Date(data.paidAt)
    let nextDueDate: Date

    switch (client.billing_frequency) {
        case 'weekly':
            nextDueDate = new Date(paidDate)
            nextDueDate.setDate(paidDate.getDate() + 7)
            break
        case 'monthly':
        default:
            nextDueDate = new Date(paidDate)
            nextDueDate.setMonth(paidDate.getMonth() + 1)
            break
    }

    // Update client
    const { error: updateError } = await supabase
        .from('clients')
        .update({
            last_paid_at: data.paidAt,
            next_due_date: nextDueDate.toISOString().split('T')[0],
            payment_status: 'paid'
        })
        .eq('id', data.clientId)

    if (updateError) throw updateError

    revalidatePath('/pagos')
    return { success: true }
}

// Get payments for a client
export async function getClientPayments(clientId: string): Promise<Payment[]> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('client_id', clientId)
        .eq('trainer_id', user.id)
        .order('paid_at', { ascending: false })

    if (error) throw error
    return data as Payment[]
}

// Update payment statuses based on due dates
export async function updatePaymentStatuses() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const today = new Date().toISOString().split('T')[0]

    // Update overdue clients
    await supabase
        .from('clients')
        .update({ payment_status: 'overdue' })
        .eq('trainer_id', user.id)
        .lt('next_due_date', today)
        .neq('payment_status', 'overdue')

    revalidatePath('/pagos')
}

// Send payment reminder (placeholder)
export async function sendPaymentReminder(clientId: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Get client details
    const { data: client } = await supabase
        .from('clients')
        .select('full_name, email')
        .eq('id', clientId)
        .single()

    // Log reminder (in production, this would send an actual email/notification)
    console.log(`[REMINDER] Sending payment reminder to ${client?.full_name} (${client?.email})`)

    return { success: true, message: `Recordatorio enviado a ${client?.full_name}` }
}

// Send bulk reminders
export async function sendBulkReminders(clientIds: string[]) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    let successCount = 0

    for (const clientId of clientIds) {
        try {
            await sendPaymentReminder(clientId)
            successCount++
        } catch (error) {
            console.error(`Failed to send reminder to client ${clientId}:`, error)
        }
    }

    return {
        success: true,
        message: `Recordatorios enviados a ${successCount} de ${clientIds.length} clientes`
    }
}
