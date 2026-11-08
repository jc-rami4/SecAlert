// src/components/TicketBody.tsx
import { impactText } from '../types'
import type { Ticket } from '../types'

function TextCard({ title, text }: { title: string; text: string | null }) {
  return (
    <div className="app-box">
      <p className="app-box-title">{title}</p>
      <p className="app-box-text">{text || 'Not provided'}</p>
    </div>
  )
}

export default function TicketBody({
  ticket,
}: {
  ticket: Pick<
    Ticket,
    | 'description'
    | 'incident_details'
    | 'mitigation_actions'
    | 'severity'
    | 'impact'
    | 'impact_other'
  >
}) {
  return (
    <div className="app-stack">
      <div className="app-chips">
        <span className="app-chip">
          <strong>Severity:</strong> {ticket.severity}
        </span>
        <span className="app-chip">
          <strong>Impact:</strong> {impactText(ticket) || 'not provided'}
        </span>
      </div>

      <TextCard title="Summary" text={ticket.description} />
      <TextCard title="Incident details" text={ticket.incident_details} />
      <TextCard title="Actions taken so far" text={ticket.mitigation_actions} />
    </div>
  )
}