import { Header } from '@/components/layout/header'
import { PatientSidebar } from '@/components/layout/patient-sidebar'

export const dynamic = 'force-dynamic'

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Header />
      <div className="flex">
        <PatientSidebar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
