import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../api'

function Block({ block }) {
  const type = block.block_type
  if (type === 'heading') return (
    <h2 style={{fontSize:'1.6rem', fontWeight:700, margin:'2.5rem 0 1rem', color:'#1a1a1a'}}>{block.content}</h2>
  )
  if (type === 'text') return (
    <p style={{fontSize:'1.05rem', lineHeight:1.85, color:'#2a2a2a', marginBottom:'1.4rem'}}>{block.content}</p>
  )
  if (type === 'quote') return (
    <blockquote style={{borderLeft:'4px solid #e8c547', paddingLeft:'1.2rem', margin:'2rem 0',
      fontStyle:'italic', fontSize:'1.1rem', color:'#444', lineHeight:1.7}}>
      {block.content}
    </blockquote>
  )
  if (type === 'image') return (
    <div style={{margin:'2rem 0'}}>
      <img src={block.media_url || block.content} alt=""
        style={{width:'100%', borderRadius:10, maxHeight:500, objectFit:'cover'}} />
    </div>
  )
  if (type === 'place' && block.linked_place) return (
    <Link to={`/places/${block.linked_place.slug}`} style={{display:'block', textDecoration:'none', margin:'1.5rem 0'}}>
      <div style={{border:'1.5px solid #e8c547', borderRadius:10, padding:'1rem 1.2rem',
        display:'flex', alignItems:'center', gap:'1rem', background:'#fffdf0',
        transition:'box-shadow 0.2s'}}
        onMouseEnter={e=>e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.1)'}
        onMouseLeave={e=>e.currentTarget.style.boxShadow='none'}>
        <div style={{width:48, height:48, borderRadius:8, background:'linear-gradient(135deg,#1a3a4a,#2d6a7c)',
          display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem', flexShrink:0}}>📍</div>
        <div>
          <div style={{fontSize:'0.75rem', textTransform:'uppercase', letterSpacing:'0.08em', color:'#888', marginBottom:'0.2rem'}}>
            {block.linked_place.place_type || 'Luogo'}
          </div>
          <div style={{fontWeight:700, fontSize:'1rem', color:'#1a1a1a'}}>{block.linked_place.name}</div>
          {block.content && <div style={{fontSize:'0.9rem', color:'#666', marginTop:'0.2rem'}}>{block.content}</div>}
        </div>
      </div>
    </Link>
  )
  if (type === 'operator' && block.linked_operator) return (
    <Link to={`/operators/${block.linked_operator.slug}`} style={{display:'block', textDecoration:'none', margin:'1.5rem 0'}}>
      <div style={{border:'1.5px solid #2d4a3e', borderRadius:10, padding:'1rem 1.2rem',
        display:'flex', alignItems:'center', gap:'1rem', background:'#f0fff8',
        transition:'box-shadow 0.2s'}}
        onMouseEnter={e=>e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.1)'}
        onMouseLeave={e=>e.currentTarget.style.boxShadow='none'}>
        <div style={{width:48, height:48, borderRadius:8, background:'linear-gradient(135deg,#3a1a4a,#6a2d7c)',
          display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem', flexShrink:0}}>🏪</div>
        <div>
          <div style={{fontSize:'0.75rem', textTransform:'uppercase', letterSpacing:'0.08em', color:'#888', marginBottom:'0.2rem'}}>
            {block.linked_operator.operator_type || 'Operatore'}
          </div>
          <div style={{fontWeight:700, fontSize:'1rem', color:'#1a1a1a'}}>{block.linked_operator.name}</div>
          {block.content && <div style={{fontSize:'0.9rem', color:'#666', marginTop:'0.2rem'}}>{block.content}</div>}
        </div>
      </div>
    </Link>
  )
  return null
}

export default function TripBookDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [tb, setTb] = useState(null)
  const [blocks, setBlocks] = useState([])
  const token = localStorage.getItem('ytt_token')

  useEffect(() => {
    api.get(`/tripbooks/${slug}`).then(r => {
      setTb(r.data)
      return api.get(`/tripbooks/${slug}/blocks`)
    }).then(r => setBlocks(r.data)).catch(() => {})
  }, [slug])

  if (!tb) return <div className="container"><p>Caricamento...</p></div>

  const isOwner = token && tb.owner_id  // semplificazione: se loggato e tripbook visibile

  return (
    <div className="container" style={{maxWidth:720}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.5rem'}}>
        <Link to="/tripbooks" style={{color:'#888', fontSize:'0.9rem'}}>← Tutti i Trip Book</Link>
        {token && (
          <button className="btn btn-outline btn-sm" onClick={() => navigate(`/tripbooks/${slug}/edit`)}>
            ✏️ Modifica
          </button>
        )}
      </div>

      <div style={{marginBottom:'2rem'}}>
        {tb.cover_image_url ? (
          <img src={tb.cover_image_url} alt={tb.title}
            style={{width:'100%', height:300, objectFit:'cover', borderRadius:10, marginBottom:'1.5rem'}} />
        ) : (
          <div style={{width:'100%', height:200, background:'linear-gradient(135deg,#2d3a4a,#4a6a7c)',
            borderRadius:10, marginBottom:'1.5rem'}} />
        )}
        <h1 style={{fontSize:'2rem', fontWeight:800, marginBottom:'0.5rem'}}>{tb.title}</h1>
        {tb.description && <p style={{color:'#666', fontSize:'1.05rem', lineHeight:1.6}}>{tb.description}</p>}
        {tb.tags && (
          <div style={{display:'flex', gap:'0.4rem', flexWrap:'wrap', marginTop:'0.8rem'}}>
            {tb.tags.split(',').map(t => <span key={t} className="badge badge-gray">{t.trim()}</span>)}
          </div>
        )}
      </div>

      <hr style={{border:'none', borderTop:'1px solid #eee', margin:'1.5rem 0'}} />

      {blocks.length === 0 ? (
        <div style={{textAlign:'center', padding:'3rem', color:'#aaa'}}>
          <p style={{fontSize:'1.1rem'}}>Questo Trip Book è ancora vuoto.</p>
          {token && <button className="btn btn-primary" style={{marginTop:'1rem'}}
            onClick={() => navigate(`/tripbooks/${slug}/edit`)}>Inizia a scrivere</button>}
        </div>
      ) : (
        <div>{blocks.map(b => <Block key={b.id} block={b} />)}</div>
      )}
    </div>
  )
}
