import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import api from '../api'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

export default function TerritoryDetail() {
  const { slug } = useParams()
  const [territory, setTerritory] = useState(null)
  const [stories, setStories] = useState([])
  const [places, setPlaces] = useState([])
  const [operators, setOperators] = useState([])
  const [activeTab, setActiveTab] = useState('racconti')
  useEffect(() => {
    api.get(`/territories/${slug}`).then(r => {
      setTerritory(r.data)
      api.get(`/stories/?territory_id=${r.data.id}`).then(s => setStories(s.data)).catch(() => {})
      api.get(`/places/?territory_id=${r.data.id}`).then(p => setPlaces(p.data)).catch(() => {})
      api.get(`/operators/?territory_id=${r.data.id}`).then(o => setOperators(o.data)).catch(() => {})
    }).catch(() => {})
  }, [slug])
  if (!territory) return <div className="container"><p>Caricamento...</p></div>
  const mapCenter = territory.lat_center && territory.lng_center ? [territory.lat_center, territory.lng_center] : [42.5, 12.5]
  return (
    <div className="container">
      <Link to="/territories" style={{color:'#888',fontSize:'0.9rem'}}>← Tutti i territori</Link>
      <div className="page-header" style={{marginTop:'1rem'}}>
        <h1>{territory.title}</h1>
        {territory.description && <p style={{color:'#555',marginTop:'0.5rem'}}>{territory.description}</p>}
      </div>
      <div className="map-container" style={{marginBottom:'2rem'}}>
        <MapContainer center={mapCenter} zoom={territory.zoom_level||10} style={{height:'100%',width:'100%'}}>
          <TileLayer attribution='© OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {places.filter(p=>p.lat&&p.lng).map(p => <Marker key={p.id} position={[p.lat,p.lng]}><Popup><strong>{p.name}</strong></Popup></Marker>)}
          {operators.filter(o=>o.lat&&o.lng).map(o => <Marker key={o.id} position={[o.lat,o.lng]}><Popup><strong>{o.name}</strong></Popup></Marker>)}
        </MapContainer>
      </div>
      <div className="tabs">
        {['racconti','luoghi','operatori'].map(tab => (
          <div key={tab} className={`tab ${activeTab===tab?'active':''}`} onClick={() => setActiveTab(tab)}>
            {tab.charAt(0).toUpperCase()+tab.slice(1)} ({tab==='racconti'?stories.length:tab==='luoghi'?places.length:operators.length})
          </div>
        ))}
      </div>
      {activeTab==='racconti' && <div className="grid-3">{stories.length===0&&<p style={{color:'#888'}}>Nessun racconto ancora.</p>}{stories.map(s=><div className="card" key={s.id}><div className="card-img-placeholder" style={{background:'linear-gradient(135deg,#4a3e2d,#7c6a4a)'}}/><div className="card-body"><div className="card-tag">Racconto</div><div className="card-title">{s.title}</div>{s.excerpt&&<div className="card-excerpt">{s.excerpt}</div>}</div></div>)}</div>}
      {activeTab==='luoghi' && <div className="grid-3">{places.length===0&&<p style={{color:'#888'}}>Nessun luogo ancora.</p>}{places.map(p=><div className="card" key={p.id}><div className="card-img-placeholder" style={{background:'linear-gradient(135deg,#1a3a4a,#2d6a7c)'}}/><div className="card-body"><div className="card-tag">{p.place_type||'Luogo'}</div><div className="card-title">{p.name}</div></div></div>)}</div>}
      {activeTab==='operatori' && <div className="grid-3">{operators.length===0&&<p style={{color:'#888'}}>Nessun operatore ancora.</p>}{operators.map(o=><div className="card" key={o.id}><div className="card-img-placeholder" style={{background:'linear-gradient(135deg,#3a1a4a,#6a2d7c)'}}/><div className="card-body"><div className="card-tag">{o.operator_type||'Operatore'}</div><div className="card-title">{o.name}</div></div></div>)}</div>}
    </div>
  )
}
