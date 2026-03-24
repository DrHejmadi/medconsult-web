'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { formatDate } from '@/lib/utils/date'
import { Footer } from '@/components/layout/footer'

interface Payment {
  id: string
  amount: number
  currency: string
  status: string
  service_level: string
  description: string | null
  created_at: string
  case_id: string | null
}

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'info' }> = {
  completed: { label: 'Gennemført', variant: 'success' },
  pending: { label: 'Afventer', variant: 'warning' },
  failed: { label: 'Fejlet', variant: 'danger' },
  refunded: { label: 'Refunderet', variant: 'info' },
}

const SERVICE_LEVELS = [
  {
    name: 'Basis',
    description: 'Kort rådgivning, næste skridt',
    price: '299 kr',
    priceNum: 299,
  },
  {
    name: 'Standard',
    description: 'Asynkron konsultation ~30 min',
    price: '599 kr',
    priceNum: 599,
  },
  {
    name: 'Udvidet',
    description: 'Fuld speciallægevurdering',
    price: '999 kr',
    priceNum: 999,
  },
  {
    name: 'Akut',
    description: 'Prioriteret 4-timers respons',
    price: '1.499 kr',
    priceNum: 1499,
  },
]

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPayments()
  }, [])

  async function loadPayments() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from('payments')
      .select('*')
      .eq('patient_id', user.id)
      .order('created_at', { ascending: false })

    setPayments(data || [])
    setLoading(false)
  }

  function formatAmount(amount: number): string {
    return new Intl.NumberFormat('da-DK', {
      style: 'currency',
      currency: 'DKK',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Betalinger</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Oversigt over dine betalinger og priser</p>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-6 space-y-8">
        {/* Pricing table */}
        <Card>
          <CardHeader>
            <CardTitle>Prisoversigt</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="pb-3 text-sm font-medium text-gray-500 dark:text-gray-400">Niveau</th>
                  <th className="pb-3 text-sm font-medium text-gray-500 dark:text-gray-400">Beskrivelse</th>
                  <th className="pb-3 text-sm font-medium text-gray-500 dark:text-gray-400 text-right">Pris</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {SERVICE_LEVELS.map((level) => (
                  <tr key={level.name}>
                    <td className="py-3 text-sm font-medium text-gray-900 dark:text-gray-100">{level.name}</td>
                    <td className="py-3 text-sm text-gray-600 dark:text-gray-400">{level.description}</td>
                    <td className="py-3 text-sm font-semibold text-gray-900 dark:text-gray-100 text-right">{level.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            Alle priser er inkl. moms. Betaling sker sikkert via Stripe.
          </p>
        </Card>

        {/* Payment history */}
        <Card>
          <CardHeader>
            <CardTitle>Betalingshistorik</CardTitle>
          </CardHeader>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Indlæser betalinger...</p>
            </div>
          ) : payments.length === 0 ? (
            <EmptyState
              icon="💳"
              title="Ingen betalinger endnu"
              message="Dine betalinger vil blive vist her, når du opretter din første sag."
            />
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {payments.map((payment) => {
                const status = STATUS_CONFIG[payment.status] || STATUS_CONFIG.pending
                return (
                  <div key={payment.id} className="py-4 flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {payment.description || payment.service_level || 'Betaling'}
                        </span>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {formatDate(payment.created_at)}
                        {payment.case_id && ` — Sag #${payment.case_id.slice(0, 8)}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap">
                        {formatAmount(payment.amount)}
                      </span>
                      {payment.status === 'completed' && (
                        <a
                          href={`/api/invoices/${payment.id}/pdf`}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Download kvittering
                        </a>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </div>

      <Footer />
    </div>
  )
}
