import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Paths that are always accessible regardless of session
const OPEN = ['/admin/login', '/api/admin/login', '/api/admin/logout']

async function computeHmac(secret: string, data: string): Promise<string> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data))
  return Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

async function isValidSession(token: string): Promise<boolean> {
  const secret = process.env.SESSION_SECRET
  if (!secret || !token) return false
  try {
    const sep = token.indexOf(':')
    if (sep === -1) return false
    const username = token.slice(0, sep)
    const hmac     = token.slice(sep + 1)
    if (!username || !hmac) return false
    const expected = await computeHmac(secret, username)
    if (expected.length !== hmac.length) return false
    // Constant-time comparison prevents timing attacks
    let diff = 0
    for (let i = 0; i < expected.length; i++) {
      diff |= expected.charCodeAt(i) ^ hmac.charCodeAt(i)
    }
    return diff === 0
  } catch {
    return false
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (OPEN.some(p => pathname === p)) return NextResponse.next()

  const token = request.cookies.get('ao_session')?.value ?? ''
  const valid = await isValidSession(token)

  if (!valid) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Oturum açmanız gerekiyor.' }, { status: 401 })
    }
    const url = request.nextUrl.clone()
    url.pathname = '/admin/login'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
