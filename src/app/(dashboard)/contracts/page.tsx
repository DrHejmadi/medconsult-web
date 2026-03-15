'use client'

import { useState } from 'react'
import { Card, CardTitle } from '@/components/ui/card'

interface ContractTemplate {
  id: string
  name: string
  description: string
  icon: string
  content: string
}

const templates: ContractTemplate[] = [
  {
    id: 'vikaraftale',
    name: 'Vikaraftale',
    description: 'Standardaftale for vikariater mellem læge og institution.',
    icon: '📄',
    content: `VIKARAFTALE

Mellem:
  Vikar: [NAVN]
  CPR: [CPR-NUMMER]
  Adresse: [ADRESSE]

Og:
  Institution: [INSTITUTION]
  CVR: [CVR-NUMMER]
  Adresse: [INSTITUTIONS ADRESSE]

1. AFTALENS OMFANG
Vikaren påtager sig at udføre lægefagligt arbejde ved ovennævnte institution
i perioden [STARTDATO] til [SLUTDATO].

2. ARBEJDSTID
Normal arbejdstid er [ANTAL] timer pr. uge.
Vagter aftales separat.

3. HONORAR
Timesats: [BELØB] kr. pr. time ekskl. moms.
Fakturering sker [UGENTLIGT/MÅNEDLIGT].
Betalingsbetingelser: 30 dage netto.

4. FORSIKRING
Vikaren er ansvarlig for egen erhvervsansvarsforsikring.

5. TAVSHEDSPLIGT
Vikaren er underlagt tavshedspligt jf. sundhedslovens bestemmelser.

6. OPSIGELSE
Aftalen kan opsiges af begge parter med [ANTAL] dages varsel.

Dato: [DATO]

______________________          ______________________
Vikar                           Institution`,
  },
  {
    id: 'fortrolighed',
    name: 'Fortrolighedserklæring',
    description: 'Erklæring om fortrolighed og tavshedspligt.',
    icon: '🔒',
    content: `FORTROLIGHEDSERKLÆRING

Undertegnede:
  Navn: [NAVN]
  CPR: [CPR-NUMMER]

Erklærer hermed:

1. FORTROLIGHED
Jeg forpligter mig til at behandle alle oplysninger, som jeg får
kendskab til i forbindelse med mit arbejde ved [INSTITUTION],
fortroligt.

2. OMFANG
Fortrolighedspligten omfatter:
- Patientoplysninger
- Journaldata
- Interne arbejdsgange
- Forretningshemmeligheder
- Personaleoplysninger

3. VARIGHED
Fortrolighedspligten gælder under ansættelsen/vikariatet samt
i en periode på 2 år efter ophør.

4. OVERTRÆDELSE
Overtrædelse af denne erklæring kan medføre erstatningsansvar
og strafansvar jf. straffelovens § 152.

Dato: [DATO]
Sted: [STED]

______________________
Underskrift`,
  },
  {
    id: 'databehandler',
    name: 'Databehandleraftale',
    description: 'Aftale om behandling af persondata iht. GDPR.',
    icon: '🛡️',
    content: `DATABEHANDLERAFTALE

I henhold til Europa-Parlamentets og Rådets forordning (EU) 2016/679
(Databeskyttelsesforordningen/GDPR)

Mellem:
  Dataansvarlig: [INSTITUTION]
  CVR: [CVR-NUMMER]

Og:
  Databehandler: [NAVN / VIRKSOMHED]
  CVR: [CVR-NUMMER]

1. FORMÅL
Denne aftale regulerer databehandlerens behandling af personoplysninger
på vegne af den dataansvarlige.

2. KATEGORIER AF REGISTREREDE
- Patienter
- Sundhedspersonale
- Pårørende

3. TYPER AF PERSONOPLYSNINGER
- Almindelige personoplysninger (navn, adresse, CPR)
- Følsomme personoplysninger (helbredsoplysninger)

4. SIKKERHEDSFORANSTALTNINGER
Databehandleren skal implementere passende tekniske og
organisatoriske sikkerhedsforanstaltninger, herunder:
- Kryptering af data i transit og i hvile
- Adgangskontrol og logning
- Regelmæssig backup
- Sletning efter aftaleophør

5. UNDERDATABEHANDLERE
Databehandleren må ikke anvende underdatabehandlere uden
forudgående skriftlig godkendelse fra den dataansvarlige.

6. VARIGHED
Aftalen gælder så længe databehandleren behandler personoplysninger
på vegne af den dataansvarlige.

Dato: [DATO]

______________________          ______________________
Dataansvarlig                   Databehandler`,
  },
  {
    id: 'samarbejde',
    name: 'Samarbejdsaftale',
    description: 'Generel samarbejdsaftale mellem sundhedsprofessionelle.',
    icon: '🤝',
    content: `SAMARBEJDSAFTALE

Mellem:
  Part A: [NAVN / VIRKSOMHED]
  CVR: [CVR-NUMMER]

Og:
  Part B: [NAVN / VIRKSOMHED]
  CVR: [CVR-NUMMER]

1. BAGGRUND OG FORMÅL
Parterne ønsker at etablere et samarbejde om [BESKRIVELSE].

2. SAMARBEJDETS OMFANG
Samarbejdet omfatter:
- [YDELSE 1]
- [YDELSE 2]
- [YDELSE 3]

3. ØKONOMI
Honorar og betalingsbetingelser aftales separat for hver opgave.
Standardtimesats: [BELØB] kr. ekskl. moms.

4. ANSVARSFORDELING
Hver part er ansvarlig for kvaliteten af egne ydelser.
Begge parter skal have gyldig erhvervsansvarsforsikring.

5. TAVSHEDSPLIGT
Begge parter er underlagt gensidig tavshedspligt vedr.
forretningshemmeligheder og patientoplysninger.

6. VARIGHED OG OPSIGELSE
Aftalen træder i kraft [DATO] og løber indtil den opsiges
af en af parterne med 3 måneders varsel.

7. TVISTER
Eventuelle tvister søges løst ved forhandling.
Kan enighed ikke opnås, afgøres tvisten ved de ordinære domstole.

Dato: [DATO]

______________________          ______________________
Part A                          Part B`,
  },
]

export default function ContractsPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null)

  const handleDownload = (template: ContractTemplate) => {
    const blob = new Blob([template.content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${template.id}-skabelon.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Kontraktskabeloner</h1>
        <p className="text-gray-500">Vælg en skabelon for at generere en kontrakt</p>
      </div>

      {/* Template grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {templates.map((template) => (
          <Card
            key={template.id}
            className="cursor-pointer hover:border-blue-300 hover:shadow-md transition-all"
            onClick={() => setSelectedTemplate(template)}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-2xl flex-shrink-0">
                {template.icon}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{template.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{template.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Template preview */}
      {selectedTemplate && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <CardTitle>{selectedTemplate.name}</CardTitle>
            <div className="flex gap-2">
              <button
                onClick={() => handleDownload(selectedTemplate)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                Download som tekst
              </button>
              <button
                onClick={() => setSelectedTemplate(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                Luk
              </button>
            </div>
          </div>
          <pre className="whitespace-pre-wrap text-sm text-gray-800 bg-gray-50 rounded-lg p-4 border border-gray-200 font-mono leading-relaxed">
            {selectedTemplate.content}
          </pre>
        </Card>
      )}
    </div>
  )
}
