'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { JournalEntry } from '@/lib/types/database'
import { formatDate } from '@/lib/utils/date'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'

export default function JournalListPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadEntries()
  }, [])

  async function loadEntries() {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    let query = supabase
      .from('journal_entries')
      .select('*')
      .eq('doctor_id', user.id)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })

    if (search.trim()) {
      query = query.or(`patient_initials.ilike.%${search}%,subjective.ilike.%${search}%,assessment.ilike.%${search}%`)
    }

    const { data, error: fetchError } = await query.limit(50)
    if (fetchError) {
      setError('Kunne ikke hente journalnotater')
    } else {
      setEntries(data || [])
    }
    setLoading(false)
  }

  async function archiveEntry(id: string) {
    if (!confirm('Er du sikker på at du vil arkivere dette notat? Det kan ikke gendannes.')) return

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error: updateError } = await supabase
      .from('journal_entries')
      .update({ is_deleted: true, deleted_at: new Date().toISOString(), deleted_by: user.id })
      .eq('id', id)

    if (updateError) {
      setError('Kunne ikke arkivere journalnotat')
    } else {
      setEntries(entries.filter(e => e.id !== id))
    }

    // Log audit
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'archive',
      resource_type: 'journal_entry',
      resource_id: id,
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Journal</h1>
        <Link
          href="/journal/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          + Nyt notat
        </Link>
      </div>

      <input
        type="text"
        placeholder="Søg i journal..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && loadEntries()}
        className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      />

      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">Indlæser...</div>
      ) : entries.length === 0 ? (
        <EmptyState
          icon="📋"
          title="Ingen journalnotater"
          message="Opret dit første journalnotat for at komme i gang"
          action={
            <Link href="/journal/new" className="text-blue-600 hover:underline text-sm">
              Opret notat →
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <Link
              key={entry.id}
              href={`/journal/${entry.id}`}
              className="block bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{entry.patient_initials}</span>
                  {entry.signed_at && <Badge variant="success">Signeret</Badge>}
                  <Badge variant="default">v{entry.version}</Badge>
                </div>
                <span className="text-sm text-gray-500">{formatDate(entry.entry_date)}</span>
              </div>
              {entry.assessment && (
                <p className="text-sm text-gray-700 truncate">{entry.assessment}</p>
              )}
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                <span>Behandler: {entry.behandler_name}</span>
                {entry.diagnosis_codes?.length > 0 && (
                  <span>Diagnoser: {entry.diagnosis_codes.join(', ')}</span>
                )}
              </div>
              <div className="mt-2 flex justify-end">
                <button
                  onClick={(e) => { e.preventDefault(); archiveEntry(entry.id) }}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Arkivér
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
