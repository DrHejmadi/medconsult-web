'use client'

import { useState } from 'react'
import { Card, CardTitle } from '@/components/ui/card'

type Tab = 'certifikater' | 'procedurer' | 'kurser'

interface Certifikat {
  id: string
  name: string
  issuer: string
  dateObtained: string
  expiryDate: string
  status: 'Gyldig' | 'Udløbet' | 'Udløber snart'
}

interface Procedure {
  id: string
  name: string
  count: number
  lastPerformed: string
  competenceLevel: 'Basalt' | 'Selvstændigt' | 'Ekspert'
}

interface Kursus {
  id: string
  name: string
  provider: string
  date: string
  cpdPoints: number
}

const certifikater: Certifikat[] = [
  { id: '1', name: 'ALS (Advanced Life Support)', issuer: 'Dansk Råd for Genoplivning', dateObtained: '2024-09-15', expiryDate: '2026-09-15', status: 'Gyldig' },
  { id: '2', name: 'ATLS (Advanced Trauma Life Support)', issuer: 'American College of Surgeons', dateObtained: '2023-03-10', expiryDate: '2027-03-10', status: 'Gyldig' },
  { id: '3', name: 'ABCDE-kursus', issuer: 'Region Hovedstaden', dateObtained: '2025-01-20', expiryDate: '2027-01-20', status: 'Gyldig' },
  { id: '4', name: 'Akut ultralyd (POCUS)', issuer: 'Dansk Selskab for Akutmedicin', dateObtained: '2024-06-05', expiryDate: '2026-06-05', status: 'Udløber snart' },
  { id: '5', name: 'NLS (Neonatal Life Support)', issuer: 'Dansk Råd for Genoplivning', dateObtained: '2022-11-01', expiryDate: '2024-11-01', status: 'Udløbet' },
  { id: '6', name: 'EPALS (European Paediatric ALS)', issuer: 'European Resuscitation Council', dateObtained: '2025-02-14', expiryDate: '2027-02-14', status: 'Gyldig' },
]

const procedurer: Procedure[] = [
  { id: '1', name: 'Ultralyd-guidet IV-adgang', count: 87, lastPerformed: '2026-03-10', competenceLevel: 'Ekspert' },
  { id: '2', name: 'Lumbalpunktur', count: 34, lastPerformed: '2026-02-28', competenceLevel: 'Selvstændigt' },
  { id: '3', name: 'Pleuradræn anlæggelse', count: 12, lastPerformed: '2026-01-15', competenceLevel: 'Selvstændigt' },
  { id: '4', name: 'Endotrakeal intubation', count: 56, lastPerformed: '2026-03-08', competenceLevel: 'Ekspert' },
  { id: '5', name: 'Central venøs kateter (CVK)', count: 23, lastPerformed: '2026-02-20', competenceLevel: 'Selvstændigt' },
  { id: '6', name: 'Ascitespunktur', count: 8, lastPerformed: '2025-12-10', competenceLevel: 'Basalt' },
]

const kurser: Kursus[] = [
  { id: '1', name: 'Akut abdomen – diagnostik og behandling', provider: 'Dansk Kirurgisk Selskab', date: '2026-02-10', cpdPoints: 12 },
  { id: '2', name: 'Antibiotikavejledning i klinisk praksis', provider: 'Rigshospitalet', date: '2025-11-22', cpdPoints: 6 },
  { id: '3', name: 'Palliativ medicin – grundkursus', provider: 'Dansk Selskab for Palliativ Medicin', date: '2025-09-05', cpdPoints: 18 },
  { id: '4', name: 'Lederuddannelse for yngre læger', provider: 'Lægeforeningen', date: '2025-06-15', cpdPoints: 24 },
  { id: '5', name: 'POCUS – avanceret hjerte-ultralyd', provider: 'Dansk Selskab for Akutmedicin', date: '2026-01-18', cpdPoints: 15 },
  { id: '6', name: 'Simulationsbaseret teamtræning', provider: 'Copenhagen Academy for Medical Education', date: '2025-10-30', cpdPoints: 8 },
]

const statusColor: Record<Certifikat['status'], string> = {
  'Gyldig': 'bg-green-50 text-green-700',
  'Udløbet': 'bg-red-50 text-red-700',
  'Udløber snart': 'bg-yellow-50 text-yellow-700',
}

const competenceColor: Record<Procedure['competenceLevel'], string> = {
  'Basalt': 'bg-gray-100 text-gray-700',
  'Selvstændigt': 'bg-blue-50 text-blue-700',
  'Ekspert': 'bg-purple-50 text-purple-700',
}

export default function CPDPage() {
  const [activeTab, setActiveTab] = useState<Tab>('certifikater')

  const totalCertifikater = certifikater.length
  const totalProcedurer = procedurer.reduce((sum, p) => sum + p.count, 0)
  const totalCPDPoints = kurser.reduce((sum, k) => sum + k.cpdPoints, 0)

  const tabs: { key: Tab; label: string }[] = [
    { key: 'certifikater', label: 'Certifikater' },
    { key: 'procedurer', label: 'Procedurer' },
    { key: 'kurser', label: 'Kurser' },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kompetencelogbog</h1>
          <p className="text-gray-500">Hold styr på certifikater, procedurer og efteruddannelse</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
          Tilføj registrering
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
      <div className="flex gap-1 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
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
            {certifikater.map((cert) => (
              <div key={cert.id} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{cert.name}</p>
                  <p className="text-sm text-gray-500">{cert.issuer}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Opnået: {cert.dateObtained} · Udløber: {cert.expiryDate}</p>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColor[cert.status]}`}>
                  {cert.status}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'procedurer' && (
        <Card>
          <CardTitle>Procedurer</CardTitle>
          <div className="mt-4 space-y-3">
            {procedurer.map((proc) => (
              <div key={proc.id} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{proc.name}</p>
                  <p className="text-sm text-gray-500">Antal: {proc.count} · Sidst udført: {proc.lastPerformed}</p>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${competenceColor[proc.competenceLevel]}`}>
                  {proc.competenceLevel}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'kurser' && (
        <Card>
          <CardTitle>Kurser</CardTitle>
          <div className="mt-4 space-y-3">
            {kurser.map((kursus) => (
              <div key={kursus.id} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{kursus.name}</p>
                  <p className="text-sm text-gray-500">{kursus.provider}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Dato: {kursus.date}</p>
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-700">
                  {kursus.cpdPoints} point
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
