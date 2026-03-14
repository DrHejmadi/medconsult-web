'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { AuditLogEntry } from '@/lib/types/database'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { formatDateTime } from '@/lib/utils/date'
import { ACTION_LABELS, RESOURCE_LABELS } from '@/lib/utils/constants'

export default function AuditLogPage() {
  const [entries, setEntries] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const pageSize = 50

  useEffect(() => {
    loadAuditLog()
  }, [page])

  async function loadAuditLog() {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(page * pageSize, (page + 1) * pageSize - 1)

    setEntries(data || [])
    setLoading(false)
  }

  const actionVariant = (action: string): 'default' | 'success' | 'warning' | 'danger' | 'info' => {
    switch (action) {
      case 'create': return 'success'
      case 'update': return 'warning'
      case 'archive': return 'danger'
      case 'view': return 'info'
      default: return 'default'
    }
  }

  if (loading) return <div className="text-center py-12 text-gray-500">Indlæser...</div>

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Adgangslog</h1>
        <p className="text-gray-500 text-sm mt-1">
          Alle dine handlinger logges automatisk jf. Sundhedsloven og Journalføringsbekendtgørelsen.
          Denne log kan ikke deaktiveres.
        </p>
      </div>

      {entries.length === 0 ? (
        <EmptyState
          icon="🔒"
          title="Ingen logposter"
          message="Dine handlinger vil automatisk blive logget her"
        />
      ) : (
        <>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left">
                  <th className="px-4 py-3 font-medium text-gray-500">Tidspunkt</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Handling</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Ressource</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Ressource-ID</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-3 text-gray-500">{formatDateTime(entry.created_at)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={actionVariant(entry.action)}>
                        {ACTION_LABELS[entry.action] || entry.action}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {RESOURCE_LABELS[entry.resource_type] || entry.resource_type}
                    </td>
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">
                      {entry.resource_id ? entry.resource_id.slice(0, 12) + '...' : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-center gap-2">
            {page > 0 && (
              <button onClick={() => setPage(page - 1)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50">
                ← Forrige
              </button>
            )}
            {entries.length === pageSize && (
              <button onClick={() => setPage(page + 1)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50">
                Næste →
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
