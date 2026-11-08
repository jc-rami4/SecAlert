// src/components/AdminTicketDetail.tsx
import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../auth/authContext'
import { personName } from '../types'
import type { AdminTicket, Status, TicketResponse } from '../types'
import TicketBody from './ticketBody'

export default function AdminTicketDetail({
  ticket,
  onBack,
  onChanged,
}: {
  ticket: AdminTicket
  onBack: () => void
  onChanged: () => void
}) {
  const { session } = useAuth()
  const [status, setStatus] = useState<Status>(ticket.status)
  const [responses, setResponses] = useState<TicketResponse[]>([])
  const [body, setBody] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const [savingStatus, setSavingStatus] = useState(false)

  const loadResponses = useCallback(async () => {
    const { data, error } = await supabase
      .from('ticket_responses')
      .select('*')
      .eq('ticket_id', ticket.id)
      .order('created_at', { ascending: true })
    if (error) setError(error.message)
    else setResponses(data as TicketResponse[])
  }, [ticket.id])

  useEffect(() => {
    loadResponses()
  }, [loadResponses])

  async function handleStatusChange(newStatus: Status) {
    setError('')
    setSavingStatus(true)
    const { data, error } = await supabase
      .from('tickets')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', ticket.id)
      .select()

    if (error) {
      setError(error.message)
    } else if (!data || data.length === 0) {
      setError('Status was not changed. Are you logged in as an admin?')
    } else {
      setStatus(newStatus)
      onChanged()
    }
    setSavingStatus(false)
  }

  async function handleReply(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSending(true)
    const { error } = await supabase
      .from('ticket_responses')
      .insert({ ticket_id: ticket.id, body })
    if (error) {
      setError(error.message)
    } else {
      setBody('')
      await loadResponses()
    }
    setSending(false)
  }

  function authorLabel(authorId: string) {
    if (authorId === session?.user.id) return 'You (admin)'
    if (authorId === ticket.created_by) return personName(ticket.submitter)
    return 'Support'
  }

  return (
    <div className="app-stack">
      <button type="button" className="app-back" onClick={onBack}>
        ← Back to tickets
      </button>

      <h2 className="app-section-title app-section-title--tight">{ticket.title}</h2>

      <div className="app-box">
        <p className="app-box-title">Submitted by</p>
        <p className="app-box-text">
          <strong>{personName(ticket.submitter)}</strong>
        </p>
        <p className="app-box-text">
          {ticket.submitter?.email} | work: {ticket.submitter?.work_phone || 'not set'} | mobile:{' '}
          {ticket.submitter?.mobile_phone || 'not set'}
        </p>
        <p className="app-box-text app-muted">
          Created {new Date(ticket.created_at).toLocaleString()}
        </p>
      </div>

      <label className="app-label">
        Status
        <select
          className="app-field app-select"
          value={status}
          disabled={savingStatus}
          onChange={(e) => handleStatusChange(e.target.value as Status)}
        >
          <option value="open">Open</option>
          <option value="in_progress">In progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </label>

      <TicketBody ticket={ticket} />

      <h3 className="app-subtitle">Responses</h3>
      {responses.length === 0 && <p className="app-empty">No responses yet.</p>}
      {responses.map((r) => (
        <div
          key={r.id}
          className={`app-response${r.author_id !== ticket.created_by ? ' app-response--staff' : ''}`}
        >
          <div className="app-response-head">
            <strong>{authorLabel(r.author_id)}</strong>
            <small className="app-muted">{new Date(r.created_at).toLocaleString()}</small>
          </div>
          <p className="app-box-text">{r.body}</p>
        </div>
      ))}

      <form className="app-form" onSubmit={handleReply}>
        <textarea
          className="app-field app-field-area"
          placeholder="write a reply"
          aria-label="Reply"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
        />
        <button className="app-button app-button--auto" type="submit" disabled={sending}>
          {sending ? 'Sending...' : 'Send reply'}
        </button>
      </form>

      {error && (
        <p className="app-error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}