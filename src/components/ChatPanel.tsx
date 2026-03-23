'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useEpics } from '@/context/EpicsContext'

interface Message {
  role: 'user' | 'assistant'
  content: string
  actions?: { tool: string; result: unknown }[]
}

const MUTATION_TOOLS = new Set([
  'create_epic', 'update_epic', 'delete_epic',
  'create_story', 'update_story', 'delete_story',
  'create_subtask', 'delete_subtask',
])

const ACTION_LABELS: Record<string, string> = {
  create_epic: 'Created epic',
  update_epic: 'Updated epic',
  delete_epic: 'Deleted epic',
  create_story: 'Created story',
  update_story: 'Updated story',
  delete_story: 'Deleted story',
  create_subtask: 'Added subtask',
  delete_subtask: 'Removed subtask',
}

export default function ChatPanel({ user }: { user: string }) {
  const { refresh } = useEpics()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hey ${user}! I have full access to the board — ask me anything or tell me what to do.`,
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [unread, setUnread] = useState(false)
  const [mounted, setMounted] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      setTimeout(() => inputRef.current?.focus(), 150)
      setUnread(false)
    }
  }, [open, messages])

  async function handleSend(e?: React.FormEvent) {
    e?.preventDefault()
    const text = input.trim()
    if (!text || loading) return

    const userMsg: Message = { role: 'user', content: text }
    const updated = [...messages, userMsg]
    setMessages(updated)
    setInput('')
    setLoading(true)

    const apiMessages = updated
      .slice(1)
      .map(m => ({ role: m.role, content: m.content }))

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages, user }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.content, actions: data.actions }])
      if (!open) setUnread(true)
      const hasMutation = data.actions?.some((a: { tool: string }) => MUTATION_TOOLS.has(a.tool))
      if (hasMutation) refresh()
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Something went wrong. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const mutationActions = (actions?: { tool: string }[]) =>
    actions?.filter(a => MUTATION_TOOLS.has(a.tool)) ?? []

  if (!mounted) return null

  return createPortal(
    <>
      {/* Chat panel */}
      <div
        ref={panelRef}
        className={`fixed bottom-20 right-4 z-50 w-[380px] max-w-[calc(100vw-2rem)] flex flex-col rounded-2xl shadow-2xl border border-cream-dark bg-white overflow-hidden transition-all duration-300 ease-out ${
          open
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        style={{ maxHeight: 'min(560px, calc(100vh - 120px))' }}
        aria-hidden={!open}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-navy shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center shrink-0">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cream-light">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                <circle cx="8.5" cy="12" r="1.5" fill="currentColor" stroke="none"/>
                <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/>
                <circle cx="15.5" cy="12" r="1.5" fill="currentColor" stroke="none"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-cream-light leading-tight">AI Assistant</p>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                <span className="text-[10px] text-taupe">Online</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setMessages([{ role: 'assistant', content: `Hey ${user}! I have full access to the board — ask me anything or tell me what to do.` }])
              }}
              className="text-[11px] text-taupe hover:text-cream-light transition-colors cursor-pointer px-2 py-1 rounded hover:bg-white/10"
            >
              Clear
            </button>
            <button
              onClick={() => setOpen(false)}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-taupe hover:text-cream-light hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close chat"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 overscroll-contain">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              {/* Avatar */}
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5 ${
                msg.role === 'user' ? 'bg-navy text-cream-light' : 'bg-cream-dark text-taupe'
              }`}>
                {msg.role === 'user' ? user[0].toUpperCase() : 'AI'}
              </div>

              <div className={`flex flex-col gap-1.5 max-w-[78%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                {/* Action badges */}
                {mutationActions(msg.actions).length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {mutationActions(msg.actions).map((a, j) => (
                      <span key={j} className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200 font-medium">
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        {ACTION_LABELS[a.tool] ?? a.tool}
                      </span>
                    ))}
                  </div>
                )}

                {/* Bubble */}
                <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
                  msg.role === 'user'
                    ? 'bg-navy text-cream-light rounded-tr-sm'
                    : 'bg-cream text-near-black rounded-tl-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex gap-2.5 flex-row">
              <div className="w-7 h-7 rounded-full bg-cream-dark flex items-center justify-center text-[11px] font-bold text-taupe shrink-0 mt-0.5">
                AI
              </div>
              <div className="bg-cream rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1 items-center h-4">
                  {[0, 150, 300].map((delay) => (
                    <span
                      key={delay}
                      className="w-1.5 h-1.5 bg-taupe rounded-full animate-bounce"
                      style={{ animationDelay: `${delay}ms`, animationDuration: '1s' }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-3 pb-3 pt-2 border-t border-cream-dark shrink-0">
          <form onSubmit={handleSend} className="flex gap-2 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                e.target.style.height = 'auto'
                e.target.style.height = `${Math.min(e.target.scrollHeight, 96)}px`
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything or give me a task…"
              rows={1}
              disabled={loading}
              className="flex-1 px-3 py-2 text-sm rounded-xl border border-taupe-light bg-cream-light text-near-black focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy placeholder:text-taupe resize-none disabled:opacity-50 transition-colors leading-relaxed"
              style={{ minHeight: '38px', maxHeight: '96px' }}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="w-9 h-9 flex items-center justify-center bg-navy text-cream-light rounded-xl hover:bg-navy-light transition-colors cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed shrink-0"
              aria-label="Send message"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" fill="currentColor" stroke="none" />
              </svg>
            </button>
          </form>
          <p className="text-[10px] text-taupe/60 mt-1.5 pl-1">Enter to send · Shift+Enter for new line</p>
        </div>
      </div>

      {/* Floating trigger button */}
      <button
        onClick={() => { setOpen(o => !o); setUnread(false) }}
        className={`fixed bottom-4 right-4 z-50 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 cursor-pointer ${
          open ? 'bg-navy-light rotate-0 scale-95' : 'bg-navy hover:bg-navy-light hover:scale-105'
        }`}
        aria-label="Toggle AI assistant"
      >
        {open ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-cream-light">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cream-light">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}

        {/* Unread dot */}
        {unread && !open && (
          <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
        )}
      </button>
    </>,
    document.body
  )
}
