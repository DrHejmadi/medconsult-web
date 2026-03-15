import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/providers/theme-provider'

export const metadata: Metadata = {
  title: 'MedConsult - Platform for lægevikariater',
  description: 'Forbind læger med virksomheder og NGOer til vikariater og frivilligt arbejde.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="da" suppressHydrationWarning>
      <body className="bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
