import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// ─── Types ───────────────────────────────────────────────────────────────────

export type SourceKey = 'sgk' | 'gib' | 'rg'

export interface Announcement {
  id:          string
  title:       string
  description: string
  link:        string
  date:        string    // "23 Haziran 2026"
  dateISO:     string    // "2026-06-23"
  source:      'SGK' | 'GİB' | 'Resmi Gazete'
  sourceKey:   SourceKey
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function decodeEntities(s: string): string {
  s = s.replace(/&#x([0-9a-fA-F]+);/gi, (_, h) => {
    try { return String.fromCodePoint(parseInt(h, 16)) } catch { return '' }
  })
  s = s.replace(/&#([0-9]+);/g, (_, n) => {
    try { return String.fromCodePoint(parseInt(n, 10)) } catch { return '' }
  })
  return s
    .replace(/&amp;/g,    '&')
    .replace(/&lt;/g,     '<')
    .replace(/&gt;/g,     '>')
    .replace(/&quot;/g,   '"')
    .replace(/&apos;/g,   "'")
    .replace(/&#039;/g,   "'")
    .replace(/&nbsp;/g,   ' ')
    .replace(/&hellip;/g, '…')
    .replace(/&mdash;/g,  '—')
    .replace(/&ndash;/g,  '–')
    .replace(/&laquo;/g,  '«')
    .replace(/&raquo;/g,  '»')
    .replace(/&ldquo;/g,  '"')
    .replace(/&rdquo;/g,  '"')
    .replace(/&lsquo;/g,  '‘')
    .replace(/&rsquo;/g,  '’')
}

function stripHtml(s: string): string {
  return decodeEntities(
    s
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  )
}

function fallbackDesc(source: 'SGK' | 'GİB' | 'Resmi Gazete', date: string): string {
  return `${source} tarafından ${date} tarihinde yayımlanan resmi duyuru.`
}

const MONTHS: Record<string, string> = {
  '01':'Ocak','02':'Şubat','03':'Mart','04':'Nisan','05':'Mayıs','06':'Haziran',
  '07':'Temmuz','08':'Ağustos','09':'Eylül','10':'Ekim','11':'Kasım','12':'Aralık',
}

const TR_DATE_RE = /\d{1,2}\s+(?:Ocak|Şubat|Mart|Nisan|Mayıs|Haziran|Temmuz|Ağustos|Eylül|Ekim|Kasım|Aralık)\s+\d{4}/gi

