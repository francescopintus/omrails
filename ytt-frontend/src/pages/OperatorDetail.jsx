import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api'

export default function OperatorDetail() {
  const { slug } = useParams()
  const [op, setOp] = useState(null)

  useEffect(() => {
    api.get(`/operators/${slug}`).then(r => setOp(r.data)).catch(() => {})
  }, [slug])

  if (!op) return <div className="container"><p>Caricamento...</p></div>

  return (
    <div className="container" style={{maxWidth:860}}>
      <Link to="/territories" style={{color:'#888', fontSize:'0.9rem'}}>← Torna ai territori</Link>
      <div className="page-header" style={{marginTop:'1rem'}}>
        <div style={{fontSize:'0.8rem', textTransform:'uppercase', letterSpacing:'0.08em', color:'#888', marginBottom:'0.4rem'}}>
          {op.operator_type || 'Operatore'}
        </div>
        <h1>{op.name}</h1>
        {op.address && <p style={{color:'#888', marginTop:'0.3rem'}}>{op.address}</p>}
      </div>
      {op.cover_image_url ? (
        <img src={op.cover_image_url} alt={op.name}
          style={{width:'100%', height:260, objectFit:'cover', borderRadius:10, marginBottom:'2rem'}} />
      ) : (
        <div style={{width:'100%', height:160, background:'linear-gradient(135deg,#3a1a4a,#6a2d7c)',
          borderRadius:10, marginBottom:'2rem'}} />
      )}
      {op.description && (
        <p style={{lineHeight:1.8, fontSize:'1.05rem', color:'#2a2a2a', marginBottom:'2rem'}}>
          {op.description}
        </p>
      )}
      <div style={{display:'flex', flexWrap:'wrap', gap:'1rem', marginBottom:'1.5rem'}}>
        {op.phone && (
          <a href={`tel:${op.phone}`} style={{display:'flex', alignItems:'center', gap:'0.4rem', color:'#2d4a3e', fontWeight:600}}>
            📞 {op.phone}
          </a>
        )}
        {op.email && (
          <a href={`mailto:${op.email}`} style={{display:'flex', alignItems:'center', gap:'0.4rem', color:'#2d4a3e', fontWeight:600}}>
            ✉️ {op.email}
          </a>
        )}
        {op.website && (
          <a href={op.website} target="_blank" rel="noreferrer" style={{display:'flex', alignItems:'center', gap:'0.4rem', color:'#2d4a3e', fontWeight:600}}>
            🌐 Sito web
          </a>
        )}
      </div>
      {op.tags && (
        <div style={{display:'flex', gap:'0.5rem', flexWrap:'wrap'}}>
          {op.tags.split(',').map(t => (
            <span key={t} className="badge badge-gray">{t.trim()}</span>
          ))}
        </div>
      )}
    </div>
  )
}
