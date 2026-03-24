'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const patientNavItems = [
  { href: '/my-cases', label: 'Mine sager', icon: '📋' },
  { href: '/my-cases/new', label: 'Ny sag', icon: '➕' },
  { href: '/patient/payments', label: 'Betalinger', icon: '💳' },
  { href: '/patient', label: 'Mine data', icon: '🔒', exact: true },
  { href: '/patient/settings', label: 'Indstillinger', icon: '⚙️' },
  { href: '/patient/help', label: 'Hjælp', icon: '❓' },
]

export function PatientSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 min-h-[calc(100vh-4rem)]">
      <nav className="p-4 space-y-1">
        {patientNavItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href)
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
