'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { PracticalInfo, CardData, TableData, ListData, LinksData, TableAndListData } from '@/lib/practical-info'
import { CATEGORY_LABELS, DATA_TYPE_LABELS, formatDateTR } from '@/lib/practical-info'

// ─── Shared input / button styles ────────────────────────────────────────────

const S = {
  input: {
    padding: '10px 13px', border: '1.5px solid #E8E5DF', borderRadius: '7px',
    fontSize: '0.88rem', fontFamily: 'inherit', color: '#2D2D2D',
    background: '#fff', outline: 'none', width: '100%', boxSizing: 'border-box' as const,
  },
  label: { fontSize: '0.78rem', fontWeight: 600, color: '#1B2A4A', display: 'block', marginBottom: '5px' } as const,
  group: { display: 'flex', flexDirection: 'column' as const, gap: '5px' },
  btn: (variant: 'primary' | 'ghost' | 'danger' | 'gold' | 'sm-ghost') => {
    const base = { fontFamily: 'inherit', cursor: 'pointer', fontSize: '0.84rem', fontWeight: 600, borderRadius: '7px', transition: 'all 0.15s', display: 'inline-flex', alignItems: 'center', gap: '6px' }
    const map = {
      primary:  { ...base, padding: '10px 22px', background: '#1B2A4A', color: '#fff', border: 'none' },
      gold:     { ...base, padding: '10px 22px', background: '#C9933A', color: '#fff', border: 'none' },
      ghost:    { ...base, padding: '10px 20px', background: 'transparent', color: '#1B2A4A', border: '1.5px solid #E8E5DF' },
      danger:   { ...base, padding: '8px 16px',  background: 'transparent', color: '#D9534F', border: '1.5px solid rgba(217,83,79,0.35)' },
      'sm-ghost': { ...base, padding: '5px 11px', background: 'transparent', color: '#6B7280', border: '1px solid #E8E5DF', fontSize: '0.78rem' },
    }
    return map[variant]
  },
  section: { background: '#F8F7F4', border: '1.5px solid #E8E5DF', borderRadius: '10px', padding: '18px 20px', marginBottom: '18px' } as const,
}

// ─── Category & data-type options ────────────────────────────────────────────

const CATEGORIES = [
  'vergi-takvimi','kdv-oranlari','sgk-primleri','asgari-ucret',
  'beyanname-sureleri','faydali-linkler','ceza-oranlar','sirket-kurulus','diger',
]

type DataType = 'table' | 'list' | 'links' | 'table_and_list'

// ─── Form state ───────────────────────────────────────────────────────────────

interface FormState {
  title:         string
  category:      string
  display_order: number
  source_name:   string
  source_url:    string
  last_updated:  string
  note:          string
  dataType:      DataType
  // table
  tableHeaders:      string[]
  tableRows:         string[][]
  tableHighlightRows: number[]
  // list
  listItems:  { label: string; value: string; highlight: boolean }[]
  // links
  linkItems:  { name: string; url: string; href: string; desc: string }[]
  // table_and_list
  mixedHeaders:      string[]
  mixedRows:         string[][]
  mixedHighlightRows: number[]
  mixedListItems:    { label: string; value: string }[]
}

const BLANK_FORM: FormState = {
  title: '', category: 'vergi-takvimi', display_order: 99,
  source_name: '', source_url: '', last_updated: '', note: '',
  dataType: 'table',
  tableHeaders: ['Kalem', 'Değer'], tableRows: [['', '']], tableHighlightRows: [],
  listItems: [{ label: '', value: '', highlight: false }],
  linkItems: [{ name: '', url: '', href: '', desc: '' }],
  mixedHeaders: ['Kalem', 'Değer1', 'Değer2'], mixedRows: [['', '', '']], mixedHighlightRows: [],
  mixedListItems: [{ label: '', value: '' }],
}

