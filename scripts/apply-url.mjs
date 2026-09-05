/**
 * Apply-link helpers: a listing URL must be a specific posting,
 * not a career-board homepage or an aggregator search page.
 */

export const AGGREGATOR_HOST = /(?:^|\.)(jobright\.ai|handshake\.com|joinhandshake\.com|linkedin\.com|indeed\.com|simplify\.jobs)$/i

const JOB_ID_QUERY = /^(gh_jid|token|jk|career_job_req_id|jobid|job_id|jobreqid|requisitionid|reqid|jobcode)$/i
const GENERIC_SEGMENT = /^(careers?|jobs|job|join|apply|internships?|open-roles|open-positions|openings|positions|opportunities|fellowships?|students?|university|early-careers?|search|results|listings|roles)$/i
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const LOCALE = /^[a-z]{2}(?:-[A-Z]{2})?$/

/** Dedicated internship boards when the general careers page is a different place. */
export const INTERNSHIP_BOARD_OVERRIDES = {
  'jane street': 'https://www.janestreet.com/join-jane-street/internships/',
  google: 'https://www.google.com/about/careers/applications/jobs/results/?q=intern',
  microsoft: 'https://apply.careers.microsoft.com/careers?query=intern',
  apple: 'https://jobs.apple.com/en-us/search?search=intern&sort=relevance',
  amazon: 'https://www.amazon.jobs/en/search?base_query=intern',
  tesla: 'https://www.tesla.com/careers/search/?query=intern',
  meta: 'https://www.metacareers.com/careerprograms/students',
  facebook: 'https://www.metacareers.com/careerprograms/students',
  nvidia: 'https://nvidia.wd5.myworkdayjobs.com/NVIDIAExternalCareerSite?q=intern',
  'y combinator': 'https://www.ycombinator.com/internships',
  usajobs: 'https://www.usajobs.gov/Search/Results?hp=student',
}

export function parseApplyUrl(url) {
  try {
    return new URL(String(url || '').trim())
  }
  catch {
    return null
  }
}

export function applyHost(url) {
  const parsed = typeof url === 'string' ? parseApplyUrl(url) : url
  return parsed ? parsed.hostname.replace(/^www\./i, '').toLowerCase() : ''
}

export function isAggregatorApplyUrl(url) {
  const host = applyHost(url)
  return Boolean(host) && AGGREGATOR_HOST.test(host)
}

function pathParts(parsed) {
  return parsed.pathname.replace(/\/+$/, '').split('/').filter(Boolean)
}

function hasJobIdQuery(parsed) {
  for (const [key, value] of parsed.searchParams) {
    if (!value) {
      continue
    }
    if (JOB_ID_QUERY.test(key)) {
      return true
    }
    if (key === 'pid' && /^\d{8,}$/.test(value)) {
      return true
    }
  }
  return false
}

function looksLikeId(value) {
  const text = String(value || '')
  return (
    /^\d{4,}$/.test(text)
    || UUID.test(text)
    || /^[0-9a-f]{8,}$/i.test(text)
    || /(?:^|[_-])(?:JR|R|REQ|JOB|GH|WD)[_-]?\d{4,}/i.test(text)
    || /\d{6,}/.test(text)
  )
}

export function isSpecificPostingUrl(url) {
  if (!url || !/^https:\/\//i.test(url) || isAggregatorApplyUrl(url)) {
    return false
  }
  const parsed = parseApplyUrl(url)
  if (!parsed) {
    return false
  }
  const host = applyHost(parsed)
  const path = parsed.pathname.replace(/\/+$/, '') || '/'
  const parts = pathParts(parsed)
  const last = parts[parts.length - 1] || ''

  if (hasJobIdQuery(parsed)) {
    return true
  }
  if (host === 'forms.gle' || host === 'docs.google.com' || host === 'airtable.com') {
    return parts.length >= 1
  }
  if (/greenhouse\.io$/.test(host)) {
    return /\/jobs\/\d+/.test(path)
  }
  if (host === 'jobs.ashbyhq.com') {
    return parts.length >= 2 && looksLikeId(parts[1])
  }
  if (/lever\.co$/.test(host)) {
    return parts.length >= 2 && looksLikeId(parts[1])
  }
  if (/myworkdayjobs\.com$|myworkdaysite\.com$/.test(host)) {
    return parts.includes('job') || parts.includes('details')
  }
  if (/usajobs\.gov$/.test(host)) {
    return /\/job\/\d+/.test(path)
  }
  if (host === 'workatastartup.com') {
    return /\/jobs\/\d+/.test(path)
  }
  if (host.includes('ycombinator.com')) {
    return /\/companies\/[^/]+\/jobs\/[^/]+/i.test(path)
  }
  if (host === 'jobs.smartrecruiters.com') {
    return parts.length >= 2 && looksLikeId(last)
  }
  if (host.includes('oraclecloud.com')) {
    return /\/job\/\d+/.test(path)
  }
  if (host.includes('breezy.hr')) {
    return parts.length >= 1 && !GENERIC_SEGMENT.test(last)
  }

  if (parts.some((part) => looksLikeId(part))) {
    return true
  }
  if (host.includes('bamboohr.com') && /\/careers\/\d+/.test(path)) {
    return true
  }
  if (!parts.length) {
    return false
  }
  if (GENERIC_SEGMENT.test(last)) {
    return false
  }
  if (parts.length >= 2 && last.length >= 8) {
    return true
  }
  return false
}

