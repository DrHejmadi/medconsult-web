'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'

type UserRole = 'patient' | 'doctor'
type PaymentStatus = 'Betalt' | 'Afventer' | 'Refunderet'
type HonorarStatus = 'Udbetalt' | 'Afventer' | 'Under behandling'
type ActiveTab = 'oversigt' | 'fakturaer'

interface Payment {
  id: string
  created_at: string
  case_type: string
  service_level: string
  amount: number
  status: string
}

interface Honorar {
  id: string
  created_at: string
  case_type: string
  service_level: string
  doctor_amount: number
  status: string
}

const statusColor = (status: string) => {
  switch (status) {
    case 'Betalt':
    case 'Udbetalt':
    case 'completed':
      return 'text-green-600 dark:text-green-400'
    case 'Afventer':
    case 'Under behandling':
    case 'pending':
      return 'text-yellow-600 dark:text-yellow-400'
    case 'Refunderet':
    case 'refunded':
      return 'text-red-600 dark:text-red-400'
    default:
      return 'text-gray-600 dark:text-gray-400'
  }
}

const statusLabel = (status: string): string => {
  switch (status) {
    case 'completed': return 'Betalt'
    case 'pending': return 'Afventer'
    case 'refunded': return 'Refunderet'
    case 'paid_out': return 'Udbetalt'
    case 'processing': return 'Under behandling'
    default: return status
  }
}

const serviceLevelLabel = (level: string): string => {
  switch (level) {
    case 'basis': return 'Basis (299 kr)'
    case 'standard': return 'Standard (599 kr)'
    case 'udvidet': return 'Udvidet (999 kr)'
    case 'akut': return 'Akut (1.499 kr)'
    case 'kort_raad': return 'Kort rad'
    case 'konsultation': return 'Konsultation'
    case 'fuld_udredning': return 'Fuld udredningsplan'
    default: return level
  }
}

