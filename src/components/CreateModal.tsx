'use client'

import { useState } from 'react'
import type { Epic, Status, Priority } from '@/lib/types'
import { STATUS_LABELS, PRIORITY_LABELS, EPIC_COLORS } from '@/lib/types'
import { useUser } from '@/lib/hooks'

interface Props {
  type: 'epic' | 'story'
  epics?: Epic[]
  defaultEpicId?: string
  onClose: () => void
  onCreated: () => void
}

export default function CreateModal({ type, epics, defaultEpicId, onClose, onCreated }: Props) {
  const user = useUser()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<Status>('TODO')
  const [priority, setPriority] = useState<Priority>('MEDIUM')
  const [assignee, setAssignee] = useState('')
  const [epicId, setEpicId] = useState(defaultEpicId || (epics?.[0]?.id ?? ''))
  const [color, setColor] = useState(EPIC_COLORS[0]!)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)

    const body: Record<string, unknown> = {
      title: title.trim(),
      description: description || null,
      status,
      priority,
      assignee: assignee || null,
      startDate: startDate || null,
      endDate: endDate || null,
      createdBy: user,
    }

    if (type === 'epic') {
      body.color = color
      await fetch('/api/epics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    } else {
      body.epicId = epicId
      await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    }

    setSaving(false)
    onCreated()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-start justify-center md:pt-20 md:px-4" onClick={onClose}>
      <div className="fixed inset-0 bg-black/40" />
      <div className="relative bg-white w-full h-full md:h-auto md:rounded-xl shadow-2xl md:max-w-lg overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="border-b border-cream-dark px-4 sm:px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-serif font-bold text-near-black">
            Create {type === 'epic' ? 'Epic' : 'Story'}
          </h2>
          <button onClick={onClose} className="text-taupe hover:text-near-black transition cursor-pointer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleCreate} className="p-4 sm:p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-taupe-light bg-cream-light focus:outline-none focus:ring-2 focus:ring-navy"
              autoFocus
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-taupe-light bg-cream-light focus:outline-none focus:ring-2 focus:ring-navy resize-y"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as Status)} className="w-full px-3 py-2 rounded-lg border border-taupe-light bg-cream-light focus:outline-none focus:ring-2 focus:ring-navy">
                {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className="w-full px-3 py-2 rounded-lg border border-taupe-light bg-cream-light focus:outline-none focus:ring-2 focus:ring-navy">
                {Object.entries(PRIORITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Assignee</label>
              <select value={assignee} onChange={(e) => setAssignee(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-taupe-light bg-cream-light focus:outline-none focus:ring-2 focus:ring-navy">
                <option value="">Unassigned</option>
                <option value="Ali">Ali</option>
                <option value="Waleed">Waleed</option>
              </select>
            </div>
            {type === 'story' && epics && (
              <div>
                <label className="block text-sm font-medium mb-1">Epic</label>
                <select value={epicId} onChange={(e) => setEpicId(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-taupe-light bg-cream-light focus:outline-none focus:ring-2 focus:ring-navy">
                  {epics.map((ep) => <option key={ep.id} value={ep.id}>{ep.title}</option>)}
                </select>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-taupe-light bg-cream-light focus:outline-none focus:ring-2 focus:ring-navy" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-taupe-light bg-cream-light focus:outline-none focus:ring-2 focus:ring-navy" />
            </div>
          </div>
          {type === 'epic' && (
            <div>
              <label className="block text-sm font-medium mb-1">Color</label>
              <div className="flex gap-2">
                {EPIC_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-full border-2 transition cursor-pointer ${color === c ? 'border-near-black scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-taupe-light hover:bg-cream transition cursor-pointer">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-navy text-cream-light hover:bg-navy-light transition cursor-pointer disabled:opacity-50">
              {saving ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
