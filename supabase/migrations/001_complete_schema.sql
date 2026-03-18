-- ============================================================================
-- MedConsult Complete Database Schema
-- Migration: 001_complete_schema.sql
-- Description: Full production schema for MedConsult platform
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- UTILITY: updated_at trigger function
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TABLE: profiles
-- ============================================================================

CREATE TABLE profiles (
    id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email       text NOT NULL,
    full_name   text NOT NULL,
    role        text NOT NULL CHECK (role IN ('doctor', 'patient', 'company', 'ngo')),
    phone       text,
    avatar_url  text,
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);

CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Doctors and companies can view other profiles"
    ON profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
              AND p.role IN ('doctor', 'company', 'ngo')
        )
    );

-- ============================================================================
-- TABLE: doctor_profiles
-- ============================================================================

CREATE TABLE doctor_profiles (
    id                  uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    autorisations_id    text,
    specialty           text,
    specialties         text[] DEFAULT '{}',
    experience_years    int DEFAULT 0,
    bio                 text,
    city                text,
    region              text,
    skills              text[] DEFAULT '{}',
    languages           text[] DEFAULT '{}',
    available           boolean DEFAULT true,
    volunteer_hours     numeric DEFAULT 0,
    profile_image_url   text,
    stps_verified       boolean DEFAULT false,
    stps_verified_at    timestamptz,
    mitid_verified      boolean DEFAULT false,
    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_doctor_profiles_specialty ON doctor_profiles(specialty);
CREATE INDEX idx_doctor_profiles_specialties ON doctor_profiles USING GIN(specialties);
CREATE INDEX idx_doctor_profiles_available ON doctor_profiles(available);
CREATE INDEX idx_doctor_profiles_region ON doctor_profiles(region);

CREATE TRIGGER trg_doctor_profiles_updated_at
    BEFORE UPDATE ON doctor_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE doctor_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors can view and edit own doctor profile"
    ON doctor_profiles FOR ALL
    USING (auth.uid() = id);

CREATE POLICY "Anyone can view doctor profiles"
    ON doctor_profiles FOR SELECT
    USING (true);

-- ============================================================================
-- TABLE: company_profiles
-- ============================================================================

CREATE TABLE company_profiles (
    id              uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    cvr             text,
    company_name    text NOT NULL,
    address         text,
    contact_person  text,
    city            text,
    region          text,
    description     text,
    logo_url        text,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_company_profiles_cvr ON company_profiles(cvr);

CREATE TRIGGER trg_company_profiles_updated_at
    BEFORE UPDATE ON company_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE company_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Companies can view and edit own company profile"
    ON company_profiles FOR ALL
    USING (auth.uid() = id);

CREATE POLICY "Anyone can view company profiles"
    ON company_profiles FOR SELECT
    USING (true);

-- ============================================================================
-- TABLE: ngo_profiles
-- ============================================================================

CREATE TABLE ngo_profiles (
    id                  uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    organization_name   text NOT NULL,
    contact_person      text,
    mission             text,
    website             text,
    city                text,
    region              text,
    logo_url            text,
    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_ngo_profiles_updated_at
    BEFORE UPDATE ON ngo_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE ngo_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "NGOs can view and edit own ngo profile"
    ON ngo_profiles FOR ALL
    USING (auth.uid() = id);

CREATE POLICY "Anyone can view ngo profiles"
    ON ngo_profiles FOR SELECT
    USING (true);

-- ============================================================================
-- TABLE: journal_entries
-- ============================================================================

CREATE TABLE journal_entries (
    id                          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id                  uuid REFERENCES profiles(id),
    doctor_id                   uuid NOT NULL REFERENCES profiles(id),
    patient_initials            text,
    entry_date                  date DEFAULT CURRENT_DATE,
    soap_subjective             text,
    soap_objective              text,
    soap_assessment             text,
    soap_plan                   text,
    notes                       text,
    icd10_codes                 text[] DEFAULT '{}',
    medications                 jsonb DEFAULT '[]',
    fmk_synced                  boolean DEFAULT false,
    attachments                 text[] DEFAULT '{}',
    behandler_name              text,
    behandler_autorisations_id  text,
    henvendelsesaarsag          text,
    informeret_samtykke         boolean DEFAULT false,
    samtykke_notes              text,
    is_signed                   boolean DEFAULT false,
    signed_at                   timestamptz,
    signed_by                   uuid REFERENCES profiles(id),
    is_deleted                  boolean DEFAULT false,
    deleted_at                  timestamptz,
    deleted_by                  uuid REFERENCES profiles(id),
    version                     int DEFAULT 1,
    created_at                  timestamptz NOT NULL DEFAULT now(),
    updated_at                  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_journal_entries_patient_id ON journal_entries(patient_id);
CREATE INDEX idx_journal_entries_doctor_id ON journal_entries(doctor_id);
CREATE INDEX idx_journal_entries_entry_date ON journal_entries(entry_date);
CREATE INDEX idx_journal_entries_is_deleted ON journal_entries(is_deleted) WHERE is_deleted = false;
CREATE INDEX idx_journal_entries_icd10 ON journal_entries USING GIN(icd10_codes);

CREATE TRIGGER trg_journal_entries_updated_at
    BEFORE UPDATE ON journal_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors can manage own journal entries"
    ON journal_entries FOR ALL
    USING (auth.uid() = doctor_id);

CREATE POLICY "Patients can view own journal entries"
    ON journal_entries FOR SELECT
    USING (auth.uid() = patient_id AND is_deleted = false);

-- ============================================================================
-- TABLE: journal_entry_versions
-- ============================================================================

CREATE TABLE journal_entry_versions (
    id                  uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    journal_entry_id    uuid NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
    version_number      int NOT NULL,
    content_snapshot    jsonb NOT NULL,
    change_reason       text,
    changed_by          uuid NOT NULL REFERENCES profiles(id),
    created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_journal_versions_entry_id ON journal_entry_versions(journal_entry_id);
CREATE INDEX idx_journal_versions_changed_by ON journal_entry_versions(changed_by);

ALTER TABLE journal_entry_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors can manage versions of own entries"
    ON journal_entry_versions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM journal_entries je
            WHERE je.id = journal_entry_versions.journal_entry_id
              AND je.doctor_id = auth.uid()
        )
    );

-- ============================================================================
-- TABLE: assignments
-- ============================================================================

CREATE TABLE assignments (
    id                  uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id          uuid NOT NULL REFERENCES profiles(id),
    title               text NOT NULL,
    description         text,
    specialty           text,
    specialty_required  text,
    location            text,
    city                text,
    region              text,
    shift_type          text,
    urgency             text DEFAULT 'normal',
    is_volunteer        boolean DEFAULT false,
    start_date          date,
    end_date            date,
    hours_per_week      numeric,
    hourly_rate         numeric,
    rate_per_hour       numeric,
    status              text DEFAULT 'open' CHECK (status IN ('open', 'assigned', 'in_progress', 'completed', 'cancelled')),
    is_deleted          boolean DEFAULT false,
    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_assignments_company_id ON assignments(company_id);
CREATE INDEX idx_assignments_status ON assignments(status);
CREATE INDEX idx_assignments_specialty ON assignments(specialty);
CREATE INDEX idx_assignments_start_date ON assignments(start_date);
CREATE INDEX idx_assignments_is_deleted ON assignments(is_deleted) WHERE is_deleted = false;

CREATE TRIGGER trg_assignments_updated_at
    BEFORE UPDATE ON assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Companies can manage own assignments"
    ON assignments FOR ALL
    USING (auth.uid() = company_id);

CREATE POLICY "Anyone can view active assignments"
    ON assignments FOR SELECT
    USING (is_deleted = false AND status != 'cancelled');

-- ============================================================================
-- TABLE: medical_cases
-- ============================================================================

CREATE TABLE medical_cases (
    id                          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id                  uuid NOT NULL REFERENCES profiles(id),
    case_type                   text NOT NULL CHECK (case_type IN ('diagnosis', 'second_opinion', 'assessment', 'treatment', 'communication')),
    title                       text,
    description                 text NOT NULL,
    symptoms                    text[] DEFAULT '{}',
    duration                    text,
    severity                    text,
    medications                 text[] DEFAULT '{}',
    allergies                   text[] DEFAULT '{}',
    specialty                   text,
    specialty_needed            text,
    service_level               text NOT NULL CHECK (service_level IN ('basis', 'standard', 'udvidet', 'akut', 'kort_raad', 'konsultation', 'fuld_udredning')),
    status                      text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'pending', 'claimed', 'in_progress', 'answered', 'assessment_sent', 'completed', 'cancelled', 'closed')),
    assigned_doctor_id          uuid REFERENCES profiles(id),
    documents                   text[] DEFAULT '{}',
    price                       numeric,
    consent_disclaimer          boolean DEFAULT false,
    consent_treatment           boolean DEFAULT false,
    consent_data_processing     boolean DEFAULT false,
    consent_not_emergency       boolean DEFAULT false,
    consent_quality             boolean DEFAULT false,
    consent_knowledge_base      boolean DEFAULT false,
    created_at                  timestamptz NOT NULL DEFAULT now(),
    updated_at                  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_medical_cases_patient_id ON medical_cases(patient_id);
CREATE INDEX idx_medical_cases_doctor_id ON medical_cases(assigned_doctor_id);
CREATE INDEX idx_medical_cases_status ON medical_cases(status);
CREATE INDEX idx_medical_cases_case_type ON medical_cases(case_type);
CREATE INDEX idx_medical_cases_service_level ON medical_cases(service_level);
CREATE INDEX idx_medical_cases_specialty ON medical_cases(specialty);
CREATE INDEX idx_medical_cases_created_at ON medical_cases(created_at DESC);

CREATE TRIGGER trg_medical_cases_updated_at
    BEFORE UPDATE ON medical_cases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE medical_cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can manage own cases"
    ON medical_cases FOR ALL
    USING (auth.uid() = patient_id);

CREATE POLICY "Doctors can view assigned cases"
    ON medical_cases FOR SELECT
    USING (auth.uid() = assigned_doctor_id);

CREATE POLICY "Doctors can update assigned cases"
    ON medical_cases FOR UPDATE
    USING (auth.uid() = assigned_doctor_id);

CREATE POLICY "Doctors can view open cases"
    ON medical_cases FOR SELECT
    USING (
        status = 'open'
        AND EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid() AND p.role = 'doctor'
        )
    );

-- ============================================================================
-- TABLE: case_assessments
-- ============================================================================

CREATE TABLE case_assessments (
    id                      uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    case_id                 uuid NOT NULL REFERENCES medical_cases(id) ON DELETE CASCADE,
    doctor_id               uuid NOT NULL REFERENCES profiles(id),
    assessment_text         text,
    diagnosis_suggestion    text,
    investigation_plan      text,
    treatment_suggestion    text,
    next_steps              text,
    icd10_codes             text[] DEFAULT '{}',
    recommendations         text,
    red_flags               text[] DEFAULT '{}',
    follow_up_plan          text,
    follow_up_needed        boolean DEFAULT false,
    is_signed               boolean DEFAULT false,
    signed_at               timestamptz,
    created_at              timestamptz NOT NULL DEFAULT now(),
    updated_at              timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_case_assessments_case_id ON case_assessments(case_id);
CREATE INDEX idx_case_assessments_doctor_id ON case_assessments(doctor_id);

CREATE TRIGGER trg_case_assessments_updated_at
    BEFORE UPDATE ON case_assessments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE case_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors can manage own assessments"
    ON case_assessments FOR ALL
    USING (auth.uid() = doctor_id);

CREATE POLICY "Patients can view assessments for own cases"
    ON case_assessments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM medical_cases mc
            WHERE mc.id = case_assessments.case_id
              AND mc.patient_id = auth.uid()
        )
    );

-- ============================================================================
-- TABLE: case_messages
-- ============================================================================

CREATE TABLE case_messages (
    id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    case_id         uuid NOT NULL REFERENCES medical_cases(id) ON DELETE CASCADE,
    sender_id       uuid NOT NULL REFERENCES profiles(id),
    sender_type     text CHECK (sender_type IN ('patient', 'doctor')),
    message         text NOT NULL,
    attachments     text[] DEFAULT '{}',
    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_case_messages_case_id ON case_messages(case_id);
CREATE INDEX idx_case_messages_sender_id ON case_messages(sender_id);
CREATE INDEX idx_case_messages_created_at ON case_messages(case_id, created_at);

ALTER TABLE case_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Case participants can view messages"
    ON case_messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM medical_cases mc
            WHERE mc.id = case_messages.case_id
              AND (mc.patient_id = auth.uid() OR mc.assigned_doctor_id = auth.uid())
        )
    );

