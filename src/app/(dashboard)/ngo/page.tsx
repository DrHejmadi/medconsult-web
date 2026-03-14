'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Assignment } from '@/lib/types/database'
import { StatCard } from '@/components/ui/stat-card'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { formatDate } from '@/lib/utils/date'

export default function NgoPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [ngoCount, setNgoCount] = useState(0)
  const [volunteerDoctorCount, setVolunteerDoctorCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()

      const [assignmentRes, ngoRes, doctorRes] = await Promise.all([
        supabase.from('assignments').select('*')
          .eq('is_volunteer', true).eq('status', 'open')
          .order('created_at', { ascending: false }).limit(6),
        supabase.from('users').select('id', { head: true, count: 'exact' }).eq('role', 'ngo'),
        supabase.from('doctor_profiles').select('id', { head: true, count: 'exact' }).gt('volunteer_hours', 0),
      ])

      setAssignments(assignmentRes.data || [])
      setNgoCount(ngoRes.count ?? 0)
      setVolunteerDoctorCount(doctorRes.count ?? 0)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="text-center py-12 text-gray-500">Indlæser...</div>

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-green-50 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">💚</span>
          <h1 className="text-2xl font-bold">Gør en forskel</h1>
        </div>
        <p className="text-gray-600">
          Forbind dig med NGO&apos;er og humanitære organisationer der har brug for medicinsk ekspertise.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard title="Frivillige opslag" value={assignments.length} icon="📋" color="green" />
        <StatCard title="Aktive NGO'er" value={ngoCount} icon="🏢" color="green" />
        <StatCard title="Frivillige læger" value={volunteerDoctorCount} icon="🩺" color="green" />
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Aktuelle frivillige muligheder</h2>
        {assignments.length === 0 ? (
          <EmptyState icon="💚" title="Ingen frivillige opslag" message="Vær den første til at oprette et frivilligt opslag" />
        ) : (
          <div className="space-y-3">
            {assignments.map((a) => (
              <Link key={a.id} href={`/assignments/${a.id}`}
                className="block bg-white rounded-xl border border-gray-200 p-4 hover:border-green-300 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{a.title}</h3>
                  <Badge variant="success">Frivillig</Badge>
                </div>
                <p className="text-sm text-gray-600 truncate mb-2">{a.description}</p>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  {a.specialty_required && <span>{a.specialty_required}</span>}
                  {a.city && <span>{a.city}</span>}
                  {a.start_date && <span>Fra {formatDate(a.start_date)}</span>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
