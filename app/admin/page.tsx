'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Appointment } from '@/lib/supabase'

function formatDate(dateStr: string) {
  if (!dateStr) return '—'
  const [y, m, d] = dateStr.split('-')
  return `${d}.${m}.${y}`
}

function formatDateTime(iso: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' })
}

const STATUS_LABEL: Record<string, string> = {
  pending:   'Bekliyor',
  confirmed: 'Onaylandı',
  cancelled: 'İptal',
}
const STATUS_COLOR: Record<string, { bg: string; color: string; border: string }> = {
  pending:   { bg: 'rgba(107,114,128,0.10)', color: '#6B7280',  border: 'rgba(107,114,128,0.25)' },
  confirmed: { bg: 'rgba(46,125,82,0.10)',   color: '#2E7D52',  border: 'rgba(46,125,82,0.25)'   },
  cancelled: { bg: 'rgba(217,83,79,0.10)',   color: '#D9534F',  border: 'rgba(217,83,79,0.25)'   },
}

export default function AdminPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState<string | null>(null)
  const [deleting,     setDeleting]     = useState<Set<string>>(new Set())
  const [logoutLoading, setLogoutLoading] = useState(false)
  const router = useRouter()

  const fetchAppointments = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/appointments')
      if (!res.ok) throw new Error(`Hata: ${res.status}`)
      const data = await res.json()
      setAppointments(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Randevular yüklenemedi.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAppointments() }, [fetchAppointments])

  async function deleteOne(id: string) {
    setDeleting(prev => new Set(prev).add(id))
    try {
      const res = await fetch(`/api/admin/appointments/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setAppointments(prev => prev.filter(a => a.id !== id))
    } catch {
      alert('Silme işlemi başarısız. Lütfen tekrar deneyin.')
    } finally {
      setDeleting(prev => { const s = new Set(prev); s.delete(id); return s })
    }
  }

  async function deleteAll() {
    if (!confirm('Tüm randevular silinecek. Emin misiniz?')) return
    try {
      const res = await fetch('/api/admin/appointments', { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setAppointments([])
    } catch {
      alert('Silme işlemi başarısız. Lütfen tekrar deneyin.')
    }
  }

  async function handleLogout() {
    setLogoutLoading(true)
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
    } finally {
      router.push('/admin/login')
      router.refresh()
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif" }}>

      {/* Spinner keyframe — scoped inside this page */}
      <style>{`@keyframes ao-spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <header style={{ background: 'var(--navy)', borderBottom: '3px solid var(--gold)', padding: '20px 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '3px', color: 'var(--gold)', display: 'block', marginBottom: '4px' }}>
              Admin Paneli
            </span>
            <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: '0.2px' }}>
              S.M.M.M. Ali Orhun
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <Link
              href="/admin/pratik-bilgiler"
              style={{ color: 'rgba(255,255,255,0.60)', fontSize: '0.88rem', fontWeight: 500, textDecoration: 'none', padding: '8px 14px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', whiteSpace: 'nowrap' }}
            >
              Pratik Bilgiler
            </Link>
            <Link
              href="/"
              style={{ color: 'rgba(255,255,255,0.60)', fontSize: '0.88rem', fontWeight: 500, textDecoration: 'none', padding: '8px 14px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', whiteSpace: 'nowrap' }}
            >
              ← Ana Sayfa
            </Link>
            <button
              onClick={handleLogout}
              disabled={logoutLoading}
              style={{ color: '#C9933A', fontSize: '0.88rem', fontWeight: 600, background: 'none', border: '1px solid rgba(201,147,58,0.40)', borderRadius: '8px', padding: '8px 14px', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit' }}
            >
              {logoutLoading ? '...' : 'Çıkış Yap'}
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main style={{ padding: '52px 0 80px' }}>
        <div className="container">

          {/* Title row */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '36px' }}>
            <div>
              <span className="section-tag">Randevu Yönetimi</span>
              <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                Gelen Randevular
                {!loading && !error && (
                  <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)', background: 'var(--border)', borderRadius: '20px', padding: '3px 14px', lineHeight: 1.6 }}>
                    {appointments.length}
                  </span>
                )}
              </h2>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              {!loading && !error && appointments.length > 0 && (
                <button
                  onClick={deleteAll}
                  style={{ padding: '10px 20px', border: '1.5px solid #D9534F', borderRadius: '8px', background: 'transparent', color: '#D9534F', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  Tümünü Sil
                </button>
              )}
              {!loading && (
                <button
                  onClick={fetchAppointments}
                  style={{ padding: '10px 20px', border: '1.5px solid var(--border)', borderRadius: '8px', background: 'transparent', color: 'var(--navy)', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  Yenile
                </button>
              )}
            </div>
          </div>

          {loading && <LoadingState />}
          {!loading && error && <ErrorState message={error} onRetry={fetchAppointments} />}
          {!loading && !error && appointments.length === 0 && <EmptyState />}
          {!loading && !error && appointments.length > 0 && (
            <AppointmentsTable appointments={appointments} deleting={deleting} onDelete={deleteOne} />
          )}

        </div>
      </main>
    </div>
  )
}

function LoadingState() {
  return (
    <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--border)', padding: '80px 40px', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--gold)', animation: 'ao-spin 0.8s linear infinite', margin: '0 auto 20px' }} />
      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>Randevular yükleniyor...</p>
    </div>
  )
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', border: '1.5px solid rgba(217,83,79,0.25)', padding: '60px 40px', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ width: '56px', height: '56px', background: 'rgba(217,83,79,0.08)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#D9534F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>
      <h3 style={{ color: 'var(--navy)', marginBottom: '8px', fontSize: '1.1rem' }}>Yükleme başarısız</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>{message}</p>
      <button
        onClick={onRetry}
        style={{ padding: '10px 24px', background: 'var(--navy)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
      >
        Tekrar Dene
      </button>
    </div>
  )
}

function EmptyState() {
  return (
    <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--border)', padding: '80px 40px', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ width: '72px', height: '72px', background: 'linear-gradient(135deg, var(--navy), var(--navy-mid))', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      </div>
      <h3 style={{ color: 'var(--navy)', marginBottom: '10px', fontSize: '1.3rem', fontWeight: 700 }}>
        Henüz randevu bulunmuyor
      </h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '360px', margin: '0 auto 28px', lineHeight: 1.7 }}>
        Siteye gelen randevu talepleri burada listelenecektir.
      </p>
      <Link
        href="/#iletisim"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: 'var(--navy)', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}
      >
        Randevu Formuna Git
      </Link>
    </div>
  )
}

