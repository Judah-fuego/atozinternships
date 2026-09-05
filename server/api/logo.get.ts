import { createHash } from 'node:crypto'

const DOMAIN_RE = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i
const DDG_MISSING_SHA1_PREFIX = '980aa215c45d'
const GOOGLE_GLOBE_SHA1 = '2d7c9b60d1e2b4f4726141de2e4ab738110b9287'

function sha1Hex(buf: Buffer) {
  return createHash('sha1').update(buf).digest('hex')
}

function looksLikeImage(buf: Buffer, contentType: string) {
  if (contentType.includes('text/html') || contentType.includes('application/json')) {
    return false
  }
  if (buf.length < 32) {
    return false
  }
  return (
    (buf[0] === 0x89 && buf[1] === 0x50)
    || (buf[0] === 0xff && buf[1] === 0xd8)
    || (buf[0] === 0x47 && buf[1] === 0x49)
    || (buf[0] === 0x52 && buf[1] === 0x49 && buf[8] === 0x57)
    || (buf[0] === 0x00 && buf[1] === 0x00 && buf[2] === 0x01 && buf[3] === 0x00)
  )
}

async function fetchLogoBytes(url: string) {
  try {
    const upstream = await fetch(url, {
      headers: { accept: 'image/png,image/x-icon,image/*,*/*;q=0.8' },
      redirect: 'follow',
      signal: AbortSignal.timeout(5000),
    })
    if (!upstream.ok) {
      return null
    }
    const type = (upstream.headers.get('content-type') || '').toLowerCase()
    const buf = Buffer.from(await upstream.arrayBuffer())
    if (!looksLikeImage(buf, type)) {
      return null
    }
    const digest = sha1Hex(buf)
    if (digest.startsWith(DDG_MISSING_SHA1_PREFIX) || digest === GOOGLE_GLOBE_SHA1) {
      return null
    }
    return { buf, type: type || 'image/png' }
  }
  catch {
    return null
  }
}

export default defineEventHandler(async (event) => {
  const domain = String(getQuery(event).domain || '').trim().toLowerCase()
  if (!DOMAIN_RE.test(domain) || domain.length > 253) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid domain' })
  }

  const encoded = encodeURIComponent(domain)
  const google = await fetchLogoBytes(
    `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${encoded}&size=128`,
  )
  const picked = google || await fetchLogoBytes(`https://icons.duckduckgo.com/ip3/${encoded}.ico`)

  if (!picked) {
    setResponseStatus(event, 404)
    setHeader(event, 'content-type', 'text/plain; charset=utf-8')
    setHeader(event, 'cache-control', 'public, max-age=3600')
    return 'not found'
  }

  setHeader(event, 'content-type', picked.type.split(';')[0] || 'image/png')
  setHeader(event, 'cache-control', 'public, max-age=86400, stale-while-revalidate=604800')
  return picked.buf
})
