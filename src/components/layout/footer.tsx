import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏥</span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">MedConsult</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/disclaimer" className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">Disclaimer</Link>
            <Link href="/behandlingssted" className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">Behandlingssted</Link>
            <Link href="/informed-consent" className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">Informeret samtykke</Link>
            <Link href="/behandleraftale" className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">Databehandleraftale</Link>
            <Link href="/disclaimer#klageadgang" className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">Klageadgang</Link>
          </nav>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} MedConsult. Alle rettigheder forbeholdes.
          </p>
        </div>
      </div>
    </footer>
  )
}