CREATE POLICY "Case participants can insert messages"
    ON case_messages FOR INSERT
    WITH CHECK (
        auth.uid() = sender_id
        AND EXISTS (
            SELECT 1 FROM medical_cases mc
            WHERE mc.id = case_messages.case_id
              AND (mc.patient_id = auth.uid() OR mc.assigned_doctor_id = auth.uid())
        )
    );

-- ============================================================================
-- TABLE: messages (direct messaging)
-- ============================================================================

CREATE TABLE messages (
    id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id   uuid NOT NULL REFERENCES profiles(id),
    receiver_id uuid NOT NULL REFERENCES profiles(id),
    content     text NOT NULL,
    is_read     boolean DEFAULT false,
    created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_messages_conversation ON messages(
    LEAST(sender_id, receiver_id),
    GREATEST(sender_id, receiver_id),
    created_at DESC
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own messages"
    ON messages FOR SELECT
    USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages"
    ON messages FOR INSERT
    WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Receivers can mark messages as read"
    ON messages FOR UPDATE
    USING (auth.uid() = receiver_id)
    WITH CHECK (auth.uid() = receiver_id);

-- ============================================================================
-- TABLE: payments
-- ============================================================================

CREATE TABLE payments (
    id                      uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    case_id                 uuid REFERENCES medical_cases(id),
    patient_id              uuid NOT NULL REFERENCES profiles(id),
    doctor_id               uuid REFERENCES profiles(id),
    amount                  numeric NOT NULL CHECK (amount >= 0),
    currency                text NOT NULL DEFAULT 'DKK',
    stripe_payment_intent_id text,
    status                  text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'succeeded', 'failed', 'refunded', 'cancelled')),
    service_level           text,
    created_at              timestamptz NOT NULL DEFAULT now(),
    updated_at              timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_payments_case_id ON payments(case_id);
CREATE INDEX idx_payments_patient_id ON payments(patient_id);
CREATE INDEX idx_payments_doctor_id ON payments(doctor_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_stripe ON payments(stripe_payment_intent_id);

CREATE TRIGGER trg_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view own payments"
    ON payments FOR SELECT
    USING (auth.uid() = patient_id);

CREATE POLICY "Doctors can view payments for assigned cases"
    ON payments FOR SELECT
    USING (auth.uid() = doctor_id);

-- ============================================================================
-- TABLE: consent_records
-- ============================================================================

CREATE TABLE consent_records (
    id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id         uuid NOT NULL REFERENCES profiles(id),
    consent_type    text NOT NULL,
    consent_text    text NOT NULL,
    ip_address      text,
    user_agent      text,
    granted_at      timestamptz NOT NULL DEFAULT now(),
    withdrawn_at    timestamptz
);

CREATE INDEX idx_consent_records_user_id ON consent_records(user_id);
CREATE INDEX idx_consent_records_type ON consent_records(consent_type);

ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own consent records"
    ON consent_records FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own consent records"
    ON consent_records FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can withdraw own consent"
    ON consent_records FOR UPDATE
    USING (auth.uid() = user_id);

-- ============================================================================
-- TABLE: audit_logs (INSERT ONLY)
-- ============================================================================

CREATE TABLE audit_logs (
    id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id         uuid REFERENCES profiles(id),
    action          text NOT NULL,
    resource_type   text NOT NULL,
    resource_id     uuid,
    patient_identifier text,
    ip_address      text,
    details         jsonb,
    metadata        jsonb,
    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own audit logs"
    ON audit_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert audit logs"
    ON audit_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Revoke UPDATE and DELETE to make audit_logs append-only
REVOKE UPDATE, DELETE ON audit_logs FROM PUBLIC;
REVOKE UPDATE, DELETE ON audit_logs FROM authenticated;
REVOKE UPDATE, DELETE ON audit_logs FROM anon;

-- ============================================================================
-- TABLE: read_access_logs (INSERT ONLY)
-- ============================================================================

CREATE TABLE read_access_logs (
    id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id         uuid NOT NULL REFERENCES profiles(id),
    resource_type   text NOT NULL,
    resource_id     uuid NOT NULL,
    accessed_at     timestamptz NOT NULL DEFAULT now(),
    ip_address      text
);

CREATE INDEX idx_read_access_logs_user_id ON read_access_logs(user_id);
CREATE INDEX idx_read_access_logs_resource ON read_access_logs(resource_type, resource_id);
CREATE INDEX idx_read_access_logs_accessed_at ON read_access_logs(accessed_at DESC);

ALTER TABLE read_access_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own read access logs"
    ON read_access_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert read access logs"
    ON read_access_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Revoke UPDATE and DELETE to make read_access_logs append-only
REVOKE UPDATE, DELETE ON read_access_logs FROM PUBLIC;
REVOKE UPDATE, DELETE ON read_access_logs FROM authenticated;
REVOKE UPDATE, DELETE ON read_access_logs FROM anon;

-- ============================================================================
-- TABLE: notifications
-- ============================================================================

CREATE TABLE notifications (
    id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type        text NOT NULL,
    title       text NOT NULL,
    message     text,
    is_read     boolean DEFAULT false,
    created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_created_at ON notifications(user_id, created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
    ON notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
    ON notifications FOR UPDATE
    USING (auth.uid() = user_id);

-- ============================================================================
-- TABLE: ratings
-- ============================================================================

CREATE TABLE ratings (
    id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    from_user_id    uuid NOT NULL REFERENCES profiles(id),
    to_user_id      uuid NOT NULL REFERENCES profiles(id),
    assignment_id   uuid REFERENCES assignments(id),
    case_id         uuid REFERENCES medical_cases(id),
    score           int NOT NULL CHECK (score BETWEEN 1 AND 5),
    comment         text,
    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_ratings_from_user ON ratings(from_user_id);
CREATE INDEX idx_ratings_to_user ON ratings(to_user_id);
CREATE INDEX idx_ratings_assignment ON ratings(assignment_id);
CREATE INDEX idx_ratings_case ON ratings(case_id);

ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view ratings"
    ON ratings FOR SELECT
    USING (true);

CREATE POLICY "Users can create own ratings"
    ON ratings FOR INSERT
    WITH CHECK (auth.uid() = from_user_id);

-- ============================================================================
-- TABLE: documents
-- ============================================================================

CREATE TABLE documents (
    id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id     uuid NOT NULL REFERENCES profiles(id),
    case_id     uuid REFERENCES medical_cases(id),
    filename    text NOT NULL,
    file_path   text NOT NULL,
    file_size   bigint,
    mime_type   text,
    file_url    text,
    category    text,
    created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_case_id ON documents(case_id);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own documents"
    ON documents FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Doctors can view documents for assigned cases"
    ON documents FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM medical_cases mc
            WHERE mc.id = documents.case_id
              AND mc.assigned_doctor_id = auth.uid()
        )
    );

-- ============================================================================
-- TABLE: cpd_entries (Continuing Professional Development)
-- ============================================================================

CREATE TABLE cpd_entries (
    id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    doctor_id       uuid NOT NULL REFERENCES profiles(id),
    type            text NOT NULL,
    title           text NOT NULL,
    provider        text,
    date            date NOT NULL,
    hours           numeric NOT NULL CHECK (hours > 0),
    certificate_url text,
    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_cpd_entries_doctor_id ON cpd_entries(doctor_id);
CREATE INDEX idx_cpd_entries_date ON cpd_entries(doctor_id, date DESC);

ALTER TABLE cpd_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors can manage own CPD entries"
    ON cpd_entries FOR ALL
    USING (auth.uid() = doctor_id);

-- ============================================================================
-- TABLE: referral_codes
-- ============================================================================

CREATE TABLE referral_codes (
    id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id         uuid NOT NULL REFERENCES profiles(id),
    code            text NOT NULL UNIQUE,
    uses            int DEFAULT 0,
    reward_amount   numeric DEFAULT 0,
    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_referral_codes_user_id ON referral_codes(user_id);
CREATE UNIQUE INDEX idx_referral_codes_code ON referral_codes(code);

ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own referral codes"
    ON referral_codes FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Anyone can look up referral codes"
    ON referral_codes FOR SELECT
    USING (true);

-- ============================================================================
-- TABLE: shift_swaps
-- ============================================================================

CREATE TABLE shift_swaps (
    id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    requester_id    uuid NOT NULL REFERENCES profiles(id),
    original_date   date NOT NULL,
    original_shift  text NOT NULL,
    desired_date    date,
    desired_shift   text,
    status          text DEFAULT 'open' CHECK (status IN ('open', 'accepted', 'rejected', 'cancelled')),
    accepted_by     uuid REFERENCES profiles(id),
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_shift_swaps_requester ON shift_swaps(requester_id);
CREATE INDEX idx_shift_swaps_status ON shift_swaps(status);
CREATE INDEX idx_shift_swaps_date ON shift_swaps(original_date);

CREATE TRIGGER trg_shift_swaps_updated_at
    BEFORE UPDATE ON shift_swaps
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE shift_swaps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own shift swap requests"
    ON shift_swaps FOR ALL
    USING (auth.uid() = requester_id);

CREATE POLICY "Doctors can view open shift swaps"
    ON shift_swaps FOR SELECT
    USING (
        status = 'open'
        AND EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid() AND p.role = 'doctor'
        )
    );

CREATE POLICY "Accepting doctor can update shift swap"
    ON shift_swaps FOR UPDATE
    USING (auth.uid() = accepted_by OR status = 'open');

-- ============================================================================
-- TABLE: time_entries
-- ============================================================================

CREATE TABLE time_entries (
    id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id         uuid NOT NULL REFERENCES profiles(id),
    assignment_id   uuid NOT NULL REFERENCES assignments(id),
    date            date NOT NULL,
    hours           numeric NOT NULL CHECK (hours > 0),
    notes           text,
    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX idx_time_entries_assignment_id ON time_entries(assignment_id);
CREATE INDEX idx_time_entries_date ON time_entries(user_id, date DESC);

ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own time entries"
    ON time_entries FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Companies can view time entries for own assignments"
    ON time_entries FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM assignments a
            WHERE a.id = time_entries.assignment_id
              AND a.company_id = auth.uid()
        )
    );

-- ============================================================================
-- TABLE: contract_templates
-- ============================================================================

CREATE TABLE contract_templates (
    id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name        text NOT NULL,
    content     text NOT NULL,
    category    text,
    created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE contract_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view contract templates"
    ON contract_templates FOR SELECT
    USING (true);

-- ============================================================================
-- STORAGE: documents bucket
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'documents',
    'documents',
    false,
    52428800, -- 50MB
    ARRAY[
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/webp',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies
CREATE POLICY "Users can upload own documents"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'documents'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view own documents"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'documents'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete own documents"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'documents'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- ============================================================================
-- FUNCTION: Auto-create profile on user signup
-- ============================================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'role', 'patient')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- FUNCTION: Log journal entry version on update
-- ============================================================================

CREATE OR REPLACE FUNCTION log_journal_entry_version()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.version IS DISTINCT FROM NEW.version THEN
        INSERT INTO journal_entry_versions (
            journal_entry_id,
            version_number,
            content_snapshot,
            changed_by
        ) VALUES (
            OLD.id,
            OLD.version,
            to_jsonb(OLD),
            auth.uid()
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_journal_entry_version_log
    BEFORE UPDATE ON journal_entries
    FOR EACH ROW EXECUTE FUNCTION log_journal_entry_version();
