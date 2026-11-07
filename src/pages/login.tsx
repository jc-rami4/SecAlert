// src/pages/Login.tsx
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../auth/authContext'

export default function Login() {
  const { session, role, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Already logged in? Send them to the right page.
  if (!loading && session && role) {
    return <Navigate to={role === 'admin' ? '/admin' : '/dashboard'} replace />
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 320, margin: '80px auto', display: 'grid', gap: 12 }}>
      <h1>Sign in</h1>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit" disabled={submitting}>
        {submitting ? 'Signing in...' : 'Sign in'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  )
}