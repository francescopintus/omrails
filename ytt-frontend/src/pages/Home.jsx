import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import api from '../api'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

export default function Home() {
  const [territories, setTerritories] = useState([])
  const [stories, setStories] = useState([])
  useEffect(() => {
    api.get('/territories/?featured=true').then(r => setTerritories(r.data)).catch(() => {})
    api.get('/stories/?featured=true').then(r => setStories(r.data)).catch(() => {})
  }, [])
  const mapMarkers = territories.filter(t => t.lat_center && t.lng_center)
  return (
    <>
      <section className="hero">
        <h1>Scopri i territori<br /><span>che non trovi sulle guide</span></h1>
        <p>Racconti autentici di viaggiatori che hanno esplorato l'Italia periferica.</p>
        <Link to="/territories" className="btn btn-primary">Esplora i territori</Link>
        {' '}
        <Link to="/tripbooks" className="btn btn-outline" style={{marginLeft:'0.5rem'}}>Leggi i Trip Book</Link>
      </section>
      <div className="container">
        {mapMarkers.length > 0 && (
          <section style={{marginBottom:'3rem'}}>
            <h2 className="section-title">La mappa dei territori</h2>
            <div className="map-container">
              <MapContainer center={[42.5, 12.5]} zoom={6} style={{height:'100%',width:'100%'}}>
                <TileLayer attribution='© OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {mapMarkers.map(t => (
                  <Marker key={t.id} position={[t.lat_center, t.lng_center]}>
                    <Popup><strong>{t.title}</strong><br /><Link to={`/territories/${t.slug}`}>Scopri →</Link></Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </section>
        )}
        {territories.length === 0 && stories.length === 0 && (
          <section style={{textAlign:'center',padding:'4rem 0'}}>
            <div style={{fontSize:'3rem',marginBottom:'1rem'}}>🗺️</div>
            <h2 className="section-title">La piattaforma è pronta</h2>
            <p className="section-subtitle">Inizia aggiungendo i primi territori e racconti</p>
            <Link to="/register" className="btn btn-primary">Inizia ora</Link>
          </section>
        )}
      </div>
    </>
  )
}
