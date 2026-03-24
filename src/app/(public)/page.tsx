import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

const caseTypes = [
  {
    icon: '🔍',
    title: 'Diagnoseforslag',
    description: 'Få et kvalificeret bud på din diagnose',
  },
  {
    icon: '🔄',
    title: 'Second opinion',
    description: 'Få en uafhængig vurdering af din eksisterende diagnose',
  },
  {
    icon: '📋',
    title: 'Udredningsforslag',
    description: 'Få forslag til hvad der bør undersøges',
  },
  {
    icon: '💊',
    title: 'Behandlingsforslag',
    description: 'Få anbefalinger til behandlingsmuligheder',
  },
  {
    icon: '💬',
    title: 'Kommunikationsrådgivning',
    description: 'Få hjælp til dialog med egen læge eller sygehus',
  },
]

const steps = [
  {
    number: '1',
    title: 'Opret en sag',
    description: 'Beskriv din sygehistorie og upload relevante dokumenter',
  },
  {
    number: '2',
    title: 'Vælg serviceniveau',
    description: 'Vælg sagstype, speciale og svartid',
  },
  {
    number: '3',
    title: 'Lægen gennemgår',
    description: 'En verificeret dansk læge gennemgår din sag grundigt',
  },
  {
    number: '4',
    title: 'Modtag vurdering',
    description: 'Få en skriftlig, sporbar vurdering du kan handle på',
  },
]

