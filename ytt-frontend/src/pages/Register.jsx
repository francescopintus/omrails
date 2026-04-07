import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api'
export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email:'', password:'', display_name:'' })
  const [error, setError] = useState('')
  const submit = async (e) => {
    e.preventDefault(); setError('')
    try {
      const res = await api.post('/auth/register', form)
      localStorage.setItem('ytt_token', res.data.access_token)
      localStorage.setItem('ytt_name', res.data.display_name)
      navigate('/'); window.location.reload()
    } catch(err) { setError(err.response?.data?.detail||'Errore nella registrazione') }
  }
  return (
    <div className="container" style={{maxWidth:'440px',paddingTop:'4rem'}}>
      <h1 style={{fontSize:'1.8rem',fontWeight:'800',marginBottom:'0.5rem'}}>Unisciti a YTT</h1>
      <p style={{color:'#666',marginBottom:'2rem'}}>Inizia a raccontare i tuoi territori</p>
      {error&&<div className="alert alert-error">{error}</div>}
      <form onSubmit={submit}>
        <div className="form-group"><label>Nome</label><input type="text" value={form.display_name} onChange={e=>setForm({...form,display_name:e.target.value})} required /></div>
        <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required /></div>
        <div className="form-group"><label>Password</label><input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required minLength={8} /></div>
        <button type="submit" className="btn btn-primary" style={{width:'100%'}}>Crea account</button>
      </form>
      <p style={{textAlign:'center',marginTop:'1.5rem',color:'#666'}}>Hai già un account? <Link to="/login" style={{color:'#2d4a3e',fontWeight:'600'}}>Accedi</Link></p>
    </div>
  )
}
