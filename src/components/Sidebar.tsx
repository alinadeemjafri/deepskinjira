'use client'

import { useRouter } from 'next/navigation'
import type { View } from '@/components/DashboardShell'

const navItems: { view: View; label: string; icon: () => React.ReactNode }[] = [
  { view: 'board', label: 'Board', icon: BoardIcon },
  { view: 'backlog', label: 'Backlog', icon: BacklogIcon },
  { view: 'timeline', label: 'Timeline', icon: TimelineIcon },
]

interface Props {
  user: string
  view: View
  setView: (v: View) => void
}

export default function Sidebar({ user, view, setView }: Props) {
  const router = useRouter()

  function handleLogout() {
    document.cookie = 'ds-user=; path=/; max-age=0'
    router.push('/login')
  }

  return (
    <header className="fixed top-0 left-0 right-0 h-12 bg-navy text-cream-light flex items-center px-4 sm:px-6 z-40">
      {/* Logo */}
      <h1 className="text-sm font-bold tracking-widest font-serif shrink-0 mr-6 sm:mr-10">
        DEEP SKIN
      </h1>

      {/* Nav tabs */}
      <nav className="flex items-center gap-1 flex-1">
        {navItems.map((item) => {
          const active = view === item.view
          return (
            <button
              key={item.view}
              onClick={() => setView(item.view)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                active
                  ? 'bg-navy-light text-cream-light'
                  : 'text-taupe hover:text-cream-light hover:bg-navy-light/50'
              }`}
            >
              <item.icon />
              <span className="hidden sm:inline">{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* User */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-green flex items-center justify-center text-xs font-bold text-white">
            {user[0]}
          </div>
          <span className="text-sm font-medium hidden sm:inline">{user}</span>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs text-taupe hover:text-cream-light transition-colors cursor-pointer"
        >
          Logout
        </button>
      </div>
    </header>
  )
}

function BoardIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
    </svg>
  )
}

function BacklogIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  )
}

function TimelineIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
      <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
      <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
      <line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" />
      <line x1="17" y1="16" x2="23" y2="16" />
    </svg>
  )
}
