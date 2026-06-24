import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createAdminClient } from '@/lib/supabase-admin'

export async function POST(req: Request) {
  // ── Parse body ──────────────────────────────────────────────────────────────
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 })
  }

  const name    = typeof body.name    === 'string' ? body.name.trim()    : ''
  const phone   = typeof body.phone   === 'string' ? body.phone.trim()   : ''
  const email   = typeof body.email   === 'string' ? body.email.trim()   : ''
  const date    = typeof body.date    === 'string' ? body.date            : ''
  const time    = typeof body.time    === 'string' ? body.time            : ''
  const message = typeof body.message === 'string' ? body.message.trim()  : ''

  // ── Validate ─────────────────────────────────────────────────────────────────
  if (!name || !phone || !date || !time) {
    return NextResponse.json({ error: 'Zorunlu alanlar eksik.' }, { status: 400 })
  }

  // ── Supabase insert ──────────────────────────────────────────────────────────
  const supabase = createAdminClient()
  const { error: dbError } = await supabase
    .from('appointments')
    .insert({
      name,
      phone,
      email:   email   || null,
      date,
      time,
      message: message || null,
    })

  if (dbError) {
    console.error('[Appointments] Supabase insert hatası:', dbError.message)
    return NextResponse.json(
      { error: 'Randevu kaydedilemedi. Lütfen tekrar deneyin.' },
      { status: 500 }
    )
  }

  // ── E-posta bildirimi — kayıt zaten başarılı, mail hatasında bozulma olmaz ──
  const apiKey    = process.env.RESEND_API_KEY
  const toEmail   = process.env.APPOINTMENT_NOTIFY_EMAIL ?? 'aliorhun@hotmail.com'
  const fromEmail = process.env.RESEND_FROM_EMAIL        ?? 'onboarding@resend.dev'

  if (apiKey) {
    const resend = new Resend(apiKey)

    const dateFormatted = new Date(`${date}T00:00:00`).toLocaleDateString('tr-TR', {
      weekday: 'long',
      year:    'numeric',
      month:   'long',
      day:     'numeric',
    })
    const createdAt = new Date().toLocaleString('tr-TR', {
      timeZone:  'Europe/Istanbul',
      dateStyle: 'long',
      timeStyle: 'short',
    })

    try {
      await resend.emails.send({
        from:    `Ali Orhun SMMM <${fromEmail}>`,
        to:      [toEmail],
        replyTo: email || undefined,
        subject: 'Yeni Randevu Talebi - Ali Orhun SMMM',
        html:    buildEmailHtml({ name, phone, email, dateFormatted, time, message, createdAt }),
      })
    } catch (emailErr) {
      console.error('[Appointments] Mail gönderilemedi:', emailErr)
    }
  } else {
    console.warn('[Appointments] RESEND_API_KEY tanımlı değil — mail gönderilmedi.')
  }

  return NextResponse.json({ success: true })
}

// ── HTML e-posta şablonu ─────────────────────────────────────────────────────

function row(label: string, value: string) {
  return `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #e8e5df;color:#6B7280;font-size:13px;
                 vertical-align:top;width:34%;white-space:nowrap;">${label}</td>
      <td style="padding:12px 0 12px 18px;border-bottom:1px solid #e8e5df;color:#1B2A4A;
                 font-size:14px;font-weight:600;vertical-align:top;">${value}</td>
    </tr>`
}

function buildEmailHtml(p: {
  name: string; phone: string; email: string
  dateFormatted: string; time: string; message: string; createdAt: string
}) {
  const emailCell  = p.email
    ? p.email
    : '<span style="color:#9ca3af;font-weight:400;">Belirtilmedi</span>'
  const messageCell = p.message
    ? p.message.replace(/\n/g, '<br>')
    : '<span style="color:#9ca3af;font-weight:400;">Mesaj girilmedi.</span>'

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Yeni Randevu Talebi</title>
</head>
<body style="margin:0;padding:32px 16px;background:#f5f4f0;
             font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:580px;margin:0 auto;background:#ffffff;border-radius:12px;
              overflow:hidden;border:1px solid #e0ddd8;
              box-shadow:0 4px 24px rgba(27,42,74,0.09);">

    <!-- Başlık -->
    <div style="background:#1B2A4A;padding:28px 36px;">
      <p style="margin:0 0 6px;color:#C9933A;font-size:11px;font-weight:700;
                letter-spacing:3px;text-transform:uppercase;">Yeni Talep</p>
      <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;
                 line-height:1.3;">Randevu Bildirimi</h1>
    </div>

    <!-- İçerik -->
    <div style="padding:28px 36px;">
      <p style="margin:0 0 24px;color:#4B5563;font-size:14px;line-height:1.7;">
        Web sitesi üzerinden yeni bir randevu talebi alındı.
      </p>
      <table style="width:100%;border-collapse:collapse;">
        ${row('Ad Soyad',      p.name)}
        ${row('Telefon',       p.phone)}
        ${row('E-posta',       emailCell)}
        ${row('Randevu Tarihi', p.dateFormatted)}
        ${row('Randevu Saati', p.time)}
        ${row('Mesaj',         messageCell)}
        <tr>
          <td style="padding:12px 0;color:#6B7280;font-size:13px;
                     vertical-align:top;width:34%;white-space:nowrap;">Talep Zamanı</td>
          <td style="padding:12px 0 12px 18px;color:#1B2A4A;font-size:14px;
                     font-weight:600;vertical-align:top;">${p.createdAt}</td>
        </tr>
      </table>
    </div>

    <!-- Alt bilgi -->
    <div style="background:#f8f7f4;padding:18px 36px;border-top:1px solid #e8e5df;">
      <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.6;">
        Bu e-posta Ali Orhun S.M.M.M. web sitesinden otomatik olarak gönderilmiştir.
      </p>
    </div>
  </div>
</body>
</html>`
}