export default function LandingPage() {
  return (
    <>
      <Header />
      <main>
        {/* Launch banner */}
        <div className="bg-blue-600 text-white text-center py-3 px-4">
          <p className="text-sm font-medium">
            Vi forventer at lancere MedConsult <span className="font-bold">1. maj 2026</span> — tilmeld dig allerede nu og vær blandt de første brugere!
          </p>
        </div>

        {/* Hero */}
        <section className="bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-block bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
              Forventet lancering: 1. maj 2026
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Den komplette sundhedsplatform for Danmark
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              MedConsult forbinder patienter med verificerede danske læger til asynkron klinisk ekspertvurdering,
              og giver læger en samlet platform til vikariater, journaler, kompetencer og samarbejde.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/signup"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Tilmeld dig til lancering
              </Link>
              <Link
                href="#features"
                className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-8 py-3 rounded-lg text-lg font-medium border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Læs mere
              </Link>
            </div>
          </div>
        </section>

        {/* Patient CTA */}
        <section className="bg-gradient-to-b from-white to-blue-50 dark:from-gray-950 dark:to-gray-900 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-block bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
              For patienter
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Få en ekspertvurdering fra en dansk læge
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
              Vælg mellem diagnoseforslag, second opinion, udredningsforslag, behandlingsforslag eller kommunikationsrådgivning
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
              <Link
                href="/signup"
                className="bg-green-600 text-white px-8 py-3.5 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20"
              >
                Opret din første sag
              </Link>
              <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                Fra 299 kr
              </span>
            </div>
          </div>
        </section>

        {/* Case type cards */}
        <section className="bg-blue-50 dark:bg-gray-900 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-10">
              Hvilken hjælp har du brug for?
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {caseTypes.map((caseType) => (
                <div
                  key={caseType.title}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all"
                >
                  <span className="text-4xl mb-4 block">{caseType.icon}</span>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {caseType.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {caseType.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-20 bg-white dark:bg-gray-950">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-4">
              Sådan fungerer det
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-xl mx-auto">
              Fire enkle trin fra sag til svar
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step) => (
                <div key={step.number} className="text-center">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    {step.number}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-20 bg-gray-50 dark:bg-gray-900">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">Alt hvad du har brug for</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: '📋',
                  title: 'Lovpligtig journalføring',
                  description: 'SOAP-notater med fuld versionering, behandleridentifikation og uafviselig auditlog — i overensstemmelse med Journalføringsbekendtgørelsen.',
                },
                {
                  icon: '📌',
                  title: 'Vikariater & opslag',
                  description: 'Virksomheder og NGOer opretter opslag. Læger finder relevante muligheder filtreret på speciale, region og vagttype.',
                },
                {
                  icon: '💬',
                  title: 'Sikker kommunikation',
                  description: 'Beskeder mellem læger, virksomheder og NGOer — alt inden for platformens sikre rammer.',
                },
                {
                  icon: '🔒',
                  title: 'GDPR & datasikkerhed',
                  description: 'Sundhedsdata håndteres efter GDPR Art. 9 og dansk sundhedslovgivning med kryptering og adgangskontrol.',
                },
                {
                  icon: '💚',
                  title: 'NGO & frivilligt arbejde',
                  description: 'Særlig sektion for NGOer der søger frivillige læger til humanitære projekter i Danmark og udlandet.',
                },
                {
                  icon: '👤',
                  title: 'Patientrettigheder',
                  description: 'Patienter kan anmode om aktindsigt, se adgangslog og administrere samtykke via patientportalen.',
                },
                {
                  icon: '📄',
                  title: 'Dokumenthåndtering',
                  description: 'Upload og administrer CV, certifikater, forsikringsbeviser og autorisationsdokumenter direkte i platformen.',
                },
                {
                  icon: '⏱️',
                  title: 'Tidsregistrering & fakturering',
                  description: 'Registrer timer per vagt, generer fakturaer og beregn løn efter PLO/PLA-overenskomsten.',
                },
                {
                  icon: '📝',
                  title: 'Kontrakt-skabeloner',
                  description: 'Vikaraftaler, fortrolighedserklæringer og databehandleraftaler — klar til brug med automatisk udfyldning.',
                },
              ].map((feature) => (
                <div key={feature.title} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <span className="text-3xl mb-4 block">{feature.icon}</span>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* For whom */}
        <section className="bg-gray-50 dark:bg-gray-900 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">For hvem?</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: '🩺',
                  title: 'Læger',
                  points: ['Find vikariater der matcher dit speciale', 'Lovpligtig journalføring med SOAP', 'Meld dig til frivilligt arbejde via NGOer'],
                },
                {
                  icon: '🏢',
                  title: 'Virksomheder',
                  points: ['Opret opslag for vikariater', 'Find kvalificerede læger hurtigt', 'Administrer tilmeldinger og vagter'],
                },
                {
                  icon: '💚',
                  title: 'NGOer',
                  points: ['Opret frivillige opslag', 'Find læger til humanitære projekter', 'Gratis platform for non-profit'],
                },
                {
                  icon: '🧑‍⚕️',
                  title: 'Patienter',
                  points: ['Få asynkron klinisk ekspertvurdering', 'Vælg serviceniveau og speciale', 'Fuld aktindsigt og klageadgang'],
                },
              ].map((role) => (
                <div key={role.title} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <span className="text-3xl mb-4 block">{role.icon}</span>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{role.title}</h3>
                  <ul className="space-y-2">
                    {role.points.map((point) => (
                      <li key={point} className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                        <span className="text-green-500 mt-0.5">✓</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Coming Soon */}
        <section className="bg-blue-50 dark:bg-gray-900 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-4">Funktioner ved lancering</h2>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
              Vi har allerede bygget en lang række funktioner til lanceringen 1. maj 2026 — og flere er på vej
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { icon: '🏥', label: 'ICD-10 diagnosekodning', ready: true },
                { icon: '💰', label: 'Lønberegner (PLO/PLA-takster)', ready: true },
                { icon: '📄', label: 'Dokumenthåndtering', ready: true },
                { icon: '⏱️', label: 'Tidsregistrering', ready: true },
                { icon: '📝', label: 'Kontraktskabeloner', ready: true },
                { icon: '⭐', label: 'Anmeldelser og ratings', ready: true },
                { icon: '📅', label: 'Kalender', ready: true },
                { icon: '🚑', label: 'Akut vikar-matching', ready: true },
                { icon: '🔄', label: 'Vagtbytte-markedsplads', ready: true },
                { icon: '🎓', label: 'CPD-tracker (kompetencelogbog)', ready: true },
                { icon: '🌙', label: 'Dark mode', ready: true },
                { icon: '🔔', label: 'Push-notifikationer', ready: true },
                { icon: '📊', label: 'Analyser og indsigter', ready: true },
                { icon: '🩺', label: 'Patient-konsultationer (asynkron)', ready: true },
                { icon: '💳', label: 'Betalingssystem (Stripe/PSD2)', ready: true },
                { icon: '⚖️', label: 'Klagevejledning og patienterstatning', ready: true },
                { icon: '📜', label: 'Databehandleraftale', ready: true },
                { icon: '👁️', label: 'Læseadgangslog (GDPR)', ready: true },
                { icon: '✅', label: 'Granulært samtykke-flow', ready: true },
                { icon: '🤖', label: 'AI-assisteret triage', ready: false },
                { icon: '🔐', label: 'MitID Erhverv login', ready: false },
                { icon: '✅', label: 'STPS autorisationsverificering', ready: false },
                { icon: '💊', label: 'FMK medicinliste (read-only)', ready: false },
              ].map((item) => (
                <div key={item.label} className={`rounded-lg border px-4 py-3 flex items-center gap-3 ${item.ready ? 'bg-white dark:bg-gray-800 border-green-200 dark:border-green-800' : 'bg-gray-50 dark:bg-gray-800/50 border-blue-100 dark:border-blue-900'}`}>
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
                  {item.ready ? (
                    <span className="ml-auto text-xs font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/50 px-2 py-0.5 rounded-full whitespace-nowrap">Klar</span>
                  ) : (
                    <span className="ml-auto text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/50 px-2 py-0.5 rounded-full whitespace-nowrap">Kommer snart</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-white dark:bg-gray-950">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Vær med fra starten</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">MedConsult lanceres 1. maj 2026.</p>
            <p className="text-lg text-gray-500 dark:text-gray-400 mb-8">Tilmeld dig nu og få tidlig adgang til platformen.</p>
            <Link
              href="/signup"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Tilmeld dig til lancering
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
