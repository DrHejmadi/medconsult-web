import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup')
  const isPatientPage = pathname.startsWith('/my-cases') || pathname.startsWith('/patient')
  const isPatientDataPage = pathname === '/patient' || pathname.startsWith('/patient/')
  const isDashboardPage = pathname.startsWith('/dashboard') ||
    pathname.startsWith('/journal') ||
    pathname.startsWith('/assignments') ||
    pathname.startsWith('/messages') ||
    pathname.startsWith('/profiles') ||
    pathname.startsWith('/ngo') ||
    pathname.startsWith('/settings') ||
    pathname.startsWith('/audit-log') ||
    pathname.startsWith('/documents') ||
    pathname.startsWith('/calculator') ||
    pathname.startsWith('/time-tracking') ||
    pathname.startsWith('/contracts') ||
    pathname.startsWith('/ratings') ||
    pathname.startsWith('/vagtbytte') ||
    pathname.startsWith('/calendar') ||
    pathname.startsWith('/cpd') ||
    pathname.startsWith('/notifications') ||
    pathname.startsWith('/onboarding') ||
    pathname.startsWith('/referral') ||
    pathname.startsWith('/analytics') ||
    pathname.startsWith('/payment') ||
    pathname.startsWith('/cases')

  // DEMO MODE: Tillad adgang uden auth mens Supabase ikke er konfigureret
  // Fjern denne blok når produktions-Supabase er sat op
  const isDemoMode = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder') ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project')

  if (isDemoMode) {
    return supabaseResponse
  }

  // Unauthenticated users cannot access protected pages
  if (!user && (isDashboardPage || isPatientPage)) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Authenticated users on auth pages → redirect based on role
  if (user && isAuthPage) {
    const role = user.user_metadata?.role
    const url = request.nextUrl.clone()
    url.pathname = role === 'patient' ? '/my-cases' : '/dashboard'
    return NextResponse.redirect(url)
  }

  if (user) {
    const role = user.user_metadata?.role

    // Patient trying to access dashboard routes → redirect to /my-cases
    if (role === 'patient' && isDashboardPage) {
      const url = request.nextUrl.clone()
      url.pathname = '/my-cases'
      return NextResponse.redirect(url)
    }

    // Non-patient trying to access patient routes → redirect to /dashboard
    // Exception: allow /patient portal for GDPR compliance (all authenticated users)
    if (role !== 'patient' && isPatientPage && !isPatientDataPage) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
