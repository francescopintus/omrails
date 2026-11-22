import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import api from '../api'

export default function PlaceDetail() {
  const { slug } = useParams()
  const [place, setPlace] = useState(null)

  useEffect(() => {
    api.get(`/places/${slug}`).then(r => setPlace(r.data)).catch(() => {})
  }, [slug])

  if (!place) return <div className="container"><p>Caricamento...</p></div>

  return (
    <div className="container" style={{maxWidth:860}}>
      <Link to="/territories" style={{color:'#888', fontSize:'0.9rem'}}>← Torna ai territori</Link>
      <div className="page-header" style={{marginTop:'1rem'}}>
        <div style={{fontSize:'0.8rem', textTransform:'uppercase', letterSpacing:'0.08em', color:'#888', marginBottom:'0.4rem'}}>
          {place.place_type || 'Luogo'}
        </div>
        <h1>{place.name}</h1>
        {place.address && <p style={{color:'#888', marginTop:'0.3rem'}}>{place.address}</p>}
      </div>
      {place.lat && place.lng && (
        <div className="map-container" style={{height:300, marginBottom:'2rem'}}>
          <MapContainer center={[place.lat, place.lng]} zoom={13} style={{height:'100%', width:'100%'}}>
            <TileLayer attribution='© OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[place.lat, place.lng]}>
              <Popup><strong>{place.name}</strong></Popup>
            </Marker>
          </MapContainer>
        </div>
      )}
      {place.description && (
        <p style={{lineHeight:1.8, fontSize:'1.05rem', color:'#2a2a2a', marginBottom:'1.5rem'}}>
          {place.description}
        </p>
      )}
      {place.tags && (
        <div style={{display:'flex', gap:'0.5rem', flexWrap:'wrap'}}>
          {place.tags.split(',').map(t => (
            <span key={t} className="badge badge-gray">{t.trim()}</span>
          ))}
        </div>
      )}
    </div>
  )
}
