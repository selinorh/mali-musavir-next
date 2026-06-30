import HeroWebGL from './HeroWebGL'
// import HeroDots from './HeroDots'   ← geri almak için bu ikisini takas edin

export default function Hero() {
  return (
    <section id="hero">
      <HeroWebGL />
      {/* <HeroDots /> */}
      <div className="container hero-content">
        <p className="hero-tag">Serbest Muhasebeci Mali Müşavirlik</p>
        <h1>İşinizin Finansal<br />Güvencesi Yanınızda</h1>
        <p className="hero-sub">
          20 yılı aşkın mesleki deneyimimizle vergi, muhasebe ve mali
          danışmanlık konularında güvenilir, şeffaf ve zamanında hizmet sunuyoruz.
        </p>
        <div className="hero-actions">
          <a href="#iletisim" className="btn btn-gold">Randevu Al</a>
          <a href="#hizmetler" className="btn btn-ghost">Hizmetlerimizi Keşfedin</a>
        </div>
      </div>
      <div className="hero-scroll-hint">
        <span />
      </div>
    </section>
  )
}
