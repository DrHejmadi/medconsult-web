'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardTitle } from '@/components/ui/card'

interface NotificationPreferences {
  push: {
    matchingPosts: boolean
    urgentShifts: boolean
    newMessages: boolean
    shiftSwapRequests: boolean
    contractFollowUp: boolean
  }
  email: {
    dailyDigest: boolean
    weeklyOverview: boolean
    contractReminders: boolean
  }
  matching: {
    regions: string[]
    specialties: string[]
    shiftTypes: string[]
  }
}

const defaultPreferences: NotificationPreferences = {
  push: {
    matchingPosts: true,
    urgentShifts: true,
    newMessages: true,
    shiftSwapRequests: false,
    contractFollowUp: true,
  },
  email: {
    dailyDigest: false,
    weeklyOverview: true,
    contractReminders: true,
  },
  matching: {
    regions: ['Region Hovedstaden'],
    specialties: ['Akutmedicin'],
    shiftTypes: ['Dag'],
  },
}

const allRegions = [
  'Region Hovedstaden',
  'Region Sjælland',
  'Region Syddanmark',
  'Region Midtjylland',
  'Region Nordjylland',
]

const allSpecialties = [
  'Akutmedicin',
  'Almen medicin',
  'Anæstesiologi',
  'Intern medicin',
  'Kirurgi',
  'Ortopædi',
  'Pædiatri',
  'Psykiatri',
]

const allShiftTypes = ['Dag', 'Aften', 'Nat', 'Tilkalde']

export default function NotificationsPage() {
  const [prefs, setPrefs] = useState<NotificationPreferences>(defaultPreferences)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.user_metadata?.notification_preferences) {
        setPrefs(user.user_metadata.notification_preferences)
      }
      setLoading(false)
    }
    load()
  }, [])

  const togglePush = (key: keyof NotificationPreferences['push']) => {
    setPrefs((prev) => ({ ...prev, push: { ...prev.push, [key]: !prev.push[key] } }))
  }

  const toggleEmail = (key: keyof NotificationPreferences['email']) => {
    setPrefs((prev) => ({ ...prev, email: { ...prev.email, [key]: !prev.email[key] } }))
  }

  const toggleArrayItem = (
    category: 'regions' | 'specialties' | 'shiftTypes',
    item: string
  ) => {
    setPrefs((prev) => {
      const current = prev.matching[category]
      const updated = current.includes(item)
        ? current.filter((i) => i !== item)
        : [...current, item]
      return { ...prev, matching: { ...prev.matching, [category]: updated } }
    })
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setMessage(null)

    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({
      data: { notification_preferences: prefs },
    })

    if (updateError) {
      setError('Kunne ikke gemme indstillinger')
    } else {
      setMessage('Notifikationsindstillinger gemt')
    }
    setSaving(false)
  }

  if (loading) return <div className="text-center py-12 text-gray-500">Indlæser...</div>

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Notifikationer</h1>
        <p className="text-gray-500">Administrer dine notifikations- og matchningspræferencer</p>
      </div>

      {error && <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
      {message && <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg text-sm">{message}</div>}

      {/* Push-notifikationer */}
      <Card>
        <CardTitle>Push-notifikationer</CardTitle>
        <div className="mt-4 space-y-3">
          {([
            { key: 'matchingPosts' as const, label: 'Nye opslag der matcher mine præferencer' },
            { key: 'urgentShifts' as const, label: 'Akutte vikarbehov i min region' },
            { key: 'newMessages' as const, label: 'Nye beskeder' },
            { key: 'shiftSwapRequests' as const, label: 'Vagtbytte-anmodninger' },
            { key: 'contractFollowUp' as const, label: 'Kontraktopfølgning' },
          ]).map(({ key, label }) => (
            <label key={key} className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-gray-700">{label}</span>
              <input
                type="checkbox"
                checked={prefs.push[key]}
                onChange={() => togglePush(key)}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            </label>
          ))}
        </div>
      </Card>

      {/* E-mail notifikationer */}
      <Card>
        <CardTitle>E-mail notifikationer</CardTitle>
        <div className="mt-4 space-y-3">
          {([
            { key: 'dailyDigest' as const, label: 'Daglig opslagsdigest' },
            { key: 'weeklyOverview' as const, label: 'Ugentlig aktivitetsoversigt' },
            { key: 'contractReminders' as const, label: 'Kontrakt- og fakturapåmindelser' },
          ]).map(({ key, label }) => (
            <label key={key} className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-gray-700">{label}</span>
              <input
                type="checkbox"
                checked={prefs.email[key]}
                onChange={() => toggleEmail(key)}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            </label>
          ))}
        </div>
      </Card>

      {/* Matchning-præferencer */}
      <Card>
        <CardTitle>Matchning-præferencer</CardTitle>
        <div className="mt-4 space-y-6">
          {/* Regioner */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Regioner</h3>
            <div className="space-y-2">
              {allRegions.map((region) => (
                <label key={region} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prefs.matching.regions.includes(region)}
                    onChange={() => toggleArrayItem('regions', region)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-sm text-gray-700">{region}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Specialer */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Specialer</h3>
            <div className="grid grid-cols-2 gap-2">
              {allSpecialties.map((specialty) => (
                <label key={specialty} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prefs.matching.specialties.includes(specialty)}
                    onChange={() => toggleArrayItem('specialties', specialty)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-sm text-gray-700">{specialty}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Vagttyper */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Vagttyper</h3>
            <div className="flex gap-4">
              {allShiftTypes.map((type) => (
                <label key={type} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prefs.matching.shiftTypes.includes(type)}
                    onChange={() => toggleArrayItem('shiftTypes', type)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-sm text-gray-700">{type}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50"
      >
        {saving ? 'Gemmer...' : 'Gem indstillinger'}
      </button>
    </div>
  )
}
