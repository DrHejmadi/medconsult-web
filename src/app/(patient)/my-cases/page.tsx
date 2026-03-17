'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { MedicalCase } from '@/lib/types/case'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { formatDate } from '@/lib/utils/date'

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'warning' | 'info' | 'success' }> = {
  pending: { label: 'Afventer svar', variant: 'warning' },
  in_progress: { label: 'Under behandling', variant: 'info' },
  answered: { label: 'Besvaret', variant: 'success' },
  closed: { label: 'Lukket', variant: 'default' },
}

const CASE_TYPE_LABELS: Record<string, string> = {
  diagnosis: 'Diagnoseforslag',
  second_opinion: 'Second opinion',
  assessment: 'Udredningsforslag',
  treatment: 'Behandlingsforslag',
  communication: 'Kommunikationsrad',
}

const SERVICE_LEVEL_LABELS: Record<string, string> = {
  kort_raad: 'Kort rad',
  konsultation: 'Konsultation',
  fuld_udredning: 'Fuld udredningsplan',
}

export default function CasesListPage() {
  const [cases, setCases] = useState<MedicalCase[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCases()
  }, [])

  async function loadCases() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from('cases')
      .select('*')
      .eq('patient_id', user.id)
      .order('created_at', { ascending: false })

    setCases(data || [])
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
          <span className="text-xl font-bold">Mine sager</span>
          <Link
            href="/my-cases/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            + Ny sag
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-6">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Indlaeser...</div>
        ) : cases.length === 0 ? (
          <EmptyState
            icon="📋"
            title="Ingen sager endnu"
            message="Opret din foerste sag for at fa ekspertvurdering fra en verificeret laege"
          />
        ) : (
          <div className="space-y-3">
            {cases.map((c) => {
              const statusConfig = STATUS_CONFIG[c.status] || STATUS_CONFIG.pending
              return (
                <Link
                  key={c.id}
                  href={`/my-cases/${c.id}`}
                  className="block bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {CASE_TYPE_LABELS[c.case_type] || c.case_type}
                    </h3>
                    <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 truncate mb-2">{c.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span>{c.specialty}</span>
                    <span>{SERVICE_LEVEL_LABELS[c.service_level] || c.service_level}</span>
                    <span>{c.price} kr</span>
                    <span>{formatDate(c.created_at)}</span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
