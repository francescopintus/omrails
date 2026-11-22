import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api'

export default function StoryDetail() {
  const { slug } = useParams()
  const [story, setStory] = useState(null)

  useEffect(() => {
    api.get(`/stories/${slug}`).then(r => setStory(r.data)).catch(() => {})
  }, [slug])

  if (!story) return <div className="container"><p>Caricamento...</p></div>

  return (
    <div className="container" style={{maxWidth: 780}}>
      <Link to="/stories" style={{color:'#888', fontSize:'0.9rem'}}>← Tutti i racconti</Link>
      <div className="page-header" style={{marginTop:'1rem', marginBottom:'0.5rem'}}>
        <div style={{fontSize:'0.8rem', textTransform:'uppercase', letterSpacing:'0.08em', color:'#888', marginBottom:'0.6rem'}}>
          Racconto
        </div>
        <h1 style={{fontSize:'2.2rem', lineHeight:1.2}}>{story.title}</h1>
        {story.excerpt && (
          <p style={{fontSize:'1.1rem', color:'#555', marginTop:'1rem', lineHeight:1.6, fontStyle:'italic'}}>
            {story.excerpt}
          </p>
        )}
      </div>
      {story.cover_image_url ? (
        <img src={story.cover_image_url} alt={story.title}
          style={{width:'100%', height:340, objectFit:'cover', borderRadius:10, marginBottom:'2rem'}} />
      ) : (
        <div style={{width:'100%', height:220, background:'linear-gradient(135deg,#4a3e2d,#7c6a4a)',
          borderRadius:10, marginBottom:'2rem'}} />
      )}
      {story.body && (
        <div style={{lineHeight:1.85, fontSize:'1.05rem', color:'#2a2a2a'}}>
          {story.body.split('\n').map((para, i) => {
            if (!para.trim()) return <br key={i} />
            if (para.startsWith('**') && para.endsWith('**')) {
              return <h3 key={i} style={{fontSize:'1.2rem', fontWeight:700, margin:'2rem 0 0.8rem'}}>{para.slice(2,-2)}</h3>
            }
            return <p key={i} style={{marginBottom:'1.2rem'}}>{para}</p>
          })}
        </div>
      )}
      {story.tags && (
        <div style={{marginTop:'2rem', display:'flex', gap:'0.5rem', flexWrap:'wrap'}}>
          {story.tags.split(',').map(t => (
            <span key={t} className="badge badge-gray">{t.trim()}</span>
          ))}
        </div>
      )}
    </div>
  )
}
