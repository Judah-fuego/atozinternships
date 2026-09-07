const ATS_PATH_HOSTS = new Set([
  'jobs.ashbyhq.com',
  'job-boards.greenhouse.io',
  'boards.greenhouse.io',
  'jobs.lever.co',
  'apply.workable.com',
  'jobs.smartrecruiters.com',
])

const OPAQUE_HOSTS = new Set([
  'jobright.ai',
  'www.jobright.ai',
  'usajobs.gov',
  'www.usajobs.gov',
  'linkedin.com',
  'www.linkedin.com',
  'indeed.com',
  'www.indeed.com',
  'workatastartup.com',
  'www.workatastartup.com',
  'ycombinator.com',
  'www.ycombinator.com',
])

const WORKDAY_HOST = /\.myworkdayjobs\.com$/i

const COMPANY_DOMAIN_ALIASES: Record<string, string> = {
  'american express': 'americanexpress.com',
  amd: 'amd.com',
  apple: 'apple.com',
  boeing: 'boeing.com',
  bytedance: 'bytedance.com',
  'capital one': 'capitalone.com',
  canva: 'canva.com',
  'epic games': 'epicgames.com',
  google: 'google.com',
  'eli lilly': 'lilly.com',
  'general motors': 'gm.com',
  'hudson river trading': 'hudsonrivertrading.com',
  'jane street': 'janestreet.com',
  'johnson and johnson': 'jnj.com',
  jnj: 'jnj.com',
  'jp morgan chase': 'jpmorganchase.com',
  'jpmorgan chase': 'jpmorganchase.com',
  'jump trading': 'jumptrading.com',
  meta: 'meta.com',
  microsoft: 'microsoft.com',
  nvidia: 'nvidia.com',
  notion: 'notion.com',
  roblox: 'roblox.com',
  tesla: 'tesla.com',
  tiktok: 'tiktok.com',
  'un volunteers': 'unv.org',
  'united nations': 'un.org',
  'united nations volunteers': 'unv.org',
}

const LEGAL_SUFFIX =
  /\b(?:inc\.?|incorporated|llc|l\.?l\.?c\.?|ltd\.?|limited|corp\.?|corporation|co\.?|company|technologies|technology|group|holdings?)\b/gi

function normalizeCompanyKey(company: string) {
  return company
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9.+]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function stripLegalSuffixes(company: string) {
  return company.replace(LEGAL_SUFFIX, ' ').replace(/\s+/g, ' ').trim()
}

function hostnameOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./i, '').toLowerCase()
  }
  catch {
    return ''
  }
}

function pathSlug(url: string) {
  try {
    const parts = new URL(url).pathname.split('/').filter(Boolean)
    return parts[0] || ''
  }
  catch {
    return ''
  }
}

function slugToDomainGuess(slug: string) {
  const cleaned = slug.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/^-+|-+$/g, '')
  if (!cleaned || cleaned.length < 2) {
    return null
  }
  return `${cleaned.replace(/-/g, '')}.com`
}

function brandHostFromHostname(host: string) {
  if (!host || OPAQUE_HOSTS.has(host) || OPAQUE_HOSTS.has(`www.${host}`)) {
    return null
  }
  if (ATS_PATH_HOSTS.has(host) || WORKDAY_HOST.test(host) || host.endsWith('.successfactors.com') || host.includes('oraclecloud.com')) {
    return null
  }
  const labels = host.split('.')
  const careersPrefixes = new Set(['careers', 'jobs', 'career', 'apply', 'recruiting', 'talent'])
  if (labels.length >= 3 && careersPrefixes.has(labels[0]!)) {
    return labels.slice(1).join('.')
  }
  return host
}

function domainFromWorkday(host: string) {
  const match = host.match(/^([a-z0-9-]+)\.wd\d+\.myworkdayjobs\.com$/i)
  if (!match?.[1]) {
    return null
  }
  return `${match[1].toLowerCase().replace(/-/g, '')}.com`
}

function aliasDomainForCompany(company: string) {
  const key = normalizeCompanyKey(company)
  const stripped = normalizeCompanyKey(stripLegalSuffixes(company))
  return COMPANY_DOMAIN_ALIASES[key] || COMPANY_DOMAIN_ALIASES[stripped] || null
}

export function companyLogoDomain(company: string, url: string): string | null {
  const alias = aliasDomainForCompany(company)
  if (alias) {
    return alias
  }
  const host = hostnameOf(url)
  if (!host) {
    return null
  }
  if (ATS_PATH_HOSTS.has(host)) {
    return slugToDomainGuess(pathSlug(url))
  }
  if (WORKDAY_HOST.test(host)) {
    return domainFromWorkday(host)
  }
  if (OPAQUE_HOSTS.has(host) || OPAQUE_HOSTS.has(`www.${host}`)) {
    return null
  }
  return brandHostFromHostname(host)
}

export function companyLogoUrl(company: string, url: string): string | null {
  const domain = companyLogoDomain(company, url)
  if (!domain) {
    return null
  }
  return `/api/logo?domain=${encodeURIComponent(domain)}`
}

export function companyInitial(company: string): string {
  const words = company.replace(/[^a-zA-Z0-9\s]/g, ' ').trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) {
    return '?'
  }
  if (words.length === 1) {
    return words[0]!.slice(0, 1).toUpperCase()
  }
  return `${words[0]!.slice(0, 1)}${words[1]!.slice(0, 1)}`.toUpperCase()
}
