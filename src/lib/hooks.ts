'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Epic } from './types'

export function useUser(): string {
  const [user, setUser] = useState('')
  useEffect(() => {
    const match = document.cookie.match(/ds-user=([^;]+)/)
    if (match) setUser(match[1]!)
  }, [])
  return user
}

export function useEpics() {
  const [epics, setEpics] = useState<Epic[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const res = await fetch('/api/epics')
    const data = await res.json()
    setEpics(data)
    setLoading(false)
  }, [])

  useEffect(() => { refresh() }, [refresh])

  return { epics, loading, refresh }
}
