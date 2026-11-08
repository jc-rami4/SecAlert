// src/pages/Admin.tsx
import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { impactText, personName } from '../types'
import type { AdminTicket, Profile, Status } from '../types'
import AdminTicketDetail from '../components/adminTicketDetail'
import AddUserForm from '../components/addUserForm'

export default function Admin() {
  const [tab, setTab] = useState<'tickets' | 'users'>('tickets')
  const [tickets, setTickets] = useState<AdminTicket[]>([])
  const [users, setUsers] = useState<Profile[]>([])
  const [selected, setSelected] = useState<AdminTicket | null>(null)
  const [statusFilter, setStatusFilter] = useState<Status | 'all'>('all')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const loadTickets = useCallback(async () => {
    const { data, error } = await supabase
      .from('tickets')
      .select('*, submitter:profiles!created_by(first_name, last_name, email, work_phone, mobile_phone)')
      .order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setTickets(data as unknown as AdminTicket[])
    setLoading(false)
  }, [])

  const loadUsers = useCallback(async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: true })
    if (error) setError(error.message)
    else setUsers(data as Profile[])
  }, [])

  useEffect(() => {
    loadTickets()
    loadUsers()
  }, [loadTickets, loadUsers])

  const visibleTickets =
    statusFilter === 'all' ? tickets : tickets.filter((t) => t.status === statusFilter)

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h1>Admin</h1>
        <button onClick={() => supabase.auth.signOut()} style={{ height: 32 }}>
          Sign out
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button onClick={() => { setTab('tickets'); setSelected(null) }} disabled={tab === 'tickets'}>
          Tickets
        </button>
        <button onClick={() => setTab('users')} disabled={tab === 'users'}>
          Users
        </button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {tab === 'tickets' &&
        (selected ? (
          <AdminTicketDetail
            key={selected.id}
            ticket={selected}
            onBack={() => setSelected(null)}
            onChanged={loadTickets}
          />
        ) : (
          <>
            <label>
              Show:{' '}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as Status | 'all')}
              >
                <option value="all">All tickets</option>
                <option value="open">Open</option>
                <option value="in_progress">In progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </label>

            {loading && <p>Loading...</p>}
            {!loading && visibleTickets.length === 0 && <p>No tickets to show.</p>}

            <ul style={{ listStyle: 'none', padding: 0, maxWidth: 700 }}>
              {visibleTickets.map((t) => (
                <li
                  key={t.id}
                  onClick={() => setSelected(t)}
                  style={{ border: '1px solid #ccc', padding: 8, marginBottom: 8, cursor: 'pointer' }}
                >
                  <strong>{t.title}</strong>
                  <br />
                  <small>
                    {personName(t.submitter)} | {t.status} | {t.severity}
                    {impactText(t) && ` | ${impactText(t)}`} |{' '}
                    {new Date(t.created_at).toLocaleDateString()}
                  </small>
                </li>
              ))}
            </ul>
          </>
        ))}

      {tab === 'users' && (
        <>
          <AddUserForm onCreated={loadUsers} />

          <h2>All users</h2>
          <table style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Name', 'Email', 'Role', 'Work phone', 'Mobile phone'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '4px 12px', borderBottom: '1px solid #ccc' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td style={{ padding: '4px 12px' }}>{personName(u)}</td>
                  <td style={{ padding: '4px 12px' }}>{u.email}</td>
                  <td style={{ padding: '4px 12px' }}>{u.role}</td>
                  <td style={{ padding: '4px 12px' }}>{u.work_phone || '—'}</td>
                  <td style={{ padding: '4px 12px' }}>{u.mobile_phone || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  )
}