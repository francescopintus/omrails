import React, { useEffect, useState } from 'react'

const API = 'http://localhost:8000'

export default function AdminDashboard() {
  const [counts, setCounts] = useState({})
  const token = localStorage.getItem('ytt_token')
  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    Promise.all([
      fetch(`${API}/territories`, { headers }).then(r => r.json()),
      fetch(`${API}/places`, { headers }).then(r => r.json()),
      fetch(`${API}/stories`, { headers }).then(r => r.json()),
      fetch(`${API}/operators`, { headers }).then(r => r.json()),
      fetch(`${API}/tripbooks/all`, { headers }).then(r => r.json()),
    ]).then(([t, p, s, o, tb]) => {
      setCounts({ territories: t.length, places: p.length, stories: s.length, operators: o.length, tripbooks: tb.length })
    }).catch(() => {})
  }, [])

  const stats = [
    { label: 'Territori', key: 'territories', color: '#2d4a3e' },
    { label: 'Luoghi', key: 'places', color: '#4a7c6a' },
    { label: 'Racconti', key: 'stories', color: '#e8c547' },
    { label: 'Operatori', key: 'operators', color: '#a86a2d' },
    { label: 'Trip Book', key: 'tripbooks', color: '#6a2da8' },
  ]

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p style={{color:'#888',marginTop:'0.3rem'}}>Benvenuto nel pannello di amministrazione YTT</p>
      </div>
      <div className="stat-grid">
        {stats.map(s => (
          <div key={s.key} className="stat-card" style={{borderTopColor: s.color}}>
            <h3>{counts[s.key] ?? '—'}</h3>
            <p>{s.label}</p>
          </div>
        ))}
      </div>
      <div className="admin-card">
        <h3 style={{marginBottom:'1rem'}}>Come iniziare</h3>
        <ol style={{paddingLeft:'1.2rem',lineHeight:2,color:'#555'}}>
          <li>Crea un <strong>Territorio</strong> (es. "Alta Murgia") e pubblicalo</li>
          <li>Aggiungi i <strong>Luoghi</strong> significativi del territorio</li>
          <li>Crea gli <strong>Operatori</strong> locali collegati al territorio</li>
          <li>Scrivi un <strong>Racconto</strong> editoriale e pubblicalo</li>
          <li>Crea un <strong>Trip Book</strong> e rendilo pubblico</li>
        </ol>
      </div>
    </div>
  )
}
