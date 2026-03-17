'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { MedicalCase, CaseMessage } from '@/lib/types/case'
import { Card, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatDateTime } from '@/lib/utils/date'

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'warning' | 'info' | 'success' }> = {
  pending: { label: 'Afventer svar', variant: 'warning' },
  in_progress: { label: 'Under behandling', variant: 'info' },
  answered: { label: 'Besvaret', variant: 'success' },
  closed: { label: 'Lukket', variant: 'default' },
}

const CASE_TYPE_LABELS: Record<string, string> = {
  diagnosis: 'Diagnoseforslag',
  second_opinion: 'Second opinion',
  assessment: 'Udredningsforslag',
  treatment: 'Behandlingsforslag',
  communication: 'Kommunikationsrad',
}

const SERVICE_LEVEL_LABELS: Record<string, string> = {
  kort_raad: 'Kort rad',
  konsultation: 'Konsultation',
  fuld_udredning: 'Fuld udredningsplan',
}

export default function CaseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const caseId = params.id as string

  const [medicalCase, setMedicalCase] = useState<MedicalCase | null>(null)
  const [messages, setMessages] = useState<CaseMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [newMessage, setNewMessage] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const [rating, setRating] = useState(0)
  const [ratingComment, setRatingComment] = useState('')
  const [ratingSubmitted, setRatingSubmitted] = useState(false)
  const [submittingRating, setSubmittingRating] = useState(false)
  const [doctorInfo, setDoctorInfo] = useState<{ specialty: string; years_since_auth: number } | null>(null)

  useEffect(() => {
    loadCase()
  }, [caseId])

  async function loadCase() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    const { data: caseData } = await supabase
      .from('cases')
      .select('*')
      .eq('id', caseId)
      .eq('patient_id', user.id)
      .single()

    if (!caseData) {
      setLoading(false)
      return
    }

    setMedicalCase(caseData as MedicalCase)

    // Load messages if konsultation level
    if (caseData.service_level === 'konsultation' || caseData.service_level === 'fuld_udredning') {
      const { data: msgData } = await supabase
        .from('case_messages')
        .select('*')
        .eq('case_id', caseId)
        .order('created_at', { ascending: true })

      setMessages(msgData || [])
    }

    // Load doctor info if assigned
    if (caseData.doctor_id) {
      const { data: doctorData } = await supabase
        .from('doctor_profiles')
        .select('specialty, created_at')
        .eq('user_id', caseData.doctor_id)
        .single()

      if (doctorData) {
        const yearsActive = Math.floor(
          (Date.now() - new Date(doctorData.created_at).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
        )
        setDoctorInfo({
          specialty: doctorData.specialty,
          years_since_auth: Math.max(1, yearsActive),
        })
      }

      // Check if already rated
      const { data: existingRating } = await supabase
        .from('case_ratings')
        .select('id')
        .eq('case_id', caseId)
        .eq('patient_id', user.id)
        .single()

      if (existingRating) {
        setRatingSubmitted(true)
      }
    }

    setLoading(false)
  }

  async function sendMessage() {
    if (!newMessage.trim()) return
    setSendingMessage(true)

    const supabase = createClient()
    const { error } = await supabase.from('case_messages').insert({
      case_id: caseId,
      sender_type: 'patient',
      content: newMessage.trim(),
    })

    if (!error) {
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        case_id: caseId,
        sender_type: 'patient',
        content: newMessage.trim(),
        created_at: new Date().toISOString(),
      }])
      setNewMessage('')
    }
    setSendingMessage(false)
  }

  async function submitRating() {
    if (rating === 0) return
    setSubmittingRating(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('case_ratings').insert({
      case_id: caseId,
      patient_id: user.id,
      doctor_id: medicalCase?.doctor_id,
      score: rating,
      comment: ratingComment || null,
    })

    if (!error) {
      setRatingSubmitted(true)
    }
    setSubmittingRating(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Indlaeser...</div>
      </div>
    )
  }

  if (!medicalCase) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-xl font-bold mb-2">Sag ikke fundet</h1>
          <p className="text-gray-500 mb-4">Sagen findes ikke eller du har ikke adgang.</p>
          <button onClick={() => router.push('/my-cases')} className="text-blue-600 hover:underline text-sm">
            Tilbage til mine sager
          </button>
        </div>
      </div>
    )
  }

  const statusConfig = STATUS_CONFIG[medicalCase.status] || STATUS_CONFIG.pending
  const assessment = medicalCase.assessment

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/my-cases')} className="text-gray-400 hover:text-gray-600">
              &larr;
            </button>
            <span className="text-xl font-bold">
              {CASE_TYPE_LABELS[medicalCase.case_type] || medicalCase.case_type}
            </span>
            <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-6 space-y-6">
        {/* Case info */}
        <Card>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-400 uppercase font-medium">Sagtype</p>
              <p className="text-sm text-gray-900">{CASE_TYPE_LABELS[medicalCase.case_type]}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase font-medium">Speciale</p>
              <p className="text-sm text-gray-900">{medicalCase.specialty}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase font-medium">Serviceniveau</p>
              <p className="text-sm text-gray-900">{SERVICE_LEVEL_LABELS[medicalCase.service_level]}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase font-medium">Pris</p>
              <p className="text-sm text-gray-900">{medicalCase.price} kr</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase font-medium">Oprettet</p>
              <p className="text-sm text-gray-900">{formatDate(medicalCase.created_at)}</p>
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-400 uppercase font-medium mb-1">Beskrivelse</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{medicalCase.description}</p>
          </div>
        </Card>

        {/* Documents */}
        {medicalCase.documents && medicalCase.documents.length > 0 && (
          <Card>
            <CardTitle>Vedhaeftede dokumenter</CardTitle>
            <div className="mt-3 space-y-2">
              {medicalCase.documents.map((doc, i) => (
                <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 text-sm">
                  <span className="text-gray-700 truncate">{doc.split('/').pop()}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Doctor info */}
        {medicalCase.doctor_id && doctorInfo && (
          <Card>
            <CardTitle>Behandlende laege</CardTitle>
            <div className="mt-3 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400 uppercase font-medium">Anonymiseret ID</p>
                <p className="text-sm text-gray-900">Laege #{medicalCase.doctor_id.slice(0, 8).toUpperCase()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-medium">Speciale</p>
                <p className="text-sm text-gray-900">{doctorInfo.specialty}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-medium">Anciennitet</p>
                <p className="text-sm text-gray-900">{doctorInfo.years_since_auth} ar siden autorisation</p>
              </div>
            </div>
          </Card>
        )}

        {/* Assessment */}
        {assessment && (
          <Card>
            <CardTitle>Laegens vurdering</CardTitle>
            <div className="mt-4 space-y-4">
              {assessment.diagnosis_suggestion && (
                <div>
                  <h4 className="text-xs font-medium text-gray-400 uppercase">Diagnoseforslag</h4>
                  <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{assessment.diagnosis_suggestion}</p>
                </div>
              )}
              {assessment.investigation_plan && (
                <div>
                  <h4 className="text-xs font-medium text-gray-400 uppercase">Udredningsforslag</h4>
                  <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{assessment.investigation_plan}</p>
                </div>
              )}
              {assessment.treatment_suggestion && (
                <div>
                  <h4 className="text-xs font-medium text-gray-400 uppercase">Behandlingsforslag</h4>
                  <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{assessment.treatment_suggestion}</p>
                </div>
              )}
              <div>
                <h4 className="text-xs font-medium text-gray-400 uppercase">Naeste skridt</h4>
                <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{assessment.next_steps}</p>
              </div>
              {assessment.icd10_codes && assessment.icd10_codes.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-gray-400 uppercase mb-1">ICD-10 koder</h4>
                  <div className="flex gap-2 flex-wrap">
                    {assessment.icd10_codes.map((code) => (
                      <Badge key={code} variant="info">{code}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {assessment.follow_up_needed && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3">
                  <p className="text-sm text-yellow-800 font-medium">Opfoelgning anbefales</p>
                  <p className="text-xs text-yellow-600 mt-1">
                    Laegen anbefaler at du foelger op med din egen laege eller en speciallaege.
                  </p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Message thread */}
        {(medicalCase.service_level === 'konsultation' || medicalCase.service_level === 'fuld_udredning') &&
          medicalCase.status !== 'closed' && (
          <Card>
            <CardTitle>Beskedtrad</CardTitle>
            {medicalCase.service_level === 'konsultation' && (
              <p className="text-xs text-gray-400 mb-3">Asynkron dialog med den behandlende laege</p>
            )}
            <div className="mt-3 space-y-3 max-h-96 overflow-y-auto">
              {messages.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">Ingen beskeder endnu</p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`rounded-lg px-4 py-3 ${
                      msg.sender_type === 'patient'
                        ? 'bg-blue-50 ml-8'
                        : 'bg-gray-50 mr-8'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-500">
                        {msg.sender_type === 'patient' ? 'Dig' : 'Laege'}
                      </span>
                      <span className="text-xs text-gray-400">{formatDateTime(msg.created_at)}</span>
                    </div>
                    <p className="text-sm text-gray-700">{msg.content}</p>
                  </div>
                ))
              )}
            </div>
            <div className="mt-4 flex gap-2">
              <textarea
                rows={2}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Skriv en besked..."
                className="flex-1 block rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim() || sendingMessage}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed self-end"
              >
                {sendingMessage ? 'Sender...' : 'Send'}
              </button>
            </div>
          </Card>
        )}

        {/* Rating */}
        {medicalCase.status === 'answered' && medicalCase.doctor_id && !ratingSubmitted && (
          <Card>
            <CardTitle>Bedoem raadgivningen</CardTitle>
            <p className="text-sm text-gray-500 mb-3">Din feedback hjaelper med at sikre kvaliteten</p>
            <div className="flex gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-2xl transition-colors ${
                    star <= rating ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                >
                  &#9733;
                </button>
              ))}
            </div>
            <textarea
              rows={2}
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
              placeholder="Tilfoej en kommentar (valgfrit)..."
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm mb-3"
            />
            <button
              onClick={submitRating}
              disabled={rating === 0 || submittingRating}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submittingRating ? 'Indsender...' : 'Indsend bedoemmelse'}
            </button>
          </Card>
        )}

        {ratingSubmitted && (
          <Card>
            <p className="text-sm text-green-600 font-medium">Tak for din bedoemmelse!</p>
          </Card>
        )}
      </div>
    </div>
  )
}
