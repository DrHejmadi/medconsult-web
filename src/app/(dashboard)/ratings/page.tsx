'use client'

import { useState } from 'react'
import { Card, CardTitle } from '@/components/ui/card'

interface Rating {
  id: string
  raterName: string
  score: number
  comment: string
  date: string
  assignmentTitle: string
}

const mockReceivedRatings: Rating[] = [
  { id: '1', raterName: 'Region Hovedstaden', score: 5, comment: 'Fantastisk arbejde og meget professionel tilgang.', date: '2026-03-10', assignmentTitle: 'Vikariat – Akutmodtagelse' },
  { id: '2', raterName: 'Privathospitalet Hamlet', score: 4, comment: 'God kommunikation og faglig dygtighed.', date: '2026-03-05', assignmentTitle: 'Konsultation – Ortopædi' },
  { id: '3', raterName: 'Lægehuset Østerbro', score: 5, comment: 'Virkelig dygtig læge. Patienterne var meget tilfredse.', date: '2026-02-28', assignmentTitle: 'Vikariat – Almen praksis' },
  { id: '4', raterName: 'Odense Universitetshospital', score: 3, comment: 'Tilfredsstillende indsats, men lidt forsinkelser.', date: '2026-02-20', assignmentTitle: 'Vikariat – Kardiologi' },
]

const mockGivenRatings: Rating[] = [
  { id: '5', raterName: 'Dig', score: 4, comment: 'Godt organiseret afdeling med klare instrukser.', date: '2026-03-08', assignmentTitle: 'Vikariat – Akutmodtagelse' },
  { id: '6', raterName: 'Dig', score: 5, comment: 'Fremragende samarbejde og gode faciliteter.', date: '2026-03-01', assignmentTitle: 'Konsultation – Ortopædi' },
]

function StarDisplay({ score }: { score: number }) {
  return (
    <span className="text-yellow-500 text-lg tracking-wide">
      {Array.from({ length: 5 }, (_, i) => (i < score ? '★' : '☆')).join('')}
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

  const ratings = activeTab === 'received' ? mockReceivedRatings : mockGivenRatings
  const avg = averageScore(ratings)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert(`Anmeldelse oprettet: ${newScore} stjerner for "${newAssignment}"`)
    setShowForm(false)
    setNewScore(5)
    setNewComment('')
    setNewAssignment('')
  }

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
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('received')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'received'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Modtagne anmeldelser
        </button>
        <button
          onClick={() => setActiveTab('given')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'given'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Givne anmeldelser
        </button>
      </div>

      {/* Average score badge */}
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-50 border border-yellow-200">
          <span className="text-2xl font-bold text-yellow-700">{avg}</span>
          <StarDisplay score={Math.round(parseFloat(avg))} />
          <span className="text-sm text-yellow-700">({ratings.length} anmeldelser)</span>
        </span>
      </div>

      {/* Ratings list */}
      <div className="space-y-4">
        {ratings.map((rating) => (
          <Card key={rating.id}>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-gray-900">{rating.raterName}</span>
                  <StarDisplay score={rating.score} />
                </div>
                <p className="text-sm text-gray-500">{rating.assignmentTitle}</p>
                <p className="text-gray-700 mt-2">{rating.comment}</p>
              </div>
              <span className="text-sm text-gray-400 whitespace-nowrap ml-4">{rating.date}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* New rating modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-semibold mb-4">Skriv en anmeldelse</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Opgave</label>
                <input
                  type="text"
                  value={newAssignment}
                  onChange={(e) => setNewAssignment(e.target.value)}
                  placeholder="Vælg opgave..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Score: {newScore} / 5</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Kommentar</label>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={4}
                  placeholder="Skriv din anmeldelse..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
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
