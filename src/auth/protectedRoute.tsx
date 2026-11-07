// src/auth/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from './authContext'

export function ProtectedRoute({
  children,
  requireAdmin = false,
}: {
  children: ReactNode
  requireAdmin?: boolean
}) {
  const { session, role, loading } = useAuth()

  if (loading || (session && !role)) return <p>Loading...</p>
  if (!session) return <Navigate to="/login" replace />
  if (requireAdmin && role !== 'admin') return <Navigate to="/dashboard" replace />

  return <>{children}</>
}