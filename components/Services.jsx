const services = [
  {
    title: 'Muhasebe & Defter Tutma',
    desc:  'İşletmenizin tüm muhasebe süreçlerini yasal yükümlülüklere tam uyum sağlayacak biçimde yönetiyoruz.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
        <rect x="9" y="3" width="6" height="4" rx="2"/>
        <line x1="9" y1="12" x2="15" y2="12"/>
        <line x1="9" y1="16" x2="13" y2="16"/>
      </svg>
    ),
  },
  {
    title: 'Vergi Danışmanlığı',
    desc:  'Vergi yükümlülüklerinizi minimize ederek yasal avantajlardan en iyi şekilde yararlanmanızı sağlıyoruz.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 6v6l4 2"/>
      </svg>
    ),
  },
  {
    title: 'SGK & Bordro',
    desc:  'Personel özlük işlemleri, bordro hazırlama ve SGK bildirimleri eksiksiz ve zamanında yönetilir.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    title: 'Şirket Kuruluşu',
    desc:  'Şirket tipi seçiminden tescil sürecine kadar tüm aşamalarda hukuki ve mali rehberlik sağlıyoruz.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2"/>
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
      </svg>
    ),
  },
  {
    title: 'Mali Analiz & Raporlama',
    desc:  'Finansal tablolarınızı analiz ederek stratejik karar alma süreçlerinize ışık tutuyoruz.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6"  y1="20" x2="6"  y2="14"/>
        <path d="M2 20h20"/>
      </svg>
    ),
  },
  {
    title: 'Beyanname & Vergi Süreçleri',
    desc:  'KDV, kurumlar ve gelir vergisi beyannamelerini yasal süreler içinde hazırlayıp ilgili kurumlara sunuyoruz.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
  },
]

export default function Services() {
  return (
    <section id="hizmetler" className="section-alt">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Hizmetlerimiz</span>
          <h2>Size Özel<br />Finansal Çözümler</h2>
          <p>İşletmenizin ihtiyaç duyduğu tüm mali ve muhasebe hizmetlerini tek çatı altında sunuyoruz.</p>
        </div>
        <div className="services-grid">
          {services.map((s) => (
            <div key={s.title} className="service-card reveal">
              <div className="service-icon">{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
