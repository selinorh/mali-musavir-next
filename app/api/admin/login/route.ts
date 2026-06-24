import { NextResponse } from 'next/server'
import { createSessionToken, safeEqual, SESSION_COOKIE, SESSION_MAX_AGE } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json() as { username?: string; password?: string }

    const validUser = safeEqual(username ?? '', process.env.ADMIN_USERNAME ?? '')
    const validPass = safeEqual(password ?? '', process.env.ADMIN_PASSWORD ?? '')

    if (!validUser || !validPass) {
      // Artificial delay to slow brute-force attempts
      await new Promise(r => setTimeout(r, 600))
      return NextResponse.json({ error: 'Kullanıcı adı veya şifre hatalı.' }, { status: 401 })
    }

    const token    = await createSessionToken(username!)
    const response = NextResponse.json({ success: true })
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   SESSION_MAX_AGE,
      path:     '/',
    })
    return response
  } catch {
    return NextResponse.json({ error: 'Sunucu hatası.' }, { status: 500 })
  }
}
