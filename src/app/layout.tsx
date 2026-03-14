import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MedConsult - Platform for lægevikariater',
  description: 'Forbind læger med virksomheder og NGOer til vikariater og frivilligt arbejde.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="da">
      <body className="bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  )
}
