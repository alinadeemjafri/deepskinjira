'use client'

import { useState, useRef, useEffect } from 'react'
import type { Epic, Story, Status, Priority, Attachment, SubTask, Comment, ItemLink } from '@/lib/types'
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
  const [subtasks, setSubtasks] = useState<SubTask[]>([])
  const [newSubtask, setNewSubtask] = useState('')
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [postingComment, setPostingComment] = useState(false)
  const [links, setLinks] = useState<ItemLink[]>([])
  const [linkTarget, setLinkTarget] = useState('')
  const [loadingDetails, setLoadingDetails] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingTitle, setEditingTitle] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const titleRef = useRef<HTMLInputElement>(null)

  const currentUser = typeof document !== 'undefined'
    ? document.cookie.split(';').find(c => c.trim().startsWith('ds-user='))?.split('=')[1] ?? 'Unknown'
    : 'Unknown'

  const isEpic = item.type === 'epic'
  const endpoint = isEpic ? `/api/epics/${item.id}` : `/api/stories/${item.id}`

  // Fetch full item with attachments + subtasks on mount
  useEffect(() => {
    async function fetchDetails() {
      const res = await fetch(endpoint)
      const data = await res.json()
      setAttachments(data.attachments || [])
      if (!isEpic) setSubtasks(data.subtasks || [])
      setComments(data.comments || [])
      setLinks(data.links || [])
      setLoadingDetails(false)
    }
    fetchDetails()
  }, [endpoint, isEpic])

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

  async function handleAddSubtask(e: React.FormEvent) {
    e.preventDefault()
    if (!newSubtask.trim()) return
    const res = await fetch('/api/subtasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newSubtask.trim(), storyId: item.id }),
    })
    const created = await res.json()
    setSubtasks((prev) => [...prev, created])
    setNewSubtask('')
  }

  async function handleToggleSubtask(id: string, done: boolean) {
    setSubtasks((prev) => prev.map((s) => s.id === id ? { ...s, done } : s))
    await fetch(`/api/subtasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done }),
    })
  }

  async function handleDeleteSubtask(id: string) {
    setSubtasks((prev) => prev.filter((s) => s.id !== id))
    await fetch(`/api/subtasks/${id}`, { method: 'DELETE' })
  }

  async function handlePostComment(e: React.FormEvent) {
    e.preventDefault()
    if (!newComment.trim()) return
    setPostingComment(true)
    const body: Record<string, unknown> = { content: newComment.trim(), author: currentUser }
    if (isEpic) body.epicId = item.id
    else body.storyId = item.id
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const created = await res.json()
    setComments((prev) => [...prev, created])
    setNewComment('')
    setPostingComment(false)
  }

  async function handleDeleteComment(id: string) {
    setComments((prev) => prev.filter((c) => c.id !== id))
    await fetch(`/api/comments/${id}`, { method: 'DELETE' })
  }

  async function handleAddLink(e: React.FormEvent) {
    e.preventDefault()
    if (!linkTarget) return
    const [targetType, targetId] = linkTarget.split(':')
    const res = await fetch('/api/links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sourceType: item.type,
        sourceId: item.id,
        targetType,
        targetId,
      }),
    })
    const created = await res.json()
    setLinks((prev) => [...prev, created])
    setLinkTarget('')
  }

  async function handleRemoveLink(id: string) {
    setLinks((prev) => prev.filter((l) => l.id !== id))
    await fetch(`/api/links/${id}`, { method: 'DELETE' })
  }

  // Resolve a link to the item on the other end
  function resolveLinkedItem(link: ItemLink) {
    const linkedId = link.sourceId === item.id ? link.targetId : link.sourceId
    const linkedType = link.sourceId === item.id ? link.targetType : link.sourceType
    if (linkedType === 'epic') {
      const epic = epics?.find((e) => e.id === linkedId)
      return epic ? { id: epic.id, title: epic.title, type: 'epic' as const, color: epic.color } : null
    } else {
      for (const epic of (epics || [])) {
        const story = epic.stories.find((s) => s.id === linkedId)
        if (story) return { id: story.id, title: story.title, type: 'story' as const, color: epic.color }
      }
    }
    return null
  }

  // All linkable items (epics + stories) excluding the current item
  const linkableItems = epics
    ? [
        ...epics.filter((e) => e.id !== item.id).map((e) => ({ type: 'epic', id: e.id, title: e.title, color: e.color, groupLabel: 'Epics' })),
        ...(epics.flatMap((e) => e.stories.filter((s) => s.id !== item.id).map((s) => ({ type: 'story', id: s.id, title: s.title, color: e.color, groupLabel: e.title })))),
      ]
    : []

  const doneCount = subtasks.filter((s) => s.done).length
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

            {/* Sub-tasks (stories only) */}
            {!isEpic && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-taupe uppercase tracking-wider">
                    Sub-tasks {subtasks.length > 0 && `(${doneCount}/${subtasks.length})`}
                  </label>
                </div>
                {subtasks.length > 0 && (
                  <>
                    <div className="w-full h-1.5 bg-cream-dark rounded-full overflow-hidden mb-3">
                      <div
                        className="h-full bg-green rounded-full transition-all duration-300"
                        style={{ width: `${subtasks.length > 0 ? (doneCount / subtasks.length) * 100 : 0}%` }}
                      />
                    </div>
                    <div className="space-y-1 mb-3">
                      {subtasks.map((st) => (
                        <div key={st.id} className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-cream transition group">
                          <input
                            type="checkbox"
                            checked={st.done}
                            onChange={(e) => handleToggleSubtask(st.id, e.target.checked)}
                            className="w-4 h-4 rounded border-taupe accent-green cursor-pointer shrink-0"
                          />
                          <span className={`text-sm flex-1 ${st.done ? 'line-through text-taupe' : 'text-near-black'}`}>
                            {st.title}
                          </span>
                          <button
                            onClick={() => handleDeleteSubtask(st.id)}
                            className="text-taupe hover:text-red-500 transition cursor-pointer opacity-0 group-hover:opacity-100"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                {loadingDetails ? (
                  <p className="text-sm text-taupe">Loading...</p>
                ) : (
                  <form onSubmit={handleAddSubtask} className="flex gap-2">
                    <input
                      value={newSubtask}
                      onChange={(e) => setNewSubtask(e.target.value)}
                      placeholder="Add a sub-task..."
                      className="flex-1 px-3 py-2 text-sm rounded-lg border border-taupe-light bg-cream-light text-near-black focus:outline-none focus:ring-2 focus:ring-navy placeholder:text-taupe"
                    />
                    <button
                      type="submit"
                      disabled={!newSubtask.trim()}
                      className="px-3 py-2 text-sm bg-navy text-cream-light rounded-lg hover:bg-navy-light transition cursor-pointer disabled:opacity-30"
                    >
                      Add
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Attachments */}
            <div>
              <label className="block text-xs font-semibold text-taupe uppercase tracking-wider mb-2">
                Attachments {!loadingDetails && attachments.length > 0 && `(${attachments.length})`}
              </label>
              {loadingDetails ? (
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

            {/* Linked Items */}
            <div>
              <label className="block text-xs font-semibold text-taupe uppercase tracking-wider mb-2">
                Linked Items {links.length > 0 && `(${links.length})`}
              </label>
              {links.length > 0 && (
                <div className="space-y-1.5 mb-3">
                  {links.map((link) => {
                    const resolved = resolveLinkedItem(link)
                    if (!resolved) return null
                    return (
                      <div key={link.id} className="flex items-center gap-2 px-3 py-2 bg-cream rounded-lg group">
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-semibold text-white shrink-0"
                          style={{ backgroundColor: resolved.color }}
                        >
                          {resolved.type.toUpperCase()}
                        </span>
                        <span className="text-sm text-near-black flex-1 truncate">{resolved.title}</span>
                        <button
                          onClick={() => handleRemoveLink(link.id)}
                          className="text-taupe hover:text-red-500 transition cursor-pointer opacity-0 group-hover:opacity-100 shrink-0"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
              {!loadingDetails && linkableItems.length > 0 && (
                <form onSubmit={handleAddLink} className="flex gap-2">
                  <select
                    value={linkTarget}
                    onChange={(e) => setLinkTarget(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm rounded-lg border border-taupe-light bg-cream-light text-near-black focus:outline-none focus:ring-2 focus:ring-navy"
                  >
                    <option value="">Link an item...</option>
                    {epics?.filter((e) => e.id !== item.id).length! > 0 && (
                      <optgroup label="Epics">
                        {epics?.filter((e) => e.id !== item.id).map((e) => (
                          <option key={e.id} value={`epic:${e.id}`}>{e.title}</option>
                        ))}
                      </optgroup>
                    )}
                    {epics?.map((e) => {
                      const stories = e.stories.filter((s) => s.id !== item.id)
                      if (stories.length === 0) return null
                      return (
                        <optgroup key={e.id} label={e.title}>
                          {stories.map((s) => (
                            <option key={s.id} value={`story:${s.id}`}>{s.title}</option>
                          ))}
                        </optgroup>
                      )
                    })}
                  </select>
                  <button
                    type="submit"
                    disabled={!linkTarget}
                    className="px-3 py-2 text-sm bg-navy text-cream-light rounded-lg hover:bg-navy-light transition cursor-pointer disabled:opacity-30"
                  >
                    Link
                  </button>
                </form>
              )}
            </div>

            {/* Comments */}
            <div>
              <label className="block text-xs font-semibold text-taupe uppercase tracking-wider mb-2">
                Comments {comments.length > 0 && `(${comments.length})`}
              </label>
              {comments.length > 0 && (
                <div className="space-y-3 mb-3">
                  {comments.map((comment) => (
                    <div key={comment.id} className="group">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 rounded-full bg-green text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                          {comment.author[0]}
                        </div>
                        <span className="text-xs font-semibold text-near-black">{comment.author}</span>
                        <span className="text-[10px] text-taupe">
                          {new Date(comment.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {comment.author === currentUser && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-taupe hover:text-red-500 transition cursor-pointer opacity-0 group-hover:opacity-100 ml-auto"
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-near-black leading-relaxed pl-8 whitespace-pre-wrap">{comment.content}</p>
                    </div>
                  ))}
                </div>
              )}
              <form onSubmit={handlePostComment} className="space-y-2">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  rows={2}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-taupe-light bg-cream-light text-near-black focus:outline-none focus:ring-2 focus:ring-navy placeholder:text-taupe resize-none"
                />
                <button
                  type="submit"
                  disabled={!newComment.trim() || postingComment}
                  className="px-3 py-1.5 text-sm bg-navy text-cream-light rounded-lg hover:bg-navy-light transition cursor-pointer disabled:opacity-30"
                >
                  {postingComment ? 'Posting...' : 'Comment'}
                </button>
              </form>
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
