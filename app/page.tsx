import Navbar                from '@/components/Navbar'
import Hero                  from '@/components/Hero'
import About                 from '@/components/About'
import Services              from '@/components/Services'
import WhyUs                 from '@/components/WhyUs'
import AnnouncementsPreview  from '@/components/AnnouncementsPreview'
import Contact               from '@/components/Contact'
import Footer                from '@/components/Footer'
import WhatsAppButton        from '@/components/WhatsAppButton'
import ScrollRevealInit      from '@/components/ScrollRevealInit'

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Services />
        <WhyUs />
        <AnnouncementsPreview />
        <Contact />
      </main>
      <Footer />
      <WhatsAppButton />
      <ScrollRevealInit />
    </>
  )
}