/** Career / ATS homepage with no specific job. */
export function isBoardLandingUrl(url) {
  if (!url || !/^https:\/\//i.test(url)) {
    return false
  }
  if (isAggregatorApplyUrl(url)) {
    return true
  }
  const parsed = parseApplyUrl(url)
  if (!parsed) {
    return false
  }
  const host = applyHost(parsed)
  const path = parsed.pathname.replace(/\/+$/, '') || '/'
  const parts = pathParts(parsed)

  if (hasJobIdQuery(parsed)) {
    return false
  }
  if (/greenhouse\.io$/.test(host)) {
    return !/\/jobs\/\d+/.test(path)
  }
  if (host === 'jobs.ashbyhq.com') {
    return parts.length < 2 || !looksLikeId(parts[1])
  }
  if (/lever\.co$/.test(host)) {
    return parts.length < 2 || !looksLikeId(parts[1])
  }
  if (/myworkdayjobs\.com$|myworkdaysite\.com$/.test(host)) {
    return !parts.includes('job') && !parts.includes('details')
  }
  if (/usajobs\.gov$/.test(host)) {
    return !/\/job\/\d+/.test(path)
  }
  if (host === 'jobs.smartrecruiters.com') {
    return parts.length < 2
  }
  if (host === 'workatastartup.com') {
    return !/\/jobs\/\d+/.test(path)
  }
  if (!parts.length || GENERIC_SEGMENT.test(parts[parts.length - 1] || '')) {
    return true
  }
  return false
}

function internQueryUrl(base, key = 'q') {
  const parsed = parseApplyUrl(base)
  if (!parsed) {
    return base
  }
  if (![...parsed.searchParams.keys()].some((name) => /^(q|query|search|keywords)$/i.test(name))) {
    parsed.searchParams.set(key, 'intern')
  }
  return parsed.toString()
}

