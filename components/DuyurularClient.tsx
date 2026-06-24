'use client'

import { useState, useEffect, useMemo } from 'react'

// ─── Types ───────────────────────────────────────────────────────────────────

type SourceKey = 'sgk' | 'gib' | 'rg'

interface Announcement {
  id:          string
  title:       string
  description: string
  link:        string
  date:        string
  dateISO:     string
  source:      'SGK' | 'GİB' | 'Resmi Gazete'
  sourceKey:   SourceKey
}

interface SourceInfo {
  success:     boolean
  count:       number
  method:      string
  officialUrl: string
}

interface ApiResponse {
  announcements: Announcement[]
  sources: {
    sgk: SourceInfo
    gib: SourceInfo
    rg:  SourceInfo
  }
  fetched_at: string
}

// ─── Icons ───────────────────────────────────────────────────────────────────

const ExternalIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
    <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
)

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)

const AlertIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
    strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
)

// ─── Sub-components ───────────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="loading-state">
      <div className="loading-spinner" />
      <span>Duyurular yükleniyor…</span>
    </div>
  )
}

function SourceStatusBar({
  sources,
  loading,
}: {
  sources: ApiResponse['sources'] | null
  loading: boolean
}) {
  return (
    <div className="source-status-bar">
      <span>Veri kaynakları:</span>

      <span className="source-status-item">
        <span className={`source-dot ${loading ? 'source-dot-load' : sources?.sgk.success ? 'source-dot-ok' : 'source-dot-fail'}`} />
        SGK{!loading && sources && ` (${sources.sgk.success ? `${sources.sgk.count} duyuru` : 'erişilemedi'})`}
      </span>

      <span className="source-status-item">
        <span className={`source-dot ${loading ? 'source-dot-load' : sources?.gib.success ? 'source-dot-ok' : 'source-dot-fail'}`} />
        GİB{!loading && sources && ` (${sources.gib.success ? `${sources.gib.count} duyuru` : 'erişilemedi'})`}
      </span>

      <span className="source-status-item">
        <span className={`source-dot ${loading ? 'source-dot-load' : sources?.rg.success ? 'source-dot-ok' : 'source-dot-fail'}`} />
        Resmi Gazete{!loading && sources && ` (${sources.rg.success ? `${sources.rg.count} duyuru` : 'erişilemedi'})`}
      </span>
    </div>
  )
}

function EmptyState({ sources }: { sources: ApiResponse['sources'] | null }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <AlertIcon />
      </div>
      <h3>Güncel duyurular alınamadı</h3>
      <p>Resmi kaynaklar şu anda erişilemez durumda olabilir. Güncel duyurular için lütfen aşağıdaki resmi adresleri ziyaret ediniz.</p>
      <div className="official-links-row">
        <a
          href={sources?.sgk.officialUrl ?? 'https://www.sgk.gov.tr/duyuru'}
          target="_blank"
          rel="noopener noreferrer"
          className="official-link-chip"
        >
          <ExternalIcon />
          sgk.gov.tr
        </a>
        <a
          href={sources?.gib.officialUrl ?? 'https://www.gib.gov.tr'}
          target="_blank"
          rel="noopener noreferrer"
          className="official-link-chip"
        >
          <ExternalIcon />
          gib.gov.tr
        </a>
        <a
          href={sources?.rg.officialUrl ?? 'https://www.resmigazete.gov.tr'}
          target="_blank"
          rel="noopener noreferrer"
          className="official-link-chip"
        >
          <ExternalIcon />
          resmigazete.gov.tr
        </a>
      </div>
    </div>
  )
}

