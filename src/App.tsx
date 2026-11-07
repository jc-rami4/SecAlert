// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './auth/protectedRoute'
import Login from './pages/login'
import Dashboard from './pages/dashboard'
import Admin from './pages/admin'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin>
            <Admin />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}