function cardToForm(c: PracticalInfo): FormState {
  const d = c.data
  return {
    title: c.title, category: c.category, display_order: c.display_order,
    source_name: c.source_name ?? '', source_url: c.source_url ?? '',
    last_updated: c.last_updated ?? '', note: c.note ?? '',
    dataType: d.type,
    tableHeaders:       d.type === 'table'          ? d.headers    : ['Kalem','Değer'],
    tableRows:          d.type === 'table'          ? d.rows       : [['','']],
    tableHighlightRows: d.type === 'table'          ? (d.highlight_rows ?? []) : [],
    listItems:          d.type === 'list'           ? d.items.map(i => ({ ...i, highlight: i.highlight ?? false })) : [{ label:'',value:'',highlight:false }],
    linkItems:          d.type === 'links'          ? d.items      : [{ name:'',url:'',href:'',desc:'' }],
    mixedHeaders:       d.type === 'table_and_list' ? d.headers    : ['Kalem','Değer1','Değer2'],
    mixedRows:          d.type === 'table_and_list' ? d.rows       : [['','','']],
    mixedHighlightRows: d.type === 'table_and_list' ? (d.highlight_rows ?? []) : [],
    mixedListItems:     d.type === 'table_and_list' ? d.list_items : [{ label:'',value:'' }],
  }
}

function formToData(f: FormState): CardData {
  switch (f.dataType) {
    case 'table':
      return { type:'table', headers: f.tableHeaders, rows: f.tableRows, highlight_rows: f.tableHighlightRows } as TableData
    case 'list':
      return { type:'list', items: f.listItems } as ListData
    case 'links':
      return { type:'links', items: f.linkItems } as LinksData
    case 'table_and_list':
      return { type:'table_and_list', headers: f.mixedHeaders, rows: f.mixedRows, highlight_rows: f.mixedHighlightRows, list_items: f.mixedListItems } as TableAndListData
  }
}

// ─── Data editors ─────────────────────────────────────────────────────────────

function TableEditor({ headers, rows, highlightRows, colCount, onChange }: {
  headers: string[]
  rows: string[][]
  highlightRows: number[]
  colCount: number
  onChange: (headers: string[], rows: string[][], highlightRows: number[]) => void
}) {
  function setHeader(ci: number, val: string) {
    const h = [...headers]; h[ci] = val; onChange(h, rows, highlightRows)
  }
  function setCell(ri: number, ci: number, val: string) {
    const r = rows.map(row => [...row]); r[ri][ci] = val; onChange(headers, r, highlightRows)
  }
  function addRow() {
    onChange(headers, [...rows, Array(colCount).fill('')], highlightRows)
  }
  function removeRow(ri: number) {
    const r = rows.filter((_, i) => i !== ri)
    const hl = highlightRows.filter(i => i !== ri).map(i => i > ri ? i - 1 : i)
    onChange(headers, r, hl)
  }
  function toggleHL(ri: number) {
    const hl = highlightRows.includes(ri)
      ? highlightRows.filter(i => i !== ri)
      : [...highlightRows, ri]
    onChange(headers, rows, hl)
  }
  function addCol() {
    const h = [...headers, `Sütun ${colCount + 1}`]
    const r = rows.map(row => [...row, ''])
    onChange(h, r, highlightRows)
  }
  function removeCol() {
    if (colCount <= 1) return
    const h = headers.slice(0, -1)
    const r = rows.map(row => row.slice(0, -1))
    onChange(h, r, highlightRows)
  }

  const tdStyle = { padding: '4px' }

  return (
    <div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
          <thead>
            <tr style={{ background: 'rgba(27,42,74,0.06)' }}>
              <th style={{ ...tdStyle, width: '28px' }} />
              {headers.map((h, ci) => (
                <th key={ci} style={tdStyle}>
                  <input value={h} onChange={e => setHeader(ci, e.target.value)}
                    style={{ ...S.input, fontWeight: 700, background: 'rgba(27,42,74,0.04)' }}
                    placeholder={`Başlık ${ci+1}`} />
                </th>
              ))}
              <th style={{ ...tdStyle, width: '36px' }} />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} style={{ borderBottom: '1px solid #E8E5DF', background: highlightRows.includes(ri) ? 'rgba(201,147,58,0.06)' : 'transparent' }}>
                <td style={{ ...tdStyle, textAlign: 'center' }}>
                  <input type="checkbox" title="Vurgu satırı"
                    checked={highlightRows.includes(ri)}
                    onChange={() => toggleHL(ri)}
                    style={{ cursor: 'pointer', accentColor: '#C9933A' }} />
                </td>
                {row.map((cell, ci) => (
                  <td key={ci} style={tdStyle}>
                    <input value={cell} onChange={e => setCell(ri, ci, e.target.value)}
                      style={S.input} placeholder="—" />
                  </td>
                ))}
                <td style={{ ...tdStyle, textAlign: 'center' }}>
                  <button onClick={() => removeRow(ri)} style={{ background:'none',border:'none',cursor:'pointer',color:'#D9534F',fontSize:'1rem',padding:'4px',lineHeight:1 }}>×</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ display:'flex', gap:'8px', marginTop:'10px', flexWrap:'wrap' }}>
        <button onClick={addRow} style={S.btn('sm-ghost')}>+ Satır Ekle</button>
        <button onClick={addCol} style={S.btn('sm-ghost')}>+ Sütun Ekle</button>
        {colCount > 1 && <button onClick={removeCol} style={{ ...S.btn('sm-ghost'), color:'#D9534F' }}>− Son Sütun</button>}
        <span style={{ fontSize:'0.72rem', color:'#6B7280', alignSelf:'center' }}>☑ = vurgu satırı (altın rengi)</span>
      </div>
    </div>
  )
}

