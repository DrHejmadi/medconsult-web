'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/dashboard', label: 'Oversigt', icon: '📊' },
  { href: '/analytics', label: 'Analyser', icon: '📈' },
  { href: '/journal', label: 'Journal', icon: '📋' },
  { href: '/assignments', label: 'Opslag', icon: '📌' },
  { href: '/assignments/akut', label: 'Akut vikar', icon: '🚨' },
  { href: '/calendar', label: 'Kalender', icon: '📅' },
  { href: '/vagtbytte', label: 'Vagtbytte', icon: '🔄' },
  { href: '/messages', label: 'Beskeder', icon: '💬' },
  { href: '/profiles', label: 'Netværk', icon: '👥' },
  { href: '/documents', label: 'Dokumenter', icon: '📄' },
  { href: '/time-tracking', label: 'Tidsregistrering', icon: '⏱️' },
  { href: '/contracts', label: 'Kontrakter', icon: '📝' },
  { href: '/ratings', label: 'Anmeldelser', icon: '⭐' },
  { href: '/calculator', label: 'Lønberegner', icon: '🧮' },
  { href: '/cpd', label: 'Kompetencer', icon: '🎓' },
  { href: '/cases', label: 'Cases', icon: '📋' },
  { href: '/cases/knowledge-base', label: 'Videnbase', icon: '📚' },
  { href: '/ngo', label: 'NGO', icon: '💚' },
  { href: '/notifications', label: 'Notifikationer', icon: '🔔' },
  { href: '/referral', label: 'Inviter', icon: '🤝' },
  { href: '/settings', label: 'Indstillinger', icon: '⚙️' },
  { href: '/audit-log', label: 'Adgangslog', icon: '🔒' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 min-h-[calc(100vh-4rem)]">
      <nav className="p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                  : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