function isoToTR(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${parseInt(d)} ${MONTHS[m] ?? m} ${y}`
}

async function safeFetch(url: string, timeoutMs = 8000): Promise<string | null> {
  try {
    const ctrl  = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), timeoutMs)
    const res   = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        'User-Agent':      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36',
        'Accept':          'text/html,application/xhtml+xml,application/rss+xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'tr-TR,tr;q=0.9,en;q=0.5',
        'Cache-Control':   'no-cache',
      },
      cache: 'no-store',
    })
    clearTimeout(timer)
    if (!res.ok) return null
    return await res.text()
  } catch {
    return null
  }
}

// ─── RSS Parser ──────────────────────────────────────────────────────────────

function parseRSS(
  xml: string,
  source: 'SGK' | 'GİB' | 'Resmi Gazete',
  sourceKey: SourceKey,
  maxItems = 25,
): Announcement[] {
  const items: Announcement[] = []
  const seen   = new Set<string>()
  const itemRe = /<item[^>]*>([\s\S]*?)<\/item>/gi
  let m: RegExpExecArray | null

  while ((m = itemRe.exec(xml)) !== null && items.length < maxItems) {
    const block = m[1]

    const titleM = block.match(/<title>(?:<!\[CDATA\[)?\s*([\s\S]*?)\s*(?:\]\]>)?<\/title>/i)
    if (!titleM) continue
    const title = stripHtml(titleM[1]).trim()
    if (title.length < 4) continue

    const linkM = block.match(/<link>\s*(https?:\/\/[^\s<]+)\s*<\/link>/i)
               ?? block.match(/<guid[^>]*>\s*(https?:\/\/[^\s<]+)\s*<\/guid>/i)
    if (!linkM) continue
    const link = linkM[1].trim()
    if (seen.has(link)) continue
    seen.add(link)

    const descM = block.match(/<description>(?:<!\[CDATA\[)?\s*([\s\S]*?)\s*(?:\]\]>)?<\/description>/i)

    const dateM = block.match(/<pubDate>\s*([\s\S]*?)\s*<\/pubDate>/i)
    let dateISO = new Date().toISOString().split('T')[0]
    if (dateM) {
      try {
        const d = new Date(dateM[1].trim())
        if (!isNaN(d.getTime())) dateISO = d.toISOString().split('T')[0]
      } catch { /* keep today */ }
    }

    const dateTR      = isoToTR(dateISO)
    const rawDesc     = descM ? stripHtml(descM[1]).trim().slice(0, 250) : ''
    const description = rawDesc.length > 8 ? rawDesc : fallbackDesc(source, dateTR)

    items.push({
      id:          `${sourceKey}-rss-${Buffer.from(link).toString('base64url')}`,
      title,
      description,
      link,
      date:        dateTR,
      dateISO,
      source,
      sourceKey,
    })
  }

  return items
}

// ─── SGK HTML Parser ─────────────────────────────────────────────────────────

function parseSGKHtml(html: string): Announcement[] {
  const items: Announcement[] = []
  const seen  = new Set<string>()
  const re    = /href="(\/duyuru\/detay\/([^"]+))"/g
  let m: RegExpExecArray | null

  while ((m = re.exec(html)) !== null) {
    const relPath = m[1]
    const slug    = m[2]
    if (seen.has(slug)) continue
    seen.add(slug)

    const datePart = slug.match(/-(\d{4})-(\d{2})-(\d{2})-\d{2}-\d{2}-\d{2}$/)
    if (!datePart) continue
    const dateISO = `${datePart[1]}-${datePart[2]}-${datePart[3]}`

    const anchorOpen  = html.lastIndexOf('<a', m.index)
    if (anchorOpen === -1) continue
    const anchorClose = html.indexOf('</a>', m.index)
    if (anchorClose === -1) continue
    const block = html.slice(anchorOpen, anchorClose + 4)

    const titleDiv = block.match(/<div[^>]*class="[^"]*title[^"]*"[^>]*>([\s\S]*?)<\/div>/i)
    let title = titleDiv ? stripHtml(titleDiv[1]) : ''
    if (!title) {
      const raw = stripHtml(block).replace(TR_DATE_RE, '').trim()
      title = raw.split(/\s{3,}|\n/).map(s => s.trim()).filter(s => s.length > 3)[0] ?? ''
    }
    if (title.length < 4) continue

    const deptDiv = block.match(/<div[^>]*class="[^"]*department[^"]*"[^>]*>([\s\S]*?)<\/div>/i)
    const dateTR  = isoToTR(dateISO)
    const rawDept = deptDiv ? stripHtml(deptDiv[1]).trim() : ''
    const dept    = rawDept
      ? rawDept.charAt(0).toUpperCase() + rawDept.slice(1).toLowerCase()
      : ''
    const description = dept.length > 4 ? dept : fallbackDesc('SGK', dateTR)

    items.push({
      id:          `sgk-${slug}`,
      title,
      description,
      link:        `https://www.sgk.gov.tr${relPath}`,
      date:        dateTR,
      dateISO,
      source:      'SGK',
      sourceKey:   'sgk',
    })

    if (items.length >= 25) break
  }

  return items
}

// ─── GİB HTML Parser ─────────────────────────────────────────────────────────

