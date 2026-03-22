'use client'

import { useState } from 'react'
import { useEpics } from '@/context/EpicsContext'
import type { Epic, Story, Status } from '@/lib/types'
import { STATUS_LABELS, STATUS_COLORS, PRIORITY_COLORS, PRIORITY_LABELS } from '@/lib/types'
import ItemModal from '@/components/ItemModal'
import CreateModal from '@/components/CreateModal'

const STATUSES: Status[] = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']

export default function BoardPage() {
  const { epics, loading, refresh, updateStoryStatus } = useEpics()
  const [selectedItem, setSelectedItem] = useState<{ item: Epic | Story; type: 'epic' | 'story' } | null>(null)
  const [creating, setCreating] = useState<{ type: 'epic' | 'story'; epicId?: string } | null>(null)
  const [filterEpic, setFilterEpic] = useState<string>('all')

  if (loading) {
    return <div className="flex items-center justify-center h-full text-taupe">Loading...</div>
  }

  // Collect all stories grouped by status
  const storiesByStatus: Record<Status, (Story & { epicColor: string; epicTitle: string })[]> = {
    TODO: [], IN_PROGRESS: [], IN_REVIEW: [], DONE: [],
  }

  epics.forEach((epic) => {
    if (filterEpic !== 'all' && epic.id !== filterEpic) return
    epic.stories.forEach((story) => {
      storiesByStatus[story.status].push({
        ...story,
        epicColor: epic.color,
        epicTitle: epic.title,
      })
    })
  })

  function handleDrop(storyId: string, newStatus: Status) {
    updateStoryStatus(storyId, newStatus)
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-near-black">Board</h1>
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <select
            value={filterEpic}
            onChange={(e) => setFilterEpic(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-taupe-light bg-white focus:outline-none focus:ring-2 focus:ring-navy"
          >
            <option value="all">All Epics</option>
            {epics.map((ep) => (
              <option key={ep.id} value={ep.id}>{ep.title}</option>
            ))}
          </select>
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

      {/* Epic chips */}
      <div className="flex flex-wrap gap-2 mb-5">
        {epics.map((epic) => (
          <button
            key={epic.id}
            onClick={() => setSelectedItem({ item: epic, type: 'epic' })}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium text-white hover:opacity-80 transition cursor-pointer"
            style={{ backgroundColor: epic.color }}
          >
            <span className="w-2 h-2 rounded-full bg-white/40" />
            {epic.title}
            <span className="bg-white/20 rounded-full px-1.5">{epic.stories.length}</span>
          </button>
        ))}
      </div>

      {/* Kanban columns */}
      <div className="flex overflow-x-auto gap-4 pb-4 md:grid md:grid-cols-4 md:overflow-x-visible md:pb-0">
        {STATUSES.map((status) => (
          <div
            key={status}
            className="bg-cream rounded-xl p-4 min-h-[300px] min-w-[280px] md:min-w-0 shrink-0 md:shrink"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              const storyId = e.dataTransfer.getData('storyId')
              if (storyId) handleDrop(storyId, status)
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[status]}`}>
                {STATUS_LABELS[status]}
              </span>
              <span className="text-xs text-taupe">{storiesByStatus[status].length}</span>
            </div>
            <div className="space-y-3">
              {storiesByStatus[status].map((story) => (
                <div
                  key={story.id}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData('storyId', story.id)}
                  onClick={() => setSelectedItem({ item: story, type: 'story' })}
                  className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition cursor-pointer border border-cream-dark"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: story.epicColor }}
                      title={story.epicTitle}
                    />
                    <span className="text-[10px] text-taupe truncate">{story.epicTitle}</span>
                  </div>
                  <p className="text-sm font-medium text-near-black mb-2">{story.title}</p>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${PRIORITY_COLORS[story.priority]}`}>
                      {PRIORITY_LABELS[story.priority]}
                    </span>
                    {story.assignee && (
                      <div className="w-6 h-6 rounded-full bg-green text-white flex items-center justify-center text-[10px] font-bold">
                        {story.assignee[0]}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

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
