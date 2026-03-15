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
}

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
  })

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
      <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
        <span className="font-medium text-gray-900">Trin {step + 1}</span>
        <span>af {STEPS.length}</span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
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
            <div className="space-y-4 text-gray-600">
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
              <p className="text-gray-600 mb-4">Vælg den rolle, der bedst beskriver dig:</p>
              {(['doctor', 'company', 'ngo'] as const).map((role) => (
                <label
                  key={role}
                  className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                    data.role === role
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
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
                    <div className="font-medium">
                      {role === 'doctor' ? 'Læge' : role === 'company' ? 'Virksomhed' : 'NGO'}
                    </div>
                    <div className="text-sm text-gray-500">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fulde navn *
                </label>
                <input
                  type="text"
                  value={data.fullName}
                  onChange={(e) => updateData({ fullName: e.target.value })}
                  placeholder="Dit fulde navn"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefon
                </label>
                <input
                  type="tel"
                  value={data.phone}
                  onChange={(e) => updateData({ phone: e.target.value })}
                  placeholder="+45 12 34 56 78"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {data.role === 'doctor' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Speciale
                  </label>
                  <select
                    value={data.specialty}
                    onChange={(e) => updateData({ specialty: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Vælg speciale</option>
                    {SPECIALTIES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Region
                </label>
                <select
                  value={data.region}
                  onChange={(e) => updateData({ region: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                <h4 className="text-sm font-medium text-gray-700 mb-3">Foretrukne vagttyper</h4>
                <div className="grid grid-cols-2 gap-2">
                  {SHIFT_TYPES.map((shift) => (
                    <label
                      key={shift.value}
                      className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                        data.shiftTypes.includes(shift.value)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={data.shiftTypes.includes(shift.value)}
                        onChange={() => toggleArrayValue('shiftTypes', shift.value)}
                        className="text-blue-600"
                      />
                      <span className="text-sm">{shift.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Tilgængelige dage</h4>
                <div className="grid grid-cols-2 gap-2">
                  {WEEKDAYS.map((day) => (
                    <label
                      key={day.value}
                      className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                        data.availableDays.includes(day.value)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={data.availableDays.includes(day.value)}
                        onChange={() => toggleArrayValue('availableDays', day.value)}
                        className="text-blue-600"
                      />
                      <span className="text-sm">{day.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Trin 5: Færdig */}
          {step === 4 && (
            <div className="space-y-6">
              <p className="text-gray-600">
                Tak! Her er en oversigt over dine oplysninger:
              </p>

              <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Rolle</span>
                  <span className="font-medium">{roleLabels[data.role] || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Navn</span>
                  <span className="font-medium">{data.fullName || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Telefon</span>
                  <span className="font-medium">{data.phone || '-'}</span>
                </div>
                {data.role === 'doctor' && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Speciale</span>
                    <span className="font-medium">{data.specialty || '-'}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Region</span>
                  <span className="font-medium">{data.region || '-'}</span>
                </div>
                {data.shiftTypes.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Vagttyper</span>
                    <span className="font-medium">
                      {data.shiftTypes
                        .map((s) => SHIFT_TYPES.find((st) => st.value === s)?.label)
                        .join(', ')}
                    </span>
                  </div>
                )}
                {data.availableDays.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Dage</span>
                    <span className="font-medium">
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
          <div className="flex justify-between mt-8 pt-4 border-t border-gray-100">
            <button
              onClick={() => setStep(step - 1)}
              disabled={step === 0}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed"
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
