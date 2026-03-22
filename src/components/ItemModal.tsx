'use client'

import { useState, useRef, useEffect } from 'react'
import type { Epic, Story, Status, Priority, Attachment } from '@/lib/types'
import { STATUS_LABELS, PRIORITY_LABELS, EPIC_COLORS, STATUS_COLORS, PRIORITY_COLORS } from '@/lib/types'

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
  const [color, setColor] = useState(item.type === 'epic' ? item.color : '')
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [loadingAttachments, setLoadingAttachments] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingTitle, setEditingTitle] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const titleRef = useRef<HTMLInputElement>(null)

  const isEpic = item.type === 'epic'
  const endpoint = isEpic ? `/api/epics/${item.id}` : `/api/stories/${item.id}`

  // Fetch full item with attachments on mount
  useEffect(() => {
    async function fetchDetails() {
      const res = await fetch(endpoint)
      const data = await res.json()
      setAttachments(data.attachments || [])
      setLoadingAttachments(false)
    }
    fetchDetails()
  }, [endpoint])

  useEffect(() => {
    if (editingTitle && titleRef.current) {
      titleRef.current.focus()
      titleRef.current.select()
    }
  }, [editingTitle])

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
    if (!confirm(`Delete this ${item.type}? This cannot be undone.`)) return
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
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const newAttachment = await res.json()
    setAttachments((prev) => [...prev, newAttachment])
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handleDeleteAttachment(id: string) {
    setAttachments((prev) => prev.filter((a) => a.id !== id))
    await fetch(`/api/attachments/${id}`, { method: 'DELETE' })
  }

  const epicForStory = !isEpic && epics ? epics.find((e) => e.id === epicId) : null

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-start justify-center md:pt-10 md:px-4" onClick={onClose}>
      <div className="fixed inset-0 bg-black/40" />
      <div
        className="relative bg-white w-full h-full md:h-auto md:rounded-xl shadow-2xl md:max-w-4xl md:max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-cream-dark px-4 sm:px-6 py-3 flex items-center justify-between md:rounded-t-xl z-10">
          <div className="flex items-center gap-3">
            {isEpic ? (
              <span className="px-2.5 py-1 rounded text-xs font-semibold text-white" style={{ backgroundColor: item.color }}>
                EPIC
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-700">
                STORY
              </span>
            )}
            {!isEpic && epicForStory && (
              <span className="text-xs text-taupe">
                in <span className="font-medium" style={{ color: epicForStory.color }}>{epicForStory.title}</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleDelete}
              className="px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer"
            >
              Delete
            </button>
            <button onClick={onClose} className="text-taupe hover:text-near-black transition cursor-pointer p-1.5 hover:bg-cream rounded-lg">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row">
          {/* Left: Main content */}
          <div className="flex-1 p-4 sm:p-6 space-y-5 md:border-r md:border-cream-dark">
            {/* Title */}
            <div>
              {editingTitle ? (
                <input
                  ref={titleRef}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={() => setEditingTitle(false)}
                  onKeyDown={(e) => { if (e.key === 'Enter') setEditingTitle(false) }}
                  className="w-full text-xl sm:text-2xl font-serif font-bold text-near-black bg-transparent border-b-2 border-navy focus:outline-none pb-1"
                />
              ) : (
                <h2
                  onClick={() => setEditingTitle(true)}
                  className="text-xl sm:text-2xl font-serif font-bold text-near-black cursor-pointer hover:text-navy transition pb-1 border-b-2 border-transparent hover:border-taupe-light"
                >
                  {title}
                </h2>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-taupe uppercase tracking-wider mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                placeholder="Add a description..."
                className="w-full px-3 py-2.5 rounded-lg border border-taupe-light bg-cream-light text-near-black text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent resize-y placeholder:text-taupe"
              />
            </div>

            {/* Attachments */}
            <div>
              <label className="block text-xs font-semibold text-taupe uppercase tracking-wider mb-2">
                Attachments {!loadingAttachments && attachments.length > 0 && `(${attachments.length})`}
              </label>
              {loadingAttachments ? (
                <p className="text-sm text-taupe">Loading...</p>
              ) : (
                <>
                  {attachments.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                      {attachments.map((att) => (
                        <div key={att.id} className="flex items-center gap-2 px-3 py-2.5 bg-cream rounded-lg group">
                          <div className="w-8 h-8 rounded bg-taupe-light flex items-center justify-center shrink-0">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-navy">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                            </svg>
                          </div>
                          <a
                            href={att.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-navy hover:underline truncate flex-1"
                          >
                            {att.filename}
                          </a>
                          <button
                            onClick={() => handleDeleteAttachment(att.id)}
                            className="text-taupe hover:text-red-500 transition cursor-pointer opacity-0 group-hover:opacity-100"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <input ref={fileRef} type="file" className="hidden" onChange={handleUpload} />
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-2 px-3 py-2 text-sm border border-dashed border-taupe rounded-lg text-taupe hover:text-navy hover:border-navy transition cursor-pointer disabled:opacity-50"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                    </svg>
                    {uploading ? 'Uploading...' : 'Attach a file'}
                  </button>
                </>
              )}
            </div>

            {/* Stories list for Epics */}
            {isEpic && item.stories && item.stories.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-taupe uppercase tracking-wider mb-2">
                  Stories ({item.stories.length})
                </label>
                <div className="space-y-1.5">
                  {item.stories.map((story: Story) => (
                    <div key={story.id} className="flex items-center gap-2 px-3 py-2 bg-cream rounded-lg">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${
                        story.status === 'DONE' ? 'bg-green-500' :
                        story.status === 'IN_PROGRESS' ? 'bg-blue-500' :
                        story.status === 'IN_REVIEW' ? 'bg-yellow-500' : 'bg-gray-400'
                      }`} />
                      <span className="text-sm text-near-black flex-1 truncate">{story.title}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${STATUS_COLORS[story.status]}`}>
                        {STATUS_LABELS[story.status]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Details sidebar */}
          <div className="w-full md:w-72 p-4 sm:p-5 space-y-4 bg-cream-light/50 md:bg-transparent">
            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-taupe uppercase tracking-wider mb-1.5">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Status)}
                className={`w-full px-3 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-navy cursor-pointer ${STATUS_COLORS[status]} border-0`}
              >
                {Object.entries(STATUS_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-semibold text-taupe uppercase tracking-wider mb-1.5">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className={`w-full px-3 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-navy cursor-pointer ${PRIORITY_COLORS[priority]} border-0`}
              >
                {Object.entries(PRIORITY_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>

            {/* Assignee */}
            <div>
              <label className="block text-xs font-semibold text-taupe uppercase tracking-wider mb-1.5">Assignee</label>
              <select
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-taupe-light bg-white text-sm text-near-black focus:outline-none focus:ring-2 focus:ring-navy cursor-pointer"
              >
                <option value="">Unassigned</option>
                <option value="Ali">Ali</option>
                <option value="Waleed">Waleed</option>
              </select>
            </div>

            {/* Epic (for stories) */}
            {!isEpic && epics && (
              <div>
                <label className="block text-xs font-semibold text-taupe uppercase tracking-wider mb-1.5">Epic</label>
                <select
                  value={epicId}
                  onChange={(e) => setEpicId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-taupe-light bg-white text-sm text-near-black focus:outline-none focus:ring-2 focus:ring-navy cursor-pointer"
                >
                  {epics.map((ep) => (
                    <option key={ep.id} value={ep.id}>{ep.title}</option>
                  ))}
                </select>
              </div>
            )}

            <hr className="border-taupe-light" />

            {/* Dates */}
            <div>
              <label className="block text-xs font-semibold text-taupe uppercase tracking-wider mb-1.5">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-taupe-light bg-white text-sm text-near-black focus:outline-none focus:ring-2 focus:ring-navy cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-taupe uppercase tracking-wider mb-1.5">Due Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-taupe-light bg-white text-sm text-near-black focus:outline-none focus:ring-2 focus:ring-navy cursor-pointer"
              />
            </div>

            {/* Color (epics only) */}
            {isEpic && (
              <div>
                <label className="block text-xs font-semibold text-taupe uppercase tracking-wider mb-1.5">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {EPIC_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full border-2 transition cursor-pointer ${color === c ? 'border-near-black scale-110' : 'border-transparent hover:scale-105'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Meta info */}
            <hr className="border-taupe-light" />
            <div className="text-[11px] text-taupe space-y-1">
              <p>Created by <span className="font-medium text-near-black">{item.createdBy}</span></p>
              <p>Created {new Date(item.createdAt).toLocaleDateString()}</p>
              <p>Updated {new Date(item.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-cream-dark px-4 sm:px-6 py-3 flex justify-end gap-3 md:rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-taupe-light text-near-black hover:bg-cream transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 text-sm rounded-lg bg-navy text-cream-light hover:bg-navy-light transition cursor-pointer disabled:opacity-50 font-medium"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
