'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { SPECIALTIES, REGIONS } from '@/lib/utils/constants'

export default function CreateAssignmentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [city, setCity] = useState('')
  const [region, setRegion] = useState('')
  const [shiftType, setShiftType] = useState('day')
  const [urgency, setUrgency] = useState('normal')
  const [isVolunteer, setIsVolunteer] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [hoursPerWeek, setHoursPerWeek] = useState('')
  const [ratePerHour, setRatePerHour] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error: insertError } = await supabase.from('assignments').insert({
      posted_by: user.id,
      title,
      description,
      specialty_required: specialty || null,
      city: city || null,
      region: region || null,
      shift_type: shiftType,
      urgency,
      is_volunteer: isVolunteer,
      status: 'open',
      start_date: startDate || null,
      end_date: endDate || null,
      hours_per_week: hoursPerWeek ? parseInt(hoursPerWeek) : null,
      rate_per_hour: isVolunteer ? null : (ratePerHour ? parseInt(ratePerHour) : null),
    })

    if (insertError) {
      setError('Kunne ikke oprette opslag')
      setLoading(false)
      return
    }

    router.push('/assignments')
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Nyt opslag</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titel *</label>
            <input required value={title} onChange={(e) => setTitle(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="F.eks. Vikar søges til lægeklinik" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Beskrivelse *</label>
            <textarea required rows={4} value={description} onChange={(e) => setDescription(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold">Detaljer</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Speciale</label>
              <select value={specialty} onChange={(e) => setSpecialty(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                <option value="">Vælg speciale</option>
                {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
              <select value={region} onChange={(e) => setRegion(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                <option value="">Vælg region</option>
                {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">By</label>
              <input value={city} onChange={(e) => setCity(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vagttype</label>
              <select value={shiftType} onChange={(e) => setShiftType(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                <option value="day">Dagvagt</option>
                <option value="evening">Aftenvagt</option>
                <option value="night">Nattevagt</option>
                <option value="on_call">Tilkaldevagt</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Startdato</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slutdato</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Timer/uge</label>
              <input type="number" value={hoursPerWeek} onChange={(e) => setHoursPerWeek(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Urgency</label>
              <select value={urgency} onChange={(e) => setUrgency(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                <option value="normal">Normal</option>
                <option value="urgent">Haster</option>
                <option value="acute">Akut</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" id="volunteer" checked={isVolunteer} onChange={(e) => setIsVolunteer(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500" />
            <label htmlFor="volunteer" className="text-sm font-medium text-gray-700">Frivilligt opslag (ulønnet)</label>
          </div>

          {!isVolunteer && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Timeløn (kr)</label>
              <input type="number" value={ratePerHour} onChange={(e) => setRatePerHour(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-end">
          <button type="button" onClick={() => router.back()}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium">
            Annuller
          </button>
          <button type="submit" disabled={loading || !title.trim() || !description.trim()}
            className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Opretter...' : 'Opret opslag'}
          </button>
        </div>
      </form>
    </div>
  )
}
