// src/components/AppHeader.tsx
import type { ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import logo from '../assets/SecAlertLogo.png'

export default function AppHeader({
  title,
  children,
}: {
  title: string
  children?: ReactNode
}) {
  return (
    <header className="app-header">
      <img className="app-header-logo" src={logo} alt="SecAlert" />
      <button className="app-signout" onClick={() => supabase.auth.signOut()}>
        Sign out
      </button>
      <h1 className="app-title">{title}</h1>
      {children}
    </header>
  )
}