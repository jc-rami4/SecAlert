// Authenticate the user

import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

type Role = 'admin' | 'user'

type AuthState = {
  session: Session | null
  role: Role | null
  loading: boolean
}

const AuthContext = createContext<AuthState>({
  session: null,
  role: null,
  loading: true,
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [role, setRole] = useState<Role | null>(null)
  const [sessionReady, setSessionReady] = useState(false)
  const [roleReady, setRoleReady] = useState(false)

  // Part 1: find out if someone is logged in, and keep watching for changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setSessionReady(true)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  // Part 2: whenever the logged-in person changes, look up their role
  useEffect(() => {
    if (!sessionReady) return
    if (!session) {
      setRole(null)
      setRoleReady(true)
      return
    }
    setRoleReady(false)
    supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => {
        setRole((data?.role as Role) ?? 'user')
        setRoleReady(true)
      })
  }, [session, sessionReady])

  const loading = !sessionReady || !roleReady

  return (
    <AuthContext.Provider value={{ session, role, loading }}>
      {children}
    </AuthContext.Provider>
  )
}