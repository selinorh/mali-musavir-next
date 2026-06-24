'use client'
import { useState, useRef, useEffect } from 'react'

export default function Contact() {
  const [btnState, setBtnState] = useState('idle') // idle | sending | success | error
  const [errors,   setErrors]   = useState({})
  const [apiError, setApiError] = useState('')
  const [minDate,  setMinDate]  = useState('')
  const formRef = useRef(null)

  useEffect(() => {
    setMinDate(new Date().toISOString().split('T')[0])
  }, [])

  const clearError = (field) =>
    setErrors(prev => { const n = { ...prev }; delete n[field]; return n })

  const handleSubmit = async (e) => {
    e.preventDefault()
    const form    = formRef.current
    const name    = form.name.value.trim()
    const phone   = form.phone.value.trim()
    const date    = form.date.value
    const time    = form.time.value
    const errs    = {}
    if (!name)  errs.name  = 'Ad Soyad alanı zorunludur.'
    if (!phone) errs.phone = 'Telefon alanı zorunludur.'
    if (!date)  errs.date  = 'Randevu tarihi zorunludur.'
    if (!time)  errs.time  = 'Randevu saati zorunludur.'
    if (Object.keys(errs).length) { setErrors(errs); return }

    setErrors({})
    setApiError('')
    setBtnState('sending')

    const res = await fetch('/api/appointments', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        name,
        phone,
        email:   form.email.value.trim() || null,
        date,
        time,
        message: form.message.value.trim() || null,
      }),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setApiError(data.error ?? 'Randevu gönderilemedi. Lütfen tekrar deneyin.')
      setBtnState('error')
      setTimeout(() => setBtnState('idle'), 3500)
      return
    }

    setBtnState('success')
    setTimeout(() => { form.reset(); setBtnState('idle') }, 3500)
  }

  const fieldStyle = (field) => errors[field] ? { borderColor: '#D9534F' } : {}
  const errSpan    = (field) => errors[field]
    ? <span style={{ fontSize: '0.78rem', color: '#D9534F', marginTop: '4px', display: 'block' }}>{errors[field]}</span>
    : null

  const btnStyle =
    btnState === 'success' ? { opacity: 1, background: '#2E7D52', borderColor: '#2E7D52' } :
    btnState === 'error'   ? { opacity: 1, background: '#D9534F', borderColor: '#D9534F' } :
    btnState === 'sending' ? { opacity: 0.75 } : {}

  return (
    <section id="iletisim" className="section-alt">
      <div className="container">
        <div className="contact-grid">

          {/* ---- Info ---- */}
          <div className="contact-info reveal">
            <span className="section-tag">Randevu</span>
            <h2>Randevu Alın,<br />Hemen Başlayalım</h2>
            <p>Formu doldurun, size uygun tarih ve saatte ofisimizde görüşelim. Tüm finansal sorularınıza uzman desteği sunmak için buradayız.</p>

            <ul className="contact-list">
              <li className="contact-item">
                <div className="contact-item-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <div className="contact-item-body">
                  <span className="contact-item-label">Adres</span>
                  <span className="contact-item-value">
                    İsmetpaşa Cd. 459 Sk. No:19-1<br />07040 Muratpaşa / Antalya
                  </span>
                </div>
              </li>
              <li className="contact-item">
                <div className="contact-item-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.28h3a2 2 0 0 1 2 1.72c.179.966.512 1.9.99 2.77a2 2 0 0 1-.45 2.11L7.91 9.4a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.87.478 1.8.812 2.77.99A2 2 0 0 1 21.64 17l.28.92z"/>
                  </svg>
                </div>
                <div className="contact-item-body">
                  <span className="contact-item-label">Telefon</span>
                  <a href="tel:+905352532486" className="contact-item-value contact-item-link">0535 253 24 86</a>
                </div>
              </li>
              <li className="contact-item">
                <div className="contact-item-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </div>
                <div className="contact-item-body">
                  <span className="contact-item-label">E-posta</span>
                  <a href="mailto:aliorhun@hotmail.com" className="contact-item-value contact-item-link">aliorhun@hotmail.com</a>
                </div>
              </li>
            </ul>

            <div className="working-hours">
              <h4>Çalışma Saatleri</h4>
              <div className="hours-grid">
                <div className="hours-row">
                  <span className="hours-day">Pazartesi – Cuma</span>
                  <span className="hours-time">09:30 – 16:00</span>
                </div>
                <div className="hours-row">
                  <span className="hours-day">Cumartesi</span>
                  <span className="hours-time">10:00 – 15:00</span>
                </div>
                <div className="hours-row">
                  <span className="hours-day">Pazar</span>
                  <span className="hours-time hours-closed">Kapalı</span>
                </div>
              </div>
            </div>
          </div>

          {/* ---- Form ---- */}
          <form className="contact-form reveal" ref={formRef} onSubmit={handleSubmit} noValidate>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Ad Soyad *</label>
                <input type="text" id="name" name="name" placeholder="Adınız Soyadınız"
                  style={fieldStyle('name')} onChange={() => clearError('name')} />
                {errSpan('name')}
              </div>
              <div className="form-group">
                <label htmlFor="phone">Telefon *</label>
                <input type="tel" id="phone" name="phone" placeholder="+90 5xx xxx xx xx"
                  style={fieldStyle('phone')} onChange={() => clearError('phone')} />
                {errSpan('phone')}
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="email">E-posta</label>
              <input type="email" id="email" name="email" placeholder="ornek@sirket.com" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="date">Randevu Tarihi *</label>
                <input type="date" id="date" name="date" min={minDate}
                  style={fieldStyle('date')} onChange={() => clearError('date')} />
                {errSpan('date')}
              </div>
              <div className="form-group">
                <label htmlFor="time">Randevu Saati *</label>
                <select id="time" name="time"
                  style={fieldStyle('time')} onChange={() => clearError('time')}>
                  <option value="">Saat Seçiniz</option>
                  <option>09:30</option>
                  <option>10:00</option>
                  <option>10:30</option>
                  <option>11:00</option>
                  <option>11:30</option>
                  <option>12:00</option>
                  <option>12:30</option>
                  <option>13:00</option>
                  <option>13:30</option>
                  <option>14:00</option>
                  <option>14:30</option>
                  <option>15:00</option>
                  <option>15:30</option>
                </select>
                {errSpan('time')}
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="message">Mesajınız</label>
              <textarea id="message" name="message" rows={4}
                placeholder="Görüşmek istediğiniz konuyu kısaca açıklayın..." />
            </div>

            {apiError && (
              <div style={{ background: 'rgba(217,83,79,0.07)', border: '1px solid rgba(217,83,79,0.25)', borderRadius: '8px', padding: '11px 14px', marginBottom: '16px', fontSize: '0.84rem', color: '#D9534F', textAlign: 'center' }}>
                {apiError}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-gold btn-full"
              id="submitBtn"
              disabled={btnState !== 'idle'}
              style={btnStyle}
            >
              {btnState === 'sending' ? 'Gönderiliyor...' :
               btnState === 'success' ? 'Randevu Talebiniz Alındı ✓' :
               btnState === 'error'   ? 'Gönderim Başarısız ✕' :
               'Randevu Talebi Gönder'}
            </button>
            <p className="form-note">* Zorunlu alanlar. Bilgileriniz gizli tutulur.</p>
          </form>
        </div>

        {/* ---- Map ---- */}
        <div className="map-section reveal">
          <div className="map-card">
            <div className="map-embed">
              <iframe
                src="https://www.google.com/maps?q=%C4%B0smetpa%C5%9Fa+Cd.+Muratpa%C5%9Fa+Antalya&output=embed&z=16&hl=tr"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ali Orhun SMMM Ofis Konumu"
              />
            </div>
            <div className="map-info">
              <span className="section-tag">Ofis Konumu</span>
              <address>
                <strong>İsmetpaşa Cd. 459 Sk. No:19-1</strong><br />
                07040 Muratpaşa / Antalya
              </address>
              <a
                href="https://share.google/ahh9htZlGXjjL6ORo"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary map-open-btn"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="2" y1="12" x2="22" y2="12"/>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
                Google Maps&apos;te Aç
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
