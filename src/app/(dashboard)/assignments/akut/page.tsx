'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Assignment } from '@/lib/types/database'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { formatDate } from '@/lib/utils/date'

const regionOptions = [
  { value: '', label: 'Alle regioner' },
  { value: 'Hovedstaden', label: 'Hovedstaden' },
  { value: 'Sjælland', label: 'Sjælland' },
  { value: 'Syddanmark', label: 'Syddanmark' },
  { value: 'Midtjylland', label: 'Midtjylland' },
  { value: 'Nordjylland', label: 'Nordjylland' },
]

const specialtyOptions = [
  { value: '', label: 'Alle specialer' },
  { value: 'Almen medicin', label: 'Almen medicin' },
  { value: 'Akutmedicin', label: 'Akutmedicin' },
  { value: 'Anæstesiologi', label: 'Anæstesiologi' },
  { value: 'Kirurgi', label: 'Kirurgi' },
  { value: 'Intern medicin', label: 'Intern medicin' },
  { value: 'Psykiatri', label: 'Psykiatri' },
  { value: 'Pædiatri', label: 'Pædiatri' },
  { value: 'Geriatri', label: 'Geriatri' },
]

const shiftOptions = [
  { value: '', label: 'Alle vagttyper' },
  { value: 'day', label: 'Dagvagt' },
  { value: 'evening', label: 'Aftenvagt' },
  { value: 'night', label: 'Nattevagt' },
]

const shiftLabels: Record<string, string> = {
  day: 'Dagvagt',
  evening: 'Aftenvagt',
  night: 'Nattevagt',
  on_call: 'Tilkaldevagt',
}

export default function AkutVikarPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [regionFilter, setRegionFilter] = useState('')
  const [specialtyFilter, setSpecialtyFilter] = useState('')
  const [shiftFilter, setShiftFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    title: '',
    description: '',
    region: '',
    specialty_required: '',
    shift_type: 'day',
    rate_per_hour: '',
    contact_phone: '',
  })

  useEffect(() => {
    loadAssignments()
  }, [regionFilter, specialtyFilter, shiftFilter])

  async function loadAssignments() {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    let query = supabase
      .from('assignments')
      .select('*')
      .eq('urgency', 'acute')
      .eq('status', 'open')
      .order('created_at', { ascending: false })

    if (regionFilter) {
      query = query.eq('region', regionFilter)
    }
    if (specialtyFilter) {
      query = query.eq('specialty_required', specialtyFilter)
    }
    if (shiftFilter) {
      query = query.eq('shift_type', shiftFilter)
    }

    const { data } = await query.limit(50)
    setAssignments(data || [])
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('assignments').insert({
      posted_by: user.id,
      title: form.title,
      description: form.description,
      region: form.region,
      specialty_required: form.specialty_required,
      shift_type: form.shift_type,
      rate_per_hour: form.rate_per_hour ? Number(form.rate_per_hour) : null,
      urgency: 'acute',
      status: 'open',
      is_volunteer: false,
    })

    setSubmitting(false)

    if (!error) {
      setShowModal(false)
      setForm({
        title: '',
        description: '',
        region: '',
        specialty_required: '',
        shift_type: 'day',
        rate_per_hour: '',
        contact_phone: '',
      })
      loadAssignments()
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
          </span>
          <h1 className="text-2xl font-bold">Akut vikarbehov</h1>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700"
        >
          + Opret akut opslag
        </button>
      </div>

      <p className="text-gray-500 text-sm">
        Akutte vikarbehov til samme dag eller n&aelig;ste dag. Disse opslag kr&aelig;ver hurtig respons.
      </p>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-3">
        <div className="w-48">
          <Select
            options={regionOptions.slice(1)}
            placeholder="Alle regioner"
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
          />
        </div>
        <div className="w-48">
          <Select
            options={specialtyOptions.slice(1)}
            placeholder="Alle specialer"
            value={specialtyFilter}
            onChange={(e) => setSpecialtyFilter(e.target.value)}
          />
        </div>
        <div className="w-48">
          <Select
            options={shiftOptions.slice(1)}
            placeholder="Alle vagttyper"
            value={shiftFilter}
            onChange={(e) => setShiftFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Assignments list */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Indl&aelig;ser akutte opslag...</div>
      ) : assignments.length === 0 ? (
        <EmptyState
          icon="🚨"
          title="Ingen akutte opslag"
          message="Der er ingen akutte vikarbehov lige nu"
        />
      ) : (
        <div className="space-y-3">
          {assignments.map((a) => (
            <Card key={a.id} className="hover:border-red-300 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <CardTitle>{a.title}</CardTitle>
                <Badge variant="danger">Akut</Badge>
              </div>
              <p className="text-sm text-gray-600 truncate mb-3">{a.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  {a.city && <span>{a.city}</span>}
                  {a.region && <span>{a.region}</span>}
                  <span>{shiftLabels[a.shift_type] || a.shift_type}</span>
                  {a.rate_per_hour && <span>{a.rate_per_hour} kr/time</span>}
                  {a.start_date && <span>{formatDate(a.start_date)}</span>}
                  {a.specialty_required && <span>{a.specialty_required}</span>}
                </div>
                <button className="bg-red-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-red-700">
                  Meld dig nu
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold">Opret akut opslag</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  &times;
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Titel"
                  required
                  placeholder="F.eks. Akut vikar til aftenvagt"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
                <Textarea
                  label="Beskrivelse"
                  required
                  placeholder="Beskriv opgaven og kravene..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
                <Select
                  label="Region"
                  options={regionOptions.slice(1)}
                  placeholder="V&aelig;lg region"
                  value={form.region}
                  onChange={(e) => setForm({ ...form, region: e.target.value })}
                />
                <Select
                  label="Specialkrav"
                  options={specialtyOptions.slice(1)}
                  placeholder="V&aelig;lg speciale"
                  value={form.specialty_required}
                  onChange={(e) => setForm({ ...form, specialty_required: e.target.value })}
                />
                <Select
                  label="Vagttype"
                  options={shiftOptions.slice(1)}
                  placeholder="V&aelig;lg vagttype"
                  value={form.shift_type}
                  onChange={(e) => setForm({ ...form, shift_type: e.target.value })}
                />
                <Input
                  label="Timesats (kr/time)"
                  type="number"
                  placeholder="F.eks. 650"
                  value={form.rate_per_hour}
                  onChange={(e) => setForm({ ...form, rate_per_hour: e.target.value })}
                />
                <Input
                  label="Kontakttelefon"
                  type="tel"
                  placeholder="F.eks. 12345678"
                  value={form.contact_phone}
                  onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
                />
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Annuller
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                  >
                    {submitting ? 'Opretter...' : 'Opret akut opslag'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
