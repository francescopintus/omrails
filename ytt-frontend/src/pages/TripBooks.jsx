import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
export default function TripBooks() {
  const [tripbooks, setTripbooks] = useState([])
  const token = localStorage.getItem('ytt_token')
  useEffect(() => { api.get('/tripbooks/').then(r => setTripbooks(r.data)).catch(() => {}) }, [])
  return (
    <div className="container">
      <div className="page-header"><h1>Trip Book</h1><p style={{color:'#666',marginTop:'0.5rem'}}>Diari di viaggio componibili e condivisibili</p></div>
      {tripbooks.length===0&&<div style={{textAlign:'center',padding:'3rem'}}><div style={{fontSize:'3rem',marginBottom:'1rem'}}>📖</div><p style={{color:'#888',marginBottom:'1rem'}}>Nessun Trip Book pubblico ancora.</p>{!token&&<Link to="/register" className="btn btn-primary">Registrati per crearne uno</Link>}</div>}
      <div className="grid-2">{tripbooks.map(tb=><div className="card" key={tb.id}><div className="card-img-placeholder" style={{height:'220px',background:'linear-gradient(135deg,#2d3a4a,#4a6a7c)'}}/><div className="card-body"><div className="card-tag">Trip Book</div><div className="card-title">{tb.title}</div>{tb.description&&<div className="card-excerpt">{tb.description.slice(0,150)}</div>}</div></div>)}</div>
    </div>
  )
}
