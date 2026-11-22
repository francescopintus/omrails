import React, { useEffect, useState } from 'react'
import AdminModal from '../../components/AdminModal'

const API = 'http://localhost:8000'
const EMPTY = { title:'', description:'', lat_center:'', lng_center:'', zoom_level:10, level:1, tags:'', cover_image_url:'' }

export default function AdminTerritories() {
  const [items, setItems] = useState([])
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const token = localStorage.getItem('ytt_token')
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

  const load = () => fetch(`${API}/territories`, { headers }).then(r => r.json()).then(setItems)
  useEffect(() => { load() }, [])

  const openCreate = () => { setForm(EMPTY); setModal('create') }
  const openEdit = (t) => {
    setForm({ ...t, lat_center: t.lat_center ?? '', lng_center: t.lng_center ?? '' })
    setModal('edit')
  }

  const save = async () => {
    const body = { ...form }
    body.lat_center = body.lat_center === '' ? null : Number(body.lat_center)
    body.lng_center = body.lng_center === '' ? null : Number(body.lng_center)
    body.zoom_level = Number(body.zoom_level)
    body.level = Number(body.level)
    if (modal === 'create') {
      await fetch(`${API}/territories`, { method:'POST', headers, body: JSON.stringify(body) })
    } else {
      await fetch(`${API}/territories/${form.slug}`, { method:'PUT', headers, body: JSON.stringify(body) })
    }
    setModal(null); load()
  }

  const del = async (slug) => {
    if (!confirm('Eliminare questo territorio?')) return
    await fetch(`${API}/territories/${slug}`, { method:'DELETE', headers })
    load()
  }

  const publish = async (slug) => {
    await fetch(`${API}/territories/${slug}/publish`, { method:'PATCH', headers })
    load()
  }

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  return (
    <div>
      <div className="page-header" style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <h1>Territori</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ Nuovo</button>
      </div>
      <div className="admin-card">
        {items.length === 0 ? <p className="admin-empty">Nessun territorio. Creane uno!</p> : (
          <table className="admin-table">
            <thead><tr><th>Titolo</th><th>Livello</th><th>Stato</th><th>Azioni</th></tr></thead>
            <tbody>{items.map(t => (
              <tr key={t.id}>
                <td><strong>{t.title}</strong><br/><small style={{color:'#888'}}>{t.slug}</small></td>
                <td>{t.level}</td>
                <td>
                  {t.is_published ? <span className="badge badge-green">Pubblicato</span> : <span className="badge badge-gray">Bozza</span>}
                  {t.is_featured && <span className="badge badge-yellow" style={{marginLeft:4}}>Featured</span>}
                </td>
                <td>
                  {!t.is_published && <button className="btn-action-publish" onClick={() => publish(t.slug)}>Pubblica</button>}
                  <button className="btn-action" onClick={() => openEdit(t)}>Modifica</button>
                  <button className="btn-action-danger" onClick={() => del(t.slug)}>Elimina</button>
                </td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>

      {modal && (
        <AdminModal title={modal === 'create' ? 'Nuovo territorio' : 'Modifica territorio'} onClose={() => setModal(null)}>
          <div className="form-row">
            <div className="form-group"><label>Titolo *</label><input value={form.title} onChange={f('title')} /></div>
            <div className="form-group"><label>Livello</label><input type="number" value={form.level} onChange={f('level')} /></div>
          </div>
          <div className="form-group"><label>Descrizione</label><textarea rows={3} value={form.description || ''} onChange={f('description')} /></div>
          <div className="form-row">
            <div className="form-group"><label>Latitudine centro</label><input type="number" step="any" value={form.lat_center} onChange={f('lat_center')} /></div>
            <div className="form-group"><label>Longitudine centro</label><input type="number" step="any" value={form.lng_center} onChange={f('lng_center')} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Zoom</label><input type="number" value={form.zoom_level} onChange={f('zoom_level')} /></div>
            <div className="form-group"><label>Tag</label><input value={form.tags || ''} onChange={f('tags')} placeholder="tag1,tag2" /></div>
          </div>
          <div className="form-group"><label>Immagine copertina (URL)</label><input value={form.cover_image_url || ''} onChange={f('cover_image_url')} /></div>
          {modal === 'edit' && (
            <div style={{display:'flex',gap:'1.5rem',margin:'0.5rem 0'}}>
              <label className="check-label"><input type="checkbox" checked={!!form.is_published} onChange={f('is_published')} /> Pubblicato</label>
              <label className="check-label"><input type="checkbox" checked={!!form.is_featured} onChange={f('is_featured')} /> Featured</label>
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
