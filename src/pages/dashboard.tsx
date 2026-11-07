// src/pages/Dashboard.tsx
import { supabase } from '../lib/supabase'

export default function Dashboard() {
  return (
    <div style={{ padding: 24 }}>
      <h1>User Dashboard</h1>
      <p>Your tickets will go here.</p>
      <button onClick={() => supabase.auth.signOut()}>Sign out</button>
    </div>
  )
}