'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { Epic, Status } from '@/lib/types'

interface EpicsContextValue {
  epics: Epic[]
  loading: boolean
  refresh: () => Promise<void>
  updateStoryStatus: (storyId: string, newStatus: Status) => void
}

const EpicsContext = createContext<EpicsContextValue>({
  epics: [],
  loading: true,
  refresh: async () => {},
  updateStoryStatus: () => {},
})

export function EpicsProvider({ children }: { children: ReactNode }) {
  const [epics, setEpics] = useState<Epic[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const res = await fetch('/api/epics')
    const data = await res.json()
    setEpics(data)
    setLoading(false)
  }, [])

  useEffect(() => { refresh() }, [refresh])

  // Optimistic update for drag-and-drop status changes
  const updateStoryStatus = useCallback((storyId: string, newStatus: Status) => {
    setEpics((prev) =>
      prev.map((epic) => ({
        ...epic,
        stories: epic.stories.map((story) =>
          story.id === storyId ? { ...story, status: newStatus } : story
        ),
      }))
    )
    // Fire and forget — sync with server in background
    fetch(`/api/stories/${storyId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    }).catch(() => refresh()) // Rollback on error
  }, [refresh])

  return (
    <EpicsContext.Provider value={{ epics, loading, refresh, updateStoryStatus }}>
      {children}
    </EpicsContext.Provider>
  )
}

export function useEpics() {
  return useContext(EpicsContext)
}
