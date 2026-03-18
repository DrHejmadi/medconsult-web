import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

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
        <section className="bg-gradient-to-b from-blue-50 to-white py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-block bg-blue-100 text-blue-800 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
              Forventet lancering: 1. maj 2026
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Den komplette sundhedsplatform for Danmark
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
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
                className="bg-white text-gray-700 px-8 py-3 rounded-lg text-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Læs mere
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">Alt hvad du har brug for</h2>
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
                <div key={feature.title} className="bg-white rounded-xl border border-gray-200 p-6">
                  <span className="text-3xl mb-4 block">{feature.icon}</span>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* For whom */}
        <section className="bg-gray-50 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">For hvem?</h2>
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
                <div key={role.title} className="bg-white rounded-xl border border-gray-200 p-6">
                  <span className="text-3xl mb-4 block">{role.icon}</span>
                  <h3 className="text-lg font-semibold mb-4">{role.title}</h3>
                  <ul className="space-y-2">
                    {role.points.map((point) => (
                      <li key={point} className="flex items-start gap-2 text-gray-600">
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
        <section className="bg-blue-50 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-4">Funktioner ved lancering</h2>
            <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto">
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
                <div key={item.label} className={`rounded-lg border px-4 py-3 flex items-center gap-3 ${item.ready ? 'bg-white border-green-200' : 'bg-gray-50 border-blue-100'}`}>
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-sm font-medium text-gray-700">{item.label}</span>
                  {item.ready ? (
                    <span className="ml-auto text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full whitespace-nowrap">Klar</span>
                  ) : (
                    <span className="ml-auto text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full whitespace-nowrap">Kommer snart</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Vær med fra starten</h2>
            <p className="text-xl text-gray-600 mb-2">MedConsult lanceres 1. maj 2026.</p>
            <p className="text-lg text-gray-500 mb-8">Tilmeld dig nu og få tidlig adgang til platformen.</p>
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
