'use client'

import { useState } from 'react'
import { Card, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { formatDate } from '@/lib/utils/date'

interface ShiftSwap {
  id: string
  doctor_name: string
  date: string
  shift_type: string
  location: string
  reason: string
  status: 'available' | 'pending' | 'swapped' | 'expired'
  expires_at: string
  created_at: string
}

const statusConfig: Record<ShiftSwap['status'], { label: string; variant: 'success' | 'warning' | 'info' | 'default' }> = {
  available: { label: 'Tilgængelig', variant: 'success' },
  pending: { label: 'Afventer', variant: 'warning' },
  swapped: { label: 'Byttet', variant: 'info' },
  expired: { label: 'Udløbet', variant: 'default' },
}

const shiftLabels: Record<string, string> = {
  day: 'Dagvagt',
  evening: 'Aftenvagt',
  night: 'Nattevagt',
  on_call: 'Tilkaldevagt',
}

const mockSwaps: ShiftSwap[] = [
  {
    id: '1',
    doctor_name: 'Dr. Maria Jensen',
    date: '2026-03-18',
    shift_type: 'evening',
    location: 'Rigshospitalet, København',
    reason: 'Familiemæssige årsager',
    status: 'available',
    expires_at: '2026-03-17',
    created_at: '2026-03-14',
  },
  {
    id: '2',
    doctor_name: 'Dr. Anders Pedersen',
    date: '2026-03-20',
    shift_type: 'night',
    location: 'Aarhus Universitetshospital',
    reason: 'Konference',
    status: 'available',
    expires_at: '2026-03-19',
    created_at: '2026-03-13',
  },
  {
    id: '3',
    doctor_name: 'Dr. Sofie Nielsen',
    date: '2026-03-22',
    shift_type: 'day',
    location: 'Odense Universitetshospital',
    reason: 'Personlige årsager',
    status: 'pending',
    expires_at: '2026-03-21',
    created_at: '2026-03-12',
  },
  {
    id: '4',
    doctor_name: 'Dr. Christian Larsen',
    date: '2026-03-10',
    shift_type: 'evening',
    location: 'Aalborg Universitetshospital',
    reason: 'Sygdom i familien',
    status: 'swapped',
    expires_at: '2026-03-09',
    created_at: '2026-03-08',
  },
  {
    id: '5',
    doctor_name: 'Dr. Louise Hansen',
    date: '2026-03-08',
    shift_type: 'night',
    location: 'Herlev Hospital',
    reason: 'Eksamen',
    status: 'expired',
    expires_at: '2026-03-07',
    created_at: '2026-03-05',
  },
]

const mockMyRequests: ShiftSwap[] = [
  {
    id: '6',
    doctor_name: 'Dig',
    date: '2026-03-25',
    shift_type: 'day',
    location: 'Bispebjerg Hospital',
    reason: 'Ferie',
    status: 'available',
    expires_at: '2026-03-24',
    created_at: '2026-03-14',
  },
  {
    id: '7',
    doctor_name: 'Dig',
    date: '2026-03-16',
    shift_type: 'night',
    location: 'Gentofte Hospital',
    reason: 'Kursus',
    status: 'pending',
    expires_at: '2026-03-15',
    created_at: '2026-03-10',
  },
]

const myAssignmentOptions = [
  { value: '1', label: 'Dagvagt - Bispebjerg Hospital - 28. marts' },
  { value: '2', label: 'Nattevagt - Gentofte Hospital - 30. marts' },
  { value: '3', label: 'Aftenvagt - Herlev Hospital - 2. april' },
]

export default function VagtbyttePage() {
  const [activeTab, setActiveTab] = useState<'available' | 'mine'>('available')
  const [showForm, setShowForm] = useState(false)
  const [swaps, setSwaps] = useState<ShiftSwap[]>(mockSwaps)
  const [myRequests, setMyRequests] = useState<ShiftSwap[]>(mockMyRequests)

  const [form, setForm] = useState({
    assignment_id: '',
    reason: '',
    expires_at: '',
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const selectedAssignment = myAssignmentOptions.find((a) => a.value === form.assignment_id)
    if (!selectedAssignment) return

    const newSwap: ShiftSwap = {
      id: String(Date.now()),
      doctor_name: 'Dig',
      date: '2026-03-28',
      shift_type: 'day',
      location: selectedAssignment.label.split(' - ')[1] || '',
      reason: form.reason,
      status: 'available',
      expires_at: form.expires_at,
      created_at: new Date().toISOString(),
    }

    setMyRequests([newSwap, ...myRequests])
    setShowForm(false)
    setForm({ assignment_id: '', reason: '', expires_at: '' })
  }

  const displayedSwaps = activeTab === 'available' ? swaps : myRequests

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Vagtbytte</h1>
          <p className="text-gray-500 text-sm mt-1">
            Find en kollega til at overtage din vagt, eller overtag en ledig vagt fra en anden l&aelig;ge.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          + Tilbyd vagt til bytte
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('available')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
            activeTab === 'available'
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Tilg&aelig;ngelige vagter
        </button>
        <button
          onClick={() => setActiveTab('mine')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
            activeTab === 'mine'
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Mine anmodninger
        </button>
      </div>

      {/* Swaps list */}
      {displayedSwaps.length === 0 ? (
        <EmptyState
          icon="🔄"
          title={activeTab === 'available' ? 'Ingen tilgængelige vagter' : 'Ingen anmodninger'}
          message={
            activeTab === 'available'
              ? 'Der er ingen vagter tilgængelige til bytte lige nu'
              : 'Du har ikke oprettet nogen vagtbytte-anmodninger endnu'
          }
        />
      ) : (
        <div className="space-y-3">
          {displayedSwaps.map((swap) => {
            const config = statusConfig[swap.status]
            return (
              <Card key={swap.id} className="hover:border-blue-300 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <CardTitle>{swap.doctor_name}</CardTitle>
                  <Badge variant={config.variant}>{config.label}</Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  <span>{formatDate(swap.date)}</span>
                  <span>{shiftLabels[swap.shift_type] || swap.shift_type}</span>
                  <span>{swap.location}</span>
                </div>
                {swap.reason && (
                  <p className="text-xs text-gray-400 mb-3">&Aring;rsag: {swap.reason}</p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    Udl&oslash;ber: {formatDate(swap.expires_at)}
                  </span>
                  {activeTab === 'available' && swap.status === 'available' && (
                    <button className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700">
                      Overtag vagt
                    </button>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold">Tilbyd vagt til bytte</h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  &times;
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Select
                  label="V&aelig;lg vagt"
                  required
                  options={myAssignmentOptions}
                  placeholder="V&aelig;lg en af dine kommende vagter"
                  value={form.assignment_id}
                  onChange={(e) => setForm({ ...form, assignment_id: e.target.value })}
                />
                <Textarea
                  label="&Aring;rsag til bytte"
                  placeholder="Beskriv hvorfor du gerne vil bytte denne vagt..."
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                />
                <Input
                  label="Udl&oslash;bsdato"
                  type="date"
                  required
                  value={form.expires_at}
                  onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                />
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Annuller
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
                  >
                    Opret vagtbytte
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
