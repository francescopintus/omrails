import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'

export default function Territories() {
  const [territories, setTerritories] = useState([])
  useEffect(() => { api.get('/territories/').then(r => setTerritories(r.data)).catch(() => {}) }, [])
  return (
    <div className="container">
      <div className="page-header">
        <h1>Territori</h1>
        <p style={{color:'#666',marginTop:'0.5rem'}}>Aree periferiche italiane raccontate da chi le ha vissute</p>
      </div>
      {territories.length === 0 && <p style={{color:'#888'}}>Nessun territorio pubblicato ancora.</p>}
      <div className="grid-3">
        {territories.map(t => (
          <Link to={`/territories/${t.slug}`} key={t.id}>
            <div className="card">
              <div className="card-img-placeholder" />
              <div className="card-body">
                <div className="card-tag">Livello {t.level}</div>
                <div className="card-title">{t.title}</div>
                {t.description && <div className="card-excerpt">{t.description.slice(0,120)}...</div>}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
