'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { DoctorProfile, CompanyProfile, NgoProfile } from '@/lib/types/database'
import { Badge } from '@/components/ui/badge'

type Profile = DoctorProfile | CompanyProfile | NgoProfile

export default function ProfileDetailPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string
  const [profile, setProfile] = useState<Profile | null>(null)
  const [profileType, setProfileType] = useState<'doctor' | 'company' | 'ngo' | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()

      // Try doctor first
      const { data: doctor } = await supabase.from('doctor_profiles').select('*').eq('user_id', userId).single()
      if (doctor) {
        setProfile(doctor)
        setProfileType('doctor')
        setLoading(false)
        return
      }

      const { data: company } = await supabase.from('company_profiles').select('*').eq('user_id', userId).single()
      if (company) {
        setProfile(company)
        setProfileType('company')
        setLoading(false)
        return
      }

      const { data: ngo } = await supabase.from('ngo_profiles').select('*').eq('user_id', userId).single()
      if (ngo) {
        setProfile(ngo)
        setProfileType('ngo')
        setLoading(false)
        return
      }

      setLoading(false)
    }
    load()
  }, [userId])

  if (loading) return <div className="text-center py-12 text-gray-500">Indlæser...</div>
  if (!profile) return <div className="text-center py-12 text-red-500">Profil ikke fundet</div>

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700">← Tilbage</button>

      {profileType === 'doctor' && (() => {
        const p = profile as DoctorProfile
        return (
          <>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl font-bold">
                  {p.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{p.full_name}</h1>
                  <p className="text-gray-500">{p.specialty}</p>
                </div>
              </div>
              {p.bio && <p className="text-gray-700 mb-4">{p.bio}</p>}
              <div className="flex gap-2 flex-wrap">
                {p.city && <Badge variant="default">{p.city}</Badge>}
                {p.region && <Badge variant="default">{p.region}</Badge>}
                <Badge variant="info">{p.experience_years} års erfaring</Badge>
                {p.available && <Badge variant="success">Tilgængelig</Badge>}
                {p.volunteer_hours > 0 && <Badge variant="success">{p.volunteer_hours} frivillige timer</Badge>}
              </div>
            </div>

            {p.skills.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-semibold mb-3">Kompetencer</h2>
                <div className="flex gap-2 flex-wrap">
                  {p.skills.map(s => <Badge key={s} variant="info">{s}</Badge>)}
                </div>
              </div>
            )}

            {p.languages.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-semibold mb-3">Sprog</h2>
                <div className="flex gap-2 flex-wrap">
                  {p.languages.map(l => <Badge key={l} variant="default">{l}</Badge>)}
                </div>
              </div>
            )}
          </>
        )
      })()}

      {profileType === 'company' && (() => {
        const p = profile as CompanyProfile
        return (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h1 className="text-2xl font-bold mb-2">{p.company_name}</h1>
            <p className="text-gray-500 mb-4">CVR: {p.cvr_number}</p>
            <p className="text-gray-500 mb-4">Kontaktperson: {p.contact_person}</p>
            {p.description && <p className="text-gray-700 mb-4">{p.description}</p>}
            <div className="flex gap-2">
              {p.city && <Badge variant="default">{p.city}</Badge>}
              {p.region && <Badge variant="default">{p.region}</Badge>}
            </div>
          </div>
        )
      })()}

      {profileType === 'ngo' && (() => {
        const p = profile as NgoProfile
        return (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h1 className="text-2xl font-bold mb-2">{p.organization_name}</h1>
            <p className="text-gray-500 mb-4">Kontakt: {p.contact_person}</p>
            {p.mission && <p className="text-gray-700 mb-4">{p.mission}</p>}
            <div className="flex gap-2">
              {p.city && <Badge variant="default">{p.city}</Badge>}
              {p.region && <Badge variant="default">{p.region}</Badge>}
            </div>
          </div>
        )
      })()}
    </div>
  )
}
