const features = [
  {
    title: 'Gizlilik & Güvenilirlik',
    desc:  'Tüm mali bilgileriniz mutlak gizlilik içinde işlenir. Yasal düzenlemelere tam uyum garantisi veriyoruz.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
  },
  {
    title: 'Zamanında Teslimat',
    desc:  'Beyanname ve raporlarınızı son güne bırakmadan önceden hazırlayarak gecikme riskini sıfıra indiriyoruz.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
  },
  {
    title: '7/24 Erişilebilirlik',
    desc:  'Acil durumlarda WhatsApp hattımız üzerinden uzman ekibimize her an ulaşabilirsiniz.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.28h3a2 2 0 0 1 2 1.72c.179.966.512 1.9.99 2.77a2 2 0 0 1-.45 2.11L7.91 9.4a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.87.478 1.8.812 2.77.99A2 2 0 0 1 21.64 17l.28.92z"/>
      </svg>
    ),
  },
  {
    title: 'Teknoloji Odaklı Yaklaşım',
    desc:  'Güncel muhasebe yazılımları ve dijital çözümlerle süreçlerinizi hızlandırıyor, hatasız yönetiyoruz.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
        <line x1="12" y1="22.08" x2="12" y2="12"/>
      </svg>
    ),
  },
]

export default function WhyUs() {
  return (
    <section id="neden-biz">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Neden Biz</span>
          <h2>Farkımızı<br />Hissedeceksiniz</h2>
          <p>Müşterilerimize sunduğumuz değerleri güçlü ilkeler üzerine inşa ediyoruz.</p>
        </div>
        <div className="features-grid">
          {features.map((f) => (
            <div key={f.title} className="feature-item reveal">
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