function parseGIBHtml(html: string, baseUrl: string): Announcement[] {
  const items: Announcement[] = []
  const seen   = new Set<string>()

  // Primary: extract anchor text as title (reliable on listing pages)
  const anchorRe = /<a\s[^>]*href="([^"#?]*(?:duyuru|haber|guncel|mevzuat|duyurular)[^"#?]*)"[^>]*>([\s\S]*?)<\/a>/gi
  let m: RegExpExecArray | null

  while ((m = anchorRe.exec(html)) !== null && items.length < 20) {
    const rawHref    = m[1]
    const anchorText = stripHtml(m[2]).trim()

    if (seen.has(rawHref) || rawHref.length < 4) continue
    if (anchorText.length < 8) continue
    seen.add(rawHref)

    const fullUrl = rawHref.startsWith('http')
      ? rawHref
      : rawHref.startsWith('/')
        ? new URL(rawHref, baseUrl).href
        : `${baseUrl}/${rawHref}`

    const yearMatch = rawHref.match(/20\d{2}/)
    const year      = yearMatch ? yearMatch[0] : new Date().getFullYear().toString()
    if (parseInt(year) < 2024) continue

    // Look for dd.mm.yyyy date near the link
    const blockStart = Math.max(0, m.index - 300)
    const blockEnd   = Math.min(html.length, m.index + 300)
    const blockHtml  = html.slice(blockStart, blockEnd)
    let dateISO      = `${year}-01-01`
    const dmy = blockHtml.match(/(\d{2})\.(\d{2})\.(20\d{2})/)
    if (dmy) dateISO = `${dmy[3]}-${dmy[2]}-${dmy[1]}`

    const dateTR = isoToTR(dateISO)

    items.push({
      id:          `gib-${Buffer.from(rawHref).toString('base64url')}`,
      title:       anchorText.slice(0, 200),
      description: fallbackDesc('GİB', dateTR),
      link:        fullUrl,
      date:        dateTR,
      dateISO,
      source:      'GİB',
      sourceKey:   'gib',
    })
  }

  if (items.length > 0) return items

  // Fallback: href keyword scan with surrounding block text
  const hrefRe = /href="([^"#?]*(?:duyuru|haber|guncel|mevzuat|duyurular|haberler)[^"#?]*)"/gi
  while ((m = hrefRe.exec(html)) !== null && items.length < 20) {
    const rawHref = m[1]
    if (seen.has(rawHref) || rawHref.length < 4) continue

    const yearMatch = rawHref.match(/20\d{2}/)
    if (!yearMatch) continue
    const year = yearMatch[0]
    if (parseInt(year) < 2024) continue
    seen.add(rawHref)

    const fullUrl = rawHref.startsWith('http')
      ? rawHref
      : rawHref.startsWith('/')
        ? new URL(rawHref, baseUrl).href
        : `${baseUrl}/${rawHref}`

    const blockStart = Math.max(0, m.index - 400)
    const blockEnd   = Math.min(html.length, m.index + 600)
    const blockText  = stripHtml(html.slice(blockStart, blockEnd))
      .replace(TR_DATE_RE, '').replace(/\s+/g, ' ').trim()

    if (blockText.length < 10) continue
    const parts = blockText.split(/\s{3,}/).filter(s => s.trim().length > 8)
    const title = parts[0]?.slice(0, 200).trim() ?? ''
    if (!title || title.length < 8) continue

    const rawDesc2    = parts[1]?.slice(0, 200).trim() ?? ''
    const description = rawDesc2.length > 8 ? rawDesc2 : fallbackDesc('GİB', year)

    items.push({
      id:          `gib-${Buffer.from(rawHref).toString('base64url')}`,
      title,
      description,
      link:        fullUrl,
      date:        year,
      dateISO:     `${year}-01-01`,
      source:      'GİB',
      sourceKey:   'gib',
    })
  }

  return items
}

// ─── Resmi Gazete HTML Parser ─────────────────────────────────────────────────

function parseRGHtml(html: string): Announcement[] {
  const items: Announcement[] = []
  const seen  = new Set<string>()

  // Match gazette issue links: /eskiler/YYYY/MM/YYYYMMDD.htm or /gundem/YYYYMMDD.htm
  const re = /href="([^"]*(?:eskiler|gundem)[^"]*(\d{4})(\d{2})(\d{2})[^"]*\.htm[^"]*)"/gi
  let m: RegExpExecArray | null

  while ((m = re.exec(html)) !== null && items.length < 20) {
    const rawHref = m[1]
    const y = m[2], mo = m[3], d = m[4]
    if (seen.has(rawHref)) continue
    if (parseInt(y) < 2024) continue
    seen.add(rawHref)

    const fullUrl = rawHref.startsWith('http')
      ? rawHref
      : `https://www.resmigazete.gov.tr${rawHref}`

    const dateISO = `${y}-${mo}-${d}`
    const dateTR  = isoToTR(dateISO)

    // Try to find gazette issue number from surrounding text
    const blockStart = Math.max(0, m.index - 200)
    const blockEnd   = Math.min(html.length, m.index + 400)
    const blockText  = stripHtml(html.slice(blockStart, blockEnd)).replace(/\s+/g, ' ').trim()
    const sayiMatch  = blockText.match(/(\d{5})\s*[Ss]ay[ıi]/i)
    const sayi       = sayiMatch ? sayiMatch[1] : ''

    const title = sayi
      ? `Resmî Gazete — ${dateTR} tarihli, ${sayi} sayılı`
      : `Resmî Gazete — ${dateTR} tarihli sayı`

    items.push({
      id:          `rg-${dateISO}-${Buffer.from(rawHref).toString('base64url')}`,
      title,
      description: `${dateTR} tarihinde yayımlanan Resmî Gazete${sayi ? ` (Sayı: ${sayi})` : ''}. Kanun, yönetmelik ve tebliğler için tıklayınız.`,
      link:        fullUrl,
      date:        dateTR,
      dateISO,
      source:      'Resmi Gazete',
      sourceKey:   'rg',
    })
  }

  return items
}

// ─── SGK Fetcher ─────────────────────────────────────────────────────────────

