'use client'
import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass]  = useState(false)
  const [error,    setError]     = useState('')
  const [loading,  setLoading]   = useState(false)
  const router = useRouter()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/admin/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ username, password }),
      })
      if (res.ok) {
        router.push('/admin')
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error ?? 'Giriş başarısız.')
      }
    } catch {
      setError('Bağlantı hatası. Lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(140deg, #08121f 0%, #0c1b34 55%, #101e38 100%)',
      padding: '24px',
      fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
    }}>
      {/* Dot grid overlay */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)',
        backgroundSize: '36px 36px',
      }} />

      <div style={{
        position: 'relative', zIndex: 1,
        width: '100%', maxWidth: '400px',
        background: '#F8F7F4',
        borderRadius: '20px',
        padding: '44px 40px',
        boxShadow: '0 24px 80px rgba(0,0,0,0.45)',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <span style={{
            display: 'inline-block',
            fontSize: '0.68rem', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '3px',
            color: '#C9933A', marginBottom: '10px',
          }}>
            Admin Girişi
          </span>
          <h2 style={{
            margin: 0,
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: '1.4rem', fontWeight: 700,
            color: '#1B2A4A', lineHeight: 1.25,
          }}>
            S.M.M.M. Ali Orhun
          </h2>
          <div style={{ width: '40px', height: '2px', background: '#C9933A', margin: '16px auto 0' }} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', marginBottom: '20px' }}>
            <label style={{ fontSize: '0.83rem', fontWeight: 600, color: '#1B2A4A' }}>
              Kullanıcı Adı
            </label>
            <input
              type="text"
              value={username}
              onChange={e => { setUsername(e.target.value); setError('') }}
              autoComplete="username"
              placeholder="admin"
              required
              style={{
                padding: '13px 16px',
                border: error ? '1.5px solid #D9534F' : '1.5px solid #E8E5DF',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontFamily: 'inherit',
                color: '#2D2D2D',
                background: '#fff',
                outline: 'none',
              }}
              onFocus={e => { if (!error) e.currentTarget.style.borderColor = '#1B2A4A' }}
              onBlur={e  => { if (!error) e.currentTarget.style.borderColor = '#E8E5DF' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', marginBottom: '28px' }}>
            <label style={{ fontSize: '0.83rem', fontWeight: 600, color: '#1B2A4A' }}>
              Şifre
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
                autoComplete="current-password"
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  padding: '13px 44px 13px 16px',
                  border: error ? '1.5px solid #D9534F' : '1.5px solid #E8E5DF',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontFamily: 'inherit',
                  color: '#2D2D2D',
                  background: '#fff',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                onFocus={e => { if (!error) e.currentTarget.style.borderColor = '#1B2A4A' }}
                onBlur={e  => { if (!error) e.currentTarget.style.borderColor = '#E8E5DF' }}
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                style={{
                  position: 'absolute', right: '12px', top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#6B7280', padding: '4px', display: 'flex',
                }}
                tabIndex={-1}
              >
                {showPass ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              background: 'rgba(217,83,79,0.08)',
              border: '1px solid rgba(217,83,79,0.25)',
              borderRadius: '8px',
              padding: '11px 14px',
              marginBottom: '20px',
              fontSize: '0.84rem',
              color: '#D9534F',
              textAlign: 'center',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading ? '#DFA84E' : '#C9933A',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.95rem',
              fontWeight: 600,
              letterSpacing: '0.3px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.8 : 1,
              fontFamily: 'inherit',
            }}
          >
            {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.78rem', color: '#6B7280' }}>
          Yetkisiz erişim yasaktır.
        </p>
      </div>
    </div>
  )
}
