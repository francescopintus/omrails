import React, { useEffect, useState } from 'react'
import AdminModal from '../../components/AdminModal'

const API = 'http://localhost:8000'
const TYPES = ['paesaggio','borgo','castello','chiesa','museo','natura','trattoria','mercato','altro']
const EMPTY = { name:'', place_type:'', description:'', lat:'', lng:'', address:'', territory_id:'', tags:'', cover_image_url:'' }

export default function AdminPlaces() {
  const [items, setItems] = useState([])
  const [territories, setTerritories] = useState([])
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const token = localStorage.getItem('ytt_token')
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

  const load = () => fetch(`${API}/places`, { headers }).then(r => r.json()).then(setItems)
  useEffect(() => {
    load()
    fetch(`${API}/territories`, { headers }).then(r => r.json()).then(setTerritories)
  }, [])

  const openCreate = () => { setForm(EMPTY); setModal('create') }
  const openEdit = (p) => { setForm({ ...p, lat: p.lat ?? '', lng: p.lng ?? '', territory_id: p.territory_id ?? '' }); setModal('edit') }

  const save = async () => {
    const body = { ...form }
    body.lat = body.lat === '' ? null : Number(body.lat)
    body.lng = body.lng === '' ? null : Number(body.lng)
    if (!body.territory_id) delete body.territory_id
    if (modal === 'create') {
      await fetch(`${API}/places`, { method:'POST', headers, body: JSON.stringify(body) })
    } else {
      await fetch(`${API}/places/${form.slug}`, { method:'PUT', headers, body: JSON.stringify(body) })
    }
    setModal(null); load()
  }

  const del = async (slug) => {
    if (!confirm('Eliminare questo luogo?')) return
    await fetch(`${API}/places/${slug}`, { method:'DELETE', headers })
    load()
  }

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  return (
    <div>
      <div className="page-header" style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <h1>Luoghi</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ Nuovo</button>
      </div>
      <div className="admin-card">
        {items.length === 0 ? <p className="admin-empty">Nessun luogo. Creane uno!</p> : (
          <table className="admin-table">
            <thead><tr><th>Nome</th><th>Tipo</th><th>Stato</th><th>Azioni</th></tr></thead>
            <tbody>{items.map(p => (
              <tr key={p.id}>
                <td><strong>{p.name}</strong><br/><small style={{color:'#888'}}>{p.slug}</small></td>
                <td>{p.place_type || '—'}</td>
                <td>{p.is_published ? <span className="badge badge-green">Pubblicato</span> : <span className="badge badge-gray">Bozza</span>}</td>
                <td>
                  <button className="btn-action" onClick={() => openEdit(p)}>Modifica</button>
                  <button className="btn-action-danger" onClick={() => del(p.slug)}>Elimina</button>
                </td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>

      {modal && (
        <AdminModal title={modal === 'create' ? 'Nuovo luogo' : 'Modifica luogo'} onClose={() => setModal(null)}>
          <div className="form-row">
            <div className="form-group"><label>Nome *</label><input value={form.name} onChange={f('name')} /></div>
            <div className="form-group"><label>Tipo</label>
              <select value={form.place_type || ''} onChange={f('place_type')}>
                <option value="">— Seleziona —</option>
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group"><label>Territorio</label>
            <select value={form.territory_id || ''} onChange={f('territory_id')}>
              <option value="">— Nessuno —</option>
              {territories.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>
          </div>
          <div className="form-group"><label>Descrizione</label><textarea rows={3} value={form.description || ''} onChange={f('description')} /></div>
          <div className="form-group"><label>Indirizzo</label><input value={form.address || ''} onChange={f('address')} /></div>
          <div className="form-row">
            <div className="form-group"><label>Latitudine</label><input type="number" step="any" value={form.lat} onChange={f('lat')} /></div>
            <div className="form-group"><label>Longitudine</label><input type="number" step="any" value={form.lng} onChange={f('lng')} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Tag</label><input value={form.tags || ''} onChange={f('tags')} /></div>
            <div className="form-group"><label>Immagine (URL)</label><input value={form.cover_image_url || ''} onChange={f('cover_image_url')} /></div>
          </div>
          {modal === 'edit' && (
            <label className="check-label" style={{margin:'0.5rem 0'}}>
              <input type="checkbox" checked={!!form.is_published} onChange={f('is_published')} /> Pubblicato
            </label>
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
