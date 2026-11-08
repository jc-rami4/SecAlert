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
      setSuccess(`Account created for ${email.trim().toLowerCase()}.`)
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
    <form className="app-form" onSubmit={handleSubmit}>
      <input
        className="app-field"
        placeholder="first name"
        aria-label="First name"
        autoComplete="off"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        required
      />
      <input
        className="app-field"
        placeholder="last name"
        aria-label="Last name"
        autoComplete="off"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        required
      />
      <input
        className="app-field"
        type="email"
        placeholder="email address"
        aria-label="Email address"
        autoComplete="off"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        className="app-field"
        type="password"
        placeholder="password"
        aria-label="Password (at least 8 characters)"
        autoComplete="new-password"
        minLength={8}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <input
        className="app-field"
        type="tel"
        placeholder="work phone"
        aria-label="Work phone"
        autoComplete="off"
        value={workPhone}
        onChange={(e) => setWorkPhone(e.target.value)}
      />
      <input
        className="app-field"
        type="tel"
        placeholder="mobile phone"
        aria-label="Mobile phone"
        autoComplete="off"
        value={mobilePhone}
        onChange={(e) => setMobilePhone(e.target.value)}
      />

      <button className="app-button app-button--auto" type="submit" disabled={submitting}>
        {submitting ? 'Adding...' : 'Add user'}
      </button>

      {error && (
        <p className="app-error" role="alert">
          {error}
        </p>
      )}
      {success && <p className="app-success">{success}</p>}
    </form>
  )
}