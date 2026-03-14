import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

export const metadata = {
  title: 'GDPR & Privatlivspolitik - MedConsult',
}

export default function GdprPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">GDPR & Privatlivspolitik</h1>

        <div className="prose prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Dataansvarlig</h2>
            <p className="text-gray-700">
              MedConsult er dataansvarlig for behandling af personoplysninger på denne platform.
              Vi behandler sundhedsdata som særlig kategori (GDPR Art. 9) med skærpede sikkerhedsforanstaltninger.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. For læger</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Journaldata opbevares i minimum 10 år jf. Journalføringsbekendtgørelsen (BEK 713/2024)</li>
              <li>Journaler kan ikke slettes — kun arkiveres (soft-delete) for at sikre lovpligtig opbevaring</li>
              <li>Alle ændringer i journaler versioneres med fuld audit trail</li>
              <li>Adgangsloggen kan ikke deaktiveres og er tilgængelig for alle brugere</li>
              <li>Behandleridentifikation (navn + autorisations-ID) registreres ved enhver journalhandling</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. For virksomheder</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>CVR-nummer og firmaoplysninger opbevares til brug for vikariatadministration</li>
              <li>Virksomheden er selv dataansvarlig for persondata om egne medarbejdere</li>
              <li>MedConsult fungerer som databehandler for data der deles via platformen</li>
              <li>Databehandleraftale (DPA) indgås ved oprettelse af virksomhedskonto</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. For NGOer</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>NGO-profiler og frivillige opslag er synlige for alle platformens brugere</li>
              <li>NGOer kan til enhver tid fjerne deres opslag</li>
              <li>Ingen sundhedsdata håndteres direkte af NGO-funktionaliteten</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. For patienter</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Aktindsigt:</strong> Du har ret til at se dine journalnotater jf. Sundhedsloven §37</li>
              <li><strong>Adgangslog:</strong> Du kan se hvem der har tilgået dine data og hvornår</li>
              <li><strong>Samtykke:</strong> Du kan administrere og tilbagetrække samtykke til databehandling</li>
              <li><strong>Dataportabilitet:</strong> Du kan anmode om eksport af dine data i maskinlæsbart format</li>
              <li><strong>Sletning:</strong> Sundhedsdata er undtaget fra retten til sletning (GDPR Art. 17(3)(c)), men du kan anmode om begrænsning af behandling</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Sikkerhedsforanstaltninger</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Kryptering i transit (TLS) og at rest (AES-256)</li>
              <li>Row Level Security (RLS) på databaseniveau</li>
              <li>Automatisk audit logging af alle adgange til sundhedsdata</li>
              <li>Immutabel versionering af journaldata</li>
              <li>Regelmæssig backup og disaster recovery</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Lovgrundlag</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>GDPR Art. 6(1)(b) — nødvendig for kontraktopfyldelse</li>
              <li>GDPR Art. 9(2)(h) — sundhedsdata til behandlingsformål</li>
              <li>Sundhedsloven §§ 15-41 — journalføring og aktindsigt</li>
              <li>Journalføringsbekendtgørelsen BEK 713/2024 — krav til journalsystem</li>
              <li>Autorisationsloven § 21 — behandleridentifikation</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Kontakt</h2>
            <p className="text-gray-700">
              Spørgsmål om databeskyttelse kan rettes til vores DPO på{' '}
              <a href="mailto:dpo@medconsult.dk" className="text-blue-600 hover:underline">dpo@medconsult.dk</a>.
            </p>
            <p className="text-gray-700 mt-2">
              Klager kan indgives til Datatilsynet:{' '}
              <a href="https://www.datatilsynet.dk" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">www.datatilsynet.dk</a>
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
