'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
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
  user_id: string
}

const statusConfig: Record<ShiftSwap['status'], { label: string; variant: 'success' | 'warning' | 'info' | 'default' }> = {
  available: { label: 'Tilg\u00e6ngelig', variant: 'success' },
  pending: { label: 'Afventer', variant: 'warning' },
  swapped: { label: 'Byttet', variant: 'info' },
  expired: { label: 'Udl\u00f8bet', variant: 'default' },
}

const shiftLabels: Record<string, string> = {
  day: 'Dagvagt',
  evening: 'Aftenvagt',
  night: 'Nattevagt',
  on_call: 'Tilkaldevagt',
}

const myAssignmentOptions = [
  { value: '1', label: 'Dagvagt - Bispebjerg Hospital - 28. marts' },
  { value: '2', label: 'Nattevagt - Gentofte Hospital - 30. marts' },
  { value: '3', label: 'Aftenvagt - Herlev Hospital - 2. april' },
]

export default function VagtbyttePage() {
  const [activeTab, setActiveTab] = useState<'available' | 'mine'>('available')
  const [showForm, setShowForm] = useState(false)
  const [swaps, setSwaps] = useState<ShiftSwap[]>([])
  const [myRequests, setMyRequests] = useState<ShiftSwap[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  const [form, setForm] = useState({
    assignment_id: '',
    reason: '',
    expires_at: '',
  })

  const supabase = createClient()

  useEffect(() => {
    async function fetchSwaps() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      setUserId(user.id)

      // Fetch all available swaps (not the current user's)
      const { data: availableResult } = await supabase
        .from('shift_swaps')
        .select('*')
        .neq('user_id', user.id)
        .order('created_at', { ascending: false })

      // Fetch user's own swap requests
      const { data: myResult } = await supabase
        .from('shift_swaps')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setSwaps(availableResult || [])
      setMyRequests(myResult || [])
      setLoading(false)
    }
    fetchSwaps()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!userId) return

    const selectedAssignment = myAssignmentOptions.find((a) => a.value === form.assignment_id)
    if (!selectedAssignment) return

    const { error } = await supabase.from('shift_swaps').insert({
      user_id: userId,
      doctor_name: 'Dig',
      date: '2026-03-28',
      shift_type: 'day',
      location: selectedAssignment.label.split(' - ')[1] || '',
      reason: form.reason,
      status: 'available',
      expires_at: form.expires_at,
    })

    if (!error) {
      // Refresh my requests
      const { data: myResult } = await supabase
        .from('shift_swaps')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      setMyRequests(myResult || [])
      setShowForm(false)
      setForm({ assignment_id: '', reason: '', expires_at: '' })
    }
  }

  const displayedSwaps = activeTab === 'available' ? swaps : myRequests

  if (loading) return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Indl\u00e6ser...</div>

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
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
              : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
          }`}
        >
          Tilg&aelig;ngelige vagter
        </button>
        <button
          onClick={() => setActiveTab('mine')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
            activeTab === 'mine'
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
              : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
          }`}
        >
          Mine anmodninger
        </button>
      </div>

      {/* Swaps list */}
      {displayedSwaps.length === 0 ? (
        <EmptyState
          icon="\uD83D\uDD04"
          title={activeTab === 'available' ? 'Ingen tilg\u00e6ngelige vagter' : 'Ingen anmodninger'}
          message={
            activeTab === 'available'
              ? 'Der er ingen vagter tilg\u00e6ngelige til bytte lige nu'
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
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
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
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold dark:text-gray-100">Tilbyd vagt til bytte</h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl"
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
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
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
