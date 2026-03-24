'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Footer } from '@/components/layout/footer'

interface FAQSection {
  id: string
  title: string
  content: React.ReactNode
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-5 w-5 text-gray-500 dark:text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}

function FAQItem({ section }: { section: FAQSection }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left"
      >
        <span className="text-base font-medium text-gray-900 dark:text-gray-100">{section.title}</span>
        <ChevronIcon open={open} />
      </button>
      {open && (
        <div className="pb-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed space-y-3">
          {section.content}
        </div>
      )}
    </div>
  )
}

const FAQ_SECTIONS: FAQSection[] = [
  {
    id: 'how-it-works',
    title: 'Hvordan fungerer det?',
    content: (
      <div className="space-y-2">
        <p>MedConsult forbinder dig med verificerede speciallæger i 5 enkle trin:</p>
        <ol className="list-decimal list-inside space-y-1.5 ml-1">
          <li><strong>Opret en sag</strong> — Beskriv din situation og upload relevant dokumentation</li>
          <li><strong>Vælg type</strong> — Vælg om du ønsker diagnoseforslag, second opinion, udredning eller behandlingsforslag</li>
          <li><strong>Betal</strong> — Sikker betaling via Stripe. Du betaler kun for den valgte ydelse</li>
          <li><strong>Vent på svar</strong> — En verificeret speciallæge gennemgår din sag grundigt</li>
          <li><strong>Modtag svar</strong> — Du får en skriftlig vurdering med konkrete anbefalinger</li>
        </ol>
      </div>
    ),
  },
  {
    id: 'pricing',
    title: 'Hvad koster det?',
    content: (
      <div className="space-y-2">
        <p>Vi tilbyder fire serviceniveauer:</p>
        <ul className="space-y-1.5 ml-1">
          <li><strong>Basis (299 kr)</strong> — Kort rådgivning med næste skridt</li>
          <li><strong>Standard (599 kr)</strong> — Asynkron konsultation på ca. 30 minutter</li>
          <li><strong>Udvidet (999 kr)</strong> — Fuld speciallægevurdering</li>
          <li><strong>Akut (1.499 kr)</strong> — Prioriteret respons inden for 4 timer</li>
        </ul>
        <p>Alle priser er inkl. moms. Du kan se en detaljeret prisoversigt under <Link href="/patient/payments" className="text-blue-600 dark:text-blue-400 hover:underline">Betalinger</Link>.</p>
      </div>
    ),
  },
  {
    id: 'security',
    title: 'Er det sikkert?',
    content: (
      <div className="space-y-2">
        <p>Ja. Vi tager din datasikkerhed meget alvorligt:</p>
        <ul className="list-disc list-inside space-y-1.5 ml-1">
          <li><strong>GDPR-compliance</strong> — Vi overholder fuldt ud EU&apos;s databeskyttelsesforordning</li>
          <li><strong>Kryptering</strong> — Al data transmitteres og opbevares krypteret (AES-256)</li>
          <li><strong>Verificerede læger</strong> — Alle læger er verificeret via Autorisationsregisteret (STPS)</li>
          <li><strong>Dansk hosting</strong> — Data opbevares i EU-datacenter i overensstemmelse med dansk lovgivning</li>
          <li><strong>Databehandleraftale</strong> — Vi har indgået databehandleraftale med alle underleverandører</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'dissatisfied',
    title: 'Hvad hvis jeg er utilfreds?',
    content: (
      <div className="space-y-2">
        <p>
          Hvis du er utilfreds med den modtagne rådgivning, kan du kontakte os på{' '}
          <a href="mailto:support@medconsult.dk" className="text-blue-600 dark:text-blue-400 hover:underline">
            support@medconsult.dk
          </a>{' '}
          inden for 14 dage. Vi gennemgår din sag og tilbyder en fornyet vurdering eller refundering efter en konkret vurdering.
        </p>
        <p>
          Du har desuden adgang til den formelle klageadgang beskrevet nedenfor.
        </p>
      </div>
    ),
  },
  {
    id: 'complaints',
    title: 'Klageadgang',
    content: (
      <div className="space-y-2">
        <p>Du har ret til at klage over den sundhedsfaglige behandling:</p>
        <ul className="list-disc list-inside space-y-1.5 ml-1">
          <li>
            <strong>Styrelsen for Patientklager (STPK)</strong> —{' '}
            <a href="https://stpk.dk" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
              stpk.dk
            </a>
          </li>
          <li>
            <strong>Patienterstatningen</strong> — For erstatningssager ved behandlingsskader
          </li>
          <li>
            <strong>Klagefrist</strong> — Du skal klage inden 2 år efter du blev bekendt med forholdet
          </li>
        </ul>
        <p className="text-xs text-gray-500 dark:text-gray-500">
          Klager behandles efter lov om klage- og erstatningsadgang inden for sundhedsvæsenet (KEL).
        </p>
      </div>
    ),
  },
  {
    id: 'contact',
    title: 'Kontakt',
    content: (
      <div className="space-y-2">
        <p>Du kan kontakte os på følgende måder:</p>
        <ul className="list-disc list-inside space-y-1.5 ml-1">
          <li>
            <strong>Generelle henvendelser:</strong>{' '}
            <a href="mailto:info@medconsult.dk" className="text-blue-600 dark:text-blue-400 hover:underline">
              info@medconsult.dk
            </a>
          </li>
          <li>
            <strong>Support og tekniske problemer:</strong>{' '}
            <a href="mailto:support@medconsult.dk" className="text-blue-600 dark:text-blue-400 hover:underline">
              support@medconsult.dk
            </a>
          </li>
        </ul>
        <p>Vi bestræber os på at svare inden for 1-2 hverdage.</p>
      </div>
    ),
  },
]

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Hjælp &amp; FAQ</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Svar på de mest stillede spørgsmål</p>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-6 space-y-6">
        <Card>
          {FAQ_SECTIONS.map((section) => (
            <FAQItem key={section.id} section={section} />
          ))}
        </Card>

        {/* Links to legal pages */}
        <Card>
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">Juridiske dokumenter</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link
              href="/disclaimer"
              className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 p-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <span className="text-lg">📄</span>
              Disclaimer
            </Link>
            <Link
              href="/informed-consent"
              className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 p-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <span className="text-lg">✅</span>
              Informeret samtykke
            </Link>
            <Link
              href="/behandlingssted"
              className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 p-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <span className="text-lg">🏥</span>
              Behandlingssted
            </Link>
          </div>
        </Card>
      </div>

      <Footer />
    </div>
  )
}
