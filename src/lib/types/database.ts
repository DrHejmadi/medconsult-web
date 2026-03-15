export interface User {
  id: string
  email: string
  role: 'doctor' | 'company' | 'ngo'
  full_name: string
  created_at: string
}

export interface JournalEntry {
  id: string
  doctor_id: string
  patient_initials: string
  entry_date: string
  entry_timestamp?: string
  subjective?: string
  objective?: string
  assessment?: string
  plan?: string
  notes?: string
  diagnosis_codes: string[]
  medications: MedicationEntry[]
  fmk_synced: boolean
  signed_at?: string
  signed_by?: string
  attachments: string[]
  behandler_name: string
  behandler_autorisations_id: string
  henvendelsesaarsag?: string
  informeret_samtykke: boolean
  samtykke_notes?: string
  patient_id?: string
  is_deleted: boolean
  deleted_at?: string
  deleted_by?: string
  version: number
  created_at: string
  updated_at: string
}

export interface MedicationEntry {
  name: string
  dosage: string
  frequency: string
  route: string
}

export interface JournalEntryVersion {
  id: string
  journal_entry_id: string
  version_number: number
  changed_by: string
  changed_at: string
  change_reason?: string
  snapshot: string
}

export interface AuditLogEntry {
  id: string
  user_id: string
  action: string
  resource_type: string
  resource_id?: string
  patient_identifier?: string
  metadata?: Record<string, unknown>
  created_at: string
}

export interface Assignment {
  id: string
  posted_by: string
  title: string
  description: string
  specialty_required?: string
  city?: string
  region?: string
  shift_type: string
  urgency: string
  is_volunteer: boolean
  status: string
  start_date?: string
  end_date?: string
  hours_per_week?: number
  rate_per_hour?: number
  created_at: string
  updated_at: string
}

export interface DoctorProfile {
  id: string
  user_id: string
  full_name: string
  specialty: string
  experience_years: number
  autorisations_id: string
  bio?: string
  city?: string
  region?: string
  skills: string[]
  languages: string[]
  available: boolean
  volunteer_hours: number
  profile_image_url?: string
  created_at: string
}

export interface CompanyProfile {
  id: string
  user_id: string
  company_name: string
  cvr_number: string
  contact_person: string
  city?: string
  region?: string
  description?: string
  logo_url?: string
  created_at: string
}

export interface NgoProfile {
  id: string
  user_id: string
  organization_name: string
  contact_person: string
  mission?: string
  website?: string
  city?: string
  region?: string
  logo_url?: string
  created_at: string
}

export interface Message {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  is_read: boolean
  created_at: string
}

export interface ConversationPreview {
  other_user_id: string
  other_user_name: string
  last_message: string
  last_message_at: string
  unread_count: number
}

export interface Document {
  id: string
  user_id: string
  name: string
  file_url: string
  file_size: number
  file_type: string
  category: string
  uploaded_at: string
}

export interface Rating {
  id: string
  rater_id: string
  rated_id: string
  assignment_id: string
  score: number
  comment: string
  created_at: string
}

export interface TimeEntry {
  id: string
  user_id: string
  assignment_id: string
  date: string
  hours: number
  notes: string
  created_at: string
}

export interface ContractTemplate {
  id: string
  name: string
  content: string
  category: string
  created_at: string
}
