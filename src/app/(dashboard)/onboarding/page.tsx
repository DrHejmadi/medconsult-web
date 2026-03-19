'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardTitle } from '@/components/ui/card'

const STEPS = ['Velkommen', 'Din rolle', 'Profil', 'Tilgængelighed', 'Færdig']

const SPECIALTIES = [
  'Almen medicin',
  'Kirurgi',
  'Intern medicin',
  'Pædiatri',
  'Gynækologi',
  'Psykiatri',
  'Ortopædkirurgi',
  'Anæstesiologi',
  'Kardiologi',
  'Neurologi',
  'Dermatologi',
  'Onkologi',
  'Akutmedicin',
  'Geriatri',
  'Radiologi',
]

const REGIONS = ['Hovedstaden', 'Sjælland', 'Syddanmark', 'Midtjylland', 'Nordjylland']

const SHIFT_TYPES = [
  { value: 'day', label: 'Dagvagt' },
  { value: 'evening', label: 'Aftenvagt' },
  { value: 'night', label: 'Nattevagt' },
  { value: 'on_call', label: 'Tilkaldevagt' },
]

const WEEKDAYS = [
  { value: 'mon', label: 'Mandag' },
  { value: 'tue', label: 'Tirsdag' },
  { value: 'wed', label: 'Onsdag' },
  { value: 'thu', label: 'Torsdag' },
  { value: 'fri', label: 'Fredag' },
  { value: 'sat', label: 'Lørdag' },
  { value: 'sun', label: 'Søndag' },
]

interface OnboardingData {
  role: 'doctor' | 'company' | 'ngo' | ''
  fullName: string
  phone: string
  specialty: string
  region: string
  shiftTypes: string[]
  availableDays: string[]
  autorisationsId: string
}

