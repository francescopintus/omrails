import React from 'react'
import { Outlet, NavLink, Navigate, Link } from 'react-router-dom'

export default function AdminLayout() {
  const token = localStorage.getItem('ytt_token')
  if (!token) return <Navigate to="/login" replace />

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h2>Admin</h2>
        <NavLink to="/admin" end>Dashboard</NavLink>
        <NavLink to="/admin/territories">Territori</NavLink>
        <NavLink to="/admin/places">Luoghi</NavLink>
        <NavLink to="/admin/stories">Racconti</NavLink>
        <NavLink to="/admin/operators">Operatori</NavLink>
        <NavLink to="/admin/tripbooks">Trip Book</NavLink>
        <div className="sidebar-back">
          <Link to="/">← Torna al sito</Link>
        </div>
      </aside>
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  )
}
