'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { searchICD10, type ICD10Code } from '@/lib/data/icd10'
import Link from 'next/link'

interface CaseData {
  id: string
  case_type: string
  specialty: string
  service_level: string
  price: number
  description: string
  status: string
  created_at: string
  doctor_id: string | null
  documents?: string[]
}

interface Message {
  id: string
  case_id: string
  sender_role: 'doctor' | 'patient'
  content: string
  created_at: string
}

interface DoctorProfile {
  anonymized_id: string
  specialty: string
  years_experience: number
}

export default function CaseDetailPage() {
  const params = useParams()
  const caseId = params.id as string

  const [caseData, setCaseData] = useState<CaseData | null>(null)
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [sendingMessage, setSendingMessage] = useState(false)

  // Response form state
  const [diagnosis, setDiagnosis] = useState('')
  const [investigation, setInvestigation] = useState('')
  const [treatment, setTreatment] = useState('')
  const [nextSteps, setNextSteps] = useState('')
  const [followUpNeeded, setFollowUpNeeded] = useState(false)
  const [selectedICD10, setSelectedICD10] = useState<ICD10Code[]>([])
  const [icd10Query, setIcd10Query] = useState('')
  const [icd10Results, setIcd10Results] = useState<ICD10Code[]>([])
  const [newMessage, setNewMessage] = useState('')

  const loadCase = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: caseRes } = await supabase
      .from('cases')
      .select('*')
      .eq('id', caseId)
      .single()

    if (caseRes) setCaseData(caseRes)

    // Load doctor profile
    const { data: profileRes } = await supabase
      .from('profiles')
      .select('specialty, years_experience')
      .eq('user_id', user.id)
      .single()

    if (profileRes) {
      const hash = user.id.slice(0, 4).toUpperCase()
      setDoctorProfile({
        anonymized_id: `MC-${hash}`,
        specialty: profileRes.specialty || 'Almen medicin',
        years_experience: profileRes.years_experience || 0,
      })
    }

    // Load messages
    const { data: messagesRes } = await supabase
      .from('case_messages')
      .select('*')
      .eq('case_id', caseId)
      .order('created_at', { ascending: true })

    if (messagesRes) setMessages(messagesRes)

    // Load existing response
    const { data: responseRes } = await supabase
      .from('case_responses')
      .select('*')
      .eq('case_id', caseId)
      .eq('doctor_id', user.id)
      .single()

    if (responseRes) {
      setDiagnosis(responseRes.diagnosis || '')
      setInvestigation(responseRes.investigation || '')
      setTreatment(responseRes.treatment || '')
      setNextSteps(responseRes.next_steps || '')
      setFollowUpNeeded(responseRes.follow_up_needed || false)
      if (responseRes.icd10_codes) {
        setSelectedICD10(responseRes.icd10_codes)
      }
    }

    setLoading(false)
  }, [caseId])

  useEffect(() => {
    loadCase()
  }, [loadCase])

  function handleICD10Search(query: string) {
    setIcd10Query(query)
    if (query.length >= 1) {
      setIcd10Results(searchICD10(query).slice(0, 8))
    } else {
      setIcd10Results([])
    }
  }

  function addICD10(code: ICD10Code) {
    if (!selectedICD10.find((c) => c.code === code.code)) {
      setSelectedICD10([...selectedICD10, code])
    }
    setIcd10Query('')
    setIcd10Results([])
  }

  function removeICD10(code: string) {
    setSelectedICD10(selectedICD10.filter((c) => c.code !== code))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nextSteps.trim()) return

    setSubmitting(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('case_responses').upsert({
      case_id: caseId,
      doctor_id: user.id,
      diagnosis,
      investigation,
      treatment,
      next_steps: nextSteps,
      follow_up_needed: followUpNeeded,
      icd10_codes: selectedICD10,
      submitted_at: new Date().toISOString(),
    }, { onConflict: 'case_id,doctor_id' })

    await supabase
      .from('cases')
      .update({ status: 'answered' })
      .eq('id', caseId)

    setSubmitting(false)
    await loadCase()
  }

  async function sendMessage() {
    if (!newMessage.trim()) return
    setSendingMessage(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('case_messages').insert({
      case_id: caseId,
      sender_role: 'doctor',
      sender_id: user.id,
      content: newMessage,
    })

    setNewMessage('')
    setSendingMessage(false)
    await loadCase()
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-500">Indlæser...</div>
  }

  if (!caseData) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <p className="text-gray-500 mb-4">Case ikke fundet.</p>
        <Link href="/cases" className="text-blue-600 hover:underline">Tilbage til cases</Link>
      </div>
    )
  }

  const isAnswered = caseData.status === 'answered'

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/cases" className="text-sm text-blue-600 hover:underline">
        &larr; Tilbage til Case-markedsplads
      </Link>

      {/* Doctor anonymized profile */}
      {doctorProfile && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg px-4 py-3 text-sm text-blue-800 dark:text-blue-200">
          L&aelig;ge #{doctorProfile.anonymized_id} &middot; {doctorProfile.specialty} &middot; {doctorProfile.years_experience} &aring;rs erfaring
        </div>
      )}

      {/* Case details */}
      <Card>
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <Badge variant="info">{caseData.case_type?.replace('_', ' ') || 'Case'}</Badge>
          <Badge variant={caseData.service_level === 'premium' ? 'warning' : caseData.service_level === 'standard' ? 'info' : 'default'}>
            {caseData.service_level || 'Basis'}
          </Badge>
          <Badge variant={isAnswered ? 'success' : 'warning'}>
            {isAnswered ? 'Besvaret' : 'Under behandling'}
          </Badge>
          {caseData.price && (
            <span className="ml-auto text-sm font-semibold text-gray-700 dark:text-gray-300">{caseData.price} kr.</span>
          )}
        </div>

        <CardTitle>Patientbeskrivelse</CardTitle>
        <p className="text-gray-700 dark:text-gray-300 mt-2 whitespace-pre-wrap">{caseData.description}</p>

        {caseData.documents && caseData.documents.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Vedhæftede dokumenter</p>
            <div className="space-y-1">
              {caseData.documents.map((doc, i) => (
                <a key={i} href={doc} target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
                  Dokument {i + 1}
                </a>
              ))}
            </div>
          </div>
        )}

        <p className="text-xs text-gray-400 mt-4">
          Oprettet: {new Date(caseData.created_at).toLocaleDateString('da-DK', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </Card>

      {/* Response form */}
      <Card>
        <CardTitle>Din vurdering</CardTitle>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <Textarea
            label="Diagnoseforslag"
            placeholder="Beskriv din diagnosevurdering..."
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            disabled={isAnswered}
          />
          <Textarea
            label="Udredningsforslag"
            placeholder="Forslag til yderligere udredning..."
            value={investigation}
            onChange={(e) => setInvestigation(e.target.value)}
            disabled={isAnswered}
          />
          <Textarea
            label="Behandlingsforslag"
            placeholder="Forslag til behandling..."
            value={treatment}
            onChange={(e) => setTreatment(e.target.value)}
            disabled={isAnswered}
          />
          <Textarea
            label="Næste skridt *"
            placeholder="Hvilke konkrete skridt anbefaler du patienten? (Påkrævet)"
            value={nextSteps}
            onChange={(e) => setNextSteps(e.target.value)}
            required
            disabled={isAnswered}
          />

          {/* ICD-10 autocomplete */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ICD-10 koder</label>
            {selectedICD10.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedICD10.map((code) => (
                  <span
                    key={code.code}
                    className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-1 rounded-full text-xs"
                  >
                    {code.code} – {code.description}
                    {!isAnswered && (
                      <button type="button" onClick={() => removeICD10(code.code)} className="ml-1 hover:text-red-600">&times;</button>
                    )}
                  </span>
                ))}
              </div>
            )}
            {!isAnswered && (
              <div className="relative">
                <Input
                  placeholder="Søg ICD-10 kode eller beskrivelse..."
                  value={icd10Query}
                  onChange={(e) => handleICD10Search(e.target.value)}
                />
                {icd10Results.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {icd10Results.map((code) => (
                      <button
                        key={code.code}
                        type="button"
                        onClick={() => addICD10(code)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-0"
                      >
                        <span className="font-medium">{code.code}</span>
                        <span className="text-gray-500 ml-2">{code.description}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Follow-up checkbox */}
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={followUpNeeded}
              onChange={(e) => setFollowUpNeeded(e.target.checked)}
              disabled={isAnswered}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Opfølgning nødvendig
          </label>

          {!isAnswered && (
            <Button type="submit" loading={submitting} className="w-full">
              Indsend vurdering
            </Button>
          )}
        </form>
      </Card>

      {/* Message thread */}
      <Card>
        <CardTitle>Beskedtråd</CardTitle>
        <div className="space-y-3 mt-4">
          {messages.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">Ingen beskeder endnu.</p>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-3 rounded-lg text-sm ${
                  msg.sender_role === 'doctor'
                    ? 'bg-blue-50 dark:bg-blue-900/20 ml-8'
                    : 'bg-gray-50 dark:bg-gray-700/50 mr-8'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-500">
                    {msg.sender_role === 'doctor' ? 'Dig (Læge)' : 'Patient'}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(msg.created_at).toLocaleDateString('da-DK', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-gray-700 dark:text-gray-300">{msg.content}</p>
              </div>
            ))
          )}
        </div>

        <div className="flex gap-2 mt-4">
          <Input
            placeholder="Skriv en besked til patienten..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
            className="flex-1"
          />
          <Button onClick={sendMessage} loading={sendingMessage} size="sm">
            Send
          </Button>
        </div>
      </Card>

      {/* Disclaimer */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-sm text-yellow-800 dark:text-yellow-200">
        <strong>Juridisk ansvarsfraskrivelse:</strong> Din vurdering udgør sundhedsfaglig rådgivning jf. Autorisationsloven. Du er ansvarlig for din vurdering.
      </div>
    </div>
  )
}
