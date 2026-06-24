-- ================================================================
-- Pratik Bilgiler — Supabase Migration
-- Run in: Supabase Dashboard → SQL Editor → Run
-- Safe to re-run: ON CONFLICT DO UPDATE corrects existing rows too
-- ================================================================

-- ── Table ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS practical_info (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT        NOT NULL,
  category      TEXT        NOT NULL,
  data          JSONB       NOT NULL DEFAULT '{"type":"list","items":[]}',
  source_name   TEXT,
  source_url    TEXT,
  last_updated  DATE,
  note          TEXT,
  display_order INTEGER     NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Auto-update trigger ──────────────────────────────────────────

CREATE OR REPLACE FUNCTION _set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS practical_info_updated_at ON practical_info;
CREATE TRIGGER practical_info_updated_at
  BEFORE UPDATE ON practical_info
  FOR EACH ROW EXECUTE FUNCTION _set_updated_at();

-- ── Row Level Security ───────────────────────────────────────────
-- Public can SELECT. Only the service-role key (admin API) can write.

ALTER TABLE practical_info ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read practical_info" ON practical_info;
CREATE POLICY "Public read practical_info"
  ON practical_info FOR SELECT TO anon, authenticated USING (true);

-- ── Unique constraint on category (idempotent) ──────────────────

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'practical_info_category_unique'
      AND conrelid = 'practical_info'::regclass
  ) THEN
    ALTER TABLE practical_info
      ADD CONSTRAINT practical_info_category_unique UNIQUE (category);
  END IF;
END;
$$;

-- ================================================================
-- Seed — 4 core sections
--
-- ON CONFLICT DO UPDATE: safe to re-run.
-- Existing rows get the corrected content.
-- Admin can refine values further at /admin/pratik-bilgiler.
-- ================================================================

INSERT INTO practical_info
  (title, category, data, source_name, source_url, last_updated, note, display_order)
VALUES

-- ── 1. Vergi Takvimi ─────────────────────────────────────────────
-- Only legally-fixed deadlines. No figures that could be stale.
(
  'Vergi Takvimi',
  'vergi-takvimi',
  $d${"type":"table","headers":["Beyanname / Bildirim","Son Gün","Periyot"],"rows":[["KDV Beyannamesi","Ayın 26'sı","Aylık"],["Muhtasar & Prim Hizmet Bey.","Ayın 26'sı","Aylık"],["Geçici Vergi – 1. Dönem","14 Mayıs","3 Aylık"],["Geçici Vergi – 2. Dönem","14 Ağustos","3 Aylık"],["Geçici Vergi – 3. Dönem","14 Kasım","3 Aylık"],["Yıllık Gelir Vergisi","31 Mart","Yıllık"],["Yıllık Kurumlar Vergisi","30 Nisan","Yıllık"]]}$d$::jsonb,
  'Gelir İdaresi Başkanlığı',
  'https://www.gib.gov.tr',
  '2026-06-01',
  'Resmi tatile denk gelen son günler bir sonraki iş gününe ertelenir. Kesin takvim için GİB''i kontrol ediniz.',
  1
),

-- ── 2. Asgari Ücret ──────────────────────────────────────────────
-- No TL figures — they change every year and go stale quickly.
-- Card directs visitors to the official source instead.
(
  'Asgari Ücret',
  'asgari-ucret',
  $d${"type":"links","items":[{"name":"Asgari Ücret – Resmî Bilgi","url":"csgb.gov.tr","href":"https://www.csgb.gov.tr/asgari-ucret/","desc":"Güncel brüt / net ücret ve işveren toplam maliyeti"},{"name":"SGK Asgari Ücret Hesaplama","url":"sgk.gov.tr","href":"https://www.sgk.gov.tr","desc":"Prim bildirimi ve ücret hesaplama araçları"}]}$d$::jsonb,
  'Çalışma ve Sosyal Güvenlik Bakanlığı',
  'https://www.csgb.gov.tr/asgari-ucret/',
  '2026-06-01',
  'Asgari ücret her yıl Aralık–Ocak döneminde yeniden belirlenir. Eski rakamlar yanıltmasın diye bu kartı sayısal değer yerine resmî kaynaklara yönlendirme olarak düzenledik.',
  2
),

-- ── 3. SGK Prim Oranları ─────────────────────────────────────────
-- No percentages — they can change with legislation.
-- Card directs visitors to the official source instead.
(
  'SGK Prim Oranları',
  'sgk-primleri',
  $d${"type":"links","items":[{"name":"SGK Prim Oranları – Resmî Bilgi","url":"sgk.gov.tr","href":"https://www.sgk.gov.tr","desc":"Sigorta kolu bazında işçi ve işveren payları"},{"name":"e-Devlet SGK Hizmetleri","url":"turkiye.gov.tr","href":"https://www.turkiye.gov.tr","desc":"Prim borcu sorgulama ve bildirim işlemleri"}]}$d$::jsonb,
  'Sosyal Güvenlik Kurumu',
  'https://www.sgk.gov.tr',
  '2026-06-01',
  'Prim oranları mevzuat değişikliklerine göre güncellenebilir. Eski oranlar yanıltmasın diye bu kartı sayısal değer yerine resmî kaynağa yönlendirme olarak düzenledik.',
  3
),

-- ── 4. Faydalı Linkler ───────────────────────────────────────────
(
  'Faydalı Linkler',
  'faydali-linkler',
  $d${"type":"links","items":[{"name":"Gelir İdaresi Başkanlığı","url":"gib.gov.tr","href":"https://www.gib.gov.tr","desc":"Vergi beyanname, bildirim ve ödeme"},{"name":"Sosyal Güvenlik Kurumu","url":"sgk.gov.tr","href":"https://www.sgk.gov.tr","desc":"SGK prim bildirgeleri ve sorgulama"},{"name":"e-Devlet Kapısı","url":"turkiye.gov.tr","href":"https://www.turkiye.gov.tr","desc":"Dijital kamu hizmetleri"},{"name":"Resmî Gazete","url":"resmigazete.gov.tr","href":"https://www.resmigazete.gov.tr","desc":"Güncel mevzuat ve resmî ilanlar"},{"name":"TÜRMOB","url":"turmob.org.tr","href":"https://www.turmob.org.tr","desc":"Muhasebe meslek kuruluşu"},{"name":"MERSİS","url":"mersis.gtb.gov.tr","href":"https://mersis.gtb.gov.tr","desc":"Şirket tescil ve ticaret sicili"},{"name":"TÜİK","url":"tuik.gov.tr","href":"https://www.tuik.gov.tr","desc":"İstatistikler ve enflasyon verileri"}]}$d$::jsonb,
  'S.M.M.M. Ali Orhun Ofisi',
  NULL,
  '2026-06-01',
  'Bu liste ofisimiz tarafından derlenmekte ve düzenli aralıklarla güncellenmektedir.',
  4
)

ON CONFLICT (category) DO UPDATE SET
  title        = EXCLUDED.title,
  data         = EXCLUDED.data,
  source_name  = EXCLUDED.source_name,
  source_url   = EXCLUDED.source_url,
  last_updated = EXCLUDED.last_updated,
  note         = EXCLUDED.note,
  display_order = EXCLUDED.display_order;

-- ================================================================
-- Done.
-- Edit content at any time: /admin/pratik-bilgiler
-- ================================================================
