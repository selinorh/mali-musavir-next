export const SESSION_COOKIE   = 'ao_session'
export const SESSION_MAX_AGE  = 60 * 60 * 24 * 7 // 7 days

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

/** Creates a signed session token: `username:hmac` */
export async function createSessionToken(username: string): Promise<string> {
  const hmac = await computeHmac(process.env.SESSION_SECRET!, username)
  return `${username}:${hmac}`
}

/** Constant-time string comparison to prevent timing attacks */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}
