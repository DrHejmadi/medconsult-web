'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'

type UserRole = 'patient' | 'doctor'

interface Payment {
  id: string
  dato: string
  caseType: string
  serviceniveau: string
  beloeb: string
  status: 'Betalt' | 'Afventer' | 'Refunderet'
}

interface Honorar {
  id: string
  dato: string
  caseType: string
  serviceniveau: string
  honorar: string
  status: 'Udbetalt' | 'Afventer' | 'Under behandling'
}

const statusColor = (status: string) => {
  switch (status) {
    case 'Betalt':
    case 'Udbetalt':
      return 'text-green-600 dark:text-green-400'
    case 'Afventer':
    case 'Under behandling':
      return 'text-yellow-600 dark:text-yellow-400'
    case 'Refunderet':
      return 'text-red-600 dark:text-red-400'
    default:
      return 'text-gray-600 dark:text-gray-400'
  }
}

// Placeholder data - replace with real data from Supabase
const mockPayments: Payment[] = [
  { id: '1', dato: '2026-03-15', caseType: 'Konsultation', serviceniveau: 'Standard', beloeb: '750 kr', status: 'Betalt' },
  { id: '2', dato: '2026-03-10', caseType: 'Kort r\u00e5d', serviceniveau: 'Basis', beloeb: '350 kr', status: 'Betalt' },
  { id: '3', dato: '2026-03-08', caseType: 'Fuld udredningsplan', serviceniveau: 'Premium', beloeb: '3.500 kr', status: 'Afventer' },
]

const mockHonorarer: Honorar[] = [
  { id: '1', dato: '2026-03-15', caseType: 'Konsultation', serviceniveau: 'Standard', honorar: '637,50 kr', status: 'Udbetalt' },
  { id: '2', dato: '2026-03-10', caseType: 'Kort r\u00e5d', serviceniveau: 'Basis', honorar: '297,50 kr', status: 'Udbetalt' },
  { id: '3', dato: '2026-03-08', caseType: 'Fuld udredningsplan', serviceniveau: 'Premium', honorar: '2.975 kr', status: 'Under behandling' },
]

export default function PaymentPage() {
  const [role, setRole] = useState<UserRole>('patient')

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Betaling</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Oversigt over betalinger og honorarer
        </p>
      </div>

      {/* Role toggle for demo purposes */}
      <div className="flex gap-2">
        <button
          onClick={() => setRole('patient')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            role === 'patient'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Patient
        </button>
        <button
          onClick={() => setRole('doctor')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            role === 'doctor'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          L&aelig;ge
        </button>
      </div>

      {role === 'patient' ? (
        <Card>
          <CardHeader>
            <CardTitle>Mine betalinger</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-2 font-medium text-gray-500 dark:text-gray-400">Dato</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500 dark:text-gray-400">Case-type</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500 dark:text-gray-400">Serviceniveau</th>
                  <th className="text-right py-3 px-2 font-medium text-gray-500 dark:text-gray-400">Bel&oslash;b</th>
                  <th className="text-right py-3 px-2 font-medium text-gray-500 dark:text-gray-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {mockPayments.map((payment) => (
                  <tr key={payment.id} className="border-b border-gray-100 dark:border-gray-700/50">
                    <td className="py-3 px-2 text-gray-700 dark:text-gray-300">{payment.dato}</td>
                    <td className="py-3 px-2 text-gray-700 dark:text-gray-300">{payment.caseType}</td>
                    <td className="py-3 px-2 text-gray-700 dark:text-gray-300">{payment.serviceniveau}</td>
                    <td className="py-3 px-2 text-right text-gray-700 dark:text-gray-300">{payment.beloeb}</td>
                    <td className={`py-3 px-2 text-right font-medium ${statusColor(payment.status)}`}>{payment.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Platformens andel: 15% til drift og udvikling
          </p>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Mine honorarer</CardTitle>
          </CardHeader>
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
                {mockHonorarer.map((honorar) => (
                  <tr key={honorar.id} className="border-b border-gray-100 dark:border-gray-700/50">
                    <td className="py-3 px-2 text-gray-700 dark:text-gray-300">{honorar.dato}</td>
                    <td className="py-3 px-2 text-gray-700 dark:text-gray-300">{honorar.caseType}</td>
                    <td className="py-3 px-2 text-gray-700 dark:text-gray-300">{honorar.serviceniveau}</td>
                    <td className="py-3 px-2 text-right text-gray-700 dark:text-gray-300">{honorar.honorar}</td>
                    <td className={`py-3 px-2 text-right font-medium ${statusColor(honorar.status)}`}>{honorar.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Udbetalinger sker via Stripe til din bankkonto
          </p>
        </Card>
      )}

      {/* Pricing info */}
      <Card>
        <CardHeader>
          <CardTitle>Prisoversigt</CardTitle>
        </CardHeader>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Kort r&aring;d</h3>
            <p className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">200-500 kr</p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Hurtig vurdering af et specifikt sp&oslash;rgsm&aring;l</p>
          </div>
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Konsultation</h3>
            <p className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">500-1.500 kr</p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Grundig gennemgang med klinisk vurdering</p>
          </div>
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Fuld udredningsplan</h3>
            <p className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">1.500-5.000+ kr</p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Komplet udredning med handlingsplan</p>
          </div>
        </div>
      </Card>

      {/* Payment security note */}
      <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          Betaling h&aring;ndteres sikkert via Stripe med PSD2 Strong Customer Authentication
        </p>
      </div>
    </div>
  )
}
