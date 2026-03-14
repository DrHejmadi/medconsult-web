'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { DoctorProfile } from '@/lib/types/database'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<DoctorProfile[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfiles()
  }, [])

  async function loadProfiles() {
    setLoading(true)
    const supabase = createClient()

    let query = supabase
      .from('doctor_profiles')
      .select('*')
      .eq('available', true)
      .order('created_at', { ascending: false })

    if (search.trim()) {
      query = query.or(`full_name.ilike.%${search}%,specialty.ilike.%${search}%,city.ilike.%${search}%`)
    }

    const { data } = await query.limit(50)
    setProfiles(data || [])
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Netværk</h1>

      <input
        type="text"
        placeholder="Søg på navn, speciale eller by..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && loadProfiles()}
        className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      />

      {loading ? (
        <div className="text-center py-12 text-gray-500">Indlæser...</div>
      ) : profiles.length === 0 ? (
        <EmptyState icon="👥" title="Ingen profiler fundet" message="Prøv at søge på noget andet" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profiles.map((p) => (
            <Link key={p.id} href={`/profiles/${p.user_id}`}
              className="bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-300 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                  {p.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <h3 className="font-semibold">{p.full_name}</h3>
                  <p className="text-sm text-gray-500">{p.specialty}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {p.city && <Badge variant="default">{p.city}</Badge>}
                <Badge variant="info">{p.experience_years} års erfaring</Badge>
                {p.volunteer_hours > 0 && <Badge variant="success">Frivillig</Badge>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
