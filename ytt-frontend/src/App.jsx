import React from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import Home from './pages/Home'
import Territories from './pages/Territories'
import TerritoryDetail from './pages/TerritoryDetail'
import Stories from './pages/Stories'
import TripBooks from './pages/TripBooks'
import Login from './pages/Login'
import Register from './pages/Register'

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
      </Routes>
    </>
  )
}
