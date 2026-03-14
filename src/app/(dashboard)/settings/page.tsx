'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

export default function SettingsPage() {
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setEmail(user.email || '')
        setFullName(user.user_metadata?.full_name || '')
        setRole(user.user_metadata?.role || '')
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setMessage(null)

    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({
      data: { full_name: fullName },
    })

    if (updateError) {
      setError('Kunne ikke gemme indstillinger')
    } else {
      setMessage('Indstillinger gemt')
    }
    setSaving(false)
  }

  if (loading) return <div className="text-center py-12 text-gray-500">Indlæser...</div>

  const roleLabels: Record<string, string> = { doctor: 'Læge', company: 'Virksomhed', ngo: 'NGO' }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Indstillinger</h1>

      {error && <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
      {message && <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg text-sm">{message}</div>}

      <form onSubmit={handleSave} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold">Profil</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input value={email} disabled className="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Navn</label>
          <input value={fullName} onChange={(e) => setFullName(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rolle</label>
          <input value={roleLabels[role] || role} disabled
            className="block w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-500" />
        </div>
        <button type="submit" disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
          {saving ? 'Gemmer...' : 'Gem'}
        </button>
      </form>

      {/* Compliance — audit log ALWAYS active, no paywall */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold">Lovkompliance</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Adgangslog</span>
            <Badge variant="success">Aktiv</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Journalversionering</span>
            <Badge variant="success">Aktiv</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Sletningsbeskyttelse</span>
            <Badge variant="success">Aktiv</Badge>
          </div>
          <p className="text-xs text-gray-400">
            Disse funktioner er lovpligtige og kan ikke deaktiveres jf. Journalføringsbekendtgørelsen og Sundhedsloven.
          </p>
        </div>
        <Link href="/audit-log" className="block text-sm text-blue-600 hover:underline">
          Se adgangslog →
        </Link>
      </div>
    </div>
  )
}
