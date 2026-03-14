'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { JournalEntry, AuditLogEntry } from '@/lib/types/database'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatDateTime } from '@/lib/utils/date'
import { ACTION_LABELS, RESOURCE_LABELS } from '@/lib/utils/constants'
import { Footer } from '@/components/layout/footer'

type Tab = 'journal' | 'access-log' | 'consent' | 'gdpr'

export default function PatientPortalWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Indlæser...</div>
      </div>
    }>
      <PatientPortalPage />
    </Suspense>
  )
}

function PatientPortalPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [tab, setTab] = useState<Tab>('journal')
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([])
  const [auditEntries, setAuditEntries] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [patientId, setPatientId] = useState<string | null>(null)
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    if (token) {
      verifyToken(token)
    } else {
      checkAuth()
    }
  }, [token])

  async function checkAuth() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user && user.user_metadata?.role === 'patient') {
      setPatientId(user.id)
      setAuthenticated(true)
      loadData(user.id)
    } else {
      setLoading(false)
    }
  }

  async function verifyToken(accessToken: string) {
    const supabase = createClient()
    const { data, error: tokenError } = await supabase
      .from('patient_access_tokens')
      .select('patient_id, expires_at')
      .eq('token_hash', accessToken)
      .single()

    if (tokenError || !data) {
      setError('Ugyldigt eller udløbet aktindsigt-link')
      setLoading(false)
      return
    }

    if (new Date(data.expires_at) < new Date()) {
      setError('Dit aktindsigt-link er udløbet. Kontakt din læge for et nyt link.')
      setLoading(false)
      return
    }

    setPatientId(data.patient_id)
    setAuthenticated(true)
    loadData(data.patient_id)
  }

  async function loadData(pid: string) {
    const supabase = createClient()

    const [journalRes, auditRes] = await Promise.all([
      supabase.from('journal_entries').select('*')
        .eq('patient_id', pid).eq('is_deleted', false)
        .order('entry_date', { ascending: false }),
      supabase.from('audit_logs').select('*')
        .eq('patient_identifier', pid)
        .order('created_at', { ascending: false })
        .limit(100),
    ])

    setJournalEntries(journalRes.data || [])
    setAuditEntries(auditRes.data || [])
    setLoading(false)
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'journal', label: 'Aktindsigt' },
    { key: 'access-log', label: 'Adgangslog' },
    { key: 'consent', label: 'Samtykke' },
    { key: 'gdpr', label: 'Dine rettigheder' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Indlæser...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <span className="text-4xl block mb-4">🔒</span>
          <h1 className="text-xl font-bold mb-2">Adgang nægtet</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-md">
          <span className="text-4xl block mb-4">👤</span>
          <h1 className="text-2xl font-bold mb-2">Patientportal</h1>
          <p className="text-gray-600 mb-6">
            For at se dine journaldata, skal du bruge det aktindsigt-link du har modtaget fra din læge,
            eller logge ind med din patientkonto.
          </p>
          <a href="/login" className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
            Log ind
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏥</span>
            <span className="text-xl font-bold">MedConsult — Patientportal</span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                tab === t.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === 'journal' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Dine journalnotater</h2>
            {journalEntries.length === 0 ? (
              <p className="text-gray-500">Ingen journalnotater fundet.</p>
            ) : (
              journalEntries.map((entry) => (
                <div key={entry.id} className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{formatDate(entry.entry_date)}</span>
                    {entry.signed_at && <Badge variant="success">Signeret</Badge>}
                  </div>
                  <div className="text-sm text-gray-500">
                    Behandler: {entry.behandler_name} (Aut. {entry.behandler_autorisations_id})
                  </div>
                  {entry.henvendelsesaarsag && (
                    <div className="text-sm"><span className="text-gray-500">Årsag:</span> {entry.henvendelsesaarsag}</div>
                  )}
                  <div className="grid grid-cols-1 gap-3 mt-3">
                    {entry.subjective && <div><h4 className="text-xs font-medium text-gray-400 uppercase">Subjektivt</h4><p className="text-sm">{entry.subjective}</p></div>}
                    {entry.objective && <div><h4 className="text-xs font-medium text-gray-400 uppercase">Objektivt</h4><p className="text-sm">{entry.objective}</p></div>}
                    {entry.assessment && <div><h4 className="text-xs font-medium text-gray-400 uppercase">Vurdering</h4><p className="text-sm">{entry.assessment}</p></div>}
                    {entry.plan && <div><h4 className="text-xs font-medium text-gray-400 uppercase">Plan</h4><p className="text-sm">{entry.plan}</p></div>}
                  </div>
                  {entry.diagnosis_codes?.length > 0 && (
                    <div className="flex gap-2">
                      {entry.diagnosis_codes.map(c => <Badge key={c} variant="info">{c}</Badge>)}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'access-log' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Hvem har tilgået dine data</h2>
            <p className="text-sm text-gray-500">
              Jf. Sundhedsloven har du ret til at se hvem der har tilgået dine sundhedsdata.
            </p>
            {auditEntries.length === 0 ? (
              <p className="text-gray-500">Ingen adgange registreret.</p>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50 text-left">
                      <th className="px-4 py-3 font-medium text-gray-500">Tidspunkt</th>
                      <th className="px-4 py-3 font-medium text-gray-500">Handling</th>
                      <th className="px-4 py-3 font-medium text-gray-500">Ressource</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditEntries.map((e) => (
                      <tr key={e.id} className="border-b last:border-0">
                        <td className="px-4 py-3 text-gray-500">{formatDateTime(e.created_at)}</td>
                        <td className="px-4 py-3">
                          <Badge variant="info">{ACTION_LABELS[e.action] || e.action}</Badge>
                        </td>
                        <td className="px-4 py-3">{RESOURCE_LABELS[e.resource_type] || e.resource_type}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === 'consent' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Samtykkestyring</h2>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <p className="text-gray-700 mb-4">
                Her kan du se og administrere de samtykker du har givet til behandling af dine sundhedsdata.
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Journalføring</p>
                    <p className="text-xs text-gray-500">Lovpligtigt — kan ikke tilbagetrækkes</p>
                  </div>
                  <Badge variant="success">Aktiv</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Adgangslogning</p>
                    <p className="text-xs text-gray-500">Lovpligtigt — kan ikke tilbagetrækkes</p>
                  </div>
                  <Badge variant="success">Aktiv</Badge>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'gdpr' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Dine rettigheder</h2>
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <div>
                <h3 className="font-medium mb-1">Aktindsigt (Sundhedsloven §37)</h3>
                <p className="text-sm text-gray-600">Du har ret til at se alle journalnotater der omhandler dig.</p>
              </div>
              <div>
                <h3 className="font-medium mb-1">Adgangslog</h3>
                <p className="text-sm text-gray-600">Du kan se hvem der har tilgået dine data og hvornår.</p>
              </div>
              <div>
                <h3 className="font-medium mb-1">Dataportabilitet (GDPR Art. 20)</h3>
                <p className="text-sm text-gray-600">Du kan anmode om eksport af dine data i maskinlæsbart format.</p>
              </div>
              <div>
                <h3 className="font-medium mb-1">Begrænsning af behandling (GDPR Art. 18)</h3>
                <p className="text-sm text-gray-600">Du kan anmode om begrænsning af behandling af dine data.</p>
              </div>
              <div>
                <h3 className="font-medium mb-1">Sletning</h3>
                <p className="text-sm text-gray-600">
                  Sundhedsdata er undtaget fra retten til sletning jf. GDPR Art. 17(3)(c),
                  da opbevaring er lovpligtigt i minimum 10 år.
                </p>
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600">
                  Henvendelser om dine rettigheder kan rettes til{' '}
                  <a href="mailto:dpo@medconsult.dk" className="text-blue-600 hover:underline">dpo@medconsult.dk</a>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
