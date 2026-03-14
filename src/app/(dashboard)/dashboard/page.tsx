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
          <CardTitle>Compliance</CardTitle>
          <div className="space-y-3 mt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Adgangslog</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Aktiv</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Journalversionering</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Aktiv</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Sletningsbeskyttelse</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Aktiv</span>
            </div>
            <Link href="/audit-log" className="block text-sm text-blue-600 hover:underline mt-2">
              Se adgangslog →
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