function NoFilterResults({ onReset }: { onReset: () => void }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <SearchIcon />
      </div>
      <h3>Sonuç bulunamadı</h3>
      <p>Arama veya filtre kriterlerinize uygun duyuru bulunamadı.</p>
      <div className="official-links-row">
        <button className="official-link-chip" onClick={onReset}
          style={{ background: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
          Filtreleri Temizle
        </button>
      </div>
    </div>
  )
}

function AnnouncementCard({ item }: { item: Announcement }) {
  return (
    <div className="announcement-card">
      <div className="announcement-meta">
        <span className={`announcement-source announcement-source-${item.sourceKey}`}>
          {item.source}
        </span>
        <span className="announcement-date">{item.date}</span>
      </div>
      <h3>{item.title}</h3>
      <p>{item.description || `${item.source} tarafından yayımlanan resmi duyuru.`}</p>
      <a
        href={item.link}
        target="_blank"
        rel="noopener noreferrer"
        className="announcement-btn"
      >
        <ExternalIcon />
        Kaynağa Git
      </a>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DuyurularClient() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [sources,       setSources]       = useState<ApiResponse['sources'] | null>(null)
  const [loading,       setLoading]       = useState(true)
  const [fetchFailed,   setFetchFailed]   = useState(false)
  const [filter,        setFilter]        = useState<'all' | SourceKey>('all')
  const [query,         setQuery]         = useState('')

  useEffect(() => {
    fetch('/api/announcements')
      .then(r => {
        if (!r.ok) throw new Error('fetch failed')
        return r.json() as Promise<ApiResponse>
      })
      .then(data => {
        setAnnouncements(data.announcements ?? [])
        setSources(data.sources ?? null)
      })
      .catch(() => {
        setFetchFailed(true)
        setAnnouncements([])
      })
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    let list = announcements
    if (filter !== 'all') list = list.filter(a => a.sourceKey === filter)
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      list = list.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q)
      )
    }
    return list
  }, [announcements, filter, query])

  const hasGIB = announcements.some(a => a.sourceKey === 'gib')
  const hasSGK = announcements.some(a => a.sourceKey === 'sgk')
  const hasRG  = announcements.some(a => a.sourceKey === 'rg')

  function resetFilters() {
    setFilter('all')
    setQuery('')
  }

  return (
    <div className="container subpage-content">

      <SourceStatusBar sources={sources} loading={loading} />

      {/* GİB fallback notice — shown when GİB fetch fails */}
      {!loading && sources && !sources.gib.success && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          padding: '14px 20px',
          background: 'var(--white)',
          border: '1.5px solid var(--border)',
          borderRadius: 'var(--radius)',
          marginBottom: 28,
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="announcement-source announcement-source-gib">GİB</span>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Gelir İdaresi Başkanlığı duyurularına otomatik erişilemiyor.
            </span>
          </div>
          <a
            href="https://www.gib.gov.tr"
            target="_blank"
            rel="noopener noreferrer"
            className="announcement-btn"
            style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
          >
            <ExternalIcon />
            gib.gov.tr
          </a>
        </div>
      )}

      {/* Controls — only shown when data is loaded and there are results */}
      {!loading && announcements.length > 0 && (
        <div className="duyurular-controls">
          <div className="filter-bar">
            <button
              className={`filter-btn${filter === 'all' ? ' active' : ''}`}
              onClick={() => setFilter('all')}
            >
              Tümü ({announcements.length})
            </button>
            {hasRG && (
              <button
                className={`filter-btn${filter === 'rg' ? ' active' : ''}`}
                onClick={() => setFilter('rg')}
              >
                Resmi Gazete
              </button>
            )}
            {hasGIB && (
              <button
                className={`filter-btn${filter === 'gib' ? ' active' : ''}`}
                onClick={() => setFilter('gib')}
              >
                GİB
              </button>
            )}
            {hasSGK && (
              <button
                className={`filter-btn${filter === 'sgk' ? ' active' : ''}`}
                onClick={() => setFilter('sgk')}
              >
                SGK
              </button>
            )}
          </div>

          <div className="search-box">
            <SearchIcon />
            <input
              type="search"
              placeholder="Duyurularda ara…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              aria-label="Duyurularda ara"
            />
          </div>
        </div>
      )}

      {/* Count */}
      {!loading && filtered.length > 0 && (
        <p className="announcements-count">
          {filtered.length} duyuru gösteriliyor
          {filter !== 'all' && ` · ${filter === 'rg' ? 'Resmi Gazete' : filter.toUpperCase()} filtresi aktif`}
          {query.trim() && ` · "${query}" araması`}
        </p>
      )}

      {/* Main content */}
      {loading ? (
        <LoadingState />
      ) : (fetchFailed || announcements.length === 0) ? (
        <EmptyState sources={sources} />
      ) : filtered.length === 0 ? (
        <NoFilterResults onReset={resetFilters} />
      ) : (
        <div className="announcements-list">
          {filtered.map((item, idx) => (
            <AnnouncementCard key={`${item.id}__${idx}`} item={item} />
          ))}
        </div>
      )}

      {/* CTA */}
      <div style={{ textAlign: 'center', marginTop: '64px' }}>
        <p style={{ marginBottom: '8px', fontSize: '1rem', color: 'var(--navy)', fontWeight: 500 }}>
          Güncel mevzuat değişikliklerini takip etmek ister misiniz?
        </p>
        <p style={{ marginBottom: '24px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Ofisimiz müvekkillerine önemli gelişmeleri düzenli olarak iletmektedir.
        </p>
        <a href="/#iletisim" className="btn btn-gold">Randevu Alın</a>
      </div>

    </div>
  )
}
