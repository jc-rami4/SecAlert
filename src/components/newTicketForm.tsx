// src/components/NewTicketForm.tsx
import { useState } from 'react'
import type { FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { IMPACT_OPTIONS } from '../types'
import type { Impact, Severity } from '../types'

export default function NewTicketForm({ onCreated }: { onCreated: () => void }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [incidentDetails, setIncidentDetails] = useState('')
  const [mitigation, setMitigation] = useState('')
  const [severity, setSeverity] = useState<Severity>('low')
  const [impact, setImpact] = useState<Impact | ''>('')
  const [impactOther, setImpactOther] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (!impact) {
      setError('Please select an impact.')
      return
    }
    if (impact === 'other' && !impactOther.trim()) {
      setError('Please describe the impact in the text box.')
      return
    }

    setSubmitting(true)

    const { error } = await supabase.from('tickets').insert({
      title,
      description,
      incident_details: incidentDetails.trim(),
      mitigation_actions: mitigation.trim(),
      severity,
      impact,
      impact_other: impact === 'other' ? impactOther.trim() : null,
    })

    if (error) {
      setError(error.message)
    } else {
      setTitle('')
      setDescription('')
      setIncidentDetails('')
      setMitigation('')
      setSeverity('low')
      setImpact('')
      setImpactOther('')
      onCreated()
    }
    setSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 8, maxWidth: 480 }}>
      <h2>Create a ticket</h2>

      <input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <label>
        Brief summary of the incident
        <textarea
          style={{ width: '100%' }}
          placeholder="One or two sentences on what happened"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          required
        />
      </label>

      <label>
        Incident details
        <textarea
          style={{ width: '100%' }}
          placeholder="Full explanation: what happened, when, which systems or accounts, who noticed, and anything else relevant"
          value={incidentDetails}
          onChange={(e) => setIncidentDetails(e.target.value)}
          rows={6}
          required
        />
      </label>

      <label>
        Actions taken so far
        <textarea
          style={{ width: '100%' }}
          placeholder="What have you already done to contain or reduce the problem? Write 'None yet' if nothing."
          value={mitigation}
          onChange={(e) => setMitigation(e.target.value)}
          rows={4}
          required
        />
      </label>

      <select value={severity} onChange={(e) => setSeverity(e.target.value as Severity)}>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
        <option value="critical">Critical</option>
      </select>

      <select value={impact} onChange={(e) => setImpact(e.target.value as Impact | '')}>
        <option value="">Select impact / potential impact</option>
        {IMPACT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      {impact === 'other' && (
        <input
          placeholder="Describe the impact"
          value={impactOther}
          onChange={(e) => setImpactOther(e.target.value)}
        />
      )}

      <button type="submit" disabled={submitting}>
        {submitting ? 'Submitting...' : 'Submit ticket'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  )
}