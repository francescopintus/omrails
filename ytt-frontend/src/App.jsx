import React from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import Home from './pages/Home'
import Territories from './pages/Territories'
import TerritoryDetail from './pages/TerritoryDetail'
import Stories from './pages/Stories'
import TripBooks from './pages/TripBooks'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminTerritories from './pages/admin/AdminTerritories'
import AdminPlaces from './pages/admin/AdminPlaces'
import AdminStories from './pages/admin/AdminStories'
import AdminOperators from './pages/admin/AdminOperators'
import AdminTripBooks from './pages/admin/AdminTripBooks'
import StoryDetail from './pages/StoryDetail'
import PlaceDetail from './pages/PlaceDetail'
import OperatorDetail from './pages/OperatorDetail'

function Navbar() {
  const navigate = useNavigate()
  const token = localStorage.getItem('ytt_token')
  const name = localStorage.getItem('ytt_name')
  const logout = () => {
    localStorage.removeItem('ytt_token')
    localStorage.removeItem('ytt_name')
    navigate('/')
    window.location.reload()
  }
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">YOU THE <span>TRIP</span></Link>
      <div className="navbar-links">
        <Link to="/territories">Territori</Link>
        <Link to="/stories">Racconti</Link>
        <Link to="/tripbooks">Trip Book</Link>
        {token ? (
          <>
            <Link to="/admin" style={{color:'#e8c547',fontWeight:700}}>Admin</Link>
            <span style={{color:'#e8c547',fontSize:'0.85rem'}}>Ciao, {name}</span>
            <button onClick={logout} className="btn btn-outline btn-sm">Esci</button>
          </>
        ) : (
          <>
            <Link to="/login">Accedi</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Registrati</Link>
          </>
        )}
      </div>
    </nav>
  )
}

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/territories" element={<Territories />} />
        <Route path="/territories/:slug" element={<TerritoryDetail />} />
        <Route path="/stories" element={<Stories />} />
        <Route path="/tripbooks" element={<TripBooks />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/stories/:slug" element={<StoryDetail />} />
        <Route path="/places/:slug" element={<PlaceDetail />} />
        <Route path="/operators/:slug" element={<OperatorDetail />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="territories" element={<AdminTerritories />} />
          <Route path="places" element={<AdminPlaces />} />
          <Route path="stories" element={<AdminStories />} />
          <Route path="operators" element={<AdminOperators />} />
          <Route path="tripbooks" element={<AdminTripBooks />} />
        </Route>
      </Routes>
    </>
  )
}
