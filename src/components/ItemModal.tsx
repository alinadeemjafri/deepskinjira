'use client'

import { useState, useRef } from 'react'
import type { Epic, Story, Status, Priority, Attachment } from '@/lib/types'
import { STATUS_LABELS, PRIORITY_LABELS, EPIC_COLORS } from '@/lib/types'

type Item = (Epic & { type: 'epic' }) | (Story & { type: 'story' })

interface Props {
  item: Item
  epics?: Epic[]
  onClose: () => void
  onUpdate: () => void
}

export default function ItemModal({ item, epics, onClose, onUpdate }: Props) {
  const [title, setTitle] = useState(item.title)
  const [description, setDescription] = useState(item.description || '')
  const [status, setStatus] = useState<Status>(item.status)
  const [priority, setPriority] = useState<Priority>(item.priority)
  const [assignee, setAssignee] = useState(item.assignee || '')
  const [startDate, setStartDate] = useState(item.startDate?.split('T')[0] || '')
  const [endDate, setEndDate] = useState(item.endDate?.split('T')[0] || '')
  const [epicId, setEpicId] = useState(item.type === 'story' ? item.epicId : '')
  const [storyPoints, setStoryPoints] = useState(item.type === 'story' ? (item.storyPoints ?? '') : '')
  const [color, setColor] = useState(item.type === 'epic' ? item.color : '')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const isEpic = item.type === 'epic'
  const endpoint = isEpic ? `/api/epics/${item.id}` : `/api/stories/${item.id}`

  async function handleSave() {
    setSaving(true)
    const body: Record<string, unknown> = {
      title, description, status, priority,
      assignee: assignee || null,
      startDate: startDate || null,
      endDate: endDate || null,
    }
    if (isEpic) body.color = color
    if (!isEpic) {
      body.epicId = epicId
      body.storyPoints = storyPoints ? Number(storyPoints) : null
    }
    await fetch(endpoint, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    setSaving(false)
    onUpdate()
  }

  async function handleDelete() {
    if (!confirm(`Delete this ${item.type}?`)) return
    await fetch(endpoint, { method: 'DELETE' })
    onUpdate()
    onClose()
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    if (isEpic) fd.append('epicId', item.id)
    else fd.append('storyId', item.id)
    await fetch('/api/upload', { method: 'POST', body: fd })
    setUploading(false)
    onUpdate()
  }

  async function handleDeleteAttachment(id: string) {
    await fetch(`/api/attachments/${id}`, { method: 'DELETE' })
    onUpdate()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4" onClick={onClose}>
      <div className="fixed inset-0 bg-black/40" />
      <div
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-cream-dark px-6 py-4 flex items-center justify-between rounded-t-xl z-10">
          <h2 className="text-xl font-serif font-bold text-near-black">
            {isEpic ? 'Epic' : 'Story'} Details
          </h2>
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
            >
              Delete
            </button>
            <button onClick={onClose} className="text-taupe hover:text-near-black transition cursor-pointer p-1">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-near-black mb-1">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-taupe-light bg-cream-light text-near-black focus:outline-none focus:ring-2 focus:ring-navy"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-near-black mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 rounded-lg border border-taupe-light bg-cream-light text-near-black focus:outline-none focus:ring-2 focus:ring-navy resize-y"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-near-black mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Status)}
                className="w-full px-3 py-2 rounded-lg border border-taupe-light bg-cream-light text-near-black focus:outline-none focus:ring-2 focus:ring-navy"
              >
                {Object.entries(STATUS_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-near-black mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 rounded-lg border border-taupe-light bg-cream-light text-near-black focus:outline-none focus:ring-2 focus:ring-navy"
              >
                {Object.entries(PRIORITY_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-near-black mb-1">Assignee</label>
              <select
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-taupe-light bg-cream-light text-near-black focus:outline-none focus:ring-2 focus:ring-navy"
              >
                <option value="">Unassigned</option>
                <option value="Ali">Ali</option>
                <option value="Waleed">Waleed</option>
              </select>
            </div>
            {!isEpic && (
              <div>
                <label className="block text-sm font-medium text-near-black mb-1">Story Points</label>
                <input
                  type="number"
                  min={0}
                  value={storyPoints}
                  onChange={(e) => setStoryPoints(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-taupe-light bg-cream-light text-near-black focus:outline-none focus:ring-2 focus:ring-navy"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-near-black mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-taupe-light bg-cream-light text-near-black focus:outline-none focus:ring-2 focus:ring-navy"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-near-black mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-taupe-light bg-cream-light text-near-black focus:outline-none focus:ring-2 focus:ring-navy"
              />
            </div>
          </div>

          {!isEpic && epics && (
            <div>
              <label className="block text-sm font-medium text-near-black mb-1">Epic</label>
              <select
                value={epicId}
                onChange={(e) => setEpicId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-taupe-light bg-cream-light text-near-black focus:outline-none focus:ring-2 focus:ring-navy"
              >
                {epics.map((ep) => (
                  <option key={ep.id} value={ep.id}>{ep.title}</option>
                ))}
              </select>
            </div>
          )}

          {isEpic && (
            <div>
              <label className="block text-sm font-medium text-near-black mb-1">Color</label>
              <div className="flex gap-2">
                {EPIC_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-full border-2 transition cursor-pointer ${color === c ? 'border-near-black scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Attachments */}
          <div>
            <label className="block text-sm font-medium text-near-black mb-2">Attachments</label>
            <div className="space-y-2">
              {item.attachments.map((att: Attachment) => (
                <div key={att.id} className="flex items-center justify-between px-3 py-2 bg-cream rounded-lg">
                  <a
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-navy hover:underline truncate"
                  >
                    {att.filename}
                  </a>
                  <button
                    onClick={() => handleDeleteAttachment(att.id)}
                    className="text-red-400 hover:text-red-600 transition ml-2 cursor-pointer"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            <input ref={fileRef} type="file" className="hidden" onChange={handleUpload} />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="mt-2 px-4 py-2 text-sm border border-taupe-light rounded-lg text-near-black hover:bg-cream transition cursor-pointer disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : '+ Attach File'}
            </button>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-cream-dark px-6 py-4 flex justify-end gap-3 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-taupe-light text-near-black hover:bg-cream transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm rounded-lg bg-navy text-cream-light hover:bg-navy-light transition cursor-pointer disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
