'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Role = 'doctor' | 'company' | 'ngo' | 'patient'

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState<'role' | 'form'>('role')
  const [role, setRole] = useState<Role>('doctor')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const roles = [
    { value: 'doctor' as Role, icon: '🩺', label: 'Læge', description: 'Find vikariater og frivillige muligheder' },
    { value: 'company' as Role, icon: '🏢', label: 'Virksomhed', description: 'Opret opslag og find kvalificerede læger' },
    { value: 'ngo' as Role, icon: '💚', label: 'NGO', description: 'Find frivillige læger til humanitære projekter' },
    { value: 'patient' as Role, icon: '🧑‍⚕️', label: 'Patient', description: 'Få ekspertvurdering fra verificerede læger' },
  ]

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    router.push(role === 'patient' ? '/my-cases' : '/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-4xl">🏥</span>
          <h1 className="text-2xl font-bold mt-4 text-gray-900 dark:text-gray-100">Opret konto</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Kom i gang med MedConsult</p>
        </div>

        {step === 'role' ? (
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Vælg din rolle:</p>
            {roles.map((r) => (
              <button
                key={r.value}
                onClick={() => { setRole(r.value); setStep('form') }}
                className="w-full bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-left hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{r.icon}</span>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{r.label}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{r.description}</p>
                  </div>
                </div>
              </button>
            ))}
            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
              Har du allerede en konto?{' '}
              <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline">Log ind</Link>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSignup} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-4">
            <button
              type="button"
              onClick={() => setStep('role')}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              ← Skift rolle ({roles.find(r => r.value === role)?.label})
            </button>

            {error && (
              <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {role === 'doctor' ? 'Fulde navn' : role === 'company' ? 'Virksomhedsnavn' : role === 'ngo' ? 'Organisationsnavn' : 'Fulde navn'}
              </label>
              <input
                id="name"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="din@email.dk"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Adgangskode</label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Min. 8 tegn"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Opretter...' : 'Opret konto'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
