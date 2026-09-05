export type Season = 'summer' | 'offseason'
export type Who = 'undergrad' | 'grad'
export type Level = 'undergrad' | 'masters' | 'phd' | 'mba'
export type Family = 'software' | 'engineering' | 'health' | 'business' | 'policy' | 'arts' | 'other'
export type LocationId =
  | 'remote'
  | 'california'
  | 'bay-area'
  | 'new-york'
  | 'boston'
  | 'seattle'
  | 'texas'
  | 'dc'
  | 'chicago'
  | 'canada'
export type Track =
  | 'swe'
  | 'ml'
  | 'quant'
  | 'pm'
  | 'data'
  | 'security'
  | 'hardware'
  | 'mechanical'
  | 'electrical'
  | 'civil'
  | 'chemical'
  | 'biomedical'
  | 'aerospace'
  | 'robotics'
  | 'engineering'
  | 'clinical'
  | 'pharma'
  | 'public-health'
  | 'science'
  | 'finance'
  | 'consulting'
  | 'sales'
  | 'marketing'
  | 'ops'
  | 'hr'
  | 'retail'
  | 'legal'
  | 'education'
  | 'policy'
  | 'gov'
  | 'nonprofit'
  | 'design'
  | 'media'
  | 'writing'
  | 'entertainment'
  | 'architecture'
  | 'other'

export type Internship = {
  id: string
  company: string
  role: string
  location: string
  url: string
  posted: string
  deadline?: string
  season: Season
  track: Track
  closed: boolean
  noSponsorship: boolean
  usCitizen: boolean
  summary?: string
  keywords?: string
}

export type Filters = {
  query?: string
  who?: Who | 'all'
  season?: Season | 'all'
  families?: Family[]
  tracks?: Track[]
  locations?: LocationId[]
  companies?: string[]
  visa?: 'all' | 'citizen' | 'auth' | 'open'
  status?: 'open' | 'all'
}

export const SEASON_LABEL: Record<Season, string> = {
  summer: 'Summer',
  offseason: 'Fall / Spring',
}

export const TRACK_LABEL: Record<Track, string> = {
  swe: 'Software',
  ml: 'AI / ML',
  quant: 'Quant',
  pm: 'Product',
  data: 'Data',
  security: 'Security',
  hardware: 'Hardware',
  mechanical: 'Mechanical',
  electrical: 'Electrical',
  civil: 'Civil',
  chemical: 'Chemical',
  biomedical: 'Biomedical',
  aerospace: 'Aerospace',
  robotics: 'Robotics',
  engineering: 'Engineering',
  clinical: 'Clinical',
  pharma: 'Pharma',
  'public-health': 'Public health',
  science: 'Science',
  finance: 'Finance',
  consulting: 'Consulting',
  sales: 'Sales',
  marketing: 'Marketing',
  ops: 'Operations',
  hr: 'HR',
  retail: 'Retail',
  legal: 'Legal',
  education: 'Education',
  policy: 'Policy',
  gov: 'Government',
  nonprofit: 'Nonprofit',
  design: 'Design',
  media: 'Media',
  writing: 'Writing',
  entertainment: 'Entertainment',
  architecture: 'Architecture',
  other: 'Other',
}

export const FAMILY_LABEL: Record<Family, string> = {
  software: 'Software',
  engineering: 'Engineering',
  health: 'Health & science',
  business: 'Business',
  policy: 'Policy & gov',
  arts: 'Arts',
  other: 'Other',
}

export const LOCATION_LABEL: Record<LocationId, string> = {
  remote: 'Remote',
  california: 'California',
  'bay-area': 'Bay Area',
  'new-york': 'New York',
  boston: 'Boston',
  seattle: 'Seattle',
  texas: 'Texas',
  dc: 'Washington DC',
  chicago: 'Chicago',
  canada: 'Canada',
}

export const LEVEL_ORDER: Level[] = ['undergrad', 'masters', 'phd', 'mba']

