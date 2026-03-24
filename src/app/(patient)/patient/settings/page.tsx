'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils/date'
import { Footer } from '@/components/layout/footer'

interface ConsentRecord {
  id: string
  consent_type: string
  granted_at: string
  revoked_at: string | null
  version: string
}

interface UserProfile {
  name: string
  email: string
}

export default function SettingsPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [consents, setConsents] = useState<ConsentRecord[]>([])
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [loading, setLoading] = useState(true)
  const [savingNotifications, setSavingNotifications] = useState(false)
  const [revokingId, setRevokingId] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletionRequested, setDeletionRequested] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    setProfile({
      name: user.user_metadata?.full_name || user.user_metadata?.name || 'Ikke angivet',
      email: user.email || '',
    })
    setEmailNotifications(user.user_metadata?.email_notifications !== false)

    const { data: consentData } = await supabase
      .from('consent_records')
      .select('*')
      .eq('patient_id', user.id)
      .is('revoked_at', null)
      .order('granted_at', { ascending: false })

    setConsents(consentData || [])
    setLoading(false)
  }

  async function toggleEmailNotifications() {
    setSavingNotifications(true)
    const supabase = createClient()
    const newValue = !emailNotifications

    const { error } = await supabase.auth.updateUser({
      data: { email_notifications: newValue },
    })

    if (!error) {
      setEmailNotifications(newValue)
    }
    setSavingNotifications(false)
  }

  async function revokeConsent(consentId: string) {
    setRevokingId(consentId)
    const supabase = createClient()

    const { error } = await supabase
      .from('consent_records')
      .update({ revoked_at: new Date().toISOString() })
      .eq('id', consentId)

    if (!error) {
      setConsents(consents.filter((c) => c.id !== consentId))
    }
    setRevokingId(null)
  }

  async function requestAccountDeletion() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('deletion_requests').insert({
      patient_id: user.id,
      requested_at: new Date().toISOString(),
      status: 'pending',
    })

    setDeletionRequested(true)
    setShowDeleteConfirm(false)
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const CONSENT_TYPE_LABELS: Record<string, string> = {
    informed_consent: 'Informeret samtykke',
    data_processing: 'Databehandling',
    terms_of_service: 'Servicevilkår',
    marketing: 'Markedsføring',
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Indlæser indstillinger...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Indstillinger</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Administrér din profil, samtykker og notifikationer</p>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-6 space-y-6">
        {/* Profile section */}
        <Card>
          <CardHeader>
            <CardTitle>Profil</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-sm text-gray-500 dark:text-gray-400">Navn</span>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{profile?.name}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">E-mail</span>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{profile?.email}</span>
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            Profiloplysninger hentes fra din login-konto og kan ikke ændres her.
          </p>
        </Card>

        {/* Notifications section */}
        <Card>
          <CardHeader>
            <CardTitle>Notifikationer</CardTitle>
          </CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">E-mail-notifikationer</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Modtag besked når din sag er besvaret eller opdateret
              </p>
            </div>
            <button
              onClick={toggleEmailNotifications}
              disabled={savingNotifications}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                emailNotifications ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              } ${savingNotifications ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              role="switch"
              aria-checked={emailNotifications}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                  emailNotifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </Card>

        {/* Consent section */}
        <Card>
          <CardHeader>
            <CardTitle>Samtykker</CardTitle>
          </CardHeader>
          {consents.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">Ingen aktive samtykker registreret.</p>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {consents.map((consent) => (
                <div key={consent.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {CONSENT_TYPE_LABELS[consent.consent_type] || consent.consent_type}
                      </span>
                      <Badge variant="success">Aktivt</Badge>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Givet {formatDate(consent.granted_at)}
                      {consent.version && ` — Version ${consent.version}`}
                    </p>
                  </div>
                  <button
                    onClick={() => revokeConsent(consent.id)}
                    disabled={revokingId === consent.id}
                    className="text-xs text-red-600 dark:text-red-400 hover:underline disabled:opacity-50"
                  >
                    {revokingId === consent.id ? 'Tilbagekalder...' : 'Tilbagekald'}
                  </button>
                </div>
              ))}
            </div>
          )}
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            Du kan tilbagekalde dine samtykker til enhver tid. Bemærk at tilbagekaldelse af samtykke til databehandling
            kan betyde, at vi ikke kan levere visse ydelser.
          </p>
        </Card>

        {/* Delete account section */}
        <Card>
          <CardHeader>
            <CardTitle>Slet konto</CardTitle>
          </CardHeader>
          {deletionRequested ? (
            <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-300 font-medium">
                Din anmodning om sletning er modtaget
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                Vi behandler din anmodning inden for 30 dage i henhold til GDPR Art. 17.
              </p>
            </div>
          ) : showDeleteConfirm ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
                <p className="text-sm text-red-800 dark:text-red-300 font-medium">
                  Er du sikker på, at du vil anmode om sletning af din konto?
                </p>
                <p className="text-xs text-red-700 dark:text-red-400 mt-2">
                  I henhold til GDPR Art. 17 har du ret til at få dine persondata slettet. Bemærk dog følgende:
                </p>
                <ul className="text-xs text-red-700 dark:text-red-400 mt-2 list-disc list-inside space-y-1">
                  <li>Journaldata bevares i minimum 10 år jf. journalbekendtgørelsen (BEK nr. 1361)</li>
                  <li>Data der er nødvendige for at overholde lovkrav kan ikke slettes</li>
                  <li>Alle øvrige personoplysninger vil blive slettet inden for 30 dage</li>
                </ul>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={requestAccountDeletion}
                  className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                >
                  Bekræft sletning
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 font-medium rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Annullér
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Du kan anmode om at få din konto slettet i henhold til GDPR Art. 17 (&quot;Retten til sletning&quot;).
                Journaldata bevares i minimum 10 år jf. journalbekendtgørelsen (BEK nr. 1361).
              </p>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 border border-red-300 dark:border-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                Anmod om sletning
              </button>
            </div>
          )}
        </Card>

        {/* Sign out */}
        <div className="flex justify-center pt-2 pb-8">
          <button
            onClick={handleSignOut}
            className="px-6 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Log ud
          </button>
        </div>
      </div>

      <Footer />
    </div>
  )
}