function ListEditor({ items, onChange }: {
  items: { label: string; value: string; highlight: boolean }[]
  onChange: (items: { label: string; value: string; highlight: boolean }[]) => void
}) {
  function setField(i: number, field: 'label'|'value', val: string) {
    const n = items.map((it, idx) => idx === i ? { ...it, [field]: val } : it)
    onChange(n)
  }
  function remove(i: number) { onChange(items.filter((_, idx) => idx !== i)) }
  function add() { onChange([...items, { label:'', value:'', highlight:false }]) }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
      {items.map((item, i) => (
        <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr 1fr 28px', gap:'6px', alignItems:'center' }}>
          <input value={item.label} onChange={e => setField(i,'label',e.target.value)}
            style={S.input} placeholder="Etiket" />
          <input value={item.value} onChange={e => setField(i,'value',e.target.value)}
            style={S.input} placeholder="Değer" />
          <button onClick={() => remove(i)} style={{ background:'none',border:'none',cursor:'pointer',color:'#D9534F',fontSize:'1.1rem',padding:'4px',lineHeight:1 }}>×</button>
        </div>
      ))}
      <button onClick={add} style={{ ...S.btn('sm-ghost'), alignSelf:'flex-start' }}>+ Öğe Ekle</button>
    </div>
  )
}

function LinksEditor({ items, onChange }: {
  items: { name: string; url: string; href: string; desc: string }[]
  onChange: (items: { name: string; url: string; href: string; desc: string }[]) => void
}) {
  function setField(i: number, field: string, val: string) {
    const n = items.map((it, idx) => idx === i ? { ...it, [field]: val } : it)
    onChange(n)
  }
  function remove(i: number) { onChange(items.filter((_, idx) => idx !== i)) }
  function add() { onChange([...items, { name:'', url:'', href:'https://', desc:'' }]) }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
      {items.map((item, i) => (
        <div key={i} style={{ border:'1px solid #E8E5DF', borderRadius:'8px', padding:'12px', position:'relative' }}>
          <button onClick={() => remove(i)}
            style={{ position:'absolute',top:'8px',right:'8px',background:'none',border:'none',cursor:'pointer',color:'#D9534F',fontSize:'1.1rem',lineHeight:1,padding:'2px' }}>×</button>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
            <div style={S.group}><label style={S.label}>Ad</label>
              <input value={item.name} onChange={e => setField(i,'name',e.target.value)} style={S.input} placeholder="GİB" /></div>
            <div style={S.group}><label style={S.label}>Kısa URL</label>
              <input value={item.url} onChange={e => setField(i,'url',e.target.value)} style={S.input} placeholder="gib.gov.tr" /></div>
            <div style={S.group}><label style={S.label}>Tam URL</label>
              <input value={item.href} onChange={e => setField(i,'href',e.target.value)} style={S.input} placeholder="https://..." /></div>
            <div style={S.group}><label style={S.label}>Açıklama</label>
              <input value={item.desc} onChange={e => setField(i,'desc',e.target.value)} style={S.input} placeholder="Kısa açıklama" /></div>
          </div>
        </div>
      ))}
      <button onClick={add} style={{ ...S.btn('sm-ghost'), alignSelf:'flex-start' }}>+ Link Ekle</button>
    </div>
  )
}

