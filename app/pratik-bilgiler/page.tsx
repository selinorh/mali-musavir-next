import Navbar           from '@/components/Navbar'
import Footer           from '@/components/Footer'
import WhatsAppButton   from '@/components/WhatsAppButton'
import ScrollRevealInit from '@/components/ScrollRevealInit'
import { createAdminClient } from '@/lib/supabase-admin'
import type { PracticalInfo, CardData, TableData, ListData, LinksData, TableAndListData } from '@/lib/practical-info'
import { formatDateTR } from '@/lib/practical-info'

export const revalidate = 3600

// Ensures every external URL starts with a protocol so the browser
// never interprets it as a relative path (→ localhost 404).
function toAbsoluteUrl(raw: string | null | undefined): string {
  if (!raw) return '#'
  const s = raw.trim()
  if (s.startsWith('http://') || s.startsWith('https://')) return s
  if (s.startsWith('//')) return `https:${s}`
  if (s.startsWith('/') || s === '#') return s  // intentional relative path
  return `https://${s}`
}

export const metadata = {
  title:       'Pratik Bilgiler | S.M.M.M. Ali Orhun',
  description: 'Vergi takvimi, KDV oranları, SGK primleri, asgari ücret bilgileri, beyanname süreleri ve daha fazlası.',
}

// ─── Icons ───────────────────────────────────────────────────────────────────

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)
const TaxIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
  </svg>
)
const PeopleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)
const WageIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
)
const DocIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
)
const LinkIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
)
const AlertIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
)
const BuildingIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
  </svg>
)
const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
)
const InfoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
)

// ─── Category → Icon ─────────────────────────────────────────────────────────

function CategoryIcon({ category }: { category: string }) {
  switch (category) {
    case 'vergi-takvimi':      return <CalendarIcon />
    case 'kdv-oranlari':       return <TaxIcon />
    case 'sgk-primleri':       return <PeopleIcon />
    case 'asgari-ucret':       return <WageIcon />
    case 'beyanname-sureleri': return <DocIcon />
    case 'faydali-linkler':    return <LinkIcon />
    case 'ceza-oranlar':       return <AlertIcon />
    case 'sirket-kurulus':     return <BuildingIcon />
    default:                   return <InfoIcon />
  }
}

// ─── Card body renderers ──────────────────────────────────────────────────────

