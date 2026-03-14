'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Assignment } from '@/lib/types/database'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils/date'

export default function AssignmentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase.from('assignments').select('*').eq('id', id).single()
      setAssignment(data)
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) return <div className="text-center py-12 text-gray-500">Indlæser...</div>
  if (!assignment) return <div className="text-center py-12 text-red-500">Opslag ikke fundet</div>

  const shiftLabels: Record<string, string> = { day: 'Dagvagt', evening: 'Aftenvagt', night: 'Nattevagt', on_call: 'Tilkaldevagt' }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700">← Tilbage</button>
        <h1 className="text-2xl font-bold">{assignment.title}</h1>
        {assignment.is_volunteer && <Badge variant="success">Frivillig</Badge>}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <p className="text-gray-700">{assignment.description}</p>

        <div className="grid grid-cols-2 gap-4 text-sm">
          {assignment.specialty_required && (
            <div><span className="text-gray-500">Speciale:</span> {assignment.specialty_required}</div>
          )}
          {assignment.city && (
            <div><span className="text-gray-500">By:</span> {assignment.city}</div>
          )}
          {assignment.region && (
            <div><span className="text-gray-500">Region:</span> {assignment.region}</div>
          )}
          <div><span className="text-gray-500">Vagttype:</span> {shiftLabels[assignment.shift_type] || assignment.shift_type}</div>
          {assignment.start_date && (
            <div><span className="text-gray-500">Start:</span> {formatDate(assignment.start_date)}</div>
          )}
          {assignment.end_date && (
            <div><span className="text-gray-500">Slut:</span> {formatDate(assignment.end_date)}</div>
          )}
          {assignment.hours_per_week && (
            <div><span className="text-gray-500">Timer/uge:</span> {assignment.hours_per_week}</div>
          )}
          {!assignment.is_volunteer && assignment.rate_per_hour && (
            <div><span className="text-gray-500">Timeløn:</span> {assignment.rate_per_hour} kr</div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold mb-3">Kontakt</h2>
        <p className="text-sm text-gray-600">
          Send en besked til opslagens forfatter via beskedsystemet for at vise din interesse.
        </p>
      </div>
    </div>
  )
}