export const TRACK_FAMILY: Record<Track, Family> = {
  swe: 'software',
  ml: 'software',
  data: 'software',
  security: 'software',
  hardware: 'engineering',
  mechanical: 'engineering',
  electrical: 'engineering',
  civil: 'engineering',
  chemical: 'engineering',
  aerospace: 'engineering',
  robotics: 'engineering',
  engineering: 'engineering',
  biomedical: 'health',
  clinical: 'health',
  pharma: 'health',
  'public-health': 'health',
  science: 'health',
  quant: 'business',
  pm: 'business',
  finance: 'business',
  consulting: 'business',
  sales: 'business',
  marketing: 'business',
  ops: 'business',
  hr: 'business',
  retail: 'business',
  legal: 'policy',
  education: 'policy',
  policy: 'policy',
  gov: 'policy',
  nonprofit: 'policy',
  design: 'arts',
  media: 'arts',
  writing: 'arts',
  entertainment: 'arts',
  architecture: 'engineering',
  other: 'other',
}

const LOCATION_RULES: Array<{ id: LocationId, test: RegExp }> = [
  { id: 'remote', test: /\bremote\b|work from home|\bwfh\b/i },
  { id: 'bay-area', test: /san francisco|san jose|palo alto|mountain view|sunnyvale|santa clara|cupertino|menlo park|redwood city|foster city|san mateo|fremont|oakland|berkeley|south san francisco|milpitas|pleasanton|hayward|stanford|bay area/i },
  { id: 'california', test: /san diego|los angeles|la jolla|irvine|pasadena|sacramento|,\s*ca\b|\bcalifornia\b|el segundo|santa monica|long beach|anaheim/i },
  { id: 'new-york', test: /new york|nyc\b|brooklyn|manhattan|jersey city|hoboken/i },
  { id: 'boston', test: /boston|cambridge,\s*ma|somerville|waltham|lexington, ma/i },
  { id: 'seattle', test: /seattle|bellevue|redmond|kirkland/i },
  { id: 'texas', test: /austin|dallas|houston|plano|,\s*tx\b/i },
  { id: 'dc', test: /washington,\s*d\.?c|arlington, va|reston|alexandria|bethesda|,\s*dc\b/i },
  { id: 'chicago', test: /chicago|evanston/i },
  { id: 'canada', test: /canada|\btoronto\b|vancouver|montr[eé]al|,\s*on\b|,\s*bc\b|ottawa/i },
]

export function levelsFromRole(role: string): Level[] {
  const value = String(role || '')
  const found = new Set<Level>()
  if (/\bmba\b/i.test(value)) {
    found.add('mba')
  }
  if (/ph\.?d/i.test(value)) {
    found.add('phd')
  }
  if (
    /master'?s|\bms students?\b|\bms intern|\bms\/(?:phd|ph\.?d)|(?:phd|ph\.?d)\/ms|\bbs\/ms|\bms\/bs|\bgraduate intern|\bgrad intern|\bgraduate student/i
      .test(value)
  ) {
    found.add('masters')
  }
  if (/undergrad|bachelor|\bbs intern|\bbs\/ms|\bms\/bs|\bundergraduate/i.test(value)) {
    found.add('undergrad')
  }
  // Pathways / student trainee are college internships for current
  // undergrads and graduate students unless the title names a level.
  if (!found.size && /pathways|student trainee/i.test(value)) {
    found.add('undergrad')
    found.add('masters')
  }
  return LEVEL_ORDER.filter((level) => found.has(level))
}

/** Every listing gets an audience so students can skip roles that are not for them. */
export function inferredLevels(item: Internship): Level[] {
  const stated = levelsFromRole(item.role)
  if (stated.length) {
    return stated
  }
  // Typical company intern programs take undergrads and master's students.
  return ['undergrad', 'masters']
}

export type AudienceKind = 'stated' | 'typical'

