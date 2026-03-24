'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  // TEST MODE: Forudfyldt til interne testere
  const [email, setEmail] = useState('hejmadi@gmail.com')
  const [password, setPassword] = useState('test1234')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const [selectedRole, setSelectedRole] = useState<'doctor' | 'patient' | 'company' | 'ngo'>('doctor')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        // DEMO MODE: Supabase auth fejlede — redirect baseret på valgt rolle
        window.location.href = selectedRole === 'patient' ? '/my-cases' : '/dashboard'
        return
      }

      // Real auth — redirect baseret på brugerens rolle
      const { data: { user } } = await supabase.auth.getUser()
      const role = user?.user_metadata?.role
      router.push(role === 'patient' ? '/my-cases' : '/dashboard')
    } catch {
      // DEMO MODE: Supabase ikke tilgængelig — redirect direkte
      window.location.href = selectedRole === 'patient' ? '/my-cases' : '/dashboard'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-4xl">🏥</span>
          <h1 className="text-2xl font-bold mt-4 text-gray-900 dark:text-white">Log ind på MedConsult</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Velkommen tilbage</p>
          <div className="mt-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-lg px-4 py-2">
            <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">🧪 TESTMODE — Felterne er forudfyldt. Tryk bare &quot;Log ind&quot;</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">{error}</div>
          )}

          {/* TEST: Rollevælger */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Test som rolle</label>
            <div className="grid grid-cols-2 gap-2">
              {([
                { value: 'doctor' as const, label: '🩺 Læge', desc: 'Dashboard + cases + NGO' },
                { value: 'patient' as const, label: '🧑‍⚕️ Patient', desc: 'Mine sager + betalinger' },
                { value: 'company' as const, label: '🏢 Virksomhed', desc: 'Opslag + kontrakter' },
                { value: 'ngo' as const, label: '💚 NGO', desc: 'Frivilligt arbejde' },
              ]).map((role) => (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => setSelectedRole(role.value)}
                  className={`text-left p-2 rounded-lg border text-sm transition-colors ${
                    selectedRole === role.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="font-medium text-gray-900 dark:text-white">{role.label}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{role.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="din@email.dk"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Adgangskode</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Logger ind...' : 'Log ind'}
          </button>

          {/* Divider */}
          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">eller</span>
            </div>
          </div>

          {/* MitID Button (disabled placeholder) */}
          <button
            type="button"
            disabled
            className="w-full bg-[#0060e6] text-white py-2 rounded-lg font-medium opacity-50 cursor-not-allowed flex items-center justify-center gap-2"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="24" height="24" rx="4" fill="white" fillOpacity="0.2" />
              <path d="M7 8h10v2H7V8zm0 3h10v2H7v-2zm0 3h7v2H7v-2z" fill="currentColor" />
            </svg>
            Log ind med MitID
          </button>
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
            Kommer snart — kræver MitID-broker aftale
          </p>
        </form>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
          Har du ikke en konto?{' '}
          <Link href="/signup" className="text-blue-600 dark:text-blue-400 hover:underline">Opret konto</Link>
        </p>
      </div>
    </div>
  )
}
