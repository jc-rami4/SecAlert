// src/types.ts
export type Severity = 'low' | 'medium' | 'high' | 'critical'
export type Status = 'open' | 'in_progress' | 'resolved' | 'closed'

export const IMPACT_OPTIONS = [
  { value: 'loss_of_data', label: 'Loss of Data' },
  { value: 'system_damage', label: 'System Damage' },
  { value: 'financial_loss', label: 'Financial Loss' },
  { value: 'other_system_affected', label: 'Other system affected' },
  { value: 'delivery_integrity_damage', label: 'Damage to delivery/integrity' },
  { value: 'regulation_violation', label: 'Regulation violation' },
  { value: 'policy_violation', label: 'Information Security policy/procedure violation' },
  { value: 'other', label: 'Other' },
] as const

export type Impact = (typeof IMPACT_OPTIONS)[number]['value']

export type Profile = {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  work_phone: string | null
  mobile_phone: string | null
  role: 'admin' | 'user'
}

export type Ticket = {
  id: string
  created_by: string
  title: string
  description: string
  severity: Severity
  impact: Impact | null
  impact_other: string | null
  status: Status
  created_at: string
  updated_at: string
}

export type TicketResponse = {
  id: string
  ticket_id: string
  author_id: string
  body: string
  created_at: string
}

// Turns a ticket's stored impact into readable text, e.g. "Loss of Data"
export function impactText(ticket: Pick<Ticket, 'impact' | 'impact_other'>): string | null {
  if (!ticket.impact) return null
  if (ticket.impact === 'other') {
    return ticket.impact_other ? `Other: ${ticket.impact_other}` : 'Other'
  }
  return IMPACT_OPTIONS.find((o) => o.value === ticket.impact)?.label ?? null
}

export type Submitter = Pick<
  Profile,
  'first_name' | 'last_name' | 'email' | 'work_phone' | 'mobile_phone'
>

export type AdminTicket = Ticket & { submitter: Submitter | null }

// Shows "First Last", or the email if no name is set
export function personName(
  p: Pick<Profile, 'first_name' | 'last_name' | 'email'> | null
): string {
  if (!p) return 'Unknown user'
  return [p.first_name, p.last_name].filter(Boolean).join(' ') || p.email
}