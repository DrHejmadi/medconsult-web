import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { verifyDoctorAuthorization } from '@/lib/verification/stps'

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { autorisationsId } = await req.json()
  if (!autorisationsId) {
    return NextResponse.json(
      { error: 'Autorisations-ID påkrævet' },
      { status: 400 }
    )
  }

  const result = await verifyDoctorAuthorization(autorisationsId)

  // Save to doctor_profiles regardless of verification status
  await supabase.from('doctor_profiles').upsert({
    id: user.id,
    autorisations_id: autorisationsId,
    stps_verified: result.verified,
    stps_verified_at: result.verified ? new Date().toISOString() : null,
  })

  // Log the verification attempt
  await supabase.from('audit_logs').insert({
    user_id: user.id,
    action: 'stps_verification_attempt',
    resource_type: 'doctor_profile',
    resource_id: user.id,
    details: { autorisationsId, verified: result.verified },
  })

  return NextResponse.json(result)
}
