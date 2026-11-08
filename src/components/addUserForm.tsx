// src/components/AddUserForm.tsx
import { useState } from 'react'
import type { FormEvent } from 'react'
import { FunctionsHttpError } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export default function AddUserForm({ onCreated }: { onCreated: () => void }) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [workPhone, setWorkPhone] = useState('')
  const [mobilePhone, setMobilePhone] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSubmitting(true)

    const { error } = await supabase.functions.invoke('create-user', {
      body: {
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        work_phone: workPhone,
        mobile_phone: mobilePhone,
      },
    })

    if (error) {
      if (error instanceof FunctionsHttpError) {
        const details = await error.context.json().catch(() => null)
        setError(details?.error ?? error.message)
      } else {
        setError(error.message)
      }
    } else {
      setSuccess(`Account created for ${email}.`)
      setFirstName('')
      setLastName('')
      setEmail('')
      setPassword('')
      setWorkPhone('')
      setMobilePhone('')
      onCreated()
    }
    setSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 8, maxWidth: 400 }}>
      <h2>Add a user</h2>
      <input placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
      <input placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input
        type="password"
        placeholder="Temporary password (8+ characters)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        minLength={8}
        required
      />
      <input placeholder="Work phone" value={workPhone} onChange={(e) => setWorkPhone(e.target.value)} />
      <input placeholder="Mobile phone" value={mobilePhone} onChange={(e) => setMobilePhone(e.target.value)} />
      <button type="submit" disabled={submitting}>
        {submitting ? 'Creating...' : 'Create user'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
    </form>
  )
}