function RenderTable({ d }: { d: TableData }) {
  return (
    <table className="info-table">
      <thead>
        <tr>{d.headers.map((h, i) => <th key={i}>{h}</th>)}</tr>
      </thead>
      <tbody>
        {d.rows.map((row, ri) => {
          const isHL = d.highlight_rows?.includes(ri)
          return (
            <tr key={ri} className={isHL ? 'highlight-row' : ''}>
              {row.map((cell, ci) => (
                <td key={ci}>{isHL ? <strong>{cell}</strong> : cell}</td>
              ))}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

function RenderList({ d }: { d: ListData }) {
  return (
    <div className="info-list">
      {d.items.map((item, i) => (
        <div key={i} className="info-list-item">
          <span className="info-list-item-label">{item.label}</span>
          <span className="info-list-item-value">{item.value}</span>
        </div>
      ))}
    </div>
  )
}

function RenderLinks({ d }: { d: LinksData }) {
  return (
    <div className="useful-links">
      {d.items.map((link) => (
        <a
          key={link.href}
          href={toAbsoluteUrl(link.href)}
          target="_blank"
          rel="noopener noreferrer"
          className="useful-link-item"
        >
          <div className="useful-link-body">
            <span className="useful-link-name">{link.name}</span>
            <span className="useful-link-url">{link.url}</span>
          </div>
          <span className="useful-link-arrow"><ArrowIcon /></span>
        </a>
      ))}
    </div>
  )
}

function RenderTableAndList({ d }: { d: TableAndListData }) {
  return (
    <>
      <RenderTable d={{ type: 'table', headers: d.headers, rows: d.rows, highlight_rows: d.highlight_rows }} />
      {d.list_items.length > 0 && (
        <div className="info-list" style={{ marginTop: '18px' }}>
          {d.list_items.map((item, i) => (
            <div key={i} className="info-list-item">
              <span className="info-list-item-label">{item.label}</span>
              <span className="info-list-item-value">{item.value}</span>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

function RenderCardData({ data }: { data: CardData }) {
  if (data.type === 'table')          return <RenderTable d={data} />
  if (data.type === 'list')           return <RenderList d={data} />
  if (data.type === 'links')          return <RenderLinks d={data} />
  if (data.type === 'table_and_list') return <RenderTableAndList d={data} />
  return null
}

// ─── Card footer: source link + last_updated + note ──────────────────────────

function CardFooter({ note, sourceName, sourceUrl, lastUpdated }: {
  note: string | null
  sourceName: string | null
  sourceUrl: string | null
  lastUpdated: string | null
}) {
  const hasAny = note || sourceName || lastUpdated
  if (!hasAny) return null
  return (
    <>
      {note && (
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '14px', lineHeight: '1.6' }}>
          {note}
        </p>
      )}
      {(sourceName || lastUpdated) && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
          {sourceName && (
            sourceUrl
              ? <a href={toAbsoluteUrl(sourceUrl)} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.74rem', color: 'var(--gold)', textDecoration: 'none', fontWeight: 600 }}>
                  Kaynak: {sourceName} ↗
                </a>
              : <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Kaynak: {sourceName}</span>
          )}
          {lastUpdated && (
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Son güncelleme: {formatDateTR(lastUpdated)}
            </span>
          )}
        </div>
      )}
    </>
  )
}

// ─── Empty state ─────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div style={{ textAlign: 'center', padding: '72px 32px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-lg)', background: 'var(--bg)' }}>
      <div style={{ width: '56px', height: '56px', background: 'rgba(27,42,74,0.06)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
        <InfoIcon />
      </div>
      <h3 style={{ color: 'var(--navy)', marginBottom: '10px', fontSize: '1.05rem' }}>Bilgiler henüz eklenmedi</h3>
      <p style={{ fontSize: '0.9rem', marginBottom: '24px', maxWidth: '380px', margin: '0 auto 24px', lineHeight: 1.7 }}>
        Güncel pratik bilgiler için resmi kaynakları ziyaret edebilirsiniz.
      </p>
      <div className="official-links-row">
        <a href="https://www.gib.gov.tr" target="_blank" rel="noopener noreferrer" className="official-link-chip">gib.gov.tr</a>
        <a href="https://www.sgk.gov.tr" target="_blank" rel="noopener noreferrer" className="official-link-chip">sgk.gov.tr</a>
        <a href="https://www.resmigazete.gov.tr" target="_blank" rel="noopener noreferrer" className="official-link-chip">resmigazete.gov.tr</a>
      </div>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function PratikBilgiler() {
  let cards: PracticalInfo[] = []

  try {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('practical_info')
      .select('*')
      .order('display_order', { ascending: true })
    cards = (data ?? []) as PracticalInfo[]
  } catch {
    cards = []
  }

  return (
    <>
      <Navbar />
      <main>
        {/* ── Hero ── */}
        <div className="subpage-hero">
          <div className="container">
            <span className="section-tag">Vergi & Mevzuat</span>
            <h1>Pratik Bilgiler</h1>
            <p>
              Sık başvurulan vergi tarihleri, prim oranları, asgari ücret verileri
              ve resmi kurumların bağlantılarını tek sayfada bulabilirsiniz.
            </p>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="container subpage-content">
          <div className="subpage-disclaimer reveal">
            <InfoIcon />
            <span>
              Aşağıdaki bilgiler ofisimiz tarafından güncellenmektedir. Yine de kesin ve bağlayıcı
              bilgi için lütfen ofisimizle iletişime geçiniz veya resmi kurumların web sitelerini
              inceleyiniz.
            </span>
          </div>

          {cards.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="info-grid">
              {cards.map((card) => (
                <div key={card.id} className="info-card reveal">
                  <div className="info-card-header">
                    <div className="info-card-icon">
                      <CategoryIcon category={card.category} />
                    </div>
                    <span className="info-card-title">{card.title}</span>
                  </div>
                  <div className="info-card-body">
                    <RenderCardData data={card.data} />
                    <CardFooter
                      note={card.note}
                      sourceName={card.source_name}
                      sourceUrl={card.source_url}
                      lastUpdated={card.last_updated}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CTA */}
          <div className="reveal" style={{ textAlign: 'center', marginTop: '64px' }}>
            <p style={{ marginBottom: '20px', fontSize: '1rem' }}>
              Daha fazla bilgi almak veya randevu oluşturmak ister misiniz?
            </p>
            <a href="/#iletisim" className="btn btn-gold">Randevu Alın</a>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
      <ScrollRevealInit />
    </>
  )
}
