const serviceLinks = [
  'Muhasebe & Defter Tutma',
  'Vergi Danışmanlığı',
  'SGK & Bordro',
  'Şirket Kuruluşu',
  'Mali Analiz & Raporlama',
  'Beyanname & Vergi Süreçleri',
]

export default function Footer() {
  return (
    <footer id="footer">
      <div className="container footer-inner">

        <div className="footer-brand">
          <a href="#" className="logo footer-logo">
            <img src="/ao-logo.png" alt="S.M.M.M. Ali Orhun" className="logo-img logo-img-footer" />
            <div className="logo-wordmark">
              <span className="logo-name">Ali Orhun</span>
              <span className="logo-title">Serbest Muhasebeci Mali Müşavir</span>
            </div>
          </a>
          <p>Antalya&apos;da muhasebe, vergi danışmanlığı ve mali müşavirlik hizmetleri. İşinizin finansal geleceğini birlikte şekillendiriyoruz.</p>
        </div>

        <div className="footer-services">
          <h4>Hizmetlerimiz</h4>
          <ul>
            {serviceLinks.map(s => (
              <li key={s}><a href="#hizmetler">{s}</a></li>
            ))}
          </ul>
        </div>

        <div className="footer-links">
          <h4>Hızlı Bağlantılar</h4>
          <ul>
            <li><a href="/#hizmetler">Hizmetler</a></li>
            <li><a href="/pratik-bilgiler">Pratik Bilgiler</a></li>
            <li><a href="/duyurular">Duyurular</a></li>
            <li><a href="/#iletisim">İletişim</a></li>
            <li><a href="/#iletisim">Randevu Al</a></li>
          </ul>
        </div>

        <div className="footer-contact">
          <h4>İletişim</h4>
          <p>0535 253 24 86</p>
          <p>aliorhun@hotmail.com</p>
          <p>Muratpaşa / Antalya</p>
        </div>

      </div>
      <div className="footer-bottom">
        <div className="container">
          <p>© 2026 Ali Orhun Serbest Muhasebeci Mali Müşavir. Tüm Hakları Saklıdır.</p>
        </div>
      </div>
    </footer>
  )
}
