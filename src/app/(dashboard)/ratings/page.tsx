'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardTitle } from '@/components/ui/card'

interface Rating {
  id: string
  rater_name: string
  score: number
  comment: string
  created_at: string
  assignment_title: string
  type: 'received' | 'given'
}

function StarDisplay({ score }: { score: number }) {
  return (
    <span className="text-yellow-500 text-lg tracking-wide">
      {Array.from({ length: 5 }, (_, i) => (i < score ? '\u2605' : '\u2606')).join('')}
    </span>
  )
}

function averageScore(ratings: Rating[]): string {
  if (ratings.length === 0) return '0.0'
  return (ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length).toFixed(1)
}

export default function RatingsPage() {
  const [activeTab, setActiveTab] = useState<'received' | 'given'>('received')
  const [showForm, setShowForm] = useState(false)
  const [newScore, setNewScore] = useState(5)
  const [newComment, setNewComment] = useState('')
  const [newAssignment, setNewAssignment] = useState('')
  const [allRatings, setAllRatings] = useState<Rating[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    async function fetchRatings() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data: result } = await supabase
        .from('ratings')
        .select('*')
        .or(`user_id.eq.${user.id},rater_id.eq.${user.id}`)
        .order('created_at', { ascending: false })

      setAllRatings(result || [])
      setLoading(false)
    }
    fetchRatings()
  }, [])

  const ratings = allRatings.filter((r) =>
    activeTab === 'received' ? r.type === 'received' : r.type === 'given'
  )
  const avg = averageScore(ratings)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('ratings').insert({
      rater_id: user.id,
      score: newScore,
      comment: newComment,
      assignment_title: newAssignment,
      type: 'given',
    })

    if (!error) {
      setShowForm(false)
      setNewScore(5)
      setNewComment('')
      setNewAssignment('')
      // Refresh ratings
      const { data: result } = await supabase
        .from('ratings')
        .select('*')
        .or(`user_id.eq.${user.id},rater_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
      setAllRatings(result || [])
    }
  }

  if (loading) return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Indl\u00e6ser...</div>

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Anmeldelser</h1>
          <p className="text-gray-500">Se og administrer dine anmeldelser</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          Skriv anmeldelse
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('received')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'received'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Modtagne anmeldelser
        </button>
        <button
          onClick={() => setActiveTab('given')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'given'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Givne anmeldelser
        </button>
      </div>

      {/* Average score badge */}
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
          <span className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{avg}</span>
          <StarDisplay score={Math.round(parseFloat(avg))} />
          <span className="text-sm text-yellow-700 dark:text-yellow-400">({ratings.length} anmeldelser)</span>
        </span>
      </div>

      {/* Ratings list */}
      {ratings.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p className="text-lg font-medium">Ingen anmeldelser endnu</p>
          <p className="text-sm mt-1">
            {activeTab === 'received'
              ? 'Du har ikke modtaget nogen anmeldelser endnu.'
              : 'Du har ikke givet nogen anmeldelser endnu.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {ratings.map((rating) => (
            <Card key={rating.id}>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{rating.rater_name}</span>
                    <StarDisplay score={rating.score} />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{rating.assignment_title}</p>
                  <p className="text-gray-700 dark:text-gray-300 mt-2">{rating.comment}</p>
                </div>
                <span className="text-sm text-gray-400 whitespace-nowrap ml-4">
                  {new Date(rating.created_at).toLocaleDateString('da-DK')}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* New rating modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-semibold mb-4 dark:text-gray-100">Skriv en anmeldelse</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Opgave</label>
                <input
                  type="text"
                  value={newAssignment}
                  onChange={(e) => setNewAssignment(e.target.value)}
                  placeholder="V\u00e6lg opgave..."
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Score: {newScore} / 5</label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={newScore}
                  onChange={(e) => setNewScore(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="mt-1">
                  <StarDisplay score={newScore} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kommentar</label>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={4}
                  placeholder="Skriv din anmeldelse..."
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Annuller
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Indsend anmeldelse
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
