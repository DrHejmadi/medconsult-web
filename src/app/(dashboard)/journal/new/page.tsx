'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { searchICD10, type ICD10Code } from '@/lib/data/icd10'

export default function JournalCreatePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Patient info
  const [patientInitials, setPatientInitials] = useState('')
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0])
  const [entryTime, setEntryTime] = useState(new Date().toTimeString().slice(0, 5))

  // SOAP
  const [subjective, setSubjective] = useState('')
  const [objective, setObjective] = useState('')
  const [assessment, setAssessment] = useState('')
  const [plan, setPlan] = useState('')
  const [notes, setNotes] = useState('')

  // Legal fields
  const [behandlerName, setBehandlerName] = useState('')
  const [autorisationsId, setAutorisationsId] = useState('')
  const [henvendelsesaarsag, setHenvendelsesaarsag] = useState('')
  const [informeretSamtykke, setInformeretSamtykke] = useState(false)
  const [samtykkeNotes, setSamtykkeNotes] = useState('')

  // Diagnosis + medications
  const [selectedDiagnoses, setSelectedDiagnoses] = useState<ICD10Code[]>([])
  const [icdSearchQuery, setIcdSearchQuery] = useState('')
  const [icdResults, setIcdResults] = useState<ICD10Code[]>([])
  const [showIcdDropdown, setShowIcdDropdown] = useState(false)
  const icdRef = useRef<HTMLDivElement>(null)
  const [medications, setMedications] = useState<{ name: string; dosage: string; frequency: string; route: string }[]>([])

  // ICD-10 autocomplete
  useEffect(() => {
    if (icdSearchQuery.length >= 1) {
      const results = searchICD10(icdSearchQuery).filter(
        (r) => !selectedDiagnoses.some((d) => d.code === r.code)
      )
      setIcdResults(results)
      setShowIcdDropdown(results.length > 0)
    } else {
      setIcdResults([])
      setShowIcdDropdown(false)
    }
  }, [icdSearchQuery, selectedDiagnoses])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (icdRef.current && !icdRef.current.contains(e.target as Node)) {
        setShowIcdDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function addDiagnosis(code: ICD10Code) {
    setSelectedDiagnoses([...selectedDiagnoses, code])
    setIcdSearchQuery('')
    setShowIcdDropdown(false)
  }

  function removeDiagnosis(code: string) {
    setSelectedDiagnoses(selectedDiagnoses.filter((d) => d.code !== code))
  }

  function addMedication() {
    setMedications([...medications, { name: '', dosage: '', frequency: '', route: 'PO' }])
  }

  function updateMedication(index: number, field: string, value: string) {
    const updated = [...medications]
    updated[index] = { ...updated[index], [field]: value }
    setMedications(updated)
  }

  function removeMedication(index: number) {
    setMedications(medications.filter((_, i) => i !== index))
  }

  const canSave = patientInitials.trim() && behandlerName.trim() && autorisationsId.trim() && henvendelsesaarsag.trim()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSave) return
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const entryTimestamp = `${entryDate}T${entryTime}:00Z`
    const codes = selectedDiagnoses.map((d) => d.code)

    const { error: insertError } = await supabase.from('journal_entries').insert({
      doctor_id: user.id,
      patient_initials: patientInitials,
      entry_date: entryDate,
      entry_timestamp: entryTimestamp,
      subjective,
      objective,
      assessment,
      plan,
      notes: notes || null,
      diagnosis_codes: codes,
      medications,
      behandler_name: behandlerName,
      behandler_autorisations_id: autorisationsId,
      henvendelsesaarsag,
      informeret_samtykke: informeretSamtykke,
      samtykke_notes: samtykkeNotes || null,
      attachments: [],
      fmk_synced: false,
      is_deleted: false,
      version: 1,
    })

    if (insertError) {
      setError('Kunne ikke oprette journalnotat: ' + insertError.message)
      setLoading(false)
      return
    }

    // Audit log
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'create',
      resource_type: 'journal_entry',
    })

    router.push('/journal')
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Nyt journalnotat</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
        )}

        {/* Patient + dato */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Patientinfo</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Patientinitialer *</label>
              <input
                required
                value={patientInitials}
                onChange={(e) => setPatientInitials(e.target.value.toUpperCase())}
                maxLength={4}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="AB"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dato *</label>
              <input type="date" required value={entryDate} onChange={(e) => setEntryDate(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tidspunkt *</label>
              <input type="time" required value={entryTime} onChange={(e) => setEntryTime(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
            </div>
          </div>
        </div>

        {/* Behandler (lovpligtigt) */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Behandleridentifikation (lovpligtigt)</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Behandler navn *</label>
              <input required value={behandlerName} onChange={(e) => setBehandlerName(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Dr. Hansen" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Autorisations-ID *</label>
              <input required value={autorisationsId} onChange={(e) => setAutorisationsId(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="12345" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Henvendelsesarsag *</label>
            <input required value={henvendelsesaarsag} onChange={(e) => setHenvendelsesaarsag(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Arsag til henvendelsen" />
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="samtykke" checked={informeretSamtykke}
              onChange={(e) => setInformeretSamtykke(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            <label htmlFor="samtykke" className="text-sm font-medium text-gray-700">Informeret samtykke indhentet</label>
          </div>
          {informeretSamtykke && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Samtykke noter</label>
              <input value={samtykkeNotes} onChange={(e) => setSamtykkeNotes(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="F.eks. mundtligt samtykke" />
            </div>
          )}
        </div>

        {/* SOAP */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">SOAP-notat</h2>
          {[
            { label: 'Subjektivt (S)', value: subjective, setter: setSubjective, placeholder: 'Patientens symptomer og klager' },
            { label: 'Objektivt (O)', value: objective, setter: setObjective, placeholder: 'Kliniske fund og observationer' },
            { label: 'Vurdering (A)', value: assessment, setter: setAssessment, placeholder: 'Diagnose og klinisk vurdering' },
            { label: 'Plan (P)', value: plan, setter: setPlan, placeholder: 'Behandlingsplan og opfolgning' },
          ].map((field) => (
            <div key={field.label}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
              <textarea
                rows={3}
                value={field.value}
                onChange={(e) => field.setter(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder={field.placeholder}
              />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ovrige noter</label>
            <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
          </div>
        </div>

        {/* Diagnose + medicin */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Diagnoser & medicin</h2>

          {/* ICD-10 Autocomplete */}
          <div ref={icdRef} className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">ICD-10 / SKS diagnosekoder</label>

            {/* Selected diagnoses as badges */}
            {selectedDiagnoses.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedDiagnoses.map((d) => (
                  <span
                    key={d.code}
                    className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-sm font-medium"
                  >
                    <span className="font-semibold">{d.code}</span>
                    <span className="text-blue-500">{d.description}</span>
                    <button
                      type="button"
                      onClick={() => removeDiagnosis(d.code)}
                      className="ml-1 text-blue-400 hover:text-blue-600"
                    >
                      x
                    </button>
                  </span>
                ))}
              </div>
            )}

            <input
              value={icdSearchQuery}
              onChange={(e) => setIcdSearchQuery(e.target.value)}
              onFocus={() => {
                if (icdResults.length > 0) setShowIcdDropdown(true)
              }}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Sog efter diagnosekode eller beskrivelse..."
            />

            {showIcdDropdown && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {icdResults.map((result) => (
                  <button
                    key={result.code}
                    type="button"
                    onClick={() => addDiagnosis(result)}
                    className="w-full text-left px-3 py-2 hover:bg-blue-50 flex items-center gap-2 text-sm border-b border-gray-100 last:border-0"
                  >
                    <span className="font-semibold text-blue-600 min-w-[50px]">{result.code}</span>
                    <span className="text-gray-700">{result.description}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Medicin</label>
              <button type="button" onClick={addMedication} className="text-sm text-blue-600 hover:underline">+ Tilfoj</button>
            </div>
            {medications.map((med, i) => (
              <div key={i} className="grid grid-cols-5 gap-2 mb-2">
                <input placeholder="Navn" value={med.name} onChange={(e) => updateMedication(i, 'name', e.target.value)}
                  className="rounded-lg border border-gray-300 px-2 py-1 text-sm" />
                <input placeholder="Dosis" value={med.dosage} onChange={(e) => updateMedication(i, 'dosage', e.target.value)}
                  className="rounded-lg border border-gray-300 px-2 py-1 text-sm" />
                <input placeholder="Frekvens" value={med.frequency} onChange={(e) => updateMedication(i, 'frequency', e.target.value)}
                  className="rounded-lg border border-gray-300 px-2 py-1 text-sm" />
                <input placeholder="Rute" value={med.route} onChange={(e) => updateMedication(i, 'route', e.target.value)}
                  className="rounded-lg border border-gray-300 px-2 py-1 text-sm" />
                <button type="button" onClick={() => removeMedication(i)} className="text-red-500 text-sm">Fjern</button>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3 justify-end">
          <button type="button" onClick={() => router.back()}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium">
            Annuller
          </button>
          <button type="submit" disabled={!canSave || loading}
            className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Gemmer...' : 'Gem notat'}
          </button>
        </div>
      </form>
    </div>
  )
}
