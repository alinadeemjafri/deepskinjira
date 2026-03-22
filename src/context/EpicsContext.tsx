'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { Epic } from '@/lib/types'

interface EpicsContextValue {
  epics: Epic[]
  loading: boolean
  refresh: () => Promise<void>
}

const EpicsContext = createContext<EpicsContextValue>({
  epics: [],
  loading: true,
  refresh: async () => {},
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

  return (
    <EpicsContext.Provider value={{ epics, loading, refresh }}>
      {children}
    </EpicsContext.Provider>
  )
}

export function useEpics() {
  return useContext(EpicsContext)
}
