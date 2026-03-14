export const ACTION_LABELS: Record<string, string> = {
  view: 'Visning',
  create: 'Oprettelse',
  update: 'Redigering',
  sign: 'Signering',
  archive: 'Arkivering',
  export: 'Eksport',
  search: 'Søgning',
}

export const RESOURCE_LABELS: Record<string, string> = {
  journal_entry: 'Journalnotat',
  patient_data: 'Patientdata',
  profile: 'Profil',
  assignment: 'Opslag',
  message: 'Besked',
}

export const REGIONS = [
  'Region Hovedstaden',
  'Region Sjælland',
  'Region Syddanmark',
  'Region Midtjylland',
  'Region Nordjylland',
]

export const SPECIALTIES = [
  'Almen medicin',
  'Kardiologi',
  'Dermatologi',
  'Endokrinologi',
  'Gastroenterologi',
  'Geriatri',
  'Gynækologi',
  'Infektionsmedicin',
  'Intern medicin',
  'Nefrologi',
  'Neurologi',
  'Onkologi',
  'Oftalmologi',
  'Ortopædkirurgi',
  'Pædiatri',
  'Psykiatri',
  'Reumatologi',
  'Urologi',
]

export const SHIFT_TYPES: Record<string, string> = {
  day: 'Dagvagt',
  evening: 'Aftenvagt',
  night: 'Nattevagt',
  on_call: 'Tilkaldevagt',
}

export const URGENCY_LABELS: Record<string, string> = {
  normal: 'Normal',
  urgent: 'Haster',
  acute: 'Akut',
}
