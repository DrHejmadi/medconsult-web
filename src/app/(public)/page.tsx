import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

export default function LandingPage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="bg-gradient-to-b from-blue-50 to-white py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Forbind læger med dem der har brug for dem
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              MedConsult gør det nemt at finde vikariater, frivillige muligheder og samarbejdspartnere
              i det danske sundhedsvæsen.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/signup"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Kom i gang gratis
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
            <div className="grid md:grid-cols-3 gap-8">
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

        {/* CTA */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Klar til at komme i gang?</h2>
            <p className="text-xl text-gray-600 mb-8">Opret en gratis konto og begynd at bruge MedConsult i dag.</p>
            <Link
              href="/signup"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Opret gratis konto
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
