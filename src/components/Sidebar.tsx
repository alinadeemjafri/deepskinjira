'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const navItems = [
  { href: '/board', label: 'Board', icon: BoardIcon },
  { href: '/backlog', label: 'Backlog', icon: BacklogIcon },
  { href: '/timeline', label: 'Timeline', icon: TimelineIcon },
]

export default function Sidebar({ user }: { user: string }) {
  const pathname = usePathname()
  const router = useRouter()

  function handleLogout() {
    document.cookie = 'ds-user=; path=/; max-age=0'
    router.push('/login')
  }

  return (
    <aside className="w-60 bg-navy text-cream-light flex flex-col shrink-0">
      <div className="p-6 border-b border-navy-light">
        <h1 className="text-xl font-bold tracking-widest font-serif">DEEP SKIN</h1>
        <p className="text-xs text-taupe mt-1 tracking-wider uppercase">Project Board</p>
      </div>

      <nav className="flex-1 py-4">
        {navItems.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors ${
                active
                  ? 'bg-navy-light text-cream-light'
                  : 'text-taupe hover:text-cream-light hover:bg-navy-light/50'
              }`}
            >
              <item.icon />
              {item.label}
            </Link>
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
