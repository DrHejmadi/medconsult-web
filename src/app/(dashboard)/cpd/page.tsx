'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardTitle } from '@/components/ui/card'

type Tab = 'certifikater' | 'procedurer' | 'kurser'

interface CPDEntry {
  id: string
  entry_type: 'certifikat' | 'procedure' | 'kursus'
  name: string
  issuer: string | null
  provider: string | null
  date_obtained: string | null
  expiry_date: string | null
  status: string | null
  count: number | null
  last_performed: string | null
  competence_level: string | null
  date: string | null
  cpd_points: number | null
  created_at: string
}

const statusColor: Record<string, string> = {
  'Gyldig': 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400',
  'Udl\u00f8bet': 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400',
  'Udl\u00f8ber snart': 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
}

const competenceColor: Record<string, string> = {
  'Basalt': 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  'Selvst\u00e6ndigt': 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
  'Ekspert': 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
}

export default function CPDPage() {
  const [activeTab, setActiveTab] = useState<Tab>('certifikater')
  const [entries, setEntries] = useState<CPDEntry[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    async function fetchEntries() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data: result } = await supabase
        .from('cpd_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setEntries(result || [])
      setLoading(false)
    }
    fetchEntries()
  }, [])

  const certifikater = entries.filter((e) => e.entry_type === 'certifikat')
  const procedurer = entries.filter((e) => e.entry_type === 'procedure')
  const kurser = entries.filter((e) => e.entry_type === 'kursus')

  const totalCertifikater = certifikater.length
  const totalProcedurer = procedurer.reduce((sum, p) => sum + (p.count || 0), 0)
  const totalCPDPoints = kurser.reduce((sum, k) => sum + (k.cpd_points || 0), 0)

  const tabs: { key: Tab; label: string }[] = [
    { key: 'certifikater', label: 'Certifikater' },
    { key: 'procedurer', label: 'Procedurer' },
    { key: 'kurser', label: 'Kurser' },
  ]

  if (loading) return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Indl\u00e6ser...</div>

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kompetencelogbog</h1>
          <p className="text-gray-500">Hold styr p\u00e5 certifikater, procedurer og efteruddannelse</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
          Tilf\u00f8j registrering
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <p className="text-sm text-gray-500">Total certifikater</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{totalCertifikater}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Total procedurer</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{totalProcedurer}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">CPD point i alt</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{totalCPDPoints}</p>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'certifikater' && (
        <Card>
          <CardTitle>Certifikater</CardTitle>
          <div className="mt-4 space-y-3">
            {certifikater.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">Ingen certifikater registreret endnu.</p>
            ) : (
              certifikater.map((cert) => (
                <div key={cert.id} className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{cert.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{cert.issuer}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Opn\u00e5et: {cert.date_obtained} \u00b7 Udl\u00f8ber: {cert.expiry_date}</p>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColor[cert.status || ''] || 'bg-gray-100 text-gray-700'}`}>
                    {cert.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {activeTab === 'procedurer' && (
        <Card>
          <CardTitle>Procedurer</CardTitle>
          <div className="mt-4 space-y-3">
            {procedurer.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">Ingen procedurer registreret endnu.</p>
            ) : (
              procedurer.map((proc) => (
                <div key={proc.id} className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{proc.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Antal: {proc.count} \u00b7 Sidst udf\u00f8rt: {proc.last_performed}</p>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${competenceColor[proc.competence_level || ''] || 'bg-gray-100 text-gray-700'}`}>
                    {proc.competence_level}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {activeTab === 'kurser' && (
        <Card>
          <CardTitle>Kurser</CardTitle>
          <div className="mt-4 space-y-3">
            {kurser.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">Ingen kurser registreret endnu.</p>
            ) : (
              kurser.map((kursus) => (
                <div key={kursus.id} className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{kursus.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{kursus.provider}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Dato: {kursus.date}</p>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                    {kursus.cpd_points} point
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
