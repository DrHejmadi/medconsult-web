'use client'

import { useState } from 'react'
import { Card, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const mockUserId = 'a3f8c2e1-9b47-4d6a-bc12-5e8f3a7d9c01'
const referralCode = 'MC-' + mockUserId.substring(0, 6)
const referralLink = `https://medconsult.dk/signup?ref=${referralCode}`

const referralHistory = [
  { name: 'Dr. Mette Hansen', email: 'mette.hansen@hospital.dk', status: 'Aktiv' as const, date: '2. jan 2026' },
  { name: 'Dr. Lars Pedersen', email: 'lars.pedersen@klinik.dk', status: 'Aktiv' as const, date: '15. jan 2026' },
  { name: 'Dr. Sofia Andersen', email: 'sofia.andersen@region.dk', status: 'Tilmeldt' as const, date: '3. feb 2026' },
  { name: 'Dr. Jonas Nielsen', email: 'jonas.nielsen@hospital.dk', status: 'Inviteret' as const, date: '20. feb 2026' },
  { name: 'Dr. Camilla Eriksen', email: 'camilla.eriksen@klinik.dk', status: 'Inviteret' as const, date: '8. mar 2026' },
]

const statusVariant: Record<string, 'success' | 'info' | 'default'> = {
  Aktiv: 'success',
  Tilmeldt: 'info',
  Inviteret: 'default',
}

export default function ReferralPage() {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleEmail = () => {
    const subject = encodeURIComponent('Prøv MedConsult - digital platform for vikarlæger')
    const body = encodeURIComponent(
      `Hej kollega,\n\nJeg bruger MedConsult til at finde vikariater og administrere min praksis. Jeg vil gerne anbefale platformen til dig.\n\nTilmeld dig her: ${referralLink}\n\nBrug min henvisningskode: ${referralCode}\n\nVenlig hilsen`
    )
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Inviter en kollega</h1>
        <p className="text-gray-500">Del MedConsult med dine kollegaer og optjen fordele</p>
      </div>

      {/* Referral code section */}
      <Card>
        <CardTitle>Din personlige henvisningskode</CardTitle>
        <div className="mt-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Henvisningskode</p>
              <p className="text-lg font-mono font-bold text-gray-900 dark:text-gray-100">{referralCode}</p>
            </div>
            <button
              onClick={handleCopy}
              className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium whitespace-nowrap"
            >
              {copied ? 'Kopieret!' : 'Kopier link'}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400 truncate flex-1">{referralLink}</span>
          </div>
        </div>
      </Card>

      {/* Share options */}
      <Card>
        <CardTitle>Del med kollegaer</CardTitle>
        <div className="mt-4">
          <button
            onClick={handleEmail}
            className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            Del via e-mail
          </button>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total inviteret', value: 5, color: 'bg-blue-50 text-blue-600' },
          { label: 'Tilmeldt', value: 3, color: 'bg-green-50 text-green-600' },
          { label: 'Aktive brugere', value: 2, color: 'bg-purple-50 text-purple-600' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
              <span className="text-lg font-bold">{stat.value}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Referral history */}
      <Card>
        <CardTitle>Dine henvisninger</CardTitle>
        <div className="mt-4 space-y-3">
          {referralHistory.map((person, i) => (
            <div key={i} className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3 last:border-0 last:pb-0">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{person.name}</p>
                <p className="text-xs text-gray-500">{person.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={statusVariant[person.status]}>{person.status}</Badge>
                <span className="text-xs text-gray-400 whitespace-nowrap">{person.date}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Reward info */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-4">
          <span className="text-3xl">🎁</span>
          <div>
            <CardTitle>Optjen gratis Premium</CardTitle>
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
              For hver kollega der tilmelder sig og gennemfører sin første vagt, modtager du 1 måneds gratis Premium.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
