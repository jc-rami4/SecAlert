// src/components/AdminTicketDetail.tsx
import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../auth/authContext'
import { impactText, personName } from '../types'
import type { AdminTicket, Status, TicketResponse } from '../types'

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
    <div style={{ maxWidth: 600 }}>
      <button onClick={onBack}>← Back to tickets</button>
      <h2>{ticket.title}</h2>

      <p>
        <strong>Submitted by:</strong> {personName(ticket.submitter)}
        <br />
        <small>
          {ticket.submitter?.email} | Work: {ticket.submitter?.work_phone || 'not set'} | Mobile:{' '}
          {ticket.submitter?.mobile_phone || 'not set'}
        </small>
      </p>

      <p>
        <strong>Severity:</strong> {ticket.severity}
        {impactText(ticket) && <> | <strong>Impact:</strong> {impactText(ticket)}</>}
      </p>

      <label>
        <strong>Status: </strong>
        <select
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

      <p>{ticket.description}</p>
      <small>Created {new Date(ticket.created_at).toLocaleString()}</small>

      <h3>Responses</h3>
      {responses.length === 0 && <p>No responses yet.</p>}
      {responses.map((r) => (
        <div key={r.id} style={{ border: '1px solid #ccc', padding: 8, marginBottom: 8 }}>
          <strong>{authorLabel(r.author_id)}</strong>{' '}
          <small>{new Date(r.created_at).toLocaleString()}</small>
          <p style={{ margin: '4px 0 0' }}>{r.body}</p>
        </div>
      ))}

      <form onSubmit={handleReply} style={{ display: 'grid', gap: 8 }}>
        <textarea
          placeholder="Write a reply"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          required
        />
        <button type="submit" disabled={sending}>
          {sending ? 'Sending...' : 'Send reply'}
        </button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  )
}