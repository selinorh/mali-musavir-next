'use client'
import { useState, useEffect, useRef } from 'react'

const navLinks = [
  { href: '#hakkimizda', label: 'Hakkımızda' },
  { href: '#hizmetler',  label: 'Hizmetler'  },
  { href: '#neden-biz',  label: 'Neden Biz'  },
  { href: '#iletisim',   label: 'İletişim'   },
]

export default function Navbar() {
  const [scrolled,       setScrolled]       = useState(false)
  const [menuOpen,       setMenuOpen]        = useState(false)
  const [activeSection,  setActiveSection]   = useState('')
  const navbarRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const sections = document.querySelectorAll('section[id]')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActiveSection(entry.target.id)
        })
      },
      { rootMargin: '-40% 0px -55% 0px' }
    )
    sections.forEach(s => observer.observe(s))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const onOutsideClick = (e) => {
      if (navbarRef.current && !navbarRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('click', onOutsideClick)
    return () => document.removeEventListener('click', onOutsideClick)
  }, [])

  const closeMenu = () => setMenuOpen(false)

  return (
    <header id="navbar" ref={navbarRef} className={scrolled ? 'scrolled' : ''}>
      <div className="container nav-inner">
        <a href="#" className="logo" aria-label="Ali Orhun – Serbest Muhasebeci Mali Müşavir">
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
            {navLinks.map(({ href, label }) => (
              <li key={href}>
                <a
                  href={href}
                  className={activeSection === href.slice(1) ? 'active' : ''}
                  onClick={closeMenu}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
          <a href="#iletisim" className="btn btn-gold nav-cta" onClick={closeMenu}>
            Randevu Al
          </a>
        </nav>
      </div>
    </header>
  )
}
