import React, { useEffect, useState } from 'react'
import api from '../api'
export default function Stories() {
  const [stories, setStories] = useState([])
  useEffect(() => { api.get('/stories/').then(r => setStories(r.data)).catch(() => {}) }, [])
  return (
    <div className="container">
      <div className="page-header"><h1>Racconti di viaggio</h1></div>
      {stories.length===0&&<p style={{color:'#888'}}>Nessun racconto pubblicato ancora.</p>}
      <div className="grid-3">{stories.map(s=><div className="card" key={s.id}><div className="card-img-placeholder" style={{background:'linear-gradient(135deg,#4a3e2d,#7c6a4a)'}}/><div className="card-body"><div className="card-tag">Racconto</div><div className="card-title">{s.title}</div>{s.excerpt&&<div className="card-excerpt">{s.excerpt}</div>}</div></div>)}</div>
    </div>
  )
}
