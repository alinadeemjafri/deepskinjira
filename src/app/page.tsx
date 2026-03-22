import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export default async function Home() {
  const cookieStore = await cookies()
  const user = cookieStore.get('ds-user')?.value
  if (user) {
    redirect('/board')
  } else {
    redirect('/login')
  }
}
