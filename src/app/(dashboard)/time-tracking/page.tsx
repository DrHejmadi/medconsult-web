'use client'

import { useState } from 'react'
import { Card, CardTitle } from '@/components/ui/card'

interface TimeEntry {
  id: string
  date: string
  dayName: string
  hours: number
  assignment: string
  notes: string
}

const weekDays = ['Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag', 'Søndag']

function getWeekDates(): { date: string; dayName: string }[] {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7))

  return weekDays.map((name, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return { date: d.toISOString().split('T')[0], dayName: name }
  })
}

const weekDates = getWeekDates()

const initialEntries: TimeEntry[] = [
  { id: '1', date: weekDates[0].date, dayName: 'Mandag', hours: 8, assignment: 'Vikariat – Akutmodtagelse', notes: 'Dagvagt, 5 patienter' },
  { id: '2', date: weekDates[1].date, dayName: 'Tirsdag', hours: 7.5, assignment: 'Vikariat – Akutmodtagelse', notes: 'Rolig dag' },
  { id: '3', date: weekDates[2].date, dayName: 'Onsdag', hours: 8, assignment: 'Konsultation – Ortopædi', notes: 'Ambulatorium' },
  { id: '4', date: weekDates[3].date, dayName: 'Torsdag', hours: 6, assignment: 'Vikariat – Almen praksis', notes: 'Halvdag + møde' },
]

const monthlySummary = [
  { month: 'Januar 2026', hours: 152, earnings: '76.000 kr.' },
  { month: 'Februar 2026', hours: 144, earnings: '72.000 kr.' },
  { month: 'Marts 2026', hours: 29.5, earnings: '14.750 kr.' },
]

export default function TimeTrackingPage() {
  const [entries, setEntries] = useState<TimeEntry[]>(initialEntries)
  const [showForm, setShowForm] = useState(false)
  const [formDate, setFormDate] = useState('')
  const [formHours, setFormHours] = useState('')
  const [formAssignment, setFormAssignment] = useState('')
  const [formNotes, setFormNotes] = useState('')

  const weeklyTotal = entries.reduce((sum, e) => sum + e.hours, 0)

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault()
    const dayIndex = new Date(formDate).getDay()
    const dayName = dayIndex === 0 ? 'Søndag' : weekDays[dayIndex - 1]
    const newEntry: TimeEntry = {
      id: Date.now().toString(),
      date: formDate,
      dayName,
      hours: parseFloat(formHours),
      assignment: formAssignment,
      notes: formNotes,
    }
    setEntries([...entries, newEntry])
    setShowForm(false)
    setFormDate('')
    setFormHours('')
    setFormAssignment('')
    setFormNotes('')
  }

  const generateInvoice = () => {
    const lines = [
      'FAKTURA',
      '========================================',
      `Dato: ${new Date().toISOString().split('T')[0]}`,
      `Fakturanummer: INV-${Date.now().toString().slice(-6)}`,
      '',
      'Tidsregistrering – Aktuel uge',
      '----------------------------------------',
      ...entries.map(e => `${e.dayName} (${e.date}): ${e.hours} timer – ${e.assignment}`),
      '----------------------------------------',
      `Total timer: ${weeklyTotal}`,
      `Timesats: 500 kr.`,
      `Beløb i alt: ${weeklyTotal * 500} kr.`,
      '',
      'Betalingsbetingelser: 30 dage netto',
      '========================================',
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `faktura-${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tidsregistrering</h1>
          <p className="text-gray-500">Registrer dine arbejdstimer og generer fakturaer</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Tilføj tid
          </button>
          <button
            onClick={generateInvoice}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            Generer faktura
          </button>
        </div>
      </div>

      {/* Week view */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <CardTitle>Aktuel uge</CardTitle>
          <span className="text-sm font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
            Total: {weeklyTotal} timer
          </span>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {weekDates.map(({ date, dayName }) => {
            const dayEntries = entries.filter(e => e.date === date)
            const dayHours = dayEntries.reduce((sum, e) => sum + e.hours, 0)
            return (
              <div
                key={date}
                className={`rounded-lg border p-3 text-center ${
                  dayHours > 0 ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'
                }`}
              >
                <p className="text-xs font-medium text-gray-500">{dayName}</p>
                <p className="text-xs text-gray-400">{date.slice(5)}</p>
                <p className={`text-lg font-bold mt-1 ${dayHours > 0 ? 'text-blue-700' : 'text-gray-300'}`}>
                  {dayHours > 0 ? `${dayHours}t` : '-'}
                </p>
                {dayEntries.map(e => (
                  <p key={e.id} className="text-xs text-gray-500 mt-1 truncate" title={e.notes}>{e.notes}</p>
                ))}
              </div>
            )
          })}
        </div>
      </Card>

      {/* Entries list */}
      <Card>
        <CardTitle>Registreringer denne uge</CardTitle>
        <div className="mt-4 space-y-3">
          {entries.length === 0 && (
            <p className="text-sm text-gray-400">Ingen registreringer endnu.</p>
          )}
          {entries.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0">
              <div>
                <p className="text-sm font-medium text-gray-900">{entry.dayName}, {entry.date}</p>
                <p className="text-sm text-gray-500">{entry.assignment}</p>
                {entry.notes && <p className="text-xs text-gray-400 mt-0.5">{entry.notes}</p>}
              </div>
              <span className="text-sm font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
                {entry.hours} timer
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Monthly summary */}
      <Card>
        <CardTitle>Månedsoversigt</CardTitle>
        <div className="mt-4 space-y-3">
          {monthlySummary.map((m) => (
            <div key={m.month} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0">
              <div>
                <p className="text-sm font-medium text-gray-900">{m.month}</p>
                <p className="text-sm text-gray-500">{m.hours} timer registreret</p>
              </div>
              <span className="text-sm font-semibold text-green-700 bg-green-50 px-3 py-1 rounded-full">
                {m.earnings}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Add entry form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-semibold mb-4">Tilføj tidsregistrering</h2>
            <form onSubmit={handleAddEntry} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dato</label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Timer</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="24"
                  value={formHours}
                  onChange={(e) => setFormHours(e.target.value)}
                  placeholder="f.eks. 8"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Opgave</label>
                <select
                  value={formAssignment}
                  onChange={(e) => setFormAssignment(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Vælg opgave...</option>
                  <option value="Vikariat – Akutmodtagelse">Vikariat – Akutmodtagelse</option>
                  <option value="Konsultation – Ortopædi">Konsultation – Ortopædi</option>
                  <option value="Vikariat – Almen praksis">Vikariat – Almen praksis</option>
                  <option value="Vikariat – Kardiologi">Vikariat – Kardiologi</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Noter</label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  rows={3}
                  placeholder="Evt. noter..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  Gem
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
