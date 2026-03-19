-- ============================================
-- MedConsult RPC Functions
-- Migration 002: Server-side database functions
-- ============================================

-- 1. Case statistics for analytics dashboard
CREATE OR REPLACE FUNCTION get_case_statistics(p_user_id UUID)
RETURNS JSON
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT json_build_object(
    'total_cases', COUNT(*),
    'open_cases', COUNT(*) FILTER (WHERE status = 'open'),
    'in_progress_cases', COUNT(*) FILTER (WHERE status = 'in_progress'),
    'completed_cases', COUNT(*) FILTER (WHERE status = 'completed'),
    'paid_cases', COUNT(*) FILTER (WHERE status = 'paid'),
    'avg_response_hours', ROUND(
      AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 3600)
      FILTER (WHERE status = 'completed'), 1
    )
  )
  FROM medical_cases
  WHERE patient_id = p_user_id OR assigned_doctor_id = p_user_id;
$$;

-- 2. Doctor matching based on specialty
CREATE OR REPLACE FUNCTION find_matching_doctors(
  p_specialty TEXT,
  p_limit INT DEFAULT 10
)
RETURNS TABLE(
  id UUID,
  full_name TEXT,
  specialties TEXT[],
  stps_verified BOOLEAN,
  cases_completed BIGINT
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT
    dp.id,
    p.full_name,
    dp.specialties,
    dp.stps_verified,
    (SELECT COUNT(*) FROM medical_cases mc WHERE mc.assigned_doctor_id = dp.id AND mc.status = 'completed') as cases_completed
  FROM doctor_profiles dp
  JOIN profiles p ON p.id = dp.id
  WHERE p_specialty = ANY(dp.specialties)
    AND dp.stps_verified = true
  ORDER BY cases_completed DESC
  LIMIT p_limit;
$$;

-- 3. Revenue statistics for payment dashboard
CREATE OR REPLACE FUNCTION get_revenue_statistics(p_user_id UUID)
RETURNS JSON
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT json_build_object(
    'total_revenue', COALESCE(SUM(amount), 0),
    'total_payments', COUNT(*),
    'completed_payments', COUNT(*) FILTER (WHERE status = 'completed'),
    'pending_payments', COUNT(*) FILTER (WHERE status = 'pending'),
    'avg_payment', ROUND(AVG(amount) FILTER (WHERE status = 'completed'), 2),
    'this_month', COALESCE(
      SUM(amount) FILTER (
        WHERE status = 'completed'
        AND created_at >= date_trunc('month', CURRENT_DATE)
      ), 0
    )
  )
  FROM payments
  WHERE patient_id = p_user_id OR doctor_id = p_user_id;
$$;

-- 4. Unread notification count
CREATE OR REPLACE FUNCTION get_unread_count(p_user_id UUID)
RETURNS INT
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT COUNT(*)::INT
  FROM notifications
  WHERE user_id = p_user_id AND is_read = false;
$$;

-- 5. Mark all notifications as read
CREATE OR REPLACE FUNCTION mark_all_notifications_read(p_user_id UUID)
RETURNS VOID
LANGUAGE SQL
SECURITY DEFINER
AS $$
  UPDATE notifications
  SET is_read = true
  WHERE user_id = p_user_id AND is_read = false;
$$;

-- 6. Add stripe_connect_id to doctor_profiles if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'doctor_profiles' AND column_name = 'stripe_connect_id'
  ) THEN
    ALTER TABLE doctor_profiles ADD COLUMN stripe_connect_id TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'doctor_profiles' AND column_name = 'is_available'
  ) THEN
    ALTER TABLE doctor_profiles ADD COLUMN is_available BOOLEAN DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'doctor_profiles' AND column_name = 'cases_completed'
  ) THEN
    ALTER TABLE doctor_profiles ADD COLUMN cases_completed INT DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'doctor_profiles' AND column_name = 'rating'
  ) THEN
    ALTER TABLE doctor_profiles ADD COLUMN rating DECIMAL(3,2) DEFAULT 0;
  END IF;
END $$;
