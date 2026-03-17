'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'

interface AnonymizedCase {
  id: string
  case_type: string
  specialty: string
  description: string
  created_at: string
  response_summary?: string
  diagnosis?: string
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

export default function KnowledgeBasePage() {
  const [cases, setCases] = useState<AnonymizedCase[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [caseType, setCaseType] = useState('')
  const [selectedCase, setSelectedCase] = useState<AnonymizedCase | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('cases')
        .select(`
          id,
          case_type,
          specialty,
          description,
          created_at,
          case_responses (
            diagnosis,
            next_steps
          )
        `)
        .eq('status', 'answered')
        .eq('knowledge_base_consent', true)
        .order('created_at', { ascending: false })

      if (data) {
        const mapped: AnonymizedCase[] = data.map((c: Record<string, unknown>) => {
          const responses = c.case_responses as Array<{ diagnosis?: string; next_steps?: string }> | undefined
          const resp = responses?.[0]
          return {
            id: c.id as string,
            case_type: c.case_type as string,
            specialty: c.specialty as string,
            description: c.description as string,
            created_at: c.created_at as string,
            diagnosis: resp?.diagnosis || undefined,
            response_summary: resp?.next_steps || undefined,
          }
        })
        setCases(mapped)
      }
      setLoading(false)
    }
    load()
  }, [])

  function filteredCases() {
    let filtered = cases
    if (specialty) filtered = filtered.filter((c) => c.specialty === specialty)
    if (caseType) filtered = filtered.filter((c) => c.case_type === caseType)
    if (search) {
      const lower = search.toLowerCase()
      filtered = filtered.filter(
        (c) =>
          c.description?.toLowerCase().includes(lower) ||
          c.diagnosis?.toLowerCase().includes(lower) ||
          c.response_summary?.toLowerCase().includes(lower)
      )
    }
    return filtered
  }

  const filtered = filteredCases()

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-500">Indlæser...</div>
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Videnbase &ndash; Anonymiserede cases</h1>
        <p className="text-gray-500 mt-1">
          Udforsk anonymiserede, afsluttede cases med patientsamtykke. L&aelig;r af kollegaers vurderinger og styrk din faglige viden.
        </p>
      </div>

      {/* Search and filters */}
      <Card>
        <div className="space-y-4">
          <Input
            label="Søg i videnbasen"
            placeholder="Søg efter beskrivelse, diagnose eller anbefaling..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Speciale"
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
          </div>
        </div>
      </Card>

      <p className="text-sm text-gray-500">{filtered.length} cases fundet</p>

      {/* Selected case detail */}
      {selectedCase && (
        <Card className="border-blue-200 dark:border-blue-700">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Badge variant="info">{selectedCase.case_type?.replace('_', ' ') || 'Case'}</Badge>
              <span className="text-sm text-gray-500">
                {specialtyOptions.find((s) => s.value === selectedCase.specialty)?.label || selectedCase.specialty}
              </span>
            </div>
            <button
              onClick={() => setSelectedCase(null)}
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              Luk &times;
            </button>
          </div>

          <CardTitle>Patientbeskrivelse (anonymiseret)</CardTitle>
          <p className="text-gray-700 dark:text-gray-300 mt-2 whitespace-pre-wrap">{selectedCase.description}</p>

          {selectedCase.diagnosis && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">L&aelig;gens diagnosevurdering</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{selectedCase.diagnosis}</p>
            </div>
          )}

          {selectedCase.response_summary && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Anbefalede n&aelig;ste skridt</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{selectedCase.response_summary}</p>
            </div>
          )}

          <p className="text-xs text-gray-400 mt-4">
            Afsluttet: {new Date(selectedCase.created_at).toLocaleDateString('da-DK', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </Card>
      )}

      {/* Cases grid */}
      {filtered.length === 0 ? (
        <Card>
          <p className="text-gray-500 text-center py-8">Ingen cases matcher din søgning.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <Card
              key={c.id}
              className="cursor-pointer hover:ring-2 hover:ring-blue-200 transition-all"
              onClick={() => setSelectedCase(c)}
            >
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge variant="info">{c.case_type?.replace('_', ' ') || 'Case'}</Badge>
                <span className="text-xs text-gray-500">
                  {specialtyOptions.find((s) => s.value === c.specialty)?.label || c.specialty || 'Ikke angivet'}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-3">
                {c.description ? c.description.slice(0, 150) + (c.description.length > 150 ? '...' : '') : 'Ingen beskrivelse'}
              </p>
              {c.diagnosis && (
                <p className="text-xs text-gray-500 italic line-clamp-2">
                  Diagnose: {c.diagnosis.slice(0, 100)}{c.diagnosis.length > 100 ? '...' : ''}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-2">
                {new Date(c.created_at).toLocaleDateString('da-DK')}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
