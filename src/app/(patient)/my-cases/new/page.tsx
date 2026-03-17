'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { SPECIALTIES } from '@/lib/utils/constants'
import { Card, CardTitle } from '@/components/ui/card'
import type { CaseType, ServiceLevel } from '@/lib/types/case'

const CASE_TYPES: { value: CaseType; label: string; description: string }[] = [
  { value: 'diagnosis', label: 'Diagnoseforslag', description: 'Fa et bud pa mulig diagnose baseret pa dine symptomer' },
  { value: 'second_opinion', label: 'Second opinion', description: 'Fa en uafhaengig vurdering af en eksisterende diagnose' },
  { value: 'assessment', label: 'Udredningsforslag', description: 'Fa forslag til relevante undersoegelser og tests' },
  { value: 'treatment', label: 'Behandlingsforslag', description: 'Fa forslag til behandlingsmuligheder' },
  { value: 'communication', label: 'Kommunikationsrad', description: 'Hjaelp til at forsta og kommunikere med sundhedsvaesenet' },
]

const SERVICE_LEVELS: { value: ServiceLevel; label: string; price: string; description: string }[] = [
  { value: 'kort_raad', label: 'Kort rad', price: '200-500 kr', description: 'Enkelt naeste bedste skridt' },
  { value: 'konsultation', label: 'Konsultation', price: '500-1.500 kr', description: 'Asynkron dialog, ca. 30 min laegearbejde' },
  { value: 'fuld_udredning', label: 'Fuld udredningsplan', price: '1.500-5.000+ kr', description: 'Speciallaege gennemgar journal' },
]

const PRICE_RANGES: Record<ServiceLevel, { min: number; max: number }> = {
  kort_raad: { min: 200, max: 500 },
  konsultation: { min: 500, max: 1500 },
  fuld_udredning: { min: 1500, max: 5000 },
}

const TOTAL_STEPS = 5

