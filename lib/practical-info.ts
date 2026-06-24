// Shared types for the practical_info Supabase table.
// Keep this file server-safe — no browser APIs.

export interface TableData {
  type: 'table'
  headers: string[]
  rows: string[][]
  highlight_rows?: number[]
}

export interface ListData {
  type: 'list'
  items: { label: string; value: string; highlight?: boolean }[]
}

export interface LinksData {
  type: 'links'
  items: { name: string; url: string; href: string; desc: string }[]
}

export interface TableAndListData {
  type: 'table_and_list'
  headers: string[]
  rows: string[][]
  highlight_rows?: number[]
  list_items: { label: string; value: string }[]
}

export type CardData = TableData | ListData | LinksData | TableAndListData

export interface PracticalInfo {
  id:            string
  title:         string
  category:      string
  data:          CardData
  source_name:   string | null
  source_url:    string | null
  last_updated:  string | null   // "YYYY-MM-DD"
  note:          string | null
  display_order: number
  created_at:    string
  updated_at:    string
}

export const CATEGORY_LABELS: Record<string, string> = {
  'vergi-takvimi':      'Vergi Takvimi',
  'kdv-oranlari':       'KDV Oranları',
  'sgk-primleri':       'SGK Primleri',
  'asgari-ucret':       'Asgari Ücret',
  'beyanname-sureleri': 'Beyanname Süreleri',
  'faydali-linkler':    'Faydalı Linkler',
  'ceza-oranlar':       'Ceza / Oranlar',
  'sirket-kurulus':     'Şirket Kuruluş',
}

export const DATA_TYPE_LABELS: Record<string, string> = {
  table:          'Tablo',
  list:           'Liste (etiket–değer)',
  links:          'Linkler',
  table_and_list: 'Tablo + Liste',
}

export function formatDateTR(iso: string): string {
  const months = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran',
                  'Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık']
  const [y, m, d] = iso.split('-')
  return `${parseInt(d)} ${months[parseInt(m) - 1]} ${y}`
}