function AppointmentsTable({
  appointments, deleting, onDelete,
}: {
  appointments: Appointment[]
  deleting: Set<string>
  onDelete: (id: string) => void
}) {
  const headers = ['#', 'Ad Soyad', 'Telefon', 'E-posta', 'Tarih', 'Saat', 'Durum', 'Mesaj', 'Gönderilme', '']
  return (
    <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ background: 'var(--navy)' }}>
              {headers.map((h, i) => (
                <th key={i} style={{ padding: '14px 18px', textAlign: 'left', color: 'rgba(255,255,255,0.80)', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '1.5px', whiteSpace: 'nowrap', borderBottom: '2px solid var(--gold)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {appointments.map((apt, idx) => (
              <TableRow key={apt.id} apt={apt} idx={idx} isDeleting={deleting.has(apt.id)} onDelete={onDelete} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function TableRow({ apt, idx, isDeleting, onDelete }: {
  apt: Appointment
  idx: number
  isDeleting: boolean
  onDelete: (id: string) => void
}) {
  const [hovered,    setHovered]    = useState(false)
  const [btnHovered, setBtnHovered] = useState(false)
  const statusStyle = STATUS_COLOR[apt.status] ?? STATUS_COLOR.pending

  return (
    <tr
      style={{ borderBottom: '1px solid var(--border)', background: hovered ? 'var(--bg)' : 'transparent', transition: 'background 0.15s', opacity: isDeleting ? 0.5 : 1 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <td style={{ padding: '14px 18px', color: 'var(--text-muted)', fontWeight: 500 }}>{idx + 1}</td>
      <td style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--navy)', whiteSpace: 'nowrap' }}>{apt.name}</td>
      <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>
        <a href={`tel:${apt.phone}`} style={{ color: 'var(--navy)', textDecoration: 'none', fontWeight: 500 }}>{apt.phone}</a>
      </td>
      <td style={{ padding: '14px 18px' }}>
        {apt.email
          ? <a href={`mailto:${apt.email}`} style={{ color: 'var(--gold)', textDecoration: 'none', fontWeight: 500 }}>{apt.email}</a>
          : <span style={{ color: 'var(--text-muted)' }}>—</span>
        }
      </td>
      <td style={{ padding: '14px 18px', whiteSpace: 'nowrap', fontWeight: 600, color: 'var(--navy)' }}>{formatDate(apt.date)}</td>
      <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>
        <span style={{ background: 'rgba(201,147,58,0.12)', color: 'var(--gold)', fontWeight: 700, padding: '3px 12px', borderRadius: '20px', fontSize: '0.82rem', border: '1px solid rgba(201,147,58,0.25)' }}>
          {apt.time}
        </span>
      </td>
      <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>
        <span style={{ background: statusStyle.bg, color: statusStyle.color, fontWeight: 600, padding: '3px 10px', borderRadius: '20px', fontSize: '0.78rem', border: `1px solid ${statusStyle.border}` }}>
          {STATUS_LABEL[apt.status] ?? apt.status}
        </span>
      </td>
      <td style={{ padding: '14px 18px', maxWidth: '200px', color: 'var(--text-muted)' }}>
        {apt.message
          ? <span title={apt.message} style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{apt.message}</span>
          : <span>—</span>
        }
      </td>
      <td style={{ padding: '14px 18px', whiteSpace: 'nowrap', color: 'var(--text-muted)', fontSize: '0.82rem' }}>{formatDateTime(apt.created_at)}</td>
      <td style={{ padding: '14px 18px' }}>
        <button
          onClick={() => onDelete(apt.id)}
          disabled={isDeleting}
          title="Randevuyu Sil"
          style={{ background: btnHovered ? 'rgba(217,83,79,0.10)' : 'none', border: 'none', cursor: isDeleting ? 'not-allowed' : 'pointer', color: '#D9534F', padding: '6px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s', fontFamily: 'inherit' }}
          onMouseEnter={() => setBtnHovered(true)}
          onMouseLeave={() => setBtnHovered(false)}
        >
          {isDeleting ? (
            <div style={{ width: '15px', height: '15px', borderRadius: '50%', border: '2px solid rgba(217,83,79,0.3)', borderTopColor: '#D9534F', animation: 'ao-spin 0.7s linear infinite' }} />
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6M14 11v6"/>
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          )}
        </button>
      </td>
    </tr>
  )
}
