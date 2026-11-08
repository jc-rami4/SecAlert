// src/components/NewTicketForm.tsx
import { useState } from 'react'
import type { FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { IMPACT_OPTIONS } from '../types'
import type { Impact, Severity } from '../types'

export default function NewTicketForm({ onCreated }: { onCreated: () => void }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [severity, setSeverity] = useState<Severity | ''>('')
  const [impact, setImpact] = useState<Impact | ''>('')
  const [impactOther, setImpactOther] = useState('')
  const [incidentDetails, setIncidentDetails] = useState('')
  const [mitigation, setMitigation] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!severity) {
      setError('Please select a severity.')
      return
    }
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
      severity,
      impact,
      impact_other: impact === 'other' ? impactOther.trim() : null,
      incident_details: incidentDetails.trim(),
      mitigation_actions: mitigation.trim(),
    })

    if (error) {
      setError(error.message)
    } else {
      setTitle('')
      setDescription('')
      setSeverity('')
      setImpact('')
      setImpactOther('')
      setIncidentDetails('')
      setMitigation('')
      setSuccess('Ticket submitted. You can find it under Outstanding Tickets below.')
      onCreated()
    }
    setSubmitting(false)
  }

  return (
    <form className="app-form" onSubmit={handleSubmit}>
      <input
        className="app-field"
        placeholder="title"
        aria-label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <textarea
        className="app-field app-field-area"
        placeholder="description"
        aria-label="Brief description of the incident"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />

      <select
        className="app-field app-select"
        aria-label="Severity"
        value={severity}
        onChange={(e) => setSeverity(e.target.value as Severity | '')}
        required
      >
        <option value="" disabled hidden>
          severity
        </option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
        <option value="critical">Critical</option>
      </select>

      <select
        className="app-field app-select"
        aria-label="Impact or potential impact"
        value={impact}
        onChange={(e) => setImpact(e.target.value as Impact | '')}
        required
      >
        <option value="" disabled hidden>
          impact
        </option>
        {IMPACT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      {impact === 'other' && (
        <input
          className="app-field"
          placeholder="describe the impact"
          aria-label="Describe the impact"
          value={impactOther}
          onChange={(e) => setImpactOther(e.target.value)}
        />
      )}

      <textarea
        className="app-field app-field-area"
        placeholder="incident details"
        aria-label="Incident details"
        value={incidentDetails}
        onChange={(e) => setIncidentDetails(e.target.value)}
        required
      />

      <textarea
        className="app-field app-field-area"
        placeholder="mitigation efforts"
        aria-label="Mitigation efforts. Write None if nothing has been done yet."
        value={mitigation}
        onChange={(e) => setMitigation(e.target.value)}
        required
      />

      <button className="app-button" type="submit" disabled={submitting}>
        {submitting ? 'Submitting...' : 'Submit ticket'}
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