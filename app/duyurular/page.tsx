import Navbar           from '@/components/Navbar'
import Footer           from '@/components/Footer'
import WhatsAppButton   from '@/components/WhatsAppButton'
import ScrollRevealInit from '@/components/ScrollRevealInit'
import DuyurularClient  from '@/components/DuyurularClient'

export const metadata = {
  title:       'Duyurular | S.M.M.M. Ali Orhun',
  description: 'GİB, SGK ve Resmî Gazete güncel duyuruları, vergi mevzuatı haberleri ve önemli tarihler.',
}

export default function Duyurular() {
  return (
    <>
      <Navbar />
      <main>
        <div className="subpage-hero">
          <div className="container">
            <span className="section-tag">GİB · SGK · Resmî Gazete</span>
            <h1>Duyurular</h1>
            <p>
              Vergi mevzuatı, SGK mevzuatı ve muhasebe dünyasındaki gelişmelere
              dair güncel duyuru ve haberler.
            </p>
          </div>
        </div>

        <DuyurularClient />
      </main>
      <Footer />
      <WhatsAppButton />
      <ScrollRevealInit />
    </>
  )
}
