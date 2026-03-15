export interface ICD10Code {
  code: string
  description: string
}

export const icd10Codes: ICD10Code[] = [
  // Infektionssygdomme
  { code: 'DA09', description: 'Gastroenteritis og colitis, uspecificeret' },
  { code: 'DA49', description: 'Bakterieinfektion, uspecificeret' },
  { code: 'DA69', description: 'Spirokætinfektion, uspecificeret' },
  { code: 'DB34', description: 'Virusinfektion, uspecificeret' },

  // Neoplasmer
  { code: 'DC44', description: 'Anden malign neoplasme i huden' },
  { code: 'DC50', description: 'Malign neoplasme i bryst' },
  { code: 'DD22', description: 'Melanocytært nævus' },

  // Endokrine sygdomme
  { code: 'DE03', description: 'Hypothyreose, anden' },
  { code: 'DE04', description: 'Struma, uspecificeret' },
  { code: 'DE05', description: 'Thyreotoksikose' },
  { code: 'DE10', description: 'Type 1-diabetes mellitus' },
  { code: 'DE11', description: 'Type 2-diabetes mellitus' },
  { code: 'DE66', description: 'Adipositas (overvægt)' },
  { code: 'DE78', description: 'Dyslipidæmi' },

  // Psykiske lidelser
  { code: 'DF10', description: 'Psykiske lidelser pga. alkohol' },
  { code: 'DF17', description: 'Psykiske lidelser pga. tobak (nikotinafhængighed)' },
  { code: 'DF20', description: 'Skizofreni' },
  { code: 'DF31', description: 'Bipolar affektiv sindslidelse' },
  { code: 'DF32', description: 'Depressiv enkeltepisode' },
  { code: 'DF33', description: 'Periodisk depression' },
  { code: 'DF40', description: 'Fobisk angst' },
  { code: 'DF41', description: 'Angst og panikangst' },
  { code: 'DF43', description: 'Belastnings- og tilpasningsreaktion' },
  { code: 'DF45', description: 'Somatoforme tilstande' },
  { code: 'DF51', description: 'Søvnforstyrrelser, ikke-organiske' },

  // Nervesystemet
  { code: 'DG43', description: 'Migræne' },
  { code: 'DG44', description: 'Andre hovedpinesyndromer' },
  { code: 'DG47', description: 'Søvnforstyrrelser' },

  // Øjensygdomme
  { code: 'DH10', description: 'Conjunctivitis (øjenbetændelse)' },
  { code: 'DH65', description: 'Otitis media serøs' },
  { code: 'DH66', description: 'Otitis media purulenta' },

  // Kredsløbssygdomme
  { code: 'DI10', description: 'Essentiel hypertension' },
  { code: 'DI20', description: 'Angina pectoris' },
  { code: 'DI21', description: 'Akut myokardieinfarkt' },
  { code: 'DI25', description: 'Kronisk iskæmisk hjertesygdom' },
  { code: 'DI48', description: 'Atrieflimren og atrieflagren' },
  { code: 'DI50', description: 'Hjerteinsufficiens' },
  { code: 'DI63', description: 'Hjerneinfarkt' },
  { code: 'DI83', description: 'Varicer på underekstremiteterne' },

  // Luftvejssygdomme
  { code: 'DJ00', description: 'Akut nasopharyngitis (forkølelse)' },
  { code: 'DJ01', description: 'Akut sinuitis' },
  { code: 'DJ02', description: 'Akut pharyngitis (halsbetændelse)' },
  { code: 'DJ03', description: 'Akut tonsillitis' },
  { code: 'DJ06', description: 'Akut øvre luftvejsinfektion, uspecificeret' },
  { code: 'DJ18', description: 'Pneumoni, uspecificeret' },
  { code: 'DJ20', description: 'Akut bronkitis' },
  { code: 'DJ44', description: 'KOL (kronisk obstruktiv lungesygdom)' },
  { code: 'DJ45', description: 'Astma' },

  // Fordøjelsessygdomme
  { code: 'DK21', description: 'Gastro-øsofageal reflukssygdom' },
  { code: 'DK25', description: 'Ulcus ventriculi (mavesår)' },
  { code: 'DK29', description: 'Gastritis og duodenitis' },
  { code: 'DK30', description: 'Dyspepsi (fordøjelsesbesvær)' },
  { code: 'DK35', description: 'Akut appendicitis' },
  { code: 'DK40', description: 'Lyskebrok' },
  { code: 'DK57', description: 'Divertikelsygdom i tarmen' },
  { code: 'DK58', description: 'Irritabel tyktarm (IBS)' },
  { code: 'DK59', description: 'Obstipation' },
  { code: 'DK76', description: 'Fedtlever' },

  // Hud og underhud
  { code: 'DL20', description: 'Atopisk dermatitis (eksem)' },
  { code: 'DL21', description: 'Seborrhoisk dermatitis' },
  { code: 'DL23', description: 'Allergisk kontaktdermatitis' },
  { code: 'DL40', description: 'Psoriasis' },
  { code: 'DL50', description: 'Urticaria (nældefeber)' },
  { code: 'DL70', description: 'Acne' },
  { code: 'DL72', description: 'Follikulær cyste i hud og underhud' },

  // Bevægeapparatet
  { code: 'DM13', description: 'Artrose, uspecificeret' },
  { code: 'DM15', description: 'Polyartrose' },
  { code: 'DM16', description: 'Coxartrose (hofteartrose)' },
  { code: 'DM17', description: 'Gonartrose (knæartrose)' },
  { code: 'DM25', description: 'Ledsygdom, uspecificeret' },
  { code: 'DM41', description: 'Skoliose' },
  { code: 'DM47', description: 'Spondylose' },
  { code: 'DM51', description: 'Diskusdegeneration (diskusprolaps)' },
  { code: 'DM54', description: 'Rygsmerter (lumbago)' },
  { code: 'DM75', description: 'Skulderlidelse' },
  { code: 'DM79', description: 'Fibromyalgi / bløddelsreumatisme' },

  // Urogenitale sygdomme
  { code: 'DN10', description: 'Akut pyelonefritis' },
  { code: 'DN30', description: 'Cystitis (blærebetændelse)' },
  { code: 'DN39', description: 'Urinvejsinfektion, uspecificeret' },
  { code: 'DN40', description: 'Prostatahyperplasi' },
  { code: 'DN76', description: 'Vaginitis' },
  { code: 'DN92', description: 'Menorragi (kraftig menstruation)' },
  { code: 'DN95', description: 'Menopausale og klimakterielle forstyrrelser' },

  // Symptomer og fund
  { code: 'DR05', description: 'Hoste' },
  { code: 'DR07', description: 'Halssmerter og brystsmerter' },
  { code: 'DR10', description: 'Abdominale og bækkensmerter' },
  { code: 'DR11', description: 'Kvalme og opkastning' },
  { code: 'DR42', description: 'Svimmelhed' },
  { code: 'DR50', description: 'Feber, uspecificeret' },
  { code: 'DR51', description: 'Hovedpine' },
  { code: 'DR53', description: 'Utilpashed og træthed' },
  { code: 'DR55', description: 'Synkope (besvimelse)' },

  // Skader og forgiftninger
  { code: 'DS93', description: 'Forstuvning af ankelled' },
  { code: 'DS52', description: 'Fraktur af underarmen' },
  { code: 'DS62', description: 'Fraktur af håndled eller hånd' },
  { code: 'DS72', description: 'Fraktur af femur (lårben)' },
  { code: 'DS82', description: 'Fraktur af underben inkl. ankel' },

  // Faktorer med betydning for helbredstilstand (Z-koder)
  { code: 'DZ00', description: 'Generel helbredsundersøgelse' },
  { code: 'DZ12', description: 'Screening for neoplasmer' },
  { code: 'DZ23', description: 'Vaccination' },
  { code: 'DZ30', description: 'Svangerskabsforebyggelse' },
  { code: 'DZ71', description: 'Rådgivning' },
  { code: 'DZ76', description: 'Kontakt pga. andre omstændigheder' },
]

export function searchICD10(query: string): ICD10Code[] {
  if (!query || query.length < 1) return []
  const lower = query.toLowerCase()
  return icd10Codes.filter(
    (c) =>
      c.code.toLowerCase().includes(lower) ||
      c.description.toLowerCase().includes(lower)
  )
}
