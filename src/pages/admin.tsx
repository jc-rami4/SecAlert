// src/pages/Admin.tsx
import { supabase } from '../lib/supabase'

export default function Admin() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Admin Page</h1>
      <p>All tickets and user management will go here.</p>
      <button onClick={() => supabase.auth.signOut()}>Sign out</button>
    </div>
  )
}