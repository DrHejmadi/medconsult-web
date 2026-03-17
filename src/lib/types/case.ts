export type CaseType = 'diagnosis' | 'second_opinion' | 'assessment' | 'treatment' | 'communication'
export type ServiceLevel = 'kort_raad' | 'konsultation' | 'fuld_udredning'
export type CaseStatus = 'pending' | 'in_progress' | 'answered' | 'closed'

export interface MedicalCase {
  id: string
  patient_id: string
  case_type: CaseType
  service_level: ServiceLevel
  status: CaseStatus
  specialty: string
  description: string
  documents: string[]
  consent_disclaimer: boolean
  consent_treatment: boolean
  consent_knowledge_base: boolean
  doctor_id?: string
  assessment?: DoctorAssessment
  created_at: string
  updated_at: string
  price: number
}

export interface DoctorAssessment {
  diagnosis_suggestion?: string
  investigation_plan?: string
  treatment_suggestion?: string
  next_steps: string
  icd10_codes?: string[]
  follow_up_needed: boolean
}

export interface CaseMessage {
  id: string
  case_id: string
  sender_type: 'patient' | 'doctor'
  content: string
  created_at: string
}
