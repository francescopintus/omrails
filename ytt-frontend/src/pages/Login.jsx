import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api'
export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email:'', password:'' })
  const [error, setError] = useState('')
  const submit = async (e) => {
    e.preventDefault(); setError('')
    try {
      const res = await api.post('/auth/login', form)
      localStorage.setItem('ytt_token', res.data.access_token)
      localStorage.setItem('ytt_name', res.data.display_name)
      navigate('/'); window.location.reload()
    } catch { setError('Email o password non corretti') }
  }
  return (
    <div className="container" style={{maxWidth:'440px',paddingTop:'4rem'}}>
      <h1 style={{fontSize:'1.8rem',fontWeight:'800',marginBottom:'2rem'}}>Accedi a YTT</h1>
      {error&&<div className="alert alert-error">{error}</div>}
      <form onSubmit={submit}>
        <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required /></div>
        <div className="form-group"><label>Password</label><input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required /></div>
        <button type="submit" className="btn btn-primary" style={{width:'100%'}}>Accedi</button>
      </form>
      <p style={{textAlign:'center',marginTop:'1.5rem',color:'#666'}}>Non hai un account? <Link to="/register" style={{color:'#2d4a3e',fontWeight:'600'}}>Registrati</Link></p>
    </div>
  )
}
