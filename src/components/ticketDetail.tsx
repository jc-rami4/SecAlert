// src/components/TicketDetail.tsx
import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../auth/authContext'
import { impactText } from '../types'
import type { Ticket, TicketResponse } from '../types'

export default function TicketDetail({
  ticket,
  onBack,
}: {
  ticket: Ticket
  onBack: () => void
}) {
  const { session } = useAuth()
  const [responses, setResponses] = useState<TicketResponse[]>([])
  const [body, setBody] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)

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

  return (
    <div style={{ maxWidth: 600 }}>
      <button onClick={onBack}>← Back to tickets</button>
      <h2>{ticket.title}</h2>
      <p>
        <strong>Status:</strong> {ticket.status} | <strong>Severity:</strong> {ticket.severity}
        {impactText(ticket) && <> | <strong>Impact:</strong> {impactText(ticket)}</>}
      </p>
      <p>{ticket.description}</p>
      <small>Created {new Date(ticket.created_at).toLocaleString()}</small>

      <h3>Responses</h3>
      {responses.length === 0 && <p>No responses yet.</p>}
      {responses.map((r) => (
        <div key={r.id} style={{ border: '1px solid #ccc', padding: 8, marginBottom: 8 }}>
          <strong>{r.author_id === session?.user.id ? 'You' : 'Support'}</strong>{' '}
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