type VerificationStatus = 'idle' | 'loading' | 'pending' | 'verified' | 'error'

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [data, setData] = useState<OnboardingData>({
    role: '',
    fullName: '',
    phone: '',
    specialty: '',
    region: '',
    shiftTypes: [],
    availableDays: [],
    autorisationsId: '',
  })

  // STPS verification state
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('idle')
  const [verificationError, setVerificationError] = useState('')

  function updateData(partial: Partial<OnboardingData>) {
    setData((prev) => ({ ...prev, ...partial }))
  }

  function toggleArrayValue(field: 'shiftTypes' | 'availableDays', value: string) {
    setData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value],
    }))
  }

  async function handleVerifyStps() {
    if (!data.autorisationsId || data.autorisationsId.length < 4) {
      setVerificationError('Indtast et gyldigt autorisations-ID (mindst 4 tegn)')
      setVerificationStatus('error')
      return
    }

    setVerificationStatus('loading')
    setVerificationError('')

    try {
      const res = await fetch('/api/verification/stps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ autorisationsId: data.autorisationsId }),
      })

      const result = await res.json()

      if (!res.ok) {
        setVerificationError(result.error || 'Verificeringsfejl')
        setVerificationStatus('error')
        return
      }

      if (result.verified) {
        setVerificationStatus('verified')
      } else if (result.error) {
        setVerificationError(result.error)
        setVerificationStatus('error')
      } else {
        // Submitted for manual review
        setVerificationStatus('pending')
      }
    } catch {
      setVerificationError('Netværksfejl. Prøv igen.')
      setVerificationStatus('error')
    }
  }

  async function handleFinish() {
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({
      data: {
        onboarding_completed: true,
        role: data.role,
        full_name: data.fullName,
        phone: data.phone,
        specialty: data.specialty,
        region: data.region,
        preferred_shifts: data.shiftTypes,
        available_days: data.availableDays,
      },
    })

    if (error) {
      alert('Der opstod en fejl. Prøv igen.')
      setSaving(false)
      return
    }

    router.push('/dashboard')
  }

  const canGoNext = () => {
    if (step === 1 && !data.role) return false
    if (step === 2 && !data.fullName) return false
    return true
  }

  const roleLabels: Record<string, string> = {
    doctor: 'Læge',
    company: 'Virksomhed',
    ngo: 'NGO',
  }

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6">
      {/* Trin-indikator */}
      <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <span className="font-medium text-gray-900 dark:text-gray-100">Trin {step + 1}</span>
        <span>af {STEPS.length}</span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
        />
      </div>

      <Card>
        <CardTitle>{STEPS[step]}</CardTitle>

        <div className="mt-6">
          {/* Trin 1: Velkommen */}
          {step === 0 && (
            <div className="space-y-4 text-gray-600 dark:text-gray-300">
              <p className="text-lg">
                Velkommen til MedConsult!
              </p>
              <p>
                MedConsult forbinder læger med vikariater, vagter og frivilligt arbejde i hele Danmark.
                Vores platform gør det nemt at:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Finde relevante vagter og vikariater baseret på dine præferencer</li>
                <li>Administrere kontrakter og tidsregistrering</li>
                <li>Føre elektronisk journal med SOAP-dokumentation</li>
                <li>Deltage i frivilligt sundhedsarbejde via NGO-samarbejder</li>
                <li>Opbygge dit professionelle netværk</li>
              </ul>
              <p>
                Lad os komme i gang med at opsætte din profil. Det tager kun et par minutter.
              </p>
            </div>
          )}

          {/* Trin 2: Rolle */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300 mb-4">Vælg den rolle, der bedst beskriver dig:</p>
              {(['doctor', 'company', 'ngo'] as const).map((role) => (
                <label
                  key={role}
                  className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                    data.role === role
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={role}
                    checked={data.role === role}
                    onChange={() => updateData({ role })}
                    className="text-blue-600"
                  />
                  <div>
                    <div className="font-medium dark:text-gray-100">
                      {role === 'doctor' ? 'Læge' : role === 'company' ? 'Virksomhed' : 'NGO'}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {role === 'doctor'
                        ? 'Jeg er læge og søger vagter eller vikariater'
                        : role === 'company'
                        ? 'Jeg repræsenterer en virksomhed, der søger læger'
                        : 'Jeg repræsenterer en NGO med behov for frivillige læger'}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}

          {/* Trin 3: Profil */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Fulde navn *
                </label>
                <input
                  type="text"
                  value={data.fullName}
                  onChange={(e) => updateData({ fullName: e.target.value })}
                  placeholder="Dit fulde navn"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Telefon
                </label>
                <input
                  type="tel"
                  value={data.phone}
                  onChange={(e) => updateData({ phone: e.target.value })}
                  placeholder="+45 12 34 56 78"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 dark:text-gray-100"
                />
              </div>

              {data.role === 'doctor' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Speciale
                    </label>
                    <select
                      value={data.specialty}
                      onChange={(e) => updateData({ specialty: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 dark:text-gray-100"
                    >
                      <option value="">Vælg speciale</option>
                      {SPECIALTIES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  {/* STPS Autorisations-verificering */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Autorisations-ID *
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Dit autorisations-ID verificeres mod STPS Autorisationsregisteret. Ved lancering bruges automatisk verificering via NSP.
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={data.autorisationsId}
                        onChange={(e) => {
                          updateData({ autorisationsId: e.target.value })
                          if (verificationStatus !== 'idle') {
                            setVerificationStatus('idle')
                            setVerificationError('')
                          }
                        }}
                        placeholder="F.eks. 09HF1"
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 dark:text-gray-100"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyStps}
                        disabled={verificationStatus === 'loading' || !data.autorisationsId}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                      >
                        {verificationStatus === 'loading' ? 'Verificerer...' : 'Verificer'}
                      </button>
                    </div>

                    {/* Verification status display */}
                    {verificationStatus === 'verified' && (
                      <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950 p-2 rounded">
                        <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Autorisation verificeret</span>
                      </div>
                    )}

                    {verificationStatus === 'pending' && (
                      <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 p-2 rounded">
                        <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        <span>Autorisations-ID er indsendt til manuel verificering. Du kan fortsætte opsætningen.</span>
                      </div>
                    )}

                    {verificationStatus === 'error' && (
                      <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950 p-2 rounded">
                        <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <span>{verificationError}</span>
                      </div>
                    )}

                    <a
                      href="https://autregweb.sst.dk"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <span>Slå op i Autorisationsregisteret</span>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Region
                </label>
                <select
                  value={data.region}
                  onChange={(e) => updateData({ region: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 dark:text-gray-100"
                >
                  <option value="">Vælg region</option>
                  {REGIONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Trin 4: Tilgængelighed */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Foretrukne vagttyper</h4>
                <div className="grid grid-cols-2 gap-2">
                  {SHIFT_TYPES.map((shift) => (
                    <label
                      key={shift.value}
                      className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                        data.shiftTypes.includes(shift.value)
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={data.shiftTypes.includes(shift.value)}
                        onChange={() => toggleArrayValue('shiftTypes', shift.value)}
                        className="text-blue-600"
                      />
                      <span className="text-sm dark:text-gray-200">{shift.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Tilgængelige dage</h4>
                <div className="grid grid-cols-2 gap-2">
                  {WEEKDAYS.map((day) => (
                    <label
                      key={day.value}
                      className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                        data.availableDays.includes(day.value)
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={data.availableDays.includes(day.value)}
                        onChange={() => toggleArrayValue('availableDays', day.value)}
                        className="text-blue-600"
                      />
                      <span className="text-sm dark:text-gray-200">{day.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Trin 5: Færdig */}
          {step === 4 && (
            <div className="space-y-6">
              <p className="text-gray-600 dark:text-gray-300">
                Tak! Her er en oversigt over dine oplysninger:
              </p>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Rolle</span>
                  <span className="font-medium dark:text-gray-100">{roleLabels[data.role] || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Navn</span>
                  <span className="font-medium dark:text-gray-100">{data.fullName || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Telefon</span>
                  <span className="font-medium dark:text-gray-100">{data.phone || '-'}</span>
                </div>
                {data.role === 'doctor' && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Speciale</span>
                      <span className="font-medium dark:text-gray-100">{data.specialty || '-'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 dark:text-gray-400">Autorisations-ID</span>
                      <span className="flex items-center gap-2 font-medium dark:text-gray-100">
                        {data.autorisationsId || '-'}
                        {verificationStatus === 'verified' && (
                          <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded">Verificeret</span>
                        )}
                        {verificationStatus === 'pending' && (
                          <span className="text-xs bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded">Afventer</span>
                        )}
                      </span>
                    </div>
                  </>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Region</span>
                  <span className="font-medium dark:text-gray-100">{data.region || '-'}</span>
                </div>
                {data.shiftTypes.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Vagttyper</span>
                    <span className="font-medium dark:text-gray-100">
                      {data.shiftTypes
                        .map((s) => SHIFT_TYPES.find((st) => st.value === s)?.label)
                        .join(', ')}
                    </span>
                  </div>
                )}
                {data.availableDays.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Dage</span>
                    <span className="font-medium dark:text-gray-100">
                      {data.availableDays
                        .map((d) => WEEKDAYS.find((wd) => wd.value === d)?.label)
                        .join(', ')}
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={handleFinish}
                disabled={saving}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {saving ? 'Gemmer...' : 'Gå til dashboard'}
              </button>
            </div>
          )}
        </div>

        {/* Navigation */}
        {step < 4 && (
          <div className="flex justify-between mt-8 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={() => setStep(step - 1)}
              disabled={step === 0}
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Tilbage
            </button>
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canGoNext()}
              className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Næste
            </button>
          </div>
        )}
      </Card>
    </div>
  )
}
