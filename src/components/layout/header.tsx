'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    try {
      const supabase = createClient()
      supabase.auth.getUser().then(({ data }) => setUser(data.user))
    } catch {
      // No Supabase config available
    }
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const isPublic = pathname === '/' || pathname === '/gdpr'

  if (!isPublic && !user) return null

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2">
            <span className="text-2xl">🏥</span>
            <span className="text-xl font-bold text-gray-900">MedConsult</span>
          </Link>

          <nav className="flex items-center gap-4">
            {isPublic ? (
              <>
                <Link href="/gdpr" className="text-sm text-gray-600 hover:text-gray-900">GDPR</Link>
                <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">Log ind</Link>
                <Link href="/signup" className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg">
                  Opret konto
                </Link>
              </>
            ) : (
              <button onClick={handleSignOut} className="text-sm text-gray-600 hover:text-gray-900">
                Log ud
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
