'use client'

import { useState, useMemo } from 'react'
import { useEpics } from '@/context/EpicsContext'
import type { Epic, Story } from '@/lib/types'
import { STATUS_COLORS, STATUS_LABELS } from '@/lib/types'
import ItemModal from '@/components/ItemModal'
import CreateModal from '@/components/CreateModal'
import { format, addDays, differenceInDays, startOfWeek, endOfWeek, eachDayOfInterval, isToday } from 'date-fns'

export default function TimelineView() {
  const { epics, loading, refresh } = useEpics()
  const [selectedItem, setSelectedItem] = useState<{ item: Epic | Story; type: 'epic' | 'story' } | null>(null)
  const [creating, setCreating] = useState<{ type: 'epic' | 'story' } | null>(null)
  const [weeksOffset, setWeeksOffset] = useState(0)

  const { timelineStart, timelineDays, weeks } = useMemo(() => {
    const today = new Date()
    const start = addDays(startOfWeek(today, { weekStartsOn: 1 }), weeksOffset * 7)
    const totalWeeks = 8
    const end = addDays(start, totalWeeks * 7 - 1)
    const days = eachDayOfInterval({ start, end })

    const weekGroups: Date[][] = []
    for (let i = 0; i < totalWeeks; i++) {
      const weekStart = addDays(start, i * 7)
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })
      weekGroups.push(eachDayOfInterval({ start: weekStart, end: weekEnd > end ? end : weekEnd }))
    }

    return { timelineStart: start, timelineDays: days, weeks: weekGroups }
  }, [weeksOffset])

  const totalDays = timelineDays.length

  function getBarStyle(startDate: string | null, endDate: string | null, color: string) {
    if (!startDate) return null
    const start = new Date(startDate)
    const end = endDate ? new Date(endDate) : addDays(start, 7)
    const startOffset = differenceInDays(start, timelineStart)
    const duration = differenceInDays(end, start) + 1

    if (startOffset + duration < 0 || startOffset > totalDays) return null

    const left = Math.max(0, (startOffset / totalDays) * 100)
    const width = Math.min(
      ((Math.min(duration, totalDays - startOffset)) / totalDays) * 100,
      100 - left
    )

    return {
      left: `${left}%`,
      width: `${Math.max(width, 1.5)}%`,
      backgroundColor: color,
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-full text-taupe">Loading...</div>
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-near-black">Timeline</h1>
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setWeeksOffset((o) => o - 4)}
              className="px-2 sm:px-3 py-2 text-sm border border-taupe-light rounded-lg hover:bg-cream transition cursor-pointer"
            >
              &larr;
            </button>
            <button
              onClick={() => setWeeksOffset(0)}
              className="px-2 sm:px-3 py-2 text-sm border border-taupe-light rounded-lg hover:bg-cream transition cursor-pointer"
            >
              Today
            </button>
            <button
              onClick={() => setWeeksOffset((o) => o + 4)}
              className="px-2 sm:px-3 py-2 text-sm border border-taupe-light rounded-lg hover:bg-cream transition cursor-pointer"
            >
              &rarr;
            </button>
          </div>
          <button
            onClick={() => setCreating({ type: 'epic' })}
            className="px-4 py-2 text-sm bg-navy text-cream-light rounded-lg hover:bg-navy-light transition cursor-pointer"
          >
            + Epic
          </button>
        </div>
      </div>

      {epics.length === 0 ? (
        <div className="text-center py-20 text-taupe">
          <p className="text-lg mb-2">No epics yet</p>
          <p className="text-sm">Create your first epic with dates to see the timeline</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-cream-dark overflow-x-auto">
          <div className="min-w-[800px]">
          {/* Header with weeks */}
          <div className="flex border-b border-cream-dark">
            <div className="w-64 shrink-0 px-4 py-3 bg-cream-light border-r border-cream-dark">
              <span className="text-xs font-medium text-taupe uppercase tracking-wider">Work Item</span>
            </div>
            <div className="flex-1 flex">
              {weeks.map((week, i) => (
                <div
                  key={i}
                  className="flex-1 text-center py-3 border-r border-cream-light last:border-r-0"
                >
                  <span className="text-[10px] text-taupe">
                    {format(week[0]!, 'MMM d')} - {format(week[week.length - 1]!, 'MMM d')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Rows */}
          {epics.map((epic) => (
            <div key={epic.id}>
              {/* Epic row */}
              <div className="flex border-b border-cream-light hover:bg-cream-light/50 transition">
                <div
                  className="w-64 shrink-0 px-4 py-3 border-r border-cream-dark flex items-center gap-2 cursor-pointer hover:bg-cream-light"
                  onClick={() => setSelectedItem({ item: epic, type: 'epic' })}
                >
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: epic.color }} />
                  <span className="text-sm font-medium text-near-black truncate">{epic.title}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ml-auto shrink-0 ${STATUS_COLORS[epic.status]}`}>
                    {STATUS_LABELS[epic.status]}
                  </span>
                </div>
                <div className="flex-1 relative py-3 px-1">
                  {/* Today line */}
                  {timelineDays.some((d) => isToday(d)) && (
                    <div
                      className="absolute top-0 bottom-0 w-px bg-red-400 z-10"
                      style={{ left: `${(differenceInDays(new Date(), timelineStart) / totalDays) * 100}%` }}
                    />
                  )}
                  {(() => {
                    const style = getBarStyle(epic.startDate, epic.endDate, epic.color)
                    if (!style) return <div className="text-[10px] text-taupe py-1 text-center">No dates set</div>
                    return (
                      <div
                        className="absolute top-2.5 h-5 rounded-full opacity-80 hover:opacity-100 transition"
                        style={style}
                      />
                    )
                  })()}
                </div>
              </div>

              {/* Story rows */}
              {epic.stories.map((story) => (
                <div
                  key={story.id}
                  className="flex border-b border-cream-light hover:bg-cream-light/50 transition"
                >
                  <div
                    className="w-64 shrink-0 px-4 py-2.5 border-r border-cream-dark flex items-center gap-2 pl-10 cursor-pointer hover:bg-cream-light"
                    onClick={() => setSelectedItem({ item: story, type: 'story' })}
                  >
                    <span className="text-xs text-near-black truncate">{story.title}</span>
                    {story.assignee && (
                      <div className="w-5 h-5 rounded-full bg-green text-white flex items-center justify-center text-[9px] font-bold ml-auto shrink-0">
                        {story.assignee[0]}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 relative py-2.5 px-1">
                    {(() => {
                      const style = getBarStyle(story.startDate, story.endDate, epic.color + '99')
                      if (!style) return null
                      return (
                        <div
                          className="absolute top-2 h-4 rounded-full hover:opacity-100 transition"
                          style={style}
                        />
                      )
                    })()}
                  </div>
                </div>
              ))}
            </div>
          ))}
          </div>
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
          onClose={() => setCreating(null)}
          onCreated={refresh}
        />
      )}
    </div>
  )
}