// ─── Edit / Create form ───────────────────────────────────────────────────────

function EditForm({ form, setForm, saving, onSave, onCancel, isNew }: {
  form: FormState
  setForm: React.Dispatch<React.SetStateAction<FormState>>
  saving: boolean
  onSave: () => void
  onCancel: () => void
  isNew: boolean
}) {
  const colCount = form.dataType === 'table' ? form.tableHeaders.length
    : form.dataType === 'table_and_list' ? form.mixedHeaders.length : 2

  function changeDataType(t: DataType) {
    setForm(f => ({
      ...f, dataType: t,
      ...(t === 'table'          && f.dataType !== 'table'          ? { tableHeaders: ['Kalem','Değer'], tableRows:[['','']], tableHighlightRows:[] } : {}),
      ...(t === 'list'           && f.dataType !== 'list'           ? { listItems:[{ label:'',value:'',highlight:false }] } : {}),
      ...(t === 'links'          && f.dataType !== 'links'          ? { linkItems:[{ name:'',url:'',href:'https://',desc:'' }] } : {}),
      ...(t === 'table_and_list' && f.dataType !== 'table_and_list' ? { mixedHeaders:['Kalem','Değer1','Değer2'], mixedRows:[['','','']], mixedHighlightRows:[], mixedListItems:[{ label:'',value:'' }] } : {}),
    }))
  }

  const fieldset = (title: string, children: React.ReactNode) => (
    <div style={S.section}>
      <p style={{ fontSize:'0.7rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'2px', color:'var(--gold)', marginBottom:'14px' }}>{title}</p>
      {children}
    </div>
  )

  return (
    <div style={{ background:'#fff', border:'1.5px solid #E8E5DF', borderRadius:'var(--radius-lg)', padding:'32px', boxShadow:'var(--shadow-sm)' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'28px', gap:'16px', flexWrap:'wrap' }}>
        <h3 style={{ margin:0, color:'var(--navy)', fontSize:'1.1rem' }}>
          {isNew ? 'Yeni Kart Ekle' : 'Kartı Düzenle'}
        </h3>
        <div style={{ display:'flex', gap:'8px' }}>
          <button onClick={onCancel} style={S.btn('ghost')}>İptal</button>
          <button onClick={onSave} disabled={saving} style={S.btn('gold')}>
            {saving ? 'Kaydediliyor…' : 'Kaydet'}
          </button>
        </div>
      </div>

      {/* Basic info */}
      {fieldset('Temel Bilgiler', (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
          <div style={{ ...S.group, gridColumn:'1/-1' }}>
            <label style={S.label}>Kart Başlığı *</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title:e.target.value }))}
              style={S.input} placeholder="ör. Vergi Takvimi 2026" />
          </div>
          <div style={S.group}>
            <label style={S.label}>Kategori (ikon)</label>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category:e.target.value }))}
              style={{ ...S.input, appearance:'none' as const }}>
              {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c] ?? c}</option>)}
            </select>
          </div>
          <div style={S.group}>
            <label style={S.label}>Sıra no</label>
            <input type="number" value={form.display_order}
              onChange={e => setForm(f => ({ ...f, display_order: parseInt(e.target.value)||0 }))}
              style={S.input} />
          </div>
        </div>
      ))}

      {/* Source & meta */}
      {fieldset('Kaynak ve Güncelleme', (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
          <div style={S.group}>
            <label style={S.label}>Kaynak adı</label>
            <input value={form.source_name} onChange={e => setForm(f => ({ ...f, source_name:e.target.value }))}
              style={S.input} placeholder="ör. Gelir İdaresi Başkanlığı" />
          </div>
          <div style={S.group}>
            <label style={S.label}>Kaynak URL</label>
            <input value={form.source_url} onChange={e => setForm(f => ({ ...f, source_url:e.target.value }))}
              style={S.input} placeholder="https://www.gib.gov.tr" />
          </div>
          <div style={S.group}>
            <label style={S.label}>Son güncelleme tarihi</label>
            <input type="date" value={form.last_updated} onChange={e => setForm(f => ({ ...f, last_updated:e.target.value }))}
              style={S.input} />
          </div>
          <div style={{ ...S.group, gridColumn:'1/-1' }}>
            <label style={S.label}>Not / uyarı (kartın altında gösterilir)</label>
            <textarea value={form.note} onChange={e => setForm(f => ({ ...f, note:e.target.value }))}
              style={{ ...S.input, resize:'vertical', minHeight:'64px' }} placeholder="İsteğe bağlı uyarı metni…" />
          </div>
        </div>
      ))}

      {/* Data editor */}
      {fieldset('Kart İçeriği', (
        <>
          <div style={S.group}>
            <label style={S.label}>İçerik tipi</label>
            <select value={form.dataType} onChange={e => changeDataType(e.target.value as DataType)}
              style={{ ...S.input, appearance:'none' as const, marginBottom:'18px' }}>
              {(Object.keys(DATA_TYPE_LABELS) as DataType[]).map(t => (
                <option key={t} value={t}>{DATA_TYPE_LABELS[t]}</option>
              ))}
            </select>
          </div>

          {form.dataType === 'table' && (
            <TableEditor
              headers={form.tableHeaders} rows={form.tableRows}
              highlightRows={form.tableHighlightRows} colCount={colCount}
              onChange={(h,r,hl) => setForm(f => ({ ...f, tableHeaders:h, tableRows:r, tableHighlightRows:hl }))}
            />
          )}

          {form.dataType === 'list' && (
            <ListEditor items={form.listItems}
              onChange={items => setForm(f => ({ ...f, listItems:items }))} />
          )}

          {form.dataType === 'links' && (
            <LinksEditor items={form.linkItems}
              onChange={items => setForm(f => ({ ...f, linkItems:items }))} />
          )}

          {form.dataType === 'table_and_list' && (
            <>
              <p style={{ fontSize:'0.8rem', fontWeight:600, color:'#6B7280', marginBottom:'10px' }}>Tablo</p>
              <TableEditor
                headers={form.mixedHeaders} rows={form.mixedRows}
                highlightRows={form.mixedHighlightRows} colCount={colCount}
                onChange={(h,r,hl) => setForm(f => ({ ...f, mixedHeaders:h, mixedRows:r, mixedHighlightRows:hl }))}
              />
              <p style={{ fontSize:'0.8rem', fontWeight:600, color:'#6B7280', margin:'18px 0 10px' }}>Alt Liste</p>
              <ListEditor
                items={form.mixedListItems.map(it => ({ ...it, highlight:false }))}
                onChange={items => setForm(f => ({ ...f, mixedListItems:items.map(({ label,value }) => ({ label,value })) }))}
              />
            </>
          )}
        </>
      ))}

      <div style={{ display:'flex', justifyContent:'flex-end', gap:'8px', marginTop:'4px' }}>
        <button onClick={onCancel} style={S.btn('ghost')}>İptal</button>
        <button onClick={onSave} disabled={saving} style={S.btn('gold')}>
          {saving ? 'Kaydediliyor…' : 'Kaydet'}
        </button>
      </div>
    </div>
  )
}

