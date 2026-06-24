'use client'
import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

const navLinks = [
  { href: '#hizmetler',       label: 'Hizmetler',       anchor: true  },
  { href: '/duyurular',       label: 'Duyurular',        anchor: false },
  { href: '/pratik-bilgiler', label: 'Pratik Bilgiler',  anchor: false },
  { href: '#iletisim',        label: 'İletişim',         anchor: true  },
]

export default function Navbar() {
  const [scrolled,      setScrolled]      = useState(false)
  const [menuOpen,      setMenuOpen]      = useState(false)
  const [activeSection, setActiveSection] = useState('')
  const navbarRef = useRef(null)
  const pathname  = usePathname()
  const isHome    = pathname === '/'

  // On sub-pages there's no dark hero so always show the solid navbar
  const isScrolled = scrolled || !isHome

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!isHome) return
    const sections = document.querySelectorAll('section[id]')
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id) }),
      { rootMargin: '-40% 0px -55% 0px' }
    )
    sections.forEach(s => observer.observe(s))
    return () => observer.disconnect()
  }, [isHome])

  useEffect(() => {
    const onOutsideClick = (e) => {
      if (navbarRef.current && !navbarRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('click', onOutsideClick)
    return () => document.removeEventListener('click', onOutsideClick)
  }, [])

  const closeMenu = () => setMenuOpen(false)

  const getLinkHref = ({ href, anchor }) =>
    anchor ? (isHome ? href : `/${href}`) : href

  const isActive = ({ href, anchor }) =>
    anchor
      ? (isHome && activeSection === href.slice(1))
      : pathname === href

  const randevuHref = isHome ? '#iletisim' : '/#iletisim'

  return (
    <header id="navbar" ref={navbarRef} className={isScrolled ? 'scrolled' : ''}>
      <div className="container nav-inner">
        <a
          href={isHome ? '#' : '/'}
          className="logo"
          aria-label="Ali Orhun – Serbest Muhasebeci Mali Müşavir"
        >
          <img src="/ao-logo.png" alt="AO" className="logo-icon" />
          <div className="logo-sep" />
          <div className="logo-wordmark">
            <span className="logo-name">Ali Orhun</span>
            <span className="logo-title">Serbest Muhasebeci Mali Müşavir</span>
          </div>
        </a>

        <button
          id="hamburger"
          className={menuOpen ? 'open' : ''}
          aria-label={menuOpen ? 'Menüyü kapat' : 'Menüyü aç'}
          onClick={() => setMenuOpen(prev => !prev)}
        >
          <span /><span /><span />
        </button>

        <nav id="nav-menu" className={menuOpen ? 'open' : ''}>
          <ul>
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={getLinkHref(link)}
                  className={isActive(link) ? 'active' : ''}
                  onClick={closeMenu}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <a href={randevuHref} className="btn btn-gold nav-cta" onClick={closeMenu}>
            Randevu Al
          </a>
        </nav>
      </div>
    </header>
  )
}
