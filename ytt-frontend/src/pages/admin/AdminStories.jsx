import React, { useEffect, useState } from 'react'
import AdminModal from '../../components/AdminModal'

const API = 'http://localhost:8000'
const EMPTY = { title:'', excerpt:'', body:'', territory_id:'', tags:'', cover_image_url:'' }
const STATUS_COLORS = { draft:'badge-gray', submitted:'badge-yellow', published:'badge-green' }
const STATUS_LABELS = { draft:'Bozza', submitted:'Inviato', published:'Pubblicato' }

export default function AdminStories() {
  const [items, setItems] = useState([])
  const [territories, setTerritories] = useState([])
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const token = localStorage.getItem('ytt_token')
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

  const load = () => fetch(`${API}/stories`, { headers }).then(r => r.json()).then(setItems)
  useEffect(() => {
    load()
    fetch(`${API}/territories`, { headers }).then(r => r.json()).then(setTerritories)
  }, [])

  const openCreate = () => { setForm(EMPTY); setModal('create') }
  const openEdit = (s) => { setForm({ ...s, territory_id: s.territory_id ?? '' }); setModal('edit') }

  const save = async () => {
    const body = { ...form }
    if (!body.territory_id) delete body.territory_id
    if (modal === 'create') {
      await fetch(`${API}/stories`, { method:'POST', headers, body: JSON.stringify(body) })
    } else {
      await fetch(`${API}/stories/${form.slug}`, { method:'PUT', headers, body: JSON.stringify(body) })
    }
    setModal(null); load()
  }

  const del = async (slug) => {
    if (!confirm('Eliminare questo racconto?')) return
    await fetch(`${API}/stories/${slug}`, { method:'DELETE', headers })
    load()
  }

  const publish = async (slug) => {
    await fetch(`${API}/stories/${slug}/publish`, { method:'PATCH', headers })
    load()
  }

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  return (
    <div>
      <div className="page-header" style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <h1>Racconti</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ Nuovo</button>
      </div>
      <div className="admin-card">
        {items.length === 0 ? <p className="admin-empty">Nessun racconto. Creane uno!</p> : (
          <table className="admin-table">
            <thead><tr><th>Titolo</th><th>Stato</th><th>Featured</th><th>Azioni</th></tr></thead>
            <tbody>{items.map(s => (
              <tr key={s.id}>
                <td><strong>{s.title}</strong><br/><small style={{color:'#888'}}>{s.slug}</small></td>
                <td><span className={`badge ${STATUS_COLORS[s.status] || 'badge-gray'}`}>{STATUS_LABELS[s.status] || s.status}</span></td>
                <td>{s.is_featured ? '⭐' : ''}</td>
                <td>
                  {s.status !== 'published' && <button className="btn-action-publish" onClick={() => publish(s.slug)}>Pubblica</button>}
                  <button className="btn-action" onClick={() => openEdit(s)}>Modifica</button>
                  <button className="btn-action-danger" onClick={() => del(s.slug)}>Elimina</button>
                </td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>

      {modal && (
        <AdminModal title={modal === 'create' ? 'Nuovo racconto' : 'Modifica racconto'} onClose={() => setModal(null)}>
          <div className="form-group"><label>Titolo *</label><input value={form.title} onChange={f('title')} /></div>
          <div className="form-group"><label>Territorio</label>
            <select value={form.territory_id || ''} onChange={f('territory_id')}>
              <option value="">— Nessuno —</option>
              {territories.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>
          </div>
          <div className="form-group"><label>Estratto</label><textarea rows={2} value={form.excerpt || ''} onChange={f('excerpt')} /></div>
          <div className="form-group"><label>Testo</label><textarea rows={8} value={form.body || ''} onChange={f('body')} /></div>
          <div className="form-row">
            <div className="form-group"><label>Tag</label><input value={form.tags || ''} onChange={f('tags')} /></div>
            <div className="form-group"><label>Immagine (URL)</label><input value={form.cover_image_url || ''} onChange={f('cover_image_url')} /></div>
          </div>
          {modal === 'edit' && (
            <div style={{display:'flex',gap:'1.5rem',margin:'0.5rem 0'}}>
              <label className="check-label"><input type="checkbox" checked={!!form.is_featured} onChange={f('is_featured')} /> Featured</label>
              <div className="form-group" style={{margin:0}}>
                <select value={form.status} onChange={f('status')} style={{padding:'0.4rem 0.6rem',border:'1.5px solid #ddd',borderRadius:4}}>
                  <option value="draft">Bozza</option>
                  <option value="submitted">Inviato</option>
                  <option value="published">Pubblicato</option>
                </select>
              </div>
            </div>
          )}
          <div className="modal-actions">
            <button className="btn btn-dark" onClick={() => setModal(null)}>Annulla</button>
            <button className="btn btn-primary" onClick={save}>Salva</button>
          </div>
        </AdminModal>
      )}
    </div>
  )
}
