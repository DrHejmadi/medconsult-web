'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardTitle } from '@/components/ui/card'

interface Notification {
  id: string
  title: string
  message: string
  type: string
  read: boolean
  created_at: string
}

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
  'Region Sj\u00e6lland',
  'Region Syddanmark',
  'Region Midtjylland',
  'Region Nordjylland',
]

const allSpecialties = [
  'Akutmedicin',
  'Almen medicin',
  'An\u00e6stesiologi',
  'Intern medicin',
  'Kirurgi',
  'Ortop\u00e6di',
  'P\u00e6diatri',
  'Psykiatri',
]

const allShiftTypes = ['Dag', 'Aften', 'Nat', 'Tilkalde']

const typeIcons: Record<string, string> = {
  info: '\u2139\uFE0F',
  success: '\u2705',
  warning: '\u26A0\uFE0F',
  error: '\u274C',
  message: '\uD83D\uDCE9',
  shift: '\uD83D\uDCC5',
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [prefs, setPrefs] = useState<NotificationPreferences>(defaultPreferences)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      if (user.user_metadata?.notification_preferences) {
        setPrefs(user.user_metadata.notification_preferences)
      }

      // Fetch notifications from the notifications table
      const { data: notifResult } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setNotifications(notifResult || [])
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

  const markAsRead = async (id: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id)
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n))
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setMessage(null)

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

  if (loading) return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Indl\u00e6ser...</div>

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Notifikationer</h1>
        <p className="text-gray-500">Administrer dine notifikations- og matchningspr\u00e6ferencer</p>
      </div>

      {error && <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
      {message && <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg text-sm">{message}</div>}

      {/* Notifications list */}
      {notifications.length > 0 && (
        <Card>
          <CardTitle>Seneste notifikationer</CardTitle>
          <div className="mt-4 space-y-3">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                  notif.read
                    ? 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800'
                    : 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20'
                }`}
                onClick={() => !notif.read && markAsRead(notif.id)}
              >
                <span className="text-lg">{typeIcons[notif.type] || '\uD83D\uDD14'}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${notif.read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-gray-100'}`}>
                    {notif.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{notif.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(notif.created_at).toLocaleDateString('da-DK', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {!notif.read && (
                  <span className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Push-notifikationer */}
      <Card>
        <CardTitle>Push-notifikationer</CardTitle>
        <div className="mt-4 space-y-3">
          {([
            { key: 'matchingPosts' as const, label: 'Nye opslag der matcher mine pr\u00e6ferencer' },
            { key: 'urgentShifts' as const, label: 'Akutte vikarbehov i min region' },
            { key: 'newMessages' as const, label: 'Nye beskeder' },
            { key: 'shiftSwapRequests' as const, label: 'Vagtbytte-anmodninger' },
            { key: 'contractFollowUp' as const, label: 'Kontraktopf\u00f8lgning' },
          ]).map(({ key, label }) => (
            <label key={key} className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
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
            { key: 'contractReminders' as const, label: 'Kontrakt- og fakturap\u00e5mindelser' },
          ]).map(({ key, label }) => (
            <label key={key} className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
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

      {/* Matchning-pr\u00e6ferencer */}
      <Card>
        <CardTitle>Matchning-pr\u00e6ferencer</CardTitle>
        <div className="mt-4 space-y-6">
          {/* Regioner */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Regioner</h3>
            <div className="space-y-2">
              {allRegions.map((region) => (
                <label key={region} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prefs.matching.regions.includes(region)}
                    onChange={() => toggleArrayItem('regions', region)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{region}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Specialer */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Specialer</h3>
            <div className="grid grid-cols-2 gap-2">
              {allSpecialties.map((specialty) => (
                <label key={specialty} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prefs.matching.specialties.includes(specialty)}
                    onChange={() => toggleArrayItem('specialties', specialty)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{specialty}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Vagttyper */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Vagttyper</h3>
            <div className="flex gap-4">
              {allShiftTypes.map((type) => (
                <label key={type} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prefs.matching.shiftTypes.includes(type)}
                    onChange={() => toggleArrayItem('shiftTypes', type)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{type}</span>
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
