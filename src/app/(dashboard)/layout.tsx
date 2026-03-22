import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { EpicsProvider } from '@/context/EpicsContext'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const user = cookieStore.get('ds-user')?.value
  if (!user) redirect('/login')

  return (
    <EpicsProvider>
      <div className="flex h-screen overflow-hidden bg-cream-light">
        <Sidebar user={user} />
        <main className="flex-1 overflow-auto p-4 pt-18 md:p-6 md:pt-6">
          {children}
        </main>
      </div>
    </EpicsProvider>
  )
}
