'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
)

const ExtIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
    <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
)

function SkeletonCard() {
  return (
    <div className="preview-skeleton-card">
      <div className="preview-skeleton" style={{ height: 16, width: '35%' }} />
      <div className="preview-skeleton" style={{ height: 20, width: '90%' }} />
      <div className="preview-skeleton" style={{ height: 14, width: '75%' }} />
      <div className="preview-skeleton" style={{ height: 14, width: '60%' }} />
    </div>
  )
}

export default function AnnouncementsPreview() {
  const [items,   setItems]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/announcements')
      .then(r => r.json())
      .then(data => {
        const latest = (data.announcements ?? []).slice(0, 3)
        setItems(latest)
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

  if (!loading && items.length === 0) return null

  return (
    <section id="guncel-duyurular">
      <div className="container">
        <div className="preview-header">
          <div className="preview-header-text reveal">
            <span className="section-tag">Haberler</span>
            <h2>Güncel Duyurular</h2>
            <p>SGK, GİB ve Resmî Gazete&apos;den son gelişmeler</p>
          </div>
          <Link href="/duyurular" className="preview-all-link reveal">
            Tüm Duyuruları Gör <ArrowIcon />
          </Link>
        </div>

        {loading ? (
          <div className="preview-grid">
            <SkeletonCard /><SkeletonCard /><SkeletonCard />
          </div>
        ) : (
          <div className="preview-grid">
            {items.map((item, idx) => (
              <a
                key={item.id}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="preview-card preview-card-enter"
                style={{ animationDelay: `${idx * 0.08}s` }}
              >
                <div className="preview-card-meta">
                  <span className={`announcement-source announcement-source-${item.sourceKey}`}>
                    {item.source}
                  </span>
                  <span className="announcement-date">{item.date}</span>
                </div>
                <h3>{item.title}</h3>
                {item.description && <p>{item.description}</p>}
                <span className="preview-card-link">
                  Kaynağa Git <ExtIcon />
                </span>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