export function audience(item: Internship): {
  who: Who[]
  label: string
  kind: AudienceKind
  levels: Level[]
} {
  const stated = levelsFromRole(item.role)
  const levels = stated.length ? stated : ['undergrad', 'masters'] as Level[]
  const kind: AudienceKind = stated.length ? 'stated' : 'typical'
  const who: Who[] = []
  if (levels.includes('undergrad')) {
    who.push('undergrad')
  }
  if (levels.some((level) => level === 'masters' || level === 'phd' || level === 'mba')) {
    who.push('grad')
  }

  let label = ''
  if (levels.length === 1 && levels[0] === 'mba') {
    label = 'MBA'
  }
  else if (levels.length === 1 && levels[0] === 'phd') {
    label = 'PhD'
  }
  else if (levels.length === 1 && levels[0] === 'masters') {
    label = "Master's"
  }
  else if (levels.length === 1 && levels[0] === 'undergrad') {
    label = 'Undergrad'
  }
  else if (!levels.includes('undergrad')) {
    label = 'Grad'
  }
  else if (levels.includes('phd') || levels.includes('mba')) {
    label = 'Undergrad or grad'
  }
  else {
    label = "Undergrad or Master's"
  }

  return { who, label, kind, levels }
}

export function visaLabel(item: Internship): string {
  if (item.usCitizen) {
    return 'U.S. citizens'
  }
  if (item.noSponsorship) {
    return 'Needs U.S. work auth'
  }
  return ''
}

export function eligibilityLine(item: Internship): string {
  const { label, kind } = audience(item)
  const visa = visaLabel(item)
  const who = kind === 'typical' ? `${label} (typical)` : label
  return visa ? `${who} · ${visa}` : who
}

export function locationsFor(location: string): LocationId[] {
  const found = new Set<LocationId>()
  for (const rule of LOCATION_RULES) {
    if (rule.test.test(location)) {
      found.add(rule.id)
    }
  }
  if (found.has('bay-area') || /,\s*ca\b|\bcalifornia\b/i.test(location)) {
    found.add('california')
  }
  return (Object.keys(LOCATION_LABEL) as LocationId[]).filter((id) => found.has(id))
}

export function familyFor(track: Track): Family {
  return TRACK_FAMILY[track]
}

export const FAMILY_ORDER = Object.keys(FAMILY_LABEL) as Family[]
export const LOCATION_ORDER = Object.keys(LOCATION_LABEL) as LocationId[]

export function tracksInFamily(family: Family): Track[] {
  return (Object.keys(TRACK_FAMILY) as Track[]).filter((track) => TRACK_FAMILY[track] === family)
}

export function uniqueCompanies(listings: Internship[]): string[] {
  const names = new Set<string>()
  for (const item of listings) {
    const name = item.company.trim()
    if (name) {
      names.add(name)
    }
  }
  return [...names].sort((a, b) => a.localeCompare(b))
}

export type FacetCounts = {
  who: Record<'all' | Who, number>
  season: Record<'all' | Season, number>
  visa: Record<'all' | 'citizen' | 'auth' | 'open', number>
  status: Record<'open' | 'all', number>
  families: Record<Family, number>
  tracks: Partial<Record<Track, number>>
  locations: Record<LocationId, number>
  companies: Record<string, number>
}

function emptyFamilyCounts(): Record<Family, number> {
  return Object.fromEntries(FAMILY_ORDER.map((family) => [family, 0])) as Record<Family, number>
}

function emptyLocationCounts(): Record<LocationId, number> {
  return Object.fromEntries(LOCATION_ORDER.map((id) => [id, 0])) as Record<LocationId, number>
}

export function facetCounts(listings: Internship[], options: Filters = {}): FacetCounts {
  const who = {
    all: filterListings(listings, { ...options, who: 'all' }).length,
    undergrad: filterListings(listings, { ...options, who: 'undergrad' }).length,
    grad: filterListings(listings, { ...options, who: 'grad' }).length,
  }
  const season = {
    all: filterListings(listings, { ...options, season: 'all' }).length,
    summer: filterListings(listings, { ...options, season: 'summer' }).length,
    offseason: filterListings(listings, { ...options, season: 'offseason' }).length,
  }
  const visa = {
    all: filterListings(listings, { ...options, visa: 'all' }).length,
    open: filterListings(listings, { ...options, visa: 'open' }).length,
    auth: filterListings(listings, { ...options, visa: 'auth' }).length,
    citizen: filterListings(listings, { ...options, visa: 'citizen' }).length,
  }
  const status = {
    open: filterListings(listings, { ...options, status: 'open' }).length,
    all: filterListings(listings, { ...options, status: 'all' }).length,
  }

  const families = emptyFamilyCounts()
  const tracks: Partial<Record<Track, number>> = {}
  for (const item of filterListings(listings, { ...options, tracks: [], families: [] })) {
    const family = familyFor(item.track)
    families[family] += 1
    tracks[item.track] = (tracks[item.track] ?? 0) + 1
  }

  const locations = emptyLocationCounts()
  for (const item of filterListings(listings, { ...options, locations: [] })) {
    for (const id of locationsFor(item.location)) {
      locations[id] += 1
    }
  }

  const companies: Record<string, number> = {}
  for (const item of filterListings(listings, { ...options, companies: [] })) {
    companies[item.company] = (companies[item.company] ?? 0) + 1
  }

  return { who, season, visa, status, families, tracks, locations, companies }
}

