'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import Link from 'next/link'

interface Case {
  id: string
  case_type: string
  specialty: string
  service_level: string
  price: number
  description: string
  status: string
  created_at: string
  doctor_id: string | null
}

const specialtyOptions = [
  { value: '', label: 'Alle specialer' },
  { value: 'almen_medicin', label: 'Almen medicin' },
  { value: 'dermatologi', label: 'Dermatologi' },
  { value: 'kardiologi', label: 'Kardiologi' },
  { value: 'neurologi', label: 'Neurologi' },
  { value: 'ortopædi', label: 'Ortopædi' },
  { value: 'psykiatri', label: 'Psykiatri' },
  { value: 'pædiatri', label: 'Pædiatri' },
  { value: 'gynækologi', label: 'Gynækologi' },
  { value: 'urologi', label: 'Urologi' },
  { value: 'øjenlæge', label: 'Øjenlæge' },
  { value: 'øre_næse_hals', label: 'Øre-næse-hals' },
]

const caseTypeOptions = [
  { value: '', label: 'Alle typer' },
  { value: 'second_opinion', label: 'Second opinion' },
  { value: 'vurdering', label: 'Vurdering' },
  { value: 'udredning', label: 'Udredningsforslag' },
  { value: 'opfølgning', label: 'Opfølgning' },
]

const serviceLevelOptions = [
  { value: '', label: 'Alle niveauer' },
  { value: 'basis', label: 'Basis' },
  { value: 'standard', label: 'Standard' },
  { value: 'premium', label: 'Premium' },
]

const sortOptions = [
  { value: 'newest', label: 'Nyeste først' },
  { value: 'price_high', label: 'Højeste pris' },
  { value: 'price_low', label: 'Laveste pris' },
]

function serviceLevelBadgeVariant(level: string): 'default' | 'info' | 'warning' | 'success' {
  switch (level) {
    case 'premium': return 'warning'
    case 'standard': return 'info'
    default: return 'default'
  }
}

function statusBadgeVariant(status: string): 'info' | 'success' | 'warning' | 'default' {
  switch (status) {
    case 'in_progress': return 'info'
    case 'answered': return 'success'
    case 'pending': return 'warning'
    default: return 'default'
  }
}

function statusLabel(status: string): string {
  switch (status) {
    case 'in_progress': return 'Under behandling'
    case 'answered': return 'Besvaret'
    case 'pending': return 'Afventer'
    default: return status
  }
}

export default function CasesPage() {
  const [activeTab, setActiveTab] = useState<'open' | 'mine'>('open')
  const [openCases, setOpenCases] = useState<Case[]>([])
  const [myCases, setMyCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState<string | null>(null)
  const [specialty, setSpecialty] = useState('')
  const [caseType, setCaseType] = useState('')
  const [serviceLevel, setServiceLevel] = useState('')
  const [sort, setSort] = useState('newest')
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    loadCases()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadCases() {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUserId(user.id)

    const [openRes, mineRes] = await Promise.all([
      supabase
        .from('cases')
        .select('*')
        .is('doctor_id', null)
        .eq('status', 'pending')
        .order('created_at', { ascending: false }),
      supabase
        .from('cases')
        .select('*')
        .eq('doctor_id', user.id)
        .order('created_at', { ascending: false }),
    ])

    setOpenCases(openRes.data ?? [])
    setMyCases(mineRes.data ?? [])
    setLoading(false)
  }

  async function claimCase(caseId: string) {
    if (!userId) return
    setClaiming(caseId)
    const supabase = createClient()
    await supabase
      .from('cases')
      .update({ doctor_id: userId, status: 'in_progress' })
      .eq('id', caseId)
    await loadCases()
    setClaiming(null)
  }

  function filterCases(cases: Case[]) {
    let filtered = cases
    if (specialty) filtered = filtered.filter((c) => c.specialty === specialty)
    if (caseType) filtered = filtered.filter((c) => c.case_type === caseType)
    if (serviceLevel) filtered = filtered.filter((c) => c.service_level === serviceLevel)

    if (sort === 'price_high') filtered = [...filtered].sort((a, b) => b.price - a.price)
    else if (sort === 'price_low') filtered = [...filtered].sort((a, b) => a.price - b.price)

    return filtered
  }

  const filteredOpen = filterCases(openCases)
  const filteredMine = filterCases(myCases)

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-500">Indlæser...</div>
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Case-markedsplads</h1>
        <p className="text-gray-500 mt-1">
          Gennemse og besvar patientcases. Tag en case for at give din sundhedsfaglige vurdering.
        </p>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select
            label="Specialefilter"
            options={specialtyOptions}
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
          />
          <Select
            label="Case-type"
            options={caseTypeOptions}
            value={caseType}
            onChange={(e) => setCaseType(e.target.value)}
          />
          <Select
            label="Serviceniveau"
            options={serviceLevelOptions}
            value={serviceLevel}
            onChange={(e) => setServiceLevel(e.target.value)}
          />
          <Select
            label="Sortering"
            options={sortOptions}
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          />
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('open')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'open'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Åbne cases ({filteredOpen.length})
        </button>
        <button
          onClick={() => setActiveTab('mine')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'mine'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Mine cases ({filteredMine.length})
        </button>
      </div>

      {/* Open cases */}
      {activeTab === 'open' && (
        <div>
          {filteredOpen.length === 0 ? (
            <Card>
              <p className="text-gray-500 text-center py-8">Ingen åbne cases matcher dine filtre.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOpen.map((c) => (
                <Card key={c.id} className="flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Badge variant="info">{c.case_type?.replace('_', ' ') || 'Case'}</Badge>
                      <Badge variant={serviceLevelBadgeVariant(c.service_level)}>
                        {c.service_level || 'Basis'}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {specialtyOptions.find((s) => s.value === c.specialty)?.label || c.specialty || 'Ikke angivet'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-3">
                      {c.description ? c.description.slice(0, 150) + (c.description.length > 150 ? '...' : '') : 'Ingen beskrivelse'}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                      <span>{new Date(c.created_at).toLocaleDateString('da-DK')}</span>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                        {c.price ? `${c.price} kr.` : 'Ikke prissat'}
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    loading={claiming === c.id}
                    onClick={() => claimCase(c.id)}
                    className="w-full"
                  >
                    Tag case
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* My cases */}
      {activeTab === 'mine' && (
        <div>
          {filteredMine.length === 0 ? (
            <Card>
              <p className="text-gray-500 text-center py-8">Du har ingen aktive cases.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMine.map((c) => (
                <Link key={c.id} href={`/cases/${c.id}`}>
                  <Card className="hover:ring-2 hover:ring-blue-200 transition-all cursor-pointer h-full">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Badge variant="info">{c.case_type?.replace('_', ' ') || 'Case'}</Badge>
                      <Badge variant={statusBadgeVariant(c.status)}>
                        {statusLabel(c.status)}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {specialtyOptions.find((s) => s.value === c.specialty)?.label || c.specialty || 'Ikke angivet'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-3">
                      {c.description ? c.description.slice(0, 150) + (c.description.length > 150 ? '...' : '') : 'Ingen beskrivelse'}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{new Date(c.created_at).toLocaleDateString('da-DK')}</span>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                        {c.price ? `${c.price} kr.` : ''}
                      </span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
