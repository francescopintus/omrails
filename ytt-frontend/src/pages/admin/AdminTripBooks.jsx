import React, { useEffect, useState } from 'react'
import AdminModal from '../../components/AdminModal'

const API = 'http://localhost:8000'
const EMPTY = { title:'', description:'', cover_image_url:'', visibility:'private', tags:'' }
const VIS_LABELS = { private:'Privato', unlisted:'Non listato', public:'Pubblico' }
const VIS_COLORS = { private:'badge-gray', unlisted:'badge-yellow', public:'badge-green' }

export default function AdminTripBooks() {
  const [items, setItems] = useState([])
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const token = localStorage.getItem('ytt_token')
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

  const load = () => fetch(`${API}/tripbooks/all`, { headers }).then(r => r.json()).then(setItems)
  useEffect(() => { load() }, [])

  const openCreate = () => { setForm(EMPTY); setModal('create') }
  const openEdit = (tb) => { setForm({ ...tb }); setModal('edit') }

  const save = async () => {
    const body = { ...form }
    if (modal === 'create') {
      await fetch(`${API}/tripbooks`, { method:'POST', headers, body: JSON.stringify(body) })
    } else {
      await fetch(`${API}/tripbooks/${form.slug}`, { method:'PUT', headers, body: JSON.stringify(body) })
    }
    setModal(null); load()
  }

  const del = async (slug) => {
    if (!confirm('Eliminare questo Trip Book?')) return
    await fetch(`${API}/tripbooks/${slug}`, { method:'DELETE', headers })
    load()
  }

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))

  return (
    <div>
      <div className="page-header" style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <h1>Trip Book</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ Nuovo</button>
      </div>
      <div className="admin-card">
        {items.length === 0 ? <p className="admin-empty">Nessun Trip Book. Creane uno!</p> : (
          <table className="admin-table">
            <thead><tr><th>Titolo</th><th>Visibilità</th><th>Creato</th><th>Azioni</th></tr></thead>
            <tbody>{items.map(tb => (
              <tr key={tb.id}>
                <td><strong>{tb.title}</strong><br/><small style={{color:'#888'}}>{tb.slug}</small></td>
                <td><span className={`badge ${VIS_COLORS[tb.visibility] || 'badge-gray'}`}>{VIS_LABELS[tb.visibility] || tb.visibility}</span></td>
                <td style={{fontSize:'0.85rem',color:'#888'}}>{new Date(tb.created_at).toLocaleDateString('it-IT')}</td>
                <td>
                  <button className="btn-action" onClick={() => openEdit(tb)}>Modifica</button>
                  <button className="btn-action-danger" onClick={() => del(tb.slug)}>Elimina</button>
                </td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>

      {modal && (
        <AdminModal title={modal === 'create' ? 'Nuovo Trip Book' : 'Modifica Trip Book'} onClose={() => setModal(null)}>
          <div className="form-group"><label>Titolo *</label><input value={form.title} onChange={f('title')} /></div>
          <div className="form-group"><label>Descrizione</label><textarea rows={3} value={form.description || ''} onChange={f('description')} /></div>
          <div className="form-group"><label>Immagine copertina (URL)</label><input value={form.cover_image_url || ''} onChange={f('cover_image_url')} /></div>
          <div className="form-row">
            <div className="form-group"><label>Visibilità</label>
              <select value={form.visibility} onChange={f('visibility')}>
                <option value="private">Privato</option>
                <option value="unlisted">Non listato</option>
                <option value="public">Pubblico</option>
              </select>
            </div>
            <div className="form-group"><label>Tag</label><input value={form.tags || ''} onChange={f('tags')} /></div>
          </div>
          <div className="modal-actions">
            <button className="btn btn-dark" onClick={() => setModal(null)}>Annulla</button>
            <button className="btn btn-primary" onClick={save}>Salva</button>
          </div>
        </AdminModal>
      )}
    </div>
  )
}
