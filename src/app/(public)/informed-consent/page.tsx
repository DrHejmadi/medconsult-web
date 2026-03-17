import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata = {
  title: 'Informeret samtykke - MedConsult',
}

export default function InformedConsentPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">Informeret samtykke</h1>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Hvad er informeret samtykke?</CardTitle>
            </CardHeader>
            <p className="text-gray-700 dark:text-gray-300">
              Informeret samtykke er et grundl&aelig;ggende princip i dansk sundhedslovgivning. Det betyder, at du som
              patient har ret til at modtage tilstr&aelig;kkelig information om en behandling, f&oslash;r du beslutter, om du
              vil give dit samtykke. Ved brug af MedConsult&apos;s digitale r&aring;dgivningsydelse g&aelig;lder de samme
              regler som ved fysisk fremmøde hos en l&aelig;ge.
            </p>
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              Retsgrundlag: Sundhedslovens &sect; 15-18 og GDPR Art. 7 (samtykke til databehandling).
            </p>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hvad giver du samtykke til?</CardTitle>
            </CardHeader>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>At en autoriseret dansk l&aelig;ge gennemg&aring;r de sundhedsoplysninger, du deler via platformen.</li>
              <li>At l&aelig;gen foretager en klinisk vurdering baseret p&aring; de fremsendte oplysninger.</li>
              <li>At der oprettes en elektronisk journal for din henvendelse i overensstemmelse med Journalf&oslash;ringsbekendtg&oslash;relsen.</li>
              <li>At dine sundhedsdata behandles og opbevares p&aring; sikre danske servere i henhold til GDPR Art. 9.</li>
              <li>At r&aring;dgivningen er asynkron og ikke erstatter akut l&aelig;gehj&aelig;lp (112) eller din egen l&aelig;ge.</li>
              <li>At platformen opkr&aelig;ver betaling for ydelsen jf. den valgte serviceniveau.</li>
            </ul>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dine rettigheder</CardTitle>
            </CardHeader>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li><strong>Ret til information:</strong> Du har ret til at f&aring; information om din helbredstilstand og behandlingsmuligheder jf. Sundhedslovens &sect; 16.</li>
              <li><strong>Ret til at frav&aelig;lge:</strong> Du kan til enhver tid v&aelig;lge ikke at modtage information eller afsl&aring; en foresl&aring;et behandling.</li>
              <li><strong>Ret til aktindsigt:</strong> Du har fuld aktindsigt i din journal jf. Sundhedslovens &sect; 37.</li>
              <li><strong>Ret til at klage:</strong> Du kan klage over behandlingen til Styrelsen for Patientklager.</li>
              <li><strong>Ret til second opinion:</strong> Du kan altid s&oslash;ge yderligere r&aring;dgivning hos en anden l&aelig;ge.</li>
              <li><strong>Ret til dataportabilitet:</strong> Du kan f&aring; udleveret dine data i maskinl&aelig;sbart format jf. GDPR Art. 20.</li>
            </ul>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tilbagetrækning af samtykke</CardTitle>
            </CardHeader>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Du kan til enhver tid tilbagetr&aelig;kke dit samtykke til databehandling jf. GDPR Art. 7(3).
              Bem&aelig;rk dog f&oslash;lgende begr&aelig;nsninger:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Journaldata kan ikke slettes, da de er underlagt Journalf&oslash;ringsbekendtg&oslash;relsens krav om minimum 10 &aring;rs opbevaring.</li>
              <li>Tilbagetrækning p&aring;virker ikke lovligheden af den databehandling, der er sket f&oslash;r tilbagetrækningen.</li>
              <li>Du kan anmode om begr&aelig;nsning af behandling af dine data jf. GDPR Art. 18.</li>
            </ul>
            <div className="mt-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                For at tilbagetr&aelig;kke dit samtykke, kontakt os p&aring;{' '}
                <a href="mailto:samtykke@medconsult.dk" className="underline">samtykke@medconsult.dk</a>{' '}
                eller via dine kontoindstillinger.
              </p>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lovgivningsreferencer</CardTitle>
            </CardHeader>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Sundhedslovens &sect; 15 — Samtykke til behandling</li>
              <li>Sundhedslovens &sect; 16 — Informationspligt</li>
              <li>Sundhedslovens &sect; 17 — Mindreåriges samtykke</li>
              <li>Sundhedslovens &sect; 18 — Samtykke for varigt inhabile</li>
              <li>GDPR Art. 7 — Betingelser for samtykke</li>
              <li>GDPR Art. 9 — Behandling af s&aelig;rlige kategorier af personoplysninger</li>
            </ul>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  )
}
