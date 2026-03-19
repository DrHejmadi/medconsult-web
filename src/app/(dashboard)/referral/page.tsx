'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ReferralCode {
  id: string
  code: string
  referred_name: string
  referred_email: string
  status: string
  created_at: string
}

const statusVariant: Record<string, 'success' | 'info' | 'default'> = {
  Aktiv: 'success',
  Tilmeldt: 'info',
  Inviteret: 'default',
}

export default function ReferralPage() {
  const [copied, setCopied] = useState(false)
  const [referrals, setReferrals] = useState<ReferralCode[]>([])
  const [referralCode, setReferralCode] = useState('')
  const [referralLink, setReferralLink] = useState('')
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    async function fetchReferrals() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const code = 'MC-' + user.id.substring(0, 6)
      setReferralCode(code)
      setReferralLink(`https://medconsult.dk/signup?ref=${code}`)

      const { data: result } = await supabase
        .from('referral_codes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setReferrals(result || [])
      setLoading(false)
    }
    fetchReferrals()
  }, [])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleEmail = () => {
    const subject = encodeURIComponent('Pr\u00f8v MedConsult - digital platform for vikarl\u00e6ger')
    const body = encodeURIComponent(
      `Hej kollega,\n\nJeg bruger MedConsult til at finde vikariater og administrere min praksis. Jeg vil gerne anbefale platformen til dig.\n\nTilmeld dig her: ${referralLink}\n\nBrug min henvisningskode: ${referralCode}\n\nVenlig hilsen`
    )
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

  const totalInvited = referrals.length
  const totalSignedUp = referrals.filter((r) => r.status === 'Tilmeldt' || r.status === 'Aktiv').length
  const totalActive = referrals.filter((r) => r.status === 'Aktiv').length

  if (loading) return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Indl\u00e6ser...</div>

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
          { label: 'Total inviteret', value: totalInvited, color: 'bg-blue-50 text-blue-600' },
          { label: 'Tilmeldt', value: totalSignedUp, color: 'bg-green-50 text-green-600' },
          { label: 'Aktive brugere', value: totalActive, color: 'bg-purple-50 text-purple-600' },
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
          {referrals.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              Du har ikke henvist nogen endnu. Del din kode for at komme i gang!
            </p>
          ) : (
            referrals.map((person) => (
              <div key={person.id} className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3 last:border-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{person.referred_name}</p>
                  <p className="text-xs text-gray-500">{person.referred_email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={statusVariant[person.status] || 'default'}>{person.status}</Badge>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {new Date(person.created_at).toLocaleDateString('da-DK')}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Reward info */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-4">
          <span className="text-3xl">{'\uD83C\uDF81'}</span>
          <div>
            <CardTitle>Optjen gratis Premium</CardTitle>
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
              For hver kollega der tilmelder sig og gennemf\u00f8rer sin f\u00f8rste vagt, modtager du 1 m\u00e5neds gratis Premium.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
