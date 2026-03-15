'use client'

import { useState } from 'react'
import { Card, CardTitle } from '@/components/ui/card'
import { StatCard } from '@/components/ui/stat-card'

type Period = 'week' | 'month' | '3months' | 'year'

const periodLabels: Record<Period, string> = {
  week: 'Denne uge',
  month: 'Denne måned',
  '3months': 'Sidste 3 måneder',
  year: 'I år',
}

const weeklyData = [
  { label: 'Man', hours: 8 },
  { label: 'Tir', hours: 10 },
  { label: 'Ons', hours: 6 },
  { label: 'Tor', hours: 9 },
  { label: 'Fre', hours: 7 },
  { label: 'Lør', hours: 4 },
  { label: 'Søn', hours: 0 },
]

const monthlyData = [
  { label: 'Jan', hours: 142 },
  { label: 'Feb', hours: 128 },
  { label: 'Mar', hours: 156 },
  { label: 'Apr', hours: 134 },
  { label: 'Maj', hours: 148 },
  { label: 'Jun', hours: 110 },
  { label: 'Jul', hours: 80 },
  { label: 'Aug', hours: 125 },
  { label: 'Sep', hours: 140 },
  { label: 'Okt', hours: 152 },
  { label: 'Nov', hours: 138 },
  { label: 'Dec', hours: 95 },
]

const topSpecialties = [
  { name: 'Akutmedicin', pct: 32 },
  { name: 'Almen medicin', pct: 24 },
  { name: 'Anæstesiologi', pct: 18 },
  { name: 'Intern medicin', pct: 14 },
  { name: 'Pædiatri', pct: 12 },
]

const regionDistribution = [
  { name: 'Region Hovedstaden', pct: 38 },
  { name: 'Region Sjælland', pct: 22 },
  { name: 'Region Syddanmark', pct: 18 },
  { name: 'Region Midtjylland', pct: 14 },
  { name: 'Region Nordjylland', pct: 8 },
]

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>('month')

  const chartData = period === 'week' ? weeklyData : monthlyData
  const maxHours = Math.max(...chartData.map((d) => d.hours))

  const brutto = 87500
  const feriepenge = Math.round(brutto * 0.125)
  const bskat = Math.round((brutto - feriepenge) * 0.38)
  const netto = brutto - feriepenge - bskat

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
        <StatCard title="Timer arbejdet" value={period === 'week' ? 44 : 156} icon="⏱️" color="blue" />
        <StatCard title="Vagter gennemført" value={period === 'week' ? 6 : 22} icon="✅" color="green" />
        <StatCard title="Gennemsnitlig rating" value="4.8" icon="⭐" color="orange" />
        <StatCard title="Indtjening" value={`${(period === 'week' ? 22000 : brutto).toLocaleString('da-DK')} kr`} icon="💰" color="green" />
      </div>

      {/* Activity chart */}
      <Card>
        <CardTitle>Aktivitetsoversigt</CardTitle>
        <p className="text-sm text-gray-500 mt-1">
          {period === 'week' ? 'Timer arbejdet per dag' : 'Timer arbejdet per måned'}
        </p>
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
      </Card>

      {/* Earnings summary */}
      <Card>
        <CardTitle>Indtjeningsoversigt</CardTitle>
        <p className="text-sm text-gray-500 mt-1">Estimeret for denne måned</p>
        <div className="mt-4 space-y-3">
          {[
            { label: 'Brutto', value: brutto, color: 'text-gray-900 dark:text-gray-100' },
            { label: 'Feriepenge (12,5%)', value: -feriepenge, color: 'text-orange-600' },
            { label: 'Estimeret B-skat (38%)', value: -bskat, color: 'text-red-600' },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">{row.label}</span>
              <span className={`text-sm font-medium ${row.color}`}>
                {row.value < 0 ? '−' : ''}{Math.abs(row.value).toLocaleString('da-DK')} kr
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
            {topSpecialties.map((s, i) => (
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
            ))}
          </div>
        </Card>

        {/* Region distribution */}
        <Card>
          <CardTitle>Regionsfordeling</CardTitle>
          <div className="mt-4 space-y-3">
            {regionDistribution.map((r) => (
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
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
