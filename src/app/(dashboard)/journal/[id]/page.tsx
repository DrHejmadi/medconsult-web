'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { JournalEntry, JournalEntryVersion } from '@/lib/types/database'
import { Badge } from '@/components/ui/badge'
import { formatDateTime } from '@/lib/utils/date'

export default function JournalDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [entry, setEntry] = useState<JournalEntry | null>(null)
  const [versions, setVersions] = useState<JournalEntryVersion[]>([])
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showVersions, setShowVersions] = useState(false)

  // Editable fields
  const [subjective, setSubjective] = useState('')
  const [objective, setObjective] = useState('')
  const [assessment, setAssessment] = useState('')
  const [plan, setPlan] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    loadEntry()
  }, [id])

  async function loadEntry() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error: fetchError } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !data) {
      setError('Kunne ikke hente journalnotat')
      setLoading(false)
      return
    }

    setEntry(data)
    setSubjective(data.subjective || '')
    setObjective(data.objective || '')
    setAssessment(data.assessment || '')
    setPlan(data.plan || '')
    setNotes(data.notes || '')

    // Log access
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'view',
      resource_type: 'journal_entry',
      resource_id: id,
    })

    // Load versions
    const { data: versionData } = await supabase
      .from('journal_entry_versions')
      .select('*')
      .eq('journal_entry_id', id)
      .order('version_number', { ascending: false })

    setVersions(versionData || [])
    setLoading(false)
  }

  async function saveEdits() {
    if (!entry) return
    setSaving(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error: updateError } = await supabase
      .from('journal_entries')
      .update({
        subjective,
        objective,
        assessment,
        plan,
        notes: notes || null,
        version: entry.version + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (updateError) {
      setError('Kunne ikke gemme ændringer')
      setSaving(false)
      return
    }

    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'update',
      resource_type: 'journal_entry',
      resource_id: id,
    })

    setEditing(false)
    setSaving(false)
    loadEntry()
  }

  if (loading) return <div className="text-center py-12 text-gray-500">Indlæser...</div>
  if (!entry) return <div className="text-center py-12 text-red-500">{error || 'Ikke fundet'}</div>

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700">← Tilbage</button>
          <h1 className="text-2xl font-bold">Journal — {entry.patient_initials}</h1>
          {entry.signed_at && <Badge variant="success">Signeret</Badge>}
          <Badge variant="default">v{entry.version}</Badge>
        </div>
        {!editing && !entry.signed_at && (
          <button onClick={() => setEditing(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
            Rediger
          </button>
        )}
      </div>

      {error && <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

      {/* Behandlerinfo */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold mb-3">Behandleridentifikation</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Behandler:</span>{' '}
            <span className="font-medium">{entry.behandler_name}</span>
          </div>
          <div>
            <span className="text-gray-500">Autorisations-ID:</span>{' '}
            <span className="font-medium">{entry.behandler_autorisations_id}</span>
          </div>
          <div>
            <span className="text-gray-500">Henvendelsesårsag:</span>{' '}
            <span className="font-medium">{entry.henvendelsesaarsag || '—'}</span>
          </div>
          <div>
            <span className="text-gray-500">Informeret samtykke:</span>{' '}
            <Badge variant={entry.informeret_samtykke ? 'success' : 'warning'}>
              {entry.informeret_samtykke ? 'Ja' : 'Nej'}
            </Badge>
          </div>
          {entry.samtykke_notes && (
            <div className="col-span-2">
              <span className="text-gray-500">Samtykke noter:</span>{' '}
              <span>{entry.samtykke_notes}</span>
            </div>
          )}
        </div>
      </div>

      {/* SOAP */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold">SOAP-notat</h2>
        {editing ? (
          <>
            {[
              { label: 'Subjektivt (S)', value: subjective, setter: setSubjective },
              { label: 'Objektivt (O)', value: objective, setter: setObjective },
              { label: 'Vurdering (A)', value: assessment, setter: setAssessment },
              { label: 'Plan (P)', value: plan, setter: setPlan },
            ].map((field) => (
              <div key={field.label}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                <textarea rows={3} value={field.value} onChange={(e) => field.setter(e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Øvrige noter</label>
              <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setEditing(false)} className="px-4 py-2 rounded-lg border border-gray-300 text-sm">Annuller</button>
              <button onClick={saveEdits} disabled={saving}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                {saving ? 'Gemmer...' : 'Gem ændringer'}
              </button>
            </div>
          </>
        ) : (
          <>
            {[
              { label: 'Subjektivt (S)', value: entry.subjective },
              { label: 'Objektivt (O)', value: entry.objective },
              { label: 'Vurdering (A)', value: entry.assessment },
              { label: 'Plan (P)', value: entry.plan },
            ].map((field) => (
              <div key={field.label}>
                <h3 className="text-sm font-medium text-gray-500">{field.label}</h3>
                <p className="text-gray-900 mt-1">{field.value || '—'}</p>
              </div>
            ))}
            {entry.notes && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Øvrige noter</h3>
                <p className="text-gray-900 mt-1">{entry.notes}</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Diagnoser + medicin */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold">Diagnoser & medicin</h2>
        {entry.diagnosis_codes?.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {entry.diagnosis_codes.map((code) => (
              <Badge key={code} variant="info">{code}</Badge>
            ))}
          </div>
        )}
        {entry.medications?.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-2">Medicin</th>
                <th className="pb-2">Dosis</th>
                <th className="pb-2">Frekvens</th>
                <th className="pb-2">Rute</th>
              </tr>
            </thead>
            <tbody>
              {entry.medications.map((med, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="py-2">{med.name}</td>
                  <td className="py-2">{med.dosage}</td>
                  <td className="py-2">{med.frequency}</td>
                  <td className="py-2">{med.route}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Metadata */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
          <div>Dato: {entry.entry_date}</div>
          <div>Tidspunkt: {entry.entry_timestamp ? formatDateTime(entry.entry_timestamp) : '—'}</div>
          <div>Oprettet: {formatDateTime(entry.created_at)}</div>
          <div>Opdateret: {formatDateTime(entry.updated_at)}</div>
        </div>
      </div>

      {/* Versionshistorik */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <button onClick={() => setShowVersions(!showVersions)} className="flex items-center gap-2 font-semibold w-full text-left">
          <span>{showVersions ? '▼' : '▶'}</span>
          Versionshistorik ({versions.length} versioner)
        </button>
        {showVersions && versions.length > 0 && (
          <div className="mt-4 space-y-3">
            {versions.map((v) => (
              <div key={v.id} className="border border-gray-100 rounded-lg p-3">
                <div className="flex items-center justify-between text-sm">
                  <Badge variant="default">v{v.version_number}</Badge>
                  <span className="text-gray-500">{formatDateTime(v.changed_at)}</span>
                </div>
                {v.change_reason && <p className="text-sm text-gray-600 mt-1">Årsag: {v.change_reason}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