// ─── Card list ────────────────────────────────────────────────────────────────

function CardList({ cards, deleting, onEdit, onDelete, onNew }: {
  cards: PracticalInfo[]
  deleting: Set<string>
  onEdit: (c: PracticalInfo) => void
  onDelete: (id: string) => void
  onNew: () => void
}) {
  return (
    <>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'16px', marginBottom:'28px', flexWrap:'wrap' }}>
        <div>
          <span className="section-tag">Pratik Bilgiler Yönetimi</span>
          <h2 style={{ margin:0 }}>
            Bilgi Kartları
            <span style={{ fontSize:'1rem', fontWeight:600, color:'var(--text-muted)', background:'var(--border)', borderRadius:'20px', padding:'3px 14px', marginLeft:'14px' }}>
              {cards.length}
            </span>
          </h2>
        </div>
        <button onClick={onNew} style={S.btn('gold')}>+ Yeni Kart</button>
      </div>

      {cards.length === 0 ? (
        <div style={{ background:'#fff', border:'1.5px solid #E8E5DF', borderRadius:'var(--radius-lg)', padding:'72px 40px', textAlign:'center' }}>
          <p style={{ color:'var(--text-muted)', marginBottom:'20px' }}>Henüz kart eklenmedi.</p>
          <button onClick={onNew} style={S.btn('gold')}>İlk Kartı Ekle</button>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
          {cards.map((card, idx) => (
            <div key={card.id}
              style={{ background:'#fff', border:'1.5px solid #E8E5DF', borderRadius:'var(--radius)', padding:'18px 22px', display:'flex', alignItems:'center', gap:'16px', flexWrap:'wrap', opacity: deleting.has(card.id) ? 0.5 : 1 }}>
              <span style={{ fontSize:'0.78rem', fontWeight:700, color:'var(--text-muted)', minWidth:'22px' }}>{idx+1}</span>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ margin:0, fontWeight:700, color:'var(--navy)', fontSize:'0.95rem' }}>{card.title}</p>
                <p style={{ margin:'3px 0 0', fontSize:'0.76rem', color:'var(--text-muted)' }}>
                  {CATEGORY_LABELS[card.category] ?? card.category}
                  {' · '}{DATA_TYPE_LABELS[card.data.type] ?? card.data.type}
                  {card.last_updated && ` · Güncelleme: ${formatDateTR(card.last_updated)}`}
                </p>
              </div>
              <div style={{ display:'flex', gap:'8px', flexShrink:0 }}>
                <button onClick={() => onEdit(card)} style={S.btn('ghost')}>Düzenle</button>
                <button onClick={() => onDelete(card.id)} disabled={deleting.has(card.id)} style={S.btn('danger')}>
                  {deleting.has(card.id) ? '…' : 'Sil'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type View = 'list' | 'edit' | 'new'

export default function AdminPratikBilgiler() {
  const [cards,    setCards]    = useState<PracticalInfo[]>([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState<string | null>(null)
  const [view,     setView]     = useState<View>('list')
  const [editing,  setEditing]  = useState<PracticalInfo | null>(null)
  const [form,     setForm]     = useState<FormState>(BLANK_FORM)
  const [saving,   setSaving]   = useState(false)
  const [deleting, setDeleting] = useState<Set<string>>(new Set())
  const [logoutLoading, setLogoutLoading] = useState(false)
  const router = useRouter()

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const res  = await fetch('/api/admin/practical-info')
      if (!res.ok) throw new Error(`Hata: ${res.status}`)
      setCards(await res.json())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Yüklenemedi.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  function openNew() {
    setForm(BLANK_FORM); setEditing(null); setView('new')
  }
  function openEdit(card: PracticalInfo) {
    setForm(cardToForm(card)); setEditing(card); setView('edit')
  }
  function cancelEdit() {
    setView('list'); setEditing(null)
  }

  async function saveCard() {
    if (!form.title.trim()) { alert('Başlık zorunludur.'); return }
    setSaving(true)
    const payload = {
      title:         form.title.trim(),
      category:      form.category,
      display_order: form.display_order,
      source_name:   form.source_name.trim() || null,
      source_url:    form.source_url.trim()  || null,
      last_updated:  form.last_updated       || null,
      note:          form.note.trim()        || null,
      data:          formToData(form),
    }
    try {
      const url    = view === 'new' ? '/api/admin/practical-info' : `/api/admin/practical-info/${editing!.id}`
      const method = view === 'new' ? 'POST' : 'PUT'
      const res    = await fetch(url, { method, headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) { const j = await res.json(); throw new Error(j.error ?? 'Hata') }
      await load()
      setView('list')
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Kaydetme başarısız.')
    } finally {
      setSaving(false)
    }
  }

  async function deleteCard(id: string) {
    if (!confirm('Bu kartı silmek istediğinize emin misiniz?')) return
    setDeleting(prev => new Set(prev).add(id))
    try {
      const res = await fetch(`/api/admin/practical-info/${id}`, { method:'DELETE' })
      if (!res.ok) throw new Error()
      setCards(prev => prev.filter(c => c.id !== id))
    } catch {
      alert('Silme başarısız.')
    } finally {
      setDeleting(prev => { const s = new Set(prev); s.delete(id); return s })
    }
  }

  async function handleLogout() {
    setLogoutLoading(true)
    try { await fetch('/api/admin/logout', { method:'POST' }) } finally {
      router.push('/admin/login'); router.refresh()
    }
  }

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', fontFamily:"'Segoe UI', system-ui, -apple-system, sans-serif" }}>
      <style>{`@keyframes ao-spin { to { transform:rotate(360deg); } }`}</style>

      {/* Header */}
      <header style={{ background:'var(--navy)', borderBottom:'3px solid var(--gold)', padding:'20px 0' }}>
        <div className="container" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'16px' }}>
          <div>
            <span style={{ fontSize:'0.68rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'3px', color:'var(--gold)', display:'block', marginBottom:'4px' }}>
              Admin Paneli
            </span>
            <span style={{ fontSize:'1.2rem', fontWeight:700, color:'#fff', fontFamily:"'Playfair Display', Georgia, serif" }}>
              S.M.M.M. Ali Orhun
            </span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', flexWrap:'wrap' }}>
            <Link href="/admin" style={{ color:'rgba(255,255,255,0.60)', fontSize:'0.86rem', fontWeight:500, textDecoration:'none', padding:'8px 14px', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'8px', whiteSpace:'nowrap' }}>
              ← Randevular
            </Link>
            <Link href="/pratik-bilgiler" target="_blank" style={{ color:'rgba(255,255,255,0.60)', fontSize:'0.86rem', fontWeight:500, textDecoration:'none', padding:'8px 14px', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'8px', whiteSpace:'nowrap' }}>
              Sayfayı Gör ↗
            </Link>
            <Link href="/" style={{ color:'rgba(255,255,255,0.60)', fontSize:'0.86rem', fontWeight:500, textDecoration:'none', padding:'8px 14px', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'8px', whiteSpace:'nowrap' }}>
              ← Ana Sayfa
            </Link>
            <button onClick={handleLogout} disabled={logoutLoading}
              style={{ color:'#C9933A', fontSize:'0.86rem', fontWeight:600, background:'none', border:'1px solid rgba(201,147,58,0.40)', borderRadius:'8px', padding:'8px 14px', cursor:'pointer', whiteSpace:'nowrap', fontFamily:'inherit' }}>
              {logoutLoading ? '...' : 'Çıkış Yap'}
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main style={{ padding:'52px 0 80px' }}>
        <div className="container">

          {loading && (
            <div style={{ textAlign:'center', padding:'80px 0' }}>
              <div style={{ width:'36px', height:'36px', borderRadius:'50%', border:'3px solid #E8E5DF', borderTopColor:'var(--gold)', animation:'ao-spin 0.8s linear infinite', margin:'0 auto 16px' }} />
              <p style={{ color:'var(--text-muted)', fontSize:'0.9rem' }}>Yükleniyor…</p>
            </div>
          )}

          {!loading && error && (
            <div style={{ background:'#fff', border:'1.5px solid rgba(217,83,79,0.25)', borderRadius:'var(--radius-lg)', padding:'60px 40px', textAlign:'center' }}>
              <h3 style={{ color:'var(--navy)', marginBottom:'8px' }}>Yükleme başarısız</h3>
              <p style={{ color:'var(--text-muted)', marginBottom:'24px', fontSize:'0.9rem' }}>{error}</p>
              <button onClick={load} style={S.btn('primary')}>Tekrar Dene</button>
            </div>
          )}

          {!loading && !error && view === 'list' && (
            <CardList cards={cards} deleting={deleting} onEdit={openEdit} onDelete={deleteCard} onNew={openNew} />
          )}

          {!loading && !error && (view === 'edit' || view === 'new') && (
            <EditForm form={form} setForm={setForm} saving={saving} onSave={saveCard} onCancel={cancelEdit} isNew={view === 'new'} />
          )}

        </div>
      </main>
    </div>
  )
}
