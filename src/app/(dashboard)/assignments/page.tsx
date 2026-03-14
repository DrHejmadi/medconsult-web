'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Assignment } from '@/lib/types/database'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { formatDate } from '@/lib/utils/date'

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'mine'>('all')

  useEffect(() => {
    loadAssignments()
  }, [filter])

  async function loadAssignments() {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    let query = supabase
      .from('assignments')
      .select('*')
      .eq('status', 'open')
      .order('created_at', { ascending: false })

    if (filter === 'mine') {
      query = query.eq('posted_by', user.id)
    }

    const { data } = await query.limit(50)
    setAssignments(data || [])
    setLoading(false)
  }

  const shiftLabels: Record<string, string> = { day: 'Dagvagt', evening: 'Aftenvagt', night: 'Nattevagt', on_call: 'Tilkaldevagt' }
  const urgencyVariant = (u: string) => u === 'acute' ? 'danger' : u === 'urgent' ? 'warning' : 'default'

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Opslag</h1>
        <Link href="/assignments/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          + Nyt opslag
        </Link>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium ${filter === 'all' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}>
          Alle opslag
        </button>
        <button onClick={() => setFilter('mine')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium ${filter === 'mine' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}>
          Mine opslag
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Indlæser...</div>
      ) : assignments.length === 0 ? (
        <EmptyState icon="📌" title="Ingen opslag" message="Der er ingen åbne opslag lige nu" />
      ) : (
        <div className="space-y-3">
          {assignments.map((a) => (
            <Link key={a.id} href={`/assignments/${a.id}`}
              className="block bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-300 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{a.title}</h3>
                <div className="flex gap-2">
                  {a.is_volunteer && <Badge variant="success">Frivillig</Badge>}
                  <Badge variant={urgencyVariant(a.urgency)}>{a.urgency === 'acute' ? 'Akut' : a.urgency === 'urgent' ? 'Haster' : 'Normal'}</Badge>
                </div>
              </div>
              <p className="text-sm text-gray-600 truncate mb-2">{a.description}</p>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                {a.specialty_required && <span>{a.specialty_required}</span>}
                {a.city && <span>{a.city}</span>}
                <span>{shiftLabels[a.shift_type] || a.shift_type}</span>
                {a.rate_per_hour && <span>{a.rate_per_hour} kr/time</span>}
                {a.start_date && <span>Fra {formatDate(a.start_date)}</span>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
