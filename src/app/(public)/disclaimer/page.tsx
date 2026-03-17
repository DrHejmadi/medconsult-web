import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

export const metadata = {
  title: 'Juridisk disclaimer - MedConsult',
}

export default function DisclaimerPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">Juridisk disclaimer og ansvarsfraskrivelse</h1>

        <div className="prose prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Om MedConsult&apos;s r&aring;dgivningsydelse</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>MedConsult formidler kontakt mellem patienter og autoriserede danske l&aelig;ger til asynkron, klinisk ekspertvurdering.</li>
              <li>R&aring;dgivningen erstatter IKKE kontakt med din egen l&aelig;ge, vagtl&aelig;ge eller 112 ved akutte tilstande.</li>
              <li>MedConsult er registreret som digitalt behandlingssted jf. Sundhedslovens &sect; 213d.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Klinisk ansvar</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Den behandlende l&aelig;ge er personligt ansvarlig for sin vurdering jf. Autorisationslovens &sect; 17 om omhu og samvittighedsfuldhed.</li>
              <li>L&aelig;gen er autoriseret og verificeret via Autorisationsregisteret (STPS).</li>
              <li>Vurderingen udg&oslash;r sundhedsfaglig virksomhed i Autorisationslovens forstand.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Patientrettigheder</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Du har ret til informeret samtykke jf. Sundhedslovens &sect; 15-18.</li>
              <li>Du har ret til aktindsigt i din journal jf. Sundhedslovens &sect; 37.</li>
              <li>Du kan klage til Styrelsen for Patientklager.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Datasikkerhed</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Al sundhedsdata behandles i overensstemmelse med GDPR Art. 9 (s&aelig;rlige kategorier af personoplysninger).</li>
              <li>Data opbevares p&aring; danske servere med kryptering.</li>
              <li>Databehandleraftale jf. GDPR Art. 28 er indg&aring;et med alle underleverand&oslash;rer.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Journalf&oslash;ring</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Journalf&oslash;ring sker i overensstemmelse med Journalf&oslash;ringsbekendtg&oslash;relsen (BEK nr. 1361 af 24/11/2025).</li>
              <li>Journaler opbevares i minimum 10 &aring;r jf. bekendtg&oslash;relsens krav.</li>
              <li>Elektroniske journaler har fuld versionering &mdash; oprindelige data kan ikke slettes eller overskrives.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Kontakt og tilsyn</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>
                Styrelsen for Patientsikkerhed:{' '}
                <a href="https://stps.dk" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">stps.dk</a>
              </li>
              <li>
                Datatilsynet:{' '}
                <a href="https://datatilsynet.dk" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">datatilsynet.dk</a>
              </li>
              <li>
                Styrelsen for Patientklager:{' '}
                <a href="https://stpk.dk" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">stpk.dk</a>
              </li>
            </ul>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
