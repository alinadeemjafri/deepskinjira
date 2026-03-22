'use client'

import { useState } from 'react'
import { useEpics } from '@/lib/hooks'
import type { Epic, Story } from '@/lib/types'
import { STATUS_LABELS, STATUS_COLORS, PRIORITY_COLORS, PRIORITY_LABELS } from '@/lib/types'
import ItemModal from '@/components/ItemModal'
import CreateModal from '@/components/CreateModal'

export default function BacklogPage() {
  const { epics, loading, refresh } = useEpics()
  const [selectedItem, setSelectedItem] = useState<{ item: Epic | Story; type: 'epic' | 'story' } | null>(null)
  const [creating, setCreating] = useState<{ type: 'epic' | 'story'; epicId?: string } | null>(null)
  const [expandedEpics, setExpandedEpics] = useState<Set<string>>(new Set())

  function toggleEpic(id: string) {
    setExpandedEpics((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (loading) {
    return <div className="flex items-center justify-center h-full text-taupe">Loading...</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-near-black">Backlog</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCreating({ type: 'epic' })}
            className="px-4 py-2 text-sm bg-navy text-cream-light rounded-lg hover:bg-navy-light transition cursor-pointer"
          >
            + Epic
          </button>
          {epics.length > 0 && (
            <button
              onClick={() => setCreating({ type: 'story' })}
              className="px-4 py-2 text-sm bg-green text-white rounded-lg hover:opacity-90 transition cursor-pointer"
            >
              + Story
            </button>
          )}
        </div>
      </div>

      {epics.length === 0 ? (
        <div className="text-center py-20 text-taupe">
          <p className="text-lg mb-2">No epics yet</p>
          <p className="text-sm">Create your first epic to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {epics.map((epic) => {
            const expanded = expandedEpics.has(epic.id)
            const doneCount = epic.stories.filter((s) => s.status === 'DONE').length
            const totalCount = epic.stories.length

            return (
              <div key={epic.id} className="bg-white rounded-xl border border-cream-dark overflow-hidden">
                {/* Epic row */}
                <div
                  className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-cream-light transition"
                  onClick={() => toggleEpic(epic.id)}
                >
                  <svg
                    width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    className={`transition-transform shrink-0 ${expanded ? 'rotate-90' : ''}`}
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: epic.color }}
                  />
                  <span
                    className="font-medium text-near-black flex-1 hover:underline"
                    onClick={(e) => { e.stopPropagation(); setSelectedItem({ item: epic, type: 'epic' }) }}
                  >
                    {epic.title}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[epic.status]}`}>
                    {STATUS_LABELS[epic.status]}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${PRIORITY_COLORS[epic.priority]}`}>
                    {PRIORITY_LABELS[epic.priority]}
                  </span>
                  {epic.assignee && (
                    <div className="w-6 h-6 rounded-full bg-green text-white flex items-center justify-center text-[10px] font-bold">
                      {epic.assignee[0]}
                    </div>
                  )}
                  <span className="text-xs text-taupe ml-2">
                    {doneCount}/{totalCount} stories
                  </span>
                  {totalCount > 0 && (
                    <div className="w-20 h-1.5 bg-cream-dark rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green rounded-full transition-all"
                        style={{ width: `${(doneCount / totalCount) * 100}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Stories list */}
                {expanded && (
                  <div className="border-t border-cream-dark">
                    {epic.stories.length === 0 ? (
                      <div className="px-12 py-4 text-sm text-taupe">No stories in this epic</div>
                    ) : (
                      epic.stories.map((story) => (
                        <div
                          key={story.id}
                          className="flex items-center gap-3 px-12 py-3 border-b border-cream-light last:border-b-0 hover:bg-cream-light transition cursor-pointer"
                          onClick={() => setSelectedItem({ item: story, type: 'story' })}
                        >
                          <StatusDot status={story.status} />
                          <span className="text-sm text-near-black flex-1">{story.title}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${STATUS_COLORS[story.status]}`}>
                            {STATUS_LABELS[story.status]}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${PRIORITY_COLORS[story.priority]}`}>
                            {PRIORITY_LABELS[story.priority]}
                          </span>
                          {story.storyPoints && (
                            <span className="text-[10px] text-taupe border border-taupe-light rounded px-1.5 py-0.5">
                              {story.storyPoints} SP
                            </span>
                          )}
                          {story.assignee && (
                            <div className="w-6 h-6 rounded-full bg-green text-white flex items-center justify-center text-[10px] font-bold">
                              {story.assignee[0]}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                    <div className="px-12 py-2 border-t border-cream-light">
                      <button
                        onClick={() => setCreating({ type: 'story', epicId: epic.id })}
                        className="text-sm text-taupe hover:text-navy transition cursor-pointer"
                      >
                        + Add Story
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {selectedItem && (
        <ItemModal
          item={{ ...selectedItem.item, type: selectedItem.type } as any}
          epics={epics}
          onClose={() => setSelectedItem(null)}
          onUpdate={() => { refresh(); setSelectedItem(null) }}
        />
      )}
      {creating && (
        <CreateModal
          type={creating.type}
          epics={epics}
          defaultEpicId={creating.epicId}
          onClose={() => setCreating(null)}
          onCreated={refresh}
        />
      )}
    </div>
  )
}

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    TODO: 'bg-gray-400',
    IN_PROGRESS: 'bg-blue-500',
    IN_REVIEW: 'bg-yellow-500',
    DONE: 'bg-green-500',
  }
  return <span className={`w-2 h-2 rounded-full shrink-0 ${colors[status] || 'bg-gray-400'}`} />
}
