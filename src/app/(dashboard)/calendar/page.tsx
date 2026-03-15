'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Assignment } from '@/lib/types/database'
import { Card, CardTitle } from '@/components/ui/card'

const DANISH_MONTHS = [
  'Januar', 'Februar', 'Marts', 'April', 'Maj', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'December',
]

const DANISH_DAYS = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn']

function getUrgencyColor(urgency: string, isVolunteer: boolean): string {
  if (isVolunteer) return 'bg-green-100 text-green-800 border-green-200'
  if (urgency === 'acute') return 'bg-red-100 text-red-800 border-red-200'
  if (urgency === 'urgent') return 'bg-orange-100 text-orange-800 border-orange-200'
  return 'bg-blue-100 text-blue-800 border-blue-200'
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay()
  // Convert Sunday=0 to Monday-based (Mon=0, Sun=6)
  return day === 0 ? 6 : day - 1
}

export default function CalendarPage() {
  const today = new Date()
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  useEffect(() => {
    loadAssignments()
  }, [currentYear, currentMonth])

  async function loadAssignments() {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const startOfMonth = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`
    const daysInMonth = getDaysInMonth(currentYear, currentMonth)
    const endOfMonth = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`

    const { data } = await supabase
      .from('assignments')
      .select('*')
      .or(`start_date.gte.${startOfMonth},end_date.gte.${startOfMonth}`)
      .or(`start_date.lte.${endOfMonth},end_date.lte.${endOfMonth}`)
      .order('start_date', { ascending: true })
      .limit(100)

    setAssignments(data || [])
    setLoading(false)
  }

  function getAssignmentsForDay(day: number): Assignment[] {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return assignments.filter((a) => {
      if (!a.start_date) return false
      const start = a.start_date.slice(0, 10)
      const end = a.end_date ? a.end_date.slice(0, 10) : start
      return dateStr >= start && dateStr <= end
    })
  }

  function goToPrevMonth() {
    setSelectedDay(null)
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  function goToNextMonth() {
    setSelectedDay(null)
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth)
  const isToday = (day: number) =>
    day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()

  const selectedAssignments = selectedDay ? getAssignmentsForDay(selectedDay) : []

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Kalender</h1>

      <Card>
        {/* Header med navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={goToPrevMonth}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 text-lg"
            aria-label="Forrige måned"
          >
            ←
          </button>
          <h2 className="text-xl font-semibold">
            {DANISH_MONTHS[currentMonth]} {currentYear}
          </h2>
          <button
            onClick={goToNextMonth}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 text-lg"
            aria-label="Næste måned"
          >
            →
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Indlæser...</div>
        ) : (
          <>
            {/* Dag-navne */}
            <div className="grid grid-cols-7 gap-px mb-1">
              {DANISH_DAYS.map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-semibold text-gray-500 py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Kalender-grid */}
            <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden">
              {/* Tomme celler før første dag */}
              {Array.from({ length: firstDay }, (_, i) => (
                <div key={`empty-${i}`} className="bg-gray-50 min-h-[80px] p-1" />
              ))}

              {/* Dage i måneden */}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1
                const dayAssignments = getAssignmentsForDay(day)
                const isSelected = selectedDay === day
                const isTodayCell = isToday(day)

                return (
                  <div
                    key={day}
                    onClick={() => dayAssignments.length > 0 ? setSelectedDay(day) : setSelectedDay(null)}
                    className={`bg-white min-h-[80px] p-1 cursor-pointer transition-colors ${
                      isSelected ? 'ring-2 ring-blue-500 ring-inset' : ''
                    } ${dayAssignments.length > 0 ? 'hover:bg-blue-50' : ''}`}
                  >
                    <div className={`text-sm font-medium mb-1 w-7 h-7 flex items-center justify-center rounded-full ${
                      isTodayCell ? 'bg-blue-600 text-white' : 'text-gray-700'
                    }`}>
                      {day}
                    </div>
                    <div className="space-y-0.5">
                      {dayAssignments.slice(0, 3).map((a) => (
                        <div
                          key={a.id}
                          className={`text-[10px] leading-tight px-1 py-0.5 rounded border truncate ${getUrgencyColor(a.urgency, a.is_volunteer)}`}
                        >
                          {a.title}
                        </div>
                      ))}
                      {dayAssignments.length > 3 && (
                        <div className="text-[10px] text-gray-400 px-1">
                          +{dayAssignments.length - 3} mere
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </Card>

      {/* Detalje-panel for valgt dag */}
      {selectedDay && selectedAssignments.length > 0 && (
        <Card>
          <CardTitle>
            Vagter den {selectedDay}. {DANISH_MONTHS[currentMonth]} {currentYear}
          </CardTitle>
          <div className="mt-4 space-y-3">
            {selectedAssignments.map((a) => (
              <div
                key={a.id}
                className={`p-3 rounded-lg border ${getUrgencyColor(a.urgency, a.is_volunteer)}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-sm">{a.title}</h4>
                  <span className="text-xs">
                    {a.is_volunteer ? 'Frivillig' : a.urgency === 'acute' ? 'Akut' : a.urgency === 'urgent' ? 'Haster' : 'Normal'}
                  </span>
                </div>
                <p className="text-xs opacity-80 mb-1">{a.description}</p>
                <div className="flex gap-3 text-xs opacity-70">
                  {a.city && <span>{a.city}</span>}
                  {a.specialty_required && <span>{a.specialty_required}</span>}
                  {a.rate_per_hour && <span>{a.rate_per_hour} kr/time</span>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
