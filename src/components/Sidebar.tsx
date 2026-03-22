'use client'

import { useState } from 'react'
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
  const [open, setOpen] = useState(false)

  function handleLogout() {
    document.cookie = 'ds-user=; path=/; max-age=0'
    router.push('/login')
  }

  function handleNav(v: View) {
    setView(v)
    setOpen(false)
  }

  return (
    <>
      {/* Mobile top bar */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-navy text-cream-light flex items-center justify-between px-4 z-40 md:hidden">
        <button onClick={() => setOpen(true)} className="p-1.5 cursor-pointer" aria-label="Open menu">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <h1 className="text-sm font-bold tracking-widest font-serif">DEEP SKIN</h1>
        <div className="w-7 h-7 rounded-full bg-green flex items-center justify-center text-xs font-bold text-white">
          {user[0]}
        </div>
      </div>

      {/* Backdrop */}
      {open && (
        <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-navy text-cream-light flex flex-col z-50 transition-transform duration-300 ease-in-out md:static md:w-60 md:translate-x-0 md:shrink-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-navy-light flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-widest font-serif">DEEP SKIN</h1>
            <p className="text-xs text-taupe mt-1 tracking-wider uppercase">Project Board</p>
          </div>
          <button onClick={() => setOpen(false)} className="md:hidden p-1 cursor-pointer text-taupe hover:text-cream-light">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 py-4">
          {navItems.map((item) => {
            const active = view === item.view
            return (
              <button
                key={item.view}
                onClick={() => handleNav(item.view)}
                className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors w-full text-left cursor-pointer ${
                  active
                    ? 'bg-navy-light text-cream-light'
                    : 'text-taupe hover:text-cream-light hover:bg-navy-light/50'
                }`}
              >
                <item.icon />
                {item.label}
              </button>
            )
          })}
        </nav>

        <div className="p-4 border-t border-navy-light">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green flex items-center justify-center text-sm font-bold text-white">
                {user[0]}
              </div>
              <span className="text-sm font-medium">{user}</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-xs text-taupe hover:text-cream-light transition-colors cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

function BoardIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
    </svg>
  )
}

function BacklogIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  )
}

function TimelineIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
      <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
      <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
      <line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" />
      <line x1="17" y1="16" x2="23" y2="16" />
    </svg>
  )
}
