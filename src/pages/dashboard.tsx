// src/pages/Dashboard.tsx
import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../auth/authContext'
import type { Profile, Ticket } from '../types'
import NewTicketForm from '../components/newTicketForm'
import TicketDetail from '../components/ticketDetail'

export default function Dashboard() {
  const { session } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [selected, setSelected] = useState<Ticket | null>(null)
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

  const displayName =
    [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || profile?.email

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h1>My Tickets</h1>
          {profile && (
            <p style={{ margin: 0 }}>
              <strong>{displayName}</strong>
              <br />
              <small>
                Work: {profile.work_phone || 'not set'} | Mobile: {profile.mobile_phone || 'not set'}
              </small>
            </p>
          )}
        </div>
        <button onClick={() => supabase.auth.signOut()} style={{ height: 32 }}>
          Sign out
        </button>
      </div>

      {selected ? (
        <TicketDetail ticket={selected} onBack={() => setSelected(null)} />
      ) : (
        <>
          <NewTicketForm onCreated={loadTickets} />

          <h2>Your tickets</h2>
          {loading && <p>Loading...</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {!loading && tickets.length === 0 && <p>You haven't created any tickets yet.</p>}
          <ul style={{ listStyle: 'none', padding: 0, maxWidth: 600 }}>
            {tickets.map((t) => (
              <li
                key={t.id}
                onClick={() => setSelected(t)}
                style={{ border: '1px solid #ccc', padding: 8, marginBottom: 8, cursor: 'pointer' }}
              >
                <strong>{t.title}</strong>
                <br />
                <small>
                  {t.status} | {t.severity} | {new Date(t.created_at).toLocaleDateString()}
                </small>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}