export default function PaymentPage() {
  const [role, setRole] = useState<UserRole>('patient')
  const [activeTab, setActiveTab] = useState<ActiveTab>('oversigt')
  const [payments, setPayments] = useState<Payment[]>([])
  const [honorarer, setHonorarer] = useState<Honorar[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  useEffect(() => {
    fetchData()
  }, [role, statusFilter, dateFrom, dateTo])

  async function fetchData() {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    if (role === 'patient') {
      let query = supabase
        .from('payments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }
      if (dateFrom) {
        query = query.gte('created_at', dateFrom)
      }
      if (dateTo) {
        query = query.lte('created_at', dateTo + 'T23:59:59')
      }

      const { data } = await query
      setPayments(data || [])
    } else {
      let query = supabase
        .from('payments')
        .select('*')
        .eq('doctor_id', user.id)
        .order('created_at', { ascending: false })

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }
      if (dateFrom) {
        query = query.gte('created_at', dateFrom)
      }
      if (dateTo) {
        query = query.lte('created_at', dateTo + 'T23:59:59')
      }

      const { data } = await query
      setHonorarer(data || [])
    }

    setLoading(false)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('da-DK', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('da-DK', { style: 'decimal' }).format(amount) + ' kr'
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Betaling</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Oversigt over betalinger og honorarer
        </p>
      </div>

      {/* Role toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => { setRole('patient'); setStatusFilter('all'); setActiveTab('oversigt') }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            role === 'patient'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Patient
        </button>
        <button
          onClick={() => { setRole('doctor'); setStatusFilter('all'); setActiveTab('oversigt') }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            role === 'doctor'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Laege
        </button>
      </div>

      {/* Tabs */}
      {role === 'patient' && (
        <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('oversigt')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'oversigt'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Oversigt
          </button>
          <button
            onClick={() => setActiveTab('fakturaer')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'fakturaer'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Fakturaer
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Alle</option>
            {role === 'patient' ? (
              <>
                <option value="completed">Betalt</option>
                <option value="pending">Afventer</option>
                <option value="refunded">Refunderet</option>
              </>
            ) : (
              <>
                <option value="paid_out">Udbetalt</option>
                <option value="pending">Afventer</option>
                <option value="processing">Under behandling</option>
              </>
            )}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Fra dato</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Til dato</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
        {(statusFilter !== 'all' || dateFrom || dateTo) && (
          <button
            onClick={() => { setStatusFilter('all'); setDateFrom(''); setDateTo('') }}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Nulstil filtre
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">Indlaeser betalinger...</div>
      ) : (
        <>
          {role === 'patient' && activeTab === 'oversigt' && (
            <Card>
              <CardHeader>
                <CardTitle>Mine betalinger</CardTitle>
              </CardHeader>
              {payments.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Ingen betalinger fundet</p>
                  <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                    Dine betalinger vil blive vist her, nar du opretter en sag.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-2 font-medium text-gray-500 dark:text-gray-400">Dato</th>
                        <th className="text-left py-3 px-2 font-medium text-gray-500 dark:text-gray-400">Case-type</th>
                        <th className="text-left py-3 px-2 font-medium text-gray-500 dark:text-gray-400">Serviceniveau</th>
                        <th className="text-right py-3 px-2 font-medium text-gray-500 dark:text-gray-400">Beloeb</th>
                        <th className="text-right py-3 px-2 font-medium text-gray-500 dark:text-gray-400">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment) => (
                        <tr key={payment.id} className="border-b border-gray-100 dark:border-gray-700/50">
                          <td className="py-3 px-2 text-gray-700 dark:text-gray-300">{formatDate(payment.created_at)}</td>
                          <td className="py-3 px-2 text-gray-700 dark:text-gray-300">{payment.case_type || '—'}</td>
                          <td className="py-3 px-2 text-gray-700 dark:text-gray-300">{serviceLevelLabel(payment.service_level)}</td>
                          <td className="py-3 px-2 text-right text-gray-700 dark:text-gray-300">{formatAmount(payment.amount)}</td>
                          <td className={`py-3 px-2 text-right font-medium ${statusColor(payment.status)}`}>{statusLabel(payment.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                Platformens andel: 15% til drift og udvikling
              </p>
            </Card>
          )}

          {role === 'patient' && activeTab === 'fakturaer' && (
            <Card>
              <CardHeader>
                <CardTitle>Fakturaer</CardTitle>
              </CardHeader>
              {payments.filter(p => p.status === 'completed').length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Ingen fakturaer tilgaengelige</p>
                  <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                    Fakturaer genereres automatisk ved gennemfoerte betalinger.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {payments
                    .filter(p => p.status === 'completed')
                    .map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            Faktura — {formatDate(payment.created_at)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {serviceLevelLabel(payment.service_level)} &middot; {formatAmount(payment.amount)}
                          </p>
                        </div>
                        <a
                          href={`/api/invoices/${payment.id}/pdf`}
                          className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          Download PDF
                        </a>
                      </div>
                    ))}
                </div>
              )}
            </Card>
          )}

          {role === 'doctor' && (
            <Card>
              <CardHeader>
                <CardTitle>Mine honorarer</CardTitle>
              </CardHeader>
              {honorarer.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Ingen honorarer fundet</p>
                  <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                    Dine honorarer vises her, nar du besvarer sager.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-2 font-medium text-gray-500 dark:text-gray-400">Dato</th>
                        <th className="text-left py-3 px-2 font-medium text-gray-500 dark:text-gray-400">Case-type</th>
                        <th className="text-left py-3 px-2 font-medium text-gray-500 dark:text-gray-400">Serviceniveau</th>
                        <th className="text-right py-3 px-2 font-medium text-gray-500 dark:text-gray-400">Honorar</th>
                        <th className="text-right py-3 px-2 font-medium text-gray-500 dark:text-gray-400">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {honorarer.map((honorar) => (
                        <tr key={honorar.id} className="border-b border-gray-100 dark:border-gray-700/50">
                          <td className="py-3 px-2 text-gray-700 dark:text-gray-300">{formatDate(honorar.created_at)}</td>
                          <td className="py-3 px-2 text-gray-700 dark:text-gray-300">{honorar.case_type || '—'}</td>
                          <td className="py-3 px-2 text-gray-700 dark:text-gray-300">{serviceLevelLabel(honorar.service_level)}</td>
                          <td className="py-3 px-2 text-right text-gray-700 dark:text-gray-300">{formatAmount(honorar.doctor_amount)}</td>
                          <td className={`py-3 px-2 text-right font-medium ${statusColor(honorar.status)}`}>{statusLabel(honorar.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                Udbetalinger sker via Stripe til din bankkonto
              </p>
            </Card>
          )}
        </>
      )}

      {/* Pricing info */}
      <Card>
        <CardHeader>
          <CardTitle>Prisoversigt</CardTitle>
        </CardHeader>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Basis</h3>
            <p className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">299 kr</p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Hurtig vurdering af et specifikt spoergsmaal</p>
          </div>
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Standard</h3>
            <p className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">599 kr</p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Grundig gennemgang med klinisk vurdering</p>
          </div>
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Udvidet</h3>
            <p className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">999 kr</p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Komplet udredning med handlingsplan</p>
          </div>
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Akut</h3>
            <p className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">1.499 kr</p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Prioriteret vurdering inden for 2 timer</p>
          </div>
        </div>
      </Card>

      {/* Stripe security note */}
      <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          Betalinger haandteres sikkert via Stripe med PSD2 Strong Customer Authentication (3D Secure).
          Alle transaktioner er krypterede og overholder gaeldende EU-betalingsregulering.
        </p>
      </div>
    </div>
  )
}
