'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { AuditLogEntry } from '@/lib/types/database'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { formatDateTime } from '@/lib/utils/date'
import { ACTION_LABELS, RESOURCE_LABELS } from '@/lib/utils/constants'

type ActiveTab = 'handlinger' | 'laeseadgang'

interface ReadAccessLog {
  id: string
  user_id: string
  resource_type: string
  resource_id: string
  created_at: string
  user_email?: string
}

export default function AuditLogPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('handlinger')
  const [entries, setEntries] = useState<AuditLogEntry[]>([])
  const [readLogs, setReadLogs] = useState<ReadAccessLog[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const pageSize = 50

  // Date range filters for read access tab
  const [readDateFrom, setReadDateFrom] = useState('')
  const [readDateTo, setReadDateTo] = useState('')

  useEffect(() => {
    if (activeTab === 'handlinger') {
      loadAuditLog()
    } else {
      loadReadAccessLogs()
    }
  }, [page, activeTab, readDateFrom, readDateTo])

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

  async function loadReadAccessLogs() {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    let query = supabase
      .from('read_access_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .range(page * pageSize, (page + 1) * pageSize - 1)

    if (readDateFrom) {
      query = query.gte('created_at', readDateFrom)
    }
    if (readDateTo) {
      query = query.lte('created_at', readDateTo + 'T23:59:59')
    }

    const { data } = await query

    setReadLogs(data || [])
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

  const resourceTypeLabel = (type: string): string => {
    switch (type) {
      case 'journal_entry': return 'Journalnotat'
      case 'medical_case': return 'Medicinsk sag'
      case 'document': return 'Dokument'
      default: return RESOURCE_LABELS[type] || type
    }
  }

  function handleTabChange(tab: ActiveTab) {
    setActiveTab(tab)
    setPage(0)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Adgangslog</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Alle dine handlinger logges automatisk jf. Sundhedsloven og Journalfoeringsbekendtgoerelsen.
          Denne log kan ikke deaktiveres.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => handleTabChange('handlinger')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'handlinger'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Handlinger
        </button>
        <button
          onClick={() => handleTabChange('laeseadgang')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'laeseadgang'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Laeseadgang
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">Indlaeser...</div>
      ) : (
        <>
          {/* Handlinger tab */}
          {activeTab === 'handlinger' && (
            <>
              {entries.length === 0 ? (
                <EmptyState
                  icon="🔒"
                  title="Ingen logposter"
                  message="Dine handlinger vil automatisk blive logget her"
                />
              ) : (
                <>
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-left">
                          <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Tidspunkt</th>
                          <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Handling</th>
                          <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Ressource</th>
                          <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Ressource-ID</th>
                        </tr>
                      </thead>
                      <tbody>
                        {entries.map((entry) => (
                          <tr key={entry.id} className="border-b border-gray-100 dark:border-gray-700/50 last:border-0">
                            <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{formatDateTime(entry.created_at)}</td>
                            <td className="px-4 py-3">
                              <Badge variant={actionVariant(entry.action)}>
                                {ACTION_LABELS[entry.action] || entry.action}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                              {RESOURCE_LABELS[entry.resource_type] || entry.resource_type}
                            </td>
                            <td className="px-4 py-3 text-gray-400 dark:text-gray-500 font-mono text-xs">
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
                        className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                        Forrige
                      </button>
                    )}
                    {entries.length === pageSize && (
                      <button onClick={() => setPage(page + 1)}
                        className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                        Naeste
                      </button>
                    )}
                  </div>
                </>
              )}
            </>
          )}

          {/* Laeseadgang tab */}
          {activeTab === 'laeseadgang' && (
            <>
              {/* Date range filters */}
              <div className="flex flex-wrap gap-4 items-end">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Fra dato</label>
                  <input
                    type="date"
                    value={readDateFrom}
                    onChange={(e) => { setReadDateFrom(e.target.value); setPage(0) }}
                    className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Til dato</label>
                  <input
                    type="date"
                    value={readDateTo}
                    onChange={(e) => { setReadDateTo(e.target.value); setPage(0) }}
                    className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                {(readDateFrom || readDateTo) && (
                  <button
                    onClick={() => { setReadDateFrom(''); setReadDateTo(''); setPage(0) }}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Nulstil filtre
                  </button>
                )}
              </div>

              {readLogs.length === 0 ? (
                <EmptyState
                  icon="🔒"
                  title="Ingen laeseadgange registreret"
                  message="Laeseadgange til journaler og sager logges automatisk her"
                />
              ) : (
                <>
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-left">
                          <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Tidspunkt</th>
                          <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Bruger</th>
                          <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Ressourcetype</th>
                          <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Ressource-ID</th>
                        </tr>
                      </thead>
                      <tbody>
                        {readLogs.map((log) => (
                          <tr key={log.id} className="border-b border-gray-100 dark:border-gray-700/50 last:border-0">
                            <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{formatDateTime(log.created_at)}</td>
                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300 font-mono text-xs">
                              {log.user_email || log.user_id.slice(0, 12) + '...'}
                            </td>
                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                              {resourceTypeLabel(log.resource_type)}
                            </td>
                            <td className="px-4 py-3 text-gray-400 dark:text-gray-500 font-mono text-xs">
                              {log.resource_id ? log.resource_id.slice(0, 12) + '...' : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-center gap-2">
                    {page > 0 && (
                      <button onClick={() => setPage(page - 1)}
                        className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                        Forrige
                      </button>
                    )}
                    {readLogs.length === pageSize && (
                      <button onClick={() => setPage(page + 1)}
                        className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                        Naeste
                      </button>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
