'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardTitle } from '@/components/ui/card'
import { StatCard } from '@/components/ui/stat-card'
import Link from 'next/link'

export default function DashboardPage() {
  const [stats, setStats] = useState({ journals: 0, assignments: 0, messages: 0 })
  const [userName, setUserName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setUserName(user.user_metadata?.full_name || user.email || '')

      const [journalRes, assignmentRes, messageRes] = await Promise.all([
        supabase.from('journal_entries').select('id', { head: true, count: 'exact' })
          .eq('doctor_id', user.id).eq('is_deleted', false),
        supabase.from('assignments').select('id', { head: true, count: 'exact' })
          .eq('status', 'open'),
        supabase.from('messages').select('id', { head: true, count: 'exact' })
          .eq('receiver_id', user.id).eq('is_read', false),
      ])

      setStats({
        journals: journalRes.count ?? 0,
        assignments: assignmentRes.count ?? 0,
        messages: messageRes.count ?? 0,
      })
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-500">Indlæser...</div>
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Velkommen, {userName}</h1>
        <p className="text-gray-500">Her er din oversigt</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Journalnotater" value={stats.journals} icon="📋" color="blue" />
        <StatCard title="Åbne opslag" value={stats.assignments} icon="📌" color="green" />
        <StatCard title="Ulæste beskeder" value={stats.messages} icon="💬" color="orange" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardTitle>Hurtige handlinger</CardTitle>
          <div className="space-y-2 mt-4">
            <Link href="/journal/new" className="block px-4 py-3 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors font-medium text-sm">
              📋 Opret nyt journalnotat
            </Link>
            <Link href="/assignments/new" className="block px-4 py-3 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors font-medium text-sm">
              📌 Opret nyt opslag
            </Link>
            <Link href="/messages" className="block px-4 py-3 rounded-lg bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors font-medium text-sm">
              💬 Se beskeder
            </Link>
          </div>
        </Card>

        <Card>
          <CardTitle>Compliance Status</CardTitle>
          <div className="space-y-3 mt-4">
            {[
              { label: 'Audit trail aktiv', active: true },
              { label: 'Versionering aktiv', active: true },
              { label: 'Soft-delete aktiv', active: true },
              { label: 'GDPR-samtykke', active: true },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span className="text-sm text-gray-700">{item.label}</span>
              </div>
            ))}
            <Link href="/audit-log" className="block text-sm text-blue-600 hover:underline mt-2">
              Se adgangslog →
            </Link>
          </div>
        </Card>
      </div>

      {/* Seneste aktivitet */}
      <Card>
        <CardTitle>Seneste aktivitet</CardTitle>
        <div className="space-y-3 mt-4">
          {[
            { action: 'Journal oprettet', detail: 'Patient #1042 – Akut konsultation', time: 'I dag, 14:32' },
            { action: 'Opslag besvaret', detail: 'Vikariat – Akutmodtagelse', time: 'I dag, 11:15' },
            { action: 'Besked sendt', detail: 'Til Region Hovedstaden', time: 'I går, 16:45' },
            { action: 'Dokument uploadet', detail: 'Autorisationsbevis.pdf', time: 'I går, 09:20' },
            { action: 'Profil opdateret', detail: 'Specialer tilføjet', time: '12. mar, 10:05' },
          ].map((entry, i) => (
            <div key={i} className="flex items-center justify-between border-b border-gray-100 pb-2 last:border-0">
              <div>
                <p className="text-sm font-medium text-gray-900">{entry.action}</p>
                <p className="text-xs text-gray-500">{entry.detail}</p>
              </div>
              <span className="text-xs text-gray-400 whitespace-nowrap ml-4">{entry.time}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Hurtig adgang */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Hurtig adgang</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { href: '/salary', label: 'Lønberegner', icon: '💰', color: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' },
            { href: '/documents', label: 'Dokumenter', icon: '📁', color: 'bg-purple-50 text-purple-700 hover:bg-purple-100' },
            { href: '/contracts', label: 'Kontrakter', icon: '📝', color: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100' },
            { href: '/time-tracking', label: 'Tidsregistrering', icon: '⏱️', color: 'bg-teal-50 text-teal-700 hover:bg-teal-100' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 ${item.color} transition-colors text-center`}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
