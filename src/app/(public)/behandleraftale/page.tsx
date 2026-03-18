import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

export const metadata = {
  title: 'Databehandleraftale - MedConsult',
}

export default function BehandleraftalePage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">Databehandleraftale</h1>

        <div className="prose prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Dataansvar p&aring; MedConsult</h2>
            <p className="text-gray-700 dark:text-gray-300">
              P&aring; MedConsult er ansvaret for persondata fordelt mellem flere parter i overensstemmelse med GDPR og dansk sundhedslovgivning.
              Denne side beskriver, hvordan dataansvaret er organiseret, og hvilke aftaler der er indg&aring;et for at beskytte dine personoplysninger.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">MedConsult som Dataansvarlig</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>MedConsult er Dataansvarlig for platformens drift og behandling af patientdata i forbindelse med formidling af sundhedsydelser.</li>
              <li>Vi bestemmer form&aring;let med og midlerne til behandling af personoplysninger p&aring; platformen jf. GDPR Art. 4(7).</li>
              <li>Behandlingsgrundlaget er GDPR Art. 6(1)(b) (kontraktopfyldelse) og Art. 9(2)(h) (sundhedsbehandling).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">L&aelig;ger som selvst&aelig;ndige Dataansvarlige</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>L&aelig;ger tilknyttet MedConsult er selvst&aelig;ndige Dataansvarlige for deres journalf&oslash;ring jf. Journalf&oslash;ringsbekendtg&oslash;relsen (BEK nr. 1361 af 24/11/2025).</li>
              <li>L&aelig;gen har det personlige ansvar for, at journalf&oslash;ringen sker korrekt og i overensstemmelse med g&aelig;ldende regler.</li>
              <li>L&aelig;gen er underlagt Autorisationslovens &sect; 17 om omhu og samvittighedsfuldhed.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">MedConsult som Databehandler</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>MedConsult fungerer som Databehandler for den tekniske drift af platformens journalsystem og datainfrastruktur.</li>
              <li>Som Databehandler behandler MedConsult kun personoplysninger efter dokumenteret instruks fra den Dataansvarlige jf. GDPR Art. 28.</li>
              <li>Der er implementeret passende tekniske og organisatoriske sikkerhedsforanstaltninger, herunder kryptering, adgangskontrol og audit logging.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">F&aelig;lles dataansvar (GDPR Art. 26)</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>I visse tilf&aelig;lde er MedConsult og den behandlende l&aelig;ge f&aelig;lles Dataansvarlige jf. GDPR Art. 26.</li>
              <li>Der er indg&aring;et aftaler om f&aelig;lles dataansvar, som fastl&aelig;gger de respektive parters ansvar for at overholde GDPR-forpligtelserne.</li>
              <li>Patienten kan udøve sine rettigheder over for begge parter uanset den interne ansvarsfordeling.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Underleverand&oslash;rer og underdatabehandlere</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Der er indg&aring;et databehandleraftaler (GDPR Art. 28) med alle underleverand&oslash;rer, herunder Supabase (database og autentificering) og Stripe (betalingsafvikling).</li>
              <li>Underleverand&oslash;rer er forpligtede til at overholde samme sikkerhedsniveau som MedConsult.</li>
              <li>Data overf&oslash;res kun til tredjelande, hvis der foreligger et gyldigt overf&oslash;rselsgrundlag jf. GDPR kapitel V.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Dine rettigheder</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Du har ret til indsigt i, hvem der behandler dine personoplysninger jf. GDPR Art. 15.</li>
              <li>Du kan anmode om en oversigt over underleverand&oslash;rer og underdatabehandlere.</li>
              <li>Du har ret til at vide, hvilke kategorier af data der behandles, og til hvilke form&aring;l.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Kontakt</h2>
            <p className="text-gray-700 dark:text-gray-300">
              Sp&oslash;rgsm&aring;l vedr&oslash;rende databehandling og databehandleraftaler kan rettes til vores DPO (Data Protection Officer) p&aring;{' '}
              <a href="mailto:dpo@medconsult.dk" className="text-blue-600 hover:underline">dpo@medconsult.dk</a>.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mt-2">
              Klager over databehandling kan indgives til Datatilsynet:{' '}
              <a href="https://www.datatilsynet.dk" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">www.datatilsynet.dk</a>.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
