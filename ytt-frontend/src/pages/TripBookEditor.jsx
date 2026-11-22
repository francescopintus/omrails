import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../api'

const BLOCK_TYPES = [
  { value: 'heading', label: '📌 Intestazione' },
  { value: 'text', label: '📝 Testo' },
  { value: 'quote', label: '💬 Citazione' },
  { value: 'image', label: '🖼 Immagine (URL)' },
  { value: 'place', label: '📍 Luogo' },
  { value: 'operator', label: '🏪 Operatore' },
]

export default function TripBookEditor() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [tb, setTb] = useState(null)
  const [blocks, setBlocks] = useState([])
  const [places, setPlaces] = useState([])
  const [operators, setOperators] = useState([])
  const [form, setForm] = useState({ block_type: 'text', content: '', media_url: '', linked_place_id: '', linked_operator_id: '' })
  const token = localStorage.getItem('ytt_token')
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

  const load = () => {
    api.get(`/tripbooks/${slug}`).then(r => setTb(r.data))
    fetch(`http://localhost:8000/tripbooks/${slug}/blocks`, { headers }).then(r => r.json()).then(setBlocks)
  }

  useEffect(() => {
    if (!token) { navigate('/login'); return }
    load()
    fetch('http://localhost:8000/places', { headers }).then(r => r.json()).then(setPlaces).catch(() => {})
    fetch('http://localhost:8000/operators', { headers }).then(r => r.json()).then(setOperators).catch(() => {})
  }, [slug])

  const addBlock = async () => {
    const body = { block_type: form.block_type, position: String(blocks.length), content: form.content || null }
    if (form.block_type === 'image') body.media_url = form.media_url || form.content
    if (form.block_type === 'place' && form.linked_place_id) body.linked_place_id = form.linked_place_id
    if (form.block_type === 'operator' && form.linked_operator_id) body.linked_operator_id = form.linked_operator_id
    await fetch(`http://localhost:8000/tripbooks/${slug}/blocks`, { method: 'POST', headers, body: JSON.stringify(body) })
    setForm({ block_type: 'text', content: '', media_url: '', linked_place_id: '', linked_operator_id: '' })
    load()
  }

  const deleteBlock = async (blockId) => {
    if (!confirm('Rimuovere questo blocco?')) return
    await fetch(`http://localhost:8000/tripbooks/${slug}/blocks/${blockId}`, { method: 'DELETE', headers })
    load()
  }

  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  if (!tb) return <div className="container"><p>Caricamento...</p></div>

  const needsPlace = form.block_type === 'place'
  const needsOperator = form.block_type === 'operator'
  const needsMedia = form.block_type === 'image'
  const needsContent = !needsPlace && !needsOperator

  return (
    <div className="container" style={{maxWidth:760}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem'}}>
        <div>
          <Link to={`/tripbooks/${slug}`} style={{color:'#888', fontSize:'0.9rem'}}>← Visualizza Trip Book</Link>
          <h1 style={{marginTop:'0.4rem'}}>{tb.title}</h1>
        </div>
      </div>

      {/* Blocchi esistenti */}
      <div className="admin-card" style={{marginBottom:'1.5rem'}}>
        <h3 style={{marginBottom:'1rem', fontSize:'1rem', color:'#888', textTransform:'uppercase', letterSpacing:'0.05em'}}>
          Blocchi ({blocks.length})
        </h3>
        {blocks.length === 0 && <p style={{color:'#aaa', textAlign:'center', padding:'1rem'}}>Nessun blocco ancora. Aggiungi il primo qui sotto.</p>}
        {blocks.map((b, i) => (
          <div key={b.id} style={{display:'flex', alignItems:'flex-start', gap:'0.8rem', padding:'0.8rem 0',
            borderBottom:'1px solid #f0f0f0'}}>
            <div style={{minWidth:28, height:28, borderRadius:6, background:'#f0f0f0',
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.75rem', color:'#888', fontWeight:700}}>
              {i+1}
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:'0.75rem', textTransform:'uppercase', color:'#aaa', marginBottom:'0.2rem'}}>
                {BLOCK_TYPES.find(t => t.value === b.block_type)?.label || b.block_type}
              </div>
              <div style={{fontSize:'0.9rem', color:'#333'}}>
                {b.block_type === 'place' ? b.linked_place?.name :
                 b.block_type === 'operator' ? b.linked_operator?.name :
                 b.block_type === 'image' ? (b.media_url || b.content)?.slice(0,60)+'…' :
                 (b.content || '').slice(0,80) + (b.content?.length > 80 ? '…' : '')}
              </div>
            </div>
            <button className="btn-action-danger" onClick={() => deleteBlock(b.id)}>✕</button>
          </div>
        ))}
      </div>

      {/* Form aggiunta blocco */}
      <div className="admin-card">
        <h3 style={{marginBottom:'1rem'}}>Aggiungi un blocco</h3>
        <div className="form-group">
          <label>Tipo di blocco</label>
          <select value={form.block_type} onChange={f('block_type')}>
            {BLOCK_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        {needsContent && (
          <div className="form-group">
            <label>{form.block_type === 'image' ? 'URL immagine' : 'Testo'}</label>
            {form.block_type === 'text' || form.block_type === 'quote'
              ? <textarea rows={4} value={form.content} onChange={f('content')} />
              : <input value={form.content} onChange={f('content')} />}
          </div>
        )}
        {needsMedia && (
          <div className="form-group">
            <label>URL immagine</label>
            <input value={form.media_url} onChange={f('media_url')} placeholder="https://..." />
          </div>
        )}
        {needsPlace && (
          <div className="form-group">
            <label>Seleziona luogo</label>
            <select value={form.linked_place_id} onChange={f('linked_place_id')}>
              <option value="">— Scegli —</option>
              {places.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <label style={{marginTop:'0.5rem'}}>Nota opzionale</label>
            <input value={form.content} onChange={f('content')} placeholder="Es. Tappa imperdibile" />
          </div>
        )}
        {needsOperator && (
          <div className="form-group">
            <label>Seleziona operatore</label>
            <select value={form.linked_operator_id} onChange={f('linked_operator_id')}>
              <option value="">— Scegli —</option>
              {operators.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
            <label style={{marginTop:'0.5rem'}}>Nota opzionale</label>
            <input value={form.content} onChange={f('content')} placeholder="Es. Contattare prima" />
          </div>
        )}
        <div style={{marginTop:'1rem'}}>
          <button className="btn btn-primary" onClick={addBlock}>+ Aggiungi</button>
        </div>
      </div>
    </div>
  )
}