export function parsePlaces(location: string): {
  label: string
  places: string[]
  compact: boolean
} {
  const raw = String(location || '').replace(/\s+/g, ' ').trim()
  if (!raw) {
    return { label: '', places: [], compact: false }
  }

  const prefix = raw.match(/^(\d+)\s+locations?\b\s*/i)
  const rest = prefix ? raw.slice(prefix[0].length).trim() : raw
  const found = rest.match(/[A-Z][A-Za-z0-9 .'-]*?,\s*(?:[A-Z]{2}|[A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+)*)/g) ?? []
  const places = [...new Set(found.map((item) => item.replace(/\s+/g, ' ').trim()))]
  const count = prefix ? Number(prefix[1]) : places.length

  if (count >= 3 || places.length >= 3) {
    return {
      label: `${count || places.length} locations`,
      places: places.length ? places : (rest ? [rest] : []),
      compact: true,
    }
  }

  return { label: raw, places, compact: false }
}

export function listingSource(item: Internship): { id: string, label: string } {
  if (item.id.startsWith('usajobs-') || /usajobs\.gov/i.test(item.url)) {
    return { id: 'usajobs', label: 'USAJobs' }
  }
  if (item.id.startsWith('yc-') || /workatastartup|ycombinator\.com/i.test(item.url)) {
    return { id: 'yc', label: 'Y Combinator' }
  }
  if (item.id.startsWith('idealist-') || /idealist\.org/i.test(item.url)) {
    return { id: 'idealist', label: 'Idealist' }
  }
  if (item.id.startsWith('biotech-') || /myworkdayjobs\.com/i.test(item.url)) {
    return { id: 'ats', label: 'Company career page' }
  }
  return { id: 'github', label: 'Public list' }
}

const DEADLINE_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** Format a stored YYYY-MM-DD application due date for the list. */
export function formatDeadline(iso: string): string {
  const match = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!match) {
    return ''
  }
  const year = Number(match[1])
  const month = Number(match[2]) - 1
  const day = Number(match[3])
  if (month < 0 || month > 11 || day < 1 || day > 31) {
    return ''
  }
  const label = `${DEADLINE_MONTHS[month]} ${day}`
  return year !== new Date().getUTCFullYear() ? `${label}, ${year}` : label
}

export function listingSummary(item: Internship): string {
  const stored = String(item.summary || '').replace(/\s+/g, ' ').trim()
  if (stored) {
    return stored
  }
  const field = TRACK_LABEL[item.track]
  const season = SEASON_LABEL[item.season]
  const place = item.location && !/^multiple locations$/i.test(item.location)
    ? ` in ${item.location}`
    : ''
  const due = formatDeadline(item.deadline || '')
  const when = due ? ` Apply by ${due}.` : ''
  return `${field} internship at ${item.company} for ${season}${place}.${when}`
}

function normalizeQuery(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

function tokens(value: string) {
  return value.toLowerCase().match(/[a-z0-9+#]+/g) ?? []
}

function maxEdits(len: number) {
  if (len <= 2) {
    return 0
  }
  if (len <= 5) {
    return 1
  }
  return 2
}

function withinEdits(a: string, b: string, max: number) {
  if (a === b) {
    return true
  }
  const la = a.length
  const lb = b.length
  if (!la || !lb || Math.abs(la - lb) > max) {
    return false
  }

  let prev2 = Array.from({ length: lb + 1 }, () => 0)
  let prev = Array.from({ length: lb + 1 }, (_, j) => j)

  for (let i = 1; i <= la; i++) {
    const curr = Array.from({ length: lb + 1 }, () => 0)
    curr[0] = i
    let rowMin = i
    const ca = a.charCodeAt(i - 1)
    for (let j = 1; j <= lb; j++) {
      const cb = b.charCodeAt(j - 1)
      let next = Math.min(
        prev[j] + 1,
        curr[j - 1] + 1,
        prev[j - 1] + (ca === cb ? 0 : 1),
      )
      if (
        i > 1
        && j > 1
        && ca === b.charCodeAt(j - 2)
        && cb === a.charCodeAt(i - 2)
      ) {
        next = Math.min(next, prev2[j - 2] + 1)
      }
      curr[j] = next
      if (next < rowMin) {
        rowMin = next
      }
    }
    if (rowMin > max) {
      return false
    }
    prev2 = prev
    prev = curr
  }
  return prev[lb] <= max
}

function wordMatches(word: string, token: string) {
  if (word === token) {
    return true
  }
  if (token.length <= 2) {
    return word.includes(token)
  }
  if (token.length >= 5 && word.startsWith(token)) {
    return true
  }
  return withinEdits(token, word, maxEdits(token.length))
}

export function queryMatches(haystack: string, query: string) {
  const q = query.trim().toLowerCase()
  if (!q) {
    return true
  }
  if (q.length <= 2) {
    return haystack.toLowerCase().includes(q)
  }
  const needles = tokens(q)
  const words = tokens(haystack)
  return needles.every((token) => words.some((word) => wordMatches(word, token)))
}

export function filterListings(listings: Internship[], options: Filters = {}) {
  const query = normalizeQuery(options.query ?? '')
  const who = options.who ?? 'all'
  const season = options.season ?? 'all'
  const status = options.status ?? 'open'
  const families = options.families ?? []
  const tracks = options.tracks ?? []
  const locations = options.locations ?? []
  const companies = options.companies ?? []
  const visa = options.visa ?? 'all'

  return listings.filter((item) => {
    if (status === 'open' && item.closed) {
      return false
    }
    if (season !== 'all' && item.season !== season) {
      return false
    }
    if (tracks.length) {
      if (!tracks.includes(item.track)) {
        return false
      }
    }
    else if (families.length && !families.includes(familyFor(item.track))) {
      return false
    }
    if (locations.length && !locationsFor(item.location).some((id) => locations.includes(id))) {
      return false
    }
    if (companies.length && !companies.includes(item.company)) {
      return false
    }
    const info = audience(item)
    if (who === 'undergrad' && !info.who.includes('undergrad')) {
      return false
    }
    if (who === 'grad' && !info.who.includes('grad')) {
      return false
    }
    if (visa === 'citizen' && !item.usCitizen) {
      return false
    }
    if (visa === 'auth' && !item.usCitizen && !item.noSponsorship) {
      return false
    }
    if (visa === 'open' && (item.usCitizen || item.noSponsorship)) {
      return false
    }
    if (!query) {
      return true
    }
    const haystack = [
      item.company,
      item.role,
      item.location,
      item.summary,
      item.keywords,
      TRACK_LABEL[item.track],
      FAMILY_LABEL[familyFor(item.track)],
      eligibilityLine(item),
    ]
      .join(' ')
      .toLowerCase()
    return queryMatches(haystack, query)
  })
}

export function sidebarFilterCount(options: Filters = {}) {
  let count = 0
  if (options.who && options.who !== 'all') {
    count += 1
  }
  if (options.season && options.season !== 'all') {
    count += 1
  }
  if (options.tracks?.length || options.families?.length) {
    count += 1
  }
  if (options.locations?.length) {
    count += 1
  }
  if (options.companies?.length) {
    count += 1
  }
  if (options.visa && options.visa !== 'all') {
    count += 1
  }
  if (options.status && options.status !== 'open') {
    count += 1
  }
  return count
}

export function filtersActive(options: Filters = {}) {
  return Boolean(
    normalizeQuery(options.query ?? '')
    || sidebarFilterCount(options),
  )
}
