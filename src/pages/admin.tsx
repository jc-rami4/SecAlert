// src/pages/Admin.tsx
import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { personName } from '../types'
import type { AdminTicket, Profile, Status } from '../types'
import { formatDate } from '../lib/format'
import AppHeader from '../components/appHeader'
import TabToggle from '../components/toggle'
import AdminTicketDetail from '../components/adminTicketDetail'
import AddUserForm from '../components/addUserForm'

type Tab = 'tickets' | 'users'

export default function Admin() {
  const [tab, setTab] = useState<Tab>('tickets')
  const [tickets, setTickets] = useState<AdminTicket[]>([])
  const [users, setUsers] = useState<Profile[]>([])
  const [selected, setSelected] = useState<AdminTicket | null>(null)
  const [statusFilter, setStatusFilter] = useState<Status | 'all'>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadTickets = useCallback(async () => {
    const { data, error } = await supabase
      .from('tickets')
      .select(
        '*, submitter:profiles!created_by(first_name, last_name, email, work_phone, mobile_phone)'
      )
      .order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setTickets(data as unknown as AdminTicket[])
    setLoading(false)
  }, [])

  const loadUsers = useCallback(async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setUsers(data as Profile[])
  }, [])

  useEffect(() => {
    loadTickets()
    loadUsers()
  }, [loadTickets, loadUsers])

  function chooseTab(next: Tab) {
    setTab(next)
    setSelected(null)
  }

  const visibleTickets =
    statusFilter === 'all' ? tickets : tickets.filter((t) => t.status === statusFilter)

  return (
    <div className="app-page fence-bg">
      <div className="app-panel fence-panel">
        <AppHeader title="Admin - Dashboard">
          <TabToggle
            options={[
              { value: 'tickets', label: 'Tickets' },
              { value: 'users', label: 'Add Users' },
            ]}
            value={tab}
            onChange={chooseTab}
          />
        </AppHeader>

        <main className="app-scroll">
          <div className="app-content">
            {error && <p className="app-error">{error}</p>}

            {tab === 'tickets' &&
              (selected ? (
                <AdminTicketDetail
                  key={selected.id}
                  ticket={selected}
                  onBack={() => setSelected(null)}
                  onChanged={loadTickets}
                />
              ) : (
                <section>
                  <h2 className="app-section-title">All tickets</h2>

                  <select
                    className="app-field app-select"
                    aria-label="Filter by status"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as Status | 'all')}
                    style={{ marginBottom: 12 }}
                  >
                    <option value="all">all statuses</option>
                    <option value="open">Open</option>
                    <option value="in_progress">In progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>

                  {loading && <p className="app-empty">Loading...</p>}
                  {!loading && visibleTickets.length === 0 && (
                    <p className="app-empty">No tickets to show.</p>
                  )}

                  <ul className="app-card-list">
                    {visibleTickets.map((t) => (
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
                </section>
              ))}

            {tab === 'users' && (
              <>
                <section>
                  <h2 className="app-section-title app-section-title--light">New User</h2>
                  <AddUserForm onCreated={loadUsers} />
                </section>

                <section>
                  <h2 className="app-section-title">All users</h2>
                  <ul className="app-card-list">
                    {users.map((u) => (
                      <li key={u.id}>
                        <div className="app-card app-card--static app-card--compact">
                          <span className="app-card-title">{personName(u)}</span>
                          <span className="app-card-meta">
                            {u.email} | {u.role}
                          </span>
                          <span className="app-card-meta">
                            work: {u.work_phone || 'not set'} | mobile: {u.mobile_phone || 'not set'}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}