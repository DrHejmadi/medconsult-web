'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardTitle } from '@/components/ui/card'
import { StatCard } from '@/components/ui/stat-card'

type Period = 'week' | 'month' | '3months' | 'year'

const periodLabels: Record<Period, string> = {
  week: 'Denne uge',
  month: 'Denne m\u00e5ned',
  '3months': 'Sidste 3 m\u00e5neder',
  year: 'I \u00e5r',
}

interface CaseStatistics {
  hours_worked: number
  shifts_completed: number
  average_rating: number
  earnings: number
  weekly_data: { label: string; hours: number }[]
  monthly_data: { label: string; hours: number }[]
  top_specialties: { name: string; pct: number }[]
  region_distribution: { name: string; pct: number }[]
}

const defaultStats: CaseStatistics = {
  hours_worked: 0,
  shifts_completed: 0,
  average_rating: 0,
  earnings: 0,
  weekly_data: [],
  monthly_data: [],
  top_specialties: [],
  region_distribution: [],
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>('month')
  const [stats, setStats] = useState<CaseStatistics>(defaultStats)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    async function fetchStats() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data: result } = await supabase.rpc('get_case_statistics', {
        p_user_id: user.id,
      })

      if (result) {
        setStats(result)
      }
      setLoading(false)
    }
    fetchStats()
  }, [])

  const chartData = period === 'week' ? stats.weekly_data : stats.monthly_data
  const maxHours = chartData.length > 0 ? Math.max(...chartData.map((d) => d.hours)) : 0

  const brutto = stats.earnings || 0
  const feriepenge = Math.round(brutto * 0.125)
  const bskat = Math.round((brutto - feriepenge) * 0.38)
  const netto = brutto - feriepenge - bskat

  if (loading) return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Indl\u00e6ser...</div>

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analyser & Indsigter</h1>
        <p className="text-gray-500">Overblik over din aktivitet og indtjening</p>
      </div>

      {/* Period selector */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(periodLabels) as Period[]).map((key) => (
          <button
            key={key}
            onClick={() => setPeriod(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              period === key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {periodLabels[key]}
          </button>
        ))}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Timer arbejdet" value={stats.hours_worked} icon="\u23F1\uFE0F" color="blue" />
        <StatCard title="Vagter gennemf\u00f8rt" value={stats.shifts_completed} icon="\u2705" color="green" />
        <StatCard title="Gennemsnitlig rating" value={stats.average_rating ? stats.average_rating.toFixed(1) : '0.0'} icon="\u2B50" color="orange" />
        <StatCard title="Indtjening" value={`${brutto.toLocaleString('da-DK')} kr`} icon="\uD83D\uDCB0" color="green" />
      </div>

      {/* Activity chart */}
      <Card>
        <CardTitle>Aktivitetsoversigt</CardTitle>
        <p className="text-sm text-gray-500 mt-1">
          {period === 'week' ? 'Timer arbejdet per dag' : 'Timer arbejdet per m\u00e5ned'}
        </p>
        {chartData.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">Ingen aktivitetsdata endnu.</p>
        ) : (
          <div className="mt-6 flex items-end gap-2" style={{ height: '200px' }}>
            {chartData.map((d) => (
              <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-gray-500 font-medium">{d.hours}t</span>
                <div
                  className="w-full bg-blue-500 rounded-t-md transition-all duration-300 min-h-[4px]"
                  style={{
                    height: maxHours > 0 ? `${(d.hours / maxHours) * 160}px` : '4px',
                  }}
                />
                <span className="text-xs text-gray-500 mt-1">{d.label}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Earnings summary */}
      <Card>
        <CardTitle>Indtjeningsoversigt</CardTitle>
        <p className="text-sm text-gray-500 mt-1">Estimeret for denne m\u00e5ned</p>
        <div className="mt-4 space-y-3">
          {[
            { label: 'Brutto', value: brutto, color: 'text-gray-900 dark:text-gray-100' },
            { label: 'Feriepenge (12,5%)', value: -feriepenge, color: 'text-orange-600' },
            { label: 'Estimeret B-skat (38%)', value: -bskat, color: 'text-red-600' },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">{row.label}</span>
              <span className={`text-sm font-medium ${row.color}`}>
                {row.value < 0 ? '\u2212' : ''}{Math.abs(row.value).toLocaleString('da-DK')} kr
              </span>
            </div>
          ))}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Netto (estimeret)</span>
              <span className="text-lg font-bold text-green-600">{netto.toLocaleString('da-DK')} kr</span>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top specialties */}
        <Card>
          <CardTitle>Top specialer efterspurgt</CardTitle>
          <div className="mt-4 space-y-3">
            {stats.top_specialties.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">Ingen data endnu.</p>
            ) : (
              stats.top_specialties.map((s, i) => (
                <div key={s.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      <span className="text-gray-400 mr-2">{i + 1}.</span>
                      {s.name}
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{s.pct}%</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${s.pct}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Region distribution */}
        <Card>
          <CardTitle>Regionsfordeling</CardTitle>
          <div className="mt-4 space-y-3">
            {stats.region_distribution.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">Ingen data endnu.</p>
            ) : (
              stats.region_distribution.map((r) => (
                <div key={r.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{r.name}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{r.pct}%</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${r.pct}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
