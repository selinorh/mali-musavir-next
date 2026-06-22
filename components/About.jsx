export default function About() {
  return (
    <section id="hakkimizda">
      <div className="container about-grid">

        <div className="about-text reveal">
          <span className="section-tag">Hakkımızda</span>
          <h2>20+ Yıllık Deneyim,<br />Kesintisiz Güven</h2>
          <p>
            Serbest Muhasebeci Mali Müşavir Ali Orhun olarak 20 yılı aşkın mesleki deneyimimizle
            Muratpaşa / Antalya&apos;da muhasebe, vergi danışmanlığı ve mali müşavirlik alanlarında
            kapsamlı hizmet sunmaktayız. Küçük ve orta ölçekli işletmelerden bireysel girişimcilere
            kadar geniş bir müşteri kesimine profesyonel destek sağlıyoruz.
          </p>
          <p>
            İşletmenizin mali süreçlerini yasal mevzuata tam uyumlu biçimde yönetmek, vergi
            yükümlülüklerinizi zamanında yerine getirmek ve finansal kararlarınızda güvenilir bir
            danışman olmak temel amacımızdır.
          </p>
          <a href="#iletisim" className="btn btn-primary">Bizimle İletişime Geçin</a>
        </div>

        <div className="about-stats">
          <div className="stat-card reveal">
            <span className="stat-num stat-abbr">SMMM</span>
            <span className="stat-label">Ruhsatlı Mali Müşavir</span>
          </div>
          <div className="stat-card reveal">
            <span className="stat-num stat-abbr">TÜRMOB</span>
            <span className="stat-label">Kayıtlı Üye</span>
          </div>
          <div className="stat-card reveal">
            <span className="stat-num stat-abbr">Antalya</span>
            <span className="stat-label">Muratpaşa&apos;da Ofis</span>
          </div>
          <div className="stat-card reveal">
            <span className="stat-num">20+</span>
            <span className="stat-label">Yıllık Deneyim</span>
          </div>
        </div>

      </div>
    </section>
  )
}
