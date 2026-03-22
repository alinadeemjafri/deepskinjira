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
      <div className="h-screen overflow-hidden bg-cream-light flex flex-col">
        <Sidebar user={user} view={view} setView={setView} />
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          {view === 'board' && <BoardView />}
          {view === 'backlog' && <BacklogView />}
          {view === 'timeline' && <TimelineView />}
        </main>
      </div>
    </EpicsProvider>
  )
}
