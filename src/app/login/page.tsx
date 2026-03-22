'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim().toLowerCase()
    if (trimmed !== 'ali' && trimmed !== 'waleed') {
      setError('Please enter Ali or Waleed')
      return
    }
    const displayName = trimmed === 'ali' ? 'Ali' : 'Waleed'
    document.cookie = `ds-user=${displayName}; path=/; max-age=${60 * 60 * 24 * 365}`
    router.push('/board')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream-light">
      <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-navy tracking-wide">DEEP SKIN</h1>
          <p className="text-taupe mt-2 text-sm tracking-widest uppercase">Project Board</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-near-black mb-1.5">
              Your Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => { setError(''); setName(e.target.value) }}
              placeholder="Ali or Waleed"
              className="w-full px-4 py-3 rounded-lg border border-taupe-light bg-cream-light text-near-black placeholder:text-taupe focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent transition"
              autoFocus
            />
            {error && <p className="text-red-500 text-sm mt-1.5">{error}</p>}
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-navy text-cream-light rounded-lg font-medium hover:bg-navy-light transition-colors cursor-pointer"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  )
}