export default function NewCasePage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Step 1
  const [caseType, setCaseType] = useState<CaseType | ''>('')
  // Step 2
  const [description, setDescription] = useState('')
  const [files, setFiles] = useState<File[]>([])
  // Step 3
  const [serviceLevel, setServiceLevel] = useState<ServiceLevel | ''>('')
  // Step 4
  const [specialty, setSpecialty] = useState('')
  // Step 5
  const [consentDisclaimer, setConsentDisclaimer] = useState(false)
  const [consentTreatment, setConsentTreatment] = useState(false)
  const [consentKnowledgeBase, setConsentKnowledgeBase] = useState(false)

  function canProceed(): boolean {
    switch (step) {
      case 1: return caseType !== ''
      case 2: return description.length >= 100
      case 3: return serviceLevel !== ''
      case 4: return specialty !== ''
      case 5: return consentDisclaimer && consentTreatment
      default: return false
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)])
    }
  }

  function removeFile(index: number) {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit() {
    if (!canProceed()) return
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Du skal vaere logget ind for at oprette en sag')
      setLoading(false)
      return
    }

    // Upload files if any
    const documentUrls: string[] = []
    for (const file of files) {
      const filePath = `cases/${user.id}/${Date.now()}_${file.name}`
      const { error: uploadError } = await supabase.storage
        .from('case-documents')
        .upload(filePath, file)
      if (!uploadError) {
        documentUrls.push(filePath)
      }
    }

    const price = serviceLevel ? PRICE_RANGES[serviceLevel as ServiceLevel].min : 0

    const { error: insertError } = await supabase.from('cases').insert({
      patient_id: user.id,
      case_type: caseType,
      service_level: serviceLevel,
      status: 'pending',
      specialty,
      description,
      documents: documentUrls,
      consent_disclaimer: consentDisclaimer,
      consent_treatment: consentTreatment,
      consent_knowledge_base: consentKnowledgeBase,
      price,
    })

    if (insertError) {
      setError('Kunne ikke oprette sagen. Proev igen.')
      setLoading(false)
      return
    }

    router.push('/my-cases')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">Opret ny sag</span>
          </div>
          <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-700">
            Annuller
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-6">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
              <div key={i} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  i + 1 < step ? 'bg-blue-600 text-white' :
                  i + 1 === step ? 'bg-blue-600 text-white' :
                  'bg-gray-200 text-gray-500'
                }`}>
                  {i + 1 < step ? '\u2713' : i + 1}
                </div>
                {i < TOTAL_STEPS - 1 && (
                  <div className={`w-12 sm:w-20 h-1 mx-1 ${i + 1 < step ? 'bg-blue-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 text-center">
            Trin {step} af {TOTAL_STEPS}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">{error}</div>
        )}

        {/* Step 1: Case type */}
        {step === 1 && (
          <div className="space-y-4">
            <CardTitle>Hvad har du brug for hjaelp til?</CardTitle>
            <p className="text-sm text-gray-500">Vaelg den type rad du soeger</p>
            <div className="space-y-3">
              {CASE_TYPES.map((ct) => (
                <label
                  key={ct.value}
                  className={`block cursor-pointer rounded-xl border p-4 transition-colors ${
                    caseType === ct.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="caseType"
                      value={ct.value}
                      checked={caseType === ct.value}
                      onChange={() => setCaseType(ct.value)}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{ct.label}</p>
                      <p className="text-sm text-gray-500">{ct.description}</p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Description and files */}
        {step === 2 && (
          <div className="space-y-4">
            <CardTitle>Beskriv din situation</CardTitle>
            <p className="text-sm text-gray-500">
              Jo mere detaljeret du beskriver, jo bedre kan laegen hjaelpe dig. Minimum 100 tegn.
            </p>
            <div>
              <textarea
                rows={8}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Beskriv dine symptomer, sygehistorik, nuvaerende medicin, og hvad du gerne vil have hjaelp til..."
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
              />
              <p className={`mt-1 text-xs ${description.length >= 100 ? 'text-green-600' : 'text-gray-400'}`}>
                {description.length} / 100 tegn minimum
              </p>
            </div>

            <Card>
              <CardTitle>Vedhaeft dokumenter</CardTitle>
              <p className="text-sm text-gray-500 mb-3">
                Upload relevante dokumenter, labsvar, billeder m.v. (valgfrit)
              </p>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors"
              >
                <p className="text-sm text-gray-500">Klik for at uploade filer</p>
                <p className="text-xs text-gray-400 mt-1">PDF, JPEG, PNG (maks. 10 MB pr. fil)</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
              {files.length > 0 && (
                <div className="mt-3 space-y-2">
                  {files.map((file, i) => (
                    <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-sm">
                      <span className="text-gray-700 truncate">{file.name}</span>
                      <button
                        onClick={() => removeFile(i)}
                        className="text-red-500 hover:text-red-700 text-xs ml-2"
                      >
                        Fjern
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Step 3: Service level */}
        {step === 3 && (
          <div className="space-y-4">
            <CardTitle>Vaelg serviceniveau</CardTitle>
            <p className="text-sm text-gray-500">Vaelg det niveau af raadgivning du oensker</p>
            <div className="space-y-3">
              {SERVICE_LEVELS.map((sl) => (
                <div
                  key={sl.value}
                  onClick={() => setServiceLevel(sl.value)}
                  className={`cursor-pointer rounded-xl border p-5 transition-colors ${
                    serviceLevel === sl.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900">{sl.label}</h3>
                    <span className="text-sm font-medium text-blue-600">{sl.price}</span>
                  </div>
                  <p className="text-sm text-gray-500">{sl.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Specialty */}
        {step === 4 && (
          <div className="space-y-4">
            <CardTitle>Vaelg foretrukket speciale</CardTitle>
            <p className="text-sm text-gray-500">
              Vaelg det laegefaglige speciale der bedst matcher din henvendelse
            </p>
            <select
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">Vaelg speciale</option>
              {SPECIALTIES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        )}

        {/* Step 5: Consent */}
        {step === 5 && (
          <div className="space-y-4">
            <CardTitle>Samtykke og bekraeftelse</CardTitle>
            <p className="text-sm text-gray-500">Laes og accepter foelgende for at fortsaette</p>
            <Card>
              <div className="space-y-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentDisclaimer}
                    onChange={(e) => setConsentDisclaimer(e.target.checked)}
                    className="h-4 w-4 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Jeg forstar at dette IKKE erstatter kontakt med min egen laege
                    </p>
                    <p className="text-xs text-gray-500">Paakraevet</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentTreatment}
                    onChange={(e) => setConsentTreatment(e.target.checked)}
                    className="h-4 w-4 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Jeg giver informeret samtykke til digital sundhedsfaglig behandling jf. Sundhedsloven
                    </p>
                    <p className="text-xs text-gray-500">Paakraevet</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentKnowledgeBase}
                    onChange={(e) => setConsentKnowledgeBase(e.target.checked)}
                    className="h-4 w-4 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Jeg oensker at min anonymiserede case deles i videnbasen
                    </p>
                    <p className="text-xs text-gray-500">Valgfrit</p>
                  </div>
                </label>
              </div>
            </Card>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={() => setStep(s => Math.max(1, s - 1))}
            disabled={step === 1}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Tilbage
          </button>
          {step < TOTAL_STEPS ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canProceed()}
              className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Naeste
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canProceed() || loading}
              className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Opretter...' : 'Opret sag'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
