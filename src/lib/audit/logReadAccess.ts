import { createClient } from '@/lib/supabase/client'

export async function logReadAccess(resourceType: string, resourceId: string) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('read_access_logs').insert({
      user_id: user.id,
      resource_type: resourceType,
      resource_id: resourceId,
    })
  } catch {
    // Silently fail — audit logging should not break the UI
  }
}
