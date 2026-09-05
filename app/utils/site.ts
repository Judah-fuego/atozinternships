export const SITE_URL = 'https://atozinternships.com'
export const SITE_NAME = 'atoz internships'
export const SITE_BRAND = 'atoz'

export function siteUrl(path = '/') {
  if (!path || path === '/') {
    return `${SITE_URL}/`
  }
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}
