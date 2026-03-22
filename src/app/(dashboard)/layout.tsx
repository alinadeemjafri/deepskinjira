import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import DashboardShell from '@/components/DashboardShell'

export default async function DashboardLayout() {
  const cookieStore = await cookies()
  const user = cookieStore.get('ds-user')?.value
  if (!user) redirect('/login')

  return <DashboardShell user={user} />
}