export function boardFromApplyUrl(url) {
  const parsed = parseApplyUrl(url)
  if (!parsed || isAggregatorApplyUrl(parsed)) {
    return null
  }
  const host = applyHost(parsed)
  const parts = pathParts(parsed)
  const origin = parsed.origin

  if (/greenhouse\.io$/.test(host) && parts[0] && parts[0] !== 'embed') {
    return { kind: 'greenhouse', boardUrl: `${origin}/${parts[0]}` }
  }
  if (host === 'jobs.ashbyhq.com' && parts[0]) {
    return { kind: 'ashby', boardUrl: `https://jobs.ashbyhq.com/${parts[0]}` }
  }
  if (/lever\.co$/.test(host) && parts[0]) {
    return { kind: 'lever', boardUrl: `${origin}/${parts[0]}` }
  }
  if (/myworkdayjobs\.com$|myworkdaysite\.com$/.test(host)) {
    const locale = parts[0] && /^[a-z]{2}-[A-Z]{2}$/.test(parts[0]) ? parts[0] : ''
    const site = locale ? parts[1] : parts[0]
    if (site && site !== 'job' && site !== 'details') {
      const base = locale ? `${origin}/${locale}/${site}` : `${origin}/${site}`
      return { kind: 'workday', boardUrl: internQueryUrl(base) }
    }
  }
  if (host === 'jobs.smartrecruiters.com' && parts[0]) {
    return { kind: 'smartrecruiters', boardUrl: `https://jobs.smartrecruiters.com/${parts[0]}` }
  }
  if (host === 'apply.workable.com' && parts[0]) {
    return { kind: 'workable', boardUrl: `https://apply.workable.com/${parts[0]}` }
  }
  if (host === 'ats.rippling.com') {
    const company = parts.find((part, index) => index > 0 && part !== 'jobs' && !LOCALE.test(part) && !UUID.test(part))
      || parts.find((part) => part !== 'jobs' && !LOCALE.test(part) && !UUID.test(part))
    if (company) {
      const locale = parts[0] && LOCALE.test(parts[0]) ? parts[0] : ''
      return {
        kind: 'rippling',
        boardUrl: locale
          ? `https://ats.rippling.com/${locale}/${company}`
          : `https://ats.rippling.com/${company}`,
      }
    }
  }
  if (host === 'workatastartup.com' || host.includes('ycombinator.com')) {
    return { kind: 'yc', boardUrl: 'https://www.ycombinator.com/internships' }
  }
  if (/usajobs\.gov$/.test(host)) {
    return { kind: 'usajobs', boardUrl: 'https://www.usajobs.gov/Search/Results?hp=student' }
  }
  if (host === 'jobs.apple.com') {
    return { kind: 'apple', boardUrl: INTERNSHIP_BOARD_OVERRIDES.apple }
  }
  if (host === 'amazon.jobs') {
    return { kind: 'amazon', boardUrl: INTERNSHIP_BOARD_OVERRIDES.amazon }
  }
  if (host === 'tesla.com') {
    return { kind: 'tesla', boardUrl: INTERNSHIP_BOARD_OVERRIDES.tesla }
  }
  if (host === 'google.com' && /careers/.test(parsed.pathname)) {
    return { kind: 'google', boardUrl: INTERNSHIP_BOARD_OVERRIDES.google }
  }
  if (host === 'apply.careers.microsoft.com' || host === 'careers.microsoft.com') {
    return { kind: 'microsoft', boardUrl: INTERNSHIP_BOARD_OVERRIDES.microsoft }
  }
  if (host === 'janestreet.com') {
    return { kind: 'jane-street', boardUrl: INTERNSHIP_BOARD_OVERRIDES['jane street'] }
  }
  if (host === 'lifeattiktok.com') {
    return { kind: 'tiktok', boardUrl: internQueryUrl('https://lifeattiktok.com/', 'keywords') }
  }
  if (host === 'joinbytedance.com' || host === 'jobs.bytedance.com') {
    return { kind: 'bytedance', boardUrl: internQueryUrl(`${origin}${parts[0] ? `/${parts[0]}` : ''}`, 'keywords') }
  }
  if (host.includes('oraclecloud.com')) {
    const jobAt = parts.indexOf('job')
    const boardParts = jobAt > 0 ? parts.slice(0, jobAt) : parts.slice(0, 5)
    if (boardParts.length) {
      return { kind: 'oracle', boardUrl: `${origin}/${boardParts.join('/')}` }
    }
  }

  if (hasJobIdQuery(parsed)) {
    parsed.search = ''
    parsed.hash = ''
    return { kind: 'company', boardUrl: parsed.toString() }
  }

  if (parts.length >= 2 && !GENERIC_SEGMENT.test(parts[0])) {
    const cutoff = parts.findIndex((part, index) => index > 0 && (looksLikeId(part) || part === 'job' || part === 'details'))
    const boardParts = cutoff > 0 ? parts.slice(0, cutoff) : parts.slice(0, Math.max(1, parts.length - 1))
    if (boardParts.length && !looksLikeId(boardParts[boardParts.length - 1])) {
      return { kind: 'company', boardUrl: `${origin}/${boardParts.join('/')}` }
    }
  }
  if (parts[0] && GENERIC_SEGMENT.test(parts[0])) {
    return { kind: 'company', boardUrl: `${origin}/${parts[0]}` }
  }
  return null
}

function companyKey(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9.+]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function internshipBoardForCompany(company, url) {
  const key = companyKey(company)
  if (INTERNSHIP_BOARD_OVERRIDES[key]) {
    return INTERNSHIP_BOARD_OVERRIDES[key]
  }
  return boardFromApplyUrl(url)?.boardUrl || ''
}

export function companyInternshipBoards(listings) {
  const byCompany = new Map()
  for (const item of listings || []) {
    const name = String(item.company || '').trim()
    if (!name) {
      continue
    }
    const current = byCompany.get(name) || { company: name, boardUrl: '', count: 0 }
    current.count += 1
    if (!current.boardUrl) {
      current.boardUrl = internshipBoardForCompany(name, item.url)
    }
    byCompany.set(name, current)
  }
  return [...byCompany.values()]
    .filter((row) => row.boardUrl)
    .sort((a, b) => b.count - a.count || a.company.localeCompare(b.company))
}
