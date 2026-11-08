// src/components/TicketBody.tsx
import { impactText } from '../types'
import type { Ticket } from '../types'

const textStyle = { whiteSpace: 'pre-wrap', margin: '4px 0 16px' } as const

export default function TicketBody({
  ticket,
}: {
  ticket: Pick<
    Ticket,
    | 'description'
    | 'incident_details'
    | 'mitigation_actions'
    | 'severity' 
    | 'status'
    | 'title'
    | 'impact'
    | 'impact_other'
  >
}) {
  return (
    <div>
      <p>
        <strong>{ticket.title}</strong>
      </p>

      <p>
        <strong>Status:</strong> {ticket.status}
      </p>

      <p>
        <strong>Severity:</strong> {ticket.severity}
        <br />
        <strong>Impact / potential impact:</strong> {impactText(ticket) || 'Not provided'}
      </p>

      <h3>Summary</h3>
      <p style={textStyle}>{ticket.description}</p>

      <h3>Incident details</h3>
      <p style={textStyle}>{ticket.incident_details || 'Not provided'}</p>

      <h3>Actions taken so far</h3>
      <p style={textStyle}>{ticket.mitigation_actions || 'Not provided'}</p>
    </div>
  )
}