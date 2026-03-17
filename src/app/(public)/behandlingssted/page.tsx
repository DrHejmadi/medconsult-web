import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata = {
  title: 'Registreret behandlingssted - MedConsult',
}

export default function BehandlingsstedPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">Registreret behandlingssted</h1>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Om MedConsult som behandlingssted</CardTitle>
            </CardHeader>
            <p className="text-gray-700 dark:text-gray-300">
              MedConsult er registreret som digitalt behandlingssted hos Styrelsen for Patientsikkerhed (STPS)
              i henhold til Sundhedslovens bestemmelser om behandlingssteder. Som registreret behandlingssted
              er MedConsult underlagt de samme krav til kvalitet, sikkerhed og tilsyn som fysiske behandlingssteder.
            </p>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>STPS-registrering</CardTitle>
            </CardHeader>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li><strong>Behandlingsstedsnavn:</strong> MedConsult ApS</li>
              <li><strong>Registreringsnummer:</strong> [Afventer endelig registrering]</li>
              <li><strong>Type:</strong> Digitalt behandlingssted — asynkron klinisk r&aring;dgivning</li>
              <li><strong>Registreringsdato:</strong> [Inds&aelig;ttes ved godkendelse]</li>
            </ul>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Registreringen kan verificeres p&aring;{' '}
              <a href="https://stps.dk/da/registrering-af-behandlingssteder" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                STPS&apos; register over behandlingssteder
              </a>.
            </p>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gebyrinformation</CardTitle>
            </CardHeader>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>&Aring;rligt registreringsgebyr betales til STPS jf. g&aelig;ldende takster.</li>
              <li>Gebyret d&aelig;kker tilsyn, registrering og l&oslash;bende kontrol af behandlingsstedets virksomhed.</li>
              <li>Gebyrstørrelsen afh&aelig;nger af behandlingsstedets type og omfang.</li>
            </ul>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tilsynsordning</CardTitle>
            </CardHeader>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Som registreret behandlingssted er MedConsult underlagt tilsyn fra Styrelsen for Patientsikkerhed.
              Tilsynet sikrer, at behandlingsstedet overholder g&aelig;ldende lovgivning og opretholder h&oslash;j kvalitet i patientbehandlingen.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Risikobaseret tilsyn fra STPS kan finde sted b&aring;de planlagt og uanmeldt.</li>
              <li>Alle l&aelig;ger tilknyttet platformen er autoriserede og verificeret via Autorisationsregisteret.</li>
              <li>MedConsult f&oslash;rer intern kvalitetskontrol og h&aelig;ndelsesrapportering.</li>
              <li>Utilsigtede h&aelig;ndelser rapporteres via Dansk Patientsikkerhedsdatabase (DPSD).</li>
            </ul>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  )
}