async function fetchSGK(): Promise<{ items: Announcement[]; method: string }> {
  const rssUrls = [
    'https://www.sgk.gov.tr/rss',
    'https://www.sgk.gov.tr/rss.xml',
    'https://www.sgk.gov.tr/feed',
  ]

  for (const url of rssUrls) {
    const xml = await safeFetch(url)
    if (xml && xml.includes('<item')) {
      const items = parseRSS(xml, 'SGK', 'sgk')
      if (items.length > 0) return { items, method: 'rss' }
    }
  }

  const html = await safeFetch('https://www.sgk.gov.tr/duyuru')
  if (html) {
    const items = parseSGKHtml(html)
    return { items, method: 'html' }
  }

  return { items: [], method: 'failed' }
}

// ─── GİB Fetcher ─────────────────────────────────────────────────────────────

async function fetchGIB(): Promise<{ items: Announcement[]; method: string }> {
  const gibRssUrls = [
    'https://www.gib.gov.tr/rss',
    'https://www.gib.gov.tr/rss.xml',
    'https://www.gib.gov.tr/feed',
  ]
  for (const url of gibRssUrls) {
    const xml = await safeFetch(url)
    if (xml && xml.includes('<item')) {
      const items = parseRSS(xml, 'GİB', 'gib')
      if (items.length > 0) return { items, method: 'rss' }
    }
  }

  // Try HTML sources in priority order; dijital.gib.gov.tr first as requested
  const gibHtmlUrls = [
    { url: 'https://dijital.gib.gov.tr/duyurular',                    base: 'https://dijital.gib.gov.tr' },
    { url: 'https://www.gib.gov.tr/duyuru-arsivi/guncel',             base: 'https://www.gib.gov.tr' },
    { url: 'https://intvrg.gib.gov.tr/intvrg_duyuru/duyurular.html', base: 'https://intvrg.gib.gov.tr' },
    { url: 'https://www.gib.gov.tr/haberler',                         base: 'https://www.gib.gov.tr' },
    { url: 'https://www.gib.gov.tr/',                                 base: 'https://www.gib.gov.tr' },
  ]

  for (const { url, base } of gibHtmlUrls) {
    const html = await safeFetch(url)
    if (!html) continue
    const items = parseGIBHtml(html, base)
    if (items.length > 0) return { items, method: 'html' }
  }

  return { items: [], method: 'failed' }
}

// ─── Resmi Gazete Fetcher ────────────────────────────────────────────────────

async function fetchRG(): Promise<{ items: Announcement[]; method: string }> {
  const rssUrls = [
    'https://www.resmigazete.gov.tr/rss/gunluk',
    'https://www.resmigazete.gov.tr/rss',
    'https://www.resmigazete.gov.tr/feed',
  ]

  for (const url of rssUrls) {
    const xml = await safeFetch(url)
    if (xml && xml.includes('<item')) {
      const items = parseRSS(xml, 'Resmi Gazete', 'rg')
      if (items.length > 0) return { items, method: 'rss' }
    }
  }

  const html = await safeFetch('https://www.resmigazete.gov.tr/')
  if (html) {
    const items = parseRGHtml(html)
    if (items.length > 0) return { items, method: 'html' }
  }

  return { items: [], method: 'failed' }
}

// ─── Route Handler ───────────────────────────────────────────────────────────

export async function GET() {
  const [sgkResult, gibResult, rgResult] = await Promise.all([
    fetchSGK(),
    fetchGIB(),
    fetchRG(),
  ])

  const merged = [...sgkResult.items, ...gibResult.items, ...rgResult.items]
    .sort((a, b) => b.dateISO.localeCompare(a.dateISO))

  // Guarantee unique IDs: if two items share an id after merging and sorting,
  // append the positional index so React never sees a duplicate key.
  const seenIds = new Set<string>()
  const all = merged.map((item, i) => {
    if (seenIds.has(item.id)) {
      const safeId = `${item.id}-${i}`
      seenIds.add(safeId)
      return { ...item, id: safeId }
    }
    seenIds.add(item.id)
    return item
  })

  return NextResponse.json(
    {
      announcements: all,
      sources: {
        sgk: {
          success:     sgkResult.items.length > 0,
          count:       sgkResult.items.length,
          method:      sgkResult.method,
          officialUrl: 'https://www.sgk.gov.tr/duyuru',
        },
        gib: {
          success:     gibResult.items.length > 0,
          count:       gibResult.items.length,
          method:      gibResult.method,
          officialUrl: 'https://www.gib.gov.tr',
        },
        rg: {
          success:     rgResult.items.length > 0,
          count:       rgResult.items.length,
          method:      rgResult.method,
          officialUrl: 'https://www.resmigazete.gov.tr',
        },
      },
      fetched_at: new Date().toISOString(),
    },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
