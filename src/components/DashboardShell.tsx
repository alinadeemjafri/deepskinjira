'use client'

import { useState } from 'react'
import { EpicsProvider } from '@/context/EpicsContext'
import Sidebar from '@/components/Sidebar'
import BoardView from '@/components/views/BoardView'
import BacklogView from '@/components/views/BacklogView'
import TimelineView from '@/components/views/TimelineView'

export type View = 'board' | 'backlog' | 'timeline'

export default function DashboardShell({ user }: { user: string }) {
  const [view, setView] = useState<View>('board')

  return (
    <EpicsProvider>
      <div className="flex h-screen overflow-hidden bg-cream-light">
        <Sidebar user={user} view={view} setView={setView} />
        <main className="flex-1 overflow-auto p-4 pt-18 md:p-6 md:pt-6">
          {view === 'board' && <BoardView />}
          {view === 'backlog' && <BacklogView />}
          {view === 'timeline' && <TimelineView />}
        </main>
      </div>
    </EpicsProvider>
  )
}
