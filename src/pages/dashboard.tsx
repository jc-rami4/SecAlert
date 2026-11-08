// src/pages/Dashboard.tsx
import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../auth/authContext'
import type { Profile, Ticket } from '../types'
import AppHeader from '../components/appHeader'
import NewTicketForm from '../components/newTicketForm'
import TicketDetail from '../components/ticketDetail'

// 11-09-2026 style (month-day-year). Swap mm and dd below for day-first.
function formatDate(iso: string) {
  const d = new Date(iso)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${mm}-${dd}-${d.getFullYear()}`
}

// "Last, First" like your design; falls back to the email if no name is set
function nameLastFirst(p: Profile) {
  if (p.last_name && p.first_name) return `${p.last_name}, ${p.first_name}`
  return p.last_name || p.first_name || p.email
}

export default function Dashboard() {
  const { session } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [selected, setSelected] = useState<Ticket | null>(null)
  const [showFinished, setShowFinished] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadProfile = useCallback(async () => {
    if (!session) return
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()
    if (data) setProfile(data as Profile)
  }, [session])

  const loadTickets = useCallback(async () => {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setTickets(data as Ticket[])
    setLoading(false)
  }, [])

  useEffect(() => {
    loadProfile()
    loadTickets()
  }, [loadProfile, loadTickets])

  const outstanding = tickets.filter((t) => t.status === 'open' || t.status === 'in_progress')
  const finishedCount = tickets.length - outstanding.length
  const visible = showFinished ? tickets : outstanding

  return (
    <div className="app-page fence-bg">
      <div className="app-panel fence-panel">
        <AppHeader title="My Tickets">
          {profile && (
            <>
              <p className="app-name">{nameLastFirst(profile)}</p>
              <p className="app-contact">
                {profile.email} | work: {profile.work_phone || 'not set'} | mobile:{' '}
                {profile.mobile_phone || 'not set'}
              </p>
            </>
          )}
        </AppHeader>

        <main className="app-scroll">
          <div className="app-content">
            {selected ? (
              <TicketDetail ticket={selected} onBack={() => setSelected(null)} />
            ) : (
              <>
                <section>
                  <h2 className="app-section-title">New Ticket</h2>
                  <NewTicketForm onCreated={loadTickets} />
                </section>

                <section>
                  <h2 className="app-section-title">Outstanding Tickets</h2>

                  {loading && <p className="app-empty">Loading...</p>}
                  {error && <p className="app-error">{error}</p>}
                  {!loading && tickets.length === 0 && (
                    <p className="app-empty">You haven't created any tickets yet.</p>
                  )}
                  {!loading && tickets.length > 0 && visible.length === 0 && (
                    <p className="app-empty">No outstanding tickets.</p>
                  )}

                  <ul className="app-card-list">
                    {visible.map((t) => (
                      <li key={t.id}>
                        <button className="app-card" onClick={() => setSelected(t)}>
                          <span className="app-card-title">{t.title}</span>
                          <span className="app-card-meta">
                            {t.status.replace('_', ' ')} | {t.severity} | {formatDate(t.created_at)}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>

                  {finishedCount > 0 && (
                    <button
                      className="app-link-button"
                      onClick={() => setShowFinished((v) => !v)}
                    >
                      {showFinished
                        ? 'Hide resolved and closed tickets'
                        : `Show resolved and closed tickets (${finishedCount})`}
                    </button>
                  )}
                </section>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}