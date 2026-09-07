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
  /** ISO datetime when the role was posted. Used for live “13m ago” labels. */
  postedAt?: string
  deadline?: string
  season: Season
  track: Track
  closed: boolean
  noSponsorship: boolean
  usCitizen: boolean
  summary?: string
  keywords?: string
  payText?: string
  payMin?: number
  payMax?: number
  payUnit?: 'hour' | 'year' | 'month'
  requirements?: string
  /** Concrete cohort when known, e.g. "Summer 2027" or "Fall 2026". */
  term?: string
  /** Set after apply-page enrich so pay/requirements are not re-fetched forever. */
  detailsVersion?: number
}

export type PostedWithin = 'all' | '1d' | '3d' | '7d' | '30d'
export type PostedSort = 'none' | 'newest' | 'oldest'
export type SourceId = 'yc' | 'usajobs' | 'idealist' | 'ats' | 'github'

export type Filters = {
  query?: string
  who?: Who | 'all'
  season?: Season | 'all'
  posted?: PostedWithin
  families?: Family[]
  tracks?: Track[]
  locations?: LocationId[]
  companies?: string[]
  sources?: SourceId[]
  visa?: 'all' | 'citizen' | 'auth' | 'open'
  status?: 'open' | 'all'
  /** Only listings that disclose pay. */
  pay?: 'all' | 'disclosed'
  /** Minimum hourly rate when payUnit is hour. */
  minHourly?: number
}

export const POSTED_WITHIN_DAYS: Record<Exclude<PostedWithin, 'all'>, number> = {
  '1d': 1,
  '3d': 3,
  '7d': 7,
  '30d': 30,
}

/** Browse UI hides postings older than this. Full history stays in listings.json for later insights. */
export const MAX_LISTING_AGE_DAYS = 365

export const SEASON_LABEL: Record<Season, string> = {
  summer: "Summer '27",
  offseason: 'Fall / Spring',
}

/** Short label for a stored cohort term like "Summer 2027" → "Summer '27". */
export function formatTermLabel(term?: string): string {
  const value = String(term || '').replace(/\s+/g, ' ').trim()
  if (!value) {
    return ''
  }
  const match = value.match(/^(Summer|Fall|Winter|Spring)\s+(20)?(\d{2})$/i)
  if (!match) {
    return value
  }
  const name = match[1][0].toUpperCase() + match[1].slice(1).toLowerCase()
  return `${name} '${match[3]}`
}

/** Prefer a concrete cohort (Summer '27) over the coarse season bucket. */
export function seasonLabelFor(item: Pick<Internship, 'season' | 'term'>): string {
  return formatTermLabel(item.term) || SEASON_LABEL[item.season]
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

export const SOURCE_LABEL: Record<SourceId, string> = {
  yc: 'Y Combinator',
  usajobs: 'USAJobs',
  idealist: 'Idealist',
  ats: 'Company career page',
  github: 'Public list',
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
export const SOURCE_ORDER = Object.keys(SOURCE_LABEL) as SourceId[]

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
  posted: Record<PostedWithin, number>
  visa: Record<'all' | 'citizen' | 'auth' | 'open', number>
  status: Record<'open' | 'all', number>
  pay: Record<'all' | 'disclosed', number>
  minHourly: Record<'all' | '40' | '50' | '60', number>
  families: Record<Family, number>
  tracks: Partial<Record<Track, number>>
  locations: Record<LocationId, number>
  companies: Record<string, number>
  sources: Record<SourceId, number>
}

function emptyFamilyCounts(): Record<Family, number> {
  return Object.fromEntries(FAMILY_ORDER.map((family) => [family, 0])) as Record<Family, number>
}

function emptyLocationCounts(): Record<LocationId, number> {
  return Object.fromEntries(LOCATION_ORDER.map((id) => [id, 0])) as Record<LocationId, number>
}

function emptySourceCounts(): Record<SourceId, number> {
  return Object.fromEntries(SOURCE_ORDER.map((id) => [id, 0])) as Record<SourceId, number>
}

function normalizeQuery(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

function tokens(value: string) {
  return value.toLowerCase().match(/[a-z0-9+#]+/g) ?? []
}

/** Collapse Ph.D. / PhD / Ph. D. so a "phd" query hits the title. */
function normalizeSearchText(value: string) {
  return value.toLowerCase().replace(/\bph\.?\s*d\.?\b/g, 'phd')
}

/** Brands people type as a company search even when we have no rows (or a near-miss stem exists). */
const COMPANY_QUERY_LOCKS = new Set([
  'meta',
  'facebook',
  'lyft',
  'slack',
  'netflix',
  'airbnb',
  'doordash',
  'openai',
  'anthropic',
])

/**
 * True when the query is this company's name (or its first token).
 * "Notion" → Notion, "amazon" → Amazon.com Services LLC, "two sigma" → Two Sigma.
 */
function companyNameMatchesQuery(company: string, q: string) {
  if (!q || q.length < 3) {
    return false
  }
  const name = company.toLowerCase().trim()
  if (name === q) {
    return true
  }
  if (q.includes(' ')) {
    return name === q || name.startsWith(`${q} `) || name.startsWith(`${q},`)
  }
  const parts = tokens(name)
  return parts[0] === q
}

/** If the query names a known employer, lock results to those companies. */
function exactCompaniesForQuery(listings: Internship[], q: string, selected: string[]) {
  if (!q || q.length < 3) {
    return null
  }
  const found: string[] = []
  const seen = new Set<string>()
  for (const item of listings) {
    if (seen.has(item.company)) {
      continue
    }
    if (companyNameMatchesQuery(item.company, q)) {
      seen.add(item.company)
      found.push(item.company)
    }
  }
  if (!found.length) {
    // Prefer empty over false friends for well-known brand queries.
    return COMPANY_QUERY_LOCKS.has(q) ? [] : null
  }
  if (!selected.length) {
    return found
  }
  return found.filter((company) => selected.includes(company))
}

type ListingIndex = {
  haystack: string
  words: string[]
  /** Company, role, location — where prefix exploration is safe. */
  exploreWords: string[]
  who: Who[]
  locations: LocationId[]
  family: Family
  source: SourceId
}

const listingIndexCache = new WeakMap<Internship, ListingIndex>()

function listingIndex(item: Internship): ListingIndex {
  const cached = listingIndexCache.get(item)
  if (cached) {
    return cached
  }
  const family = familyFor(item.track)
  const source = listingSource(item).id
  const explore = normalizeSearchText([item.company, item.role, item.location].join(' '))
  const haystack = normalizeSearchText([
    item.company,
    item.role,
    item.location,
    item.summary,
    item.keywords,
    item.payText,
    item.requirements,
    TRACK_LABEL[item.track],
    FAMILY_LABEL[family],
    eligibilityLine(item),
  ].join(' '))
  const indexed = {
    haystack,
    words: tokens(haystack),
    exploreWords: tokens(explore),
    who: audience(item).who,
    locations: locationsFor(item.location),
    family,
    source,
  }
  listingIndexCache.set(item, indexed)
  return indexed
}

function visaMatches(item: Internship, visa: NonNullable<Filters['visa']>) {
  if (visa === 'citizen') {
    return item.usCitizen
  }
  if (visa === 'auth') {
    return item.usCitizen || item.noSponsorship
  }
  if (visa === 'open') {
    return !item.usCitizen && !item.noSponsorship
  }
  return true
}

function whoMatches(who: Who[], filter: NonNullable<Filters['who']>) {
  return filter === 'all' || who.includes(filter)
}

function postedMatches(item: Internship, posted: PostedWithin, now: Date) {
  if (posted === 'all') {
    return true
  }
  const age = listingPostedAgeDays(item, now)
  return age !== null && age <= POSTED_WITHIN_DAYS[posted]
}

function trackMatches(item: Internship, family: Family, tracks: Track[], families: Family[]) {
  if (tracks.length) {
    return tracks.includes(item.track)
  }
  if (families.length) {
    return families.includes(family)
  }
  return true
}

function locationMatches(found: LocationId[], selected: LocationId[]) {
  return !selected.length || found.some((id) => selected.includes(id))
}

function companyMatches(company: string, selected: string[]) {
  return !selected.length || selected.includes(company)
}

function sourceMatches(source: SourceId, selected: SourceId[]) {
  return !selected.length || selected.includes(source)
}

export function listingHasPay(item: Internship) {
  return Boolean(item.payText || item.payMin != null)
}

export function listingHourlyMin(item: Internship) {
  if (item.payUnit !== 'hour' || item.payMin == null || !Number.isFinite(item.payMin)) {
    return null
  }
  return item.payMin
}

function payMatches(
  item: Internship,
  pay: NonNullable<Filters['pay']>,
  minHourly: number | undefined,
) {
  if (pay === 'disclosed' && !listingHasPay(item)) {
    return false
  }
  if (minHourly != null && minHourly > 0) {
    const hourly = listingHourlyMin(item)
    if (hourly == null || hourly < minHourly) {
      return false
    }
  }
  return true
}

function queryMatchesIndexed(index: ListingIndex, query: string) {
  if (!query) {
    return true
  }
  if (query.length <= 2) {
    return index.haystack.includes(query)
  }
  const needles = tokens(query)
  return needles.every((token) => tokenMatchesIndex(index, token))
}

function tokenMatchesIndex(index: ListingIndex, token: string) {
  if (index.words.some((word) => word === token)) {
    return true
  }
  if (token.length <= 2) {
    return index.words.some((word) => word.includes(token))
  }
  // Prefix exploration on company / role / location only (not body copy).
  if (index.exploreWords.some((word) => prefixMatches(word, token))) {
    return true
  }
  // Light typo tolerance across the full posting.
  return index.words.some((word) => fuzzyMatches(word, token))
}

function textOrCompanyQueryMatches(
  item: Internship,
  index: ListingIndex,
  query: string,
  exactCompanies: string[] | null,
) {
  if (exactCompanies) {
    return exactCompanies.includes(item.company)
  }
  return queryMatchesIndexed(index, query)
}

function listingPasses(
  item: Internship,
  index: ListingIndex,
  options: {
    query: string
    exactCompanies: string[] | null
    who: NonNullable<Filters['who']>
    season: NonNullable<Filters['season']>
    posted: PostedWithin
    status: NonNullable<Filters['status']>
    families: Family[]
    tracks: Track[]
    locations: LocationId[]
    companies: string[]
    sources: SourceId[]
    visa: NonNullable<Filters['visa']>
    pay: NonNullable<Filters['pay']>
    minHourly?: number
    now: Date
  },
) {
  if (!listingIsCurrent(item, options.now)) {
    return false
  }
  if (options.status === 'open' && item.closed) {
    return false
  }
  if (options.season !== 'all' && item.season !== options.season) {
    return false
  }
  if (!postedMatches(item, options.posted, options.now)) {
    return false
  }
  if (!trackMatches(item, index.family, options.tracks, options.families)) {
    return false
  }
  if (!locationMatches(index.locations, options.locations)) {
    return false
  }
  if (!companyMatches(item.company, options.companies)) {
    return false
  }
  if (!sourceMatches(index.source, options.sources)) {
    return false
  }
  if (!whoMatches(index.who, options.who)) {
    return false
  }
  if (!visaMatches(item, options.visa)) {
    return false
  }
  if (!payMatches(item, options.pay, options.minHourly)) {
    return false
  }
  return textOrCompanyQueryMatches(item, index, options.query, options.exactCompanies)
}

function resolveListFilters(listings: Internship[], options: Filters = {}, asOf?: Date) {
  const query = normalizeQuery(options.query ?? '')
  const companies = options.companies ?? []
  return {
    query,
    exactCompanies: exactCompaniesForQuery(listings, query, companies),
    who: options.who ?? 'all' as const,
    season: options.season ?? 'all' as const,
    posted: options.posted ?? 'all' as PostedWithin,
    status: options.status ?? 'open' as const,
    families: options.families ?? [],
    tracks: options.tracks ?? [],
    locations: options.locations ?? [],
    companies,
    sources: options.sources ?? [],
    visa: options.visa ?? 'all' as const,
    pay: options.pay ?? 'all' as const,
    minHourly: options.minHourly,
    now: asOf ?? new Date(),
  }
}

export function facetCounts(listings: Internship[], options: Filters = {}, asOf?: Date): FacetCounts {
  const resolved = resolveListFilters(listings, options, asOf)
  const who = { all: 0, undergrad: 0, grad: 0 }
  const season = { all: 0, summer: 0, offseason: 0 }
  const posted = { all: 0, '1d': 0, '3d': 0, '7d': 0, '30d': 0 }
  const visa = { all: 0, open: 0, auth: 0, citizen: 0 }
  const status = { open: 0, all: 0 }
  const pay = { all: 0, disclosed: 0 }
  const minHourly = { all: 0, '40': 0, '50': 0, '60': 0 }
  const families = emptyFamilyCounts()
  const tracks: Partial<Record<Track, number>> = {}
  const locations = emptyLocationCounts()
  const companies: Record<string, number> = {}
  const sources = emptySourceCounts()

  for (const item of listings) {
    if (!listingIsCurrent(item, resolved.now)) {
      continue
    }
    const index = listingIndex(item)
    if (!textOrCompanyQueryMatches(item, index, resolved.query, resolved.exactCompanies)) {
      continue
    }

    const matchWho = whoMatches(index.who, resolved.who)
    const matchSeason = resolved.season === 'all' || item.season === resolved.season
    const matchPosted = postedMatches(item, resolved.posted, resolved.now)
    const matchStatus = resolved.status !== 'open' || !item.closed
    const matchTracks = trackMatches(item, index.family, resolved.tracks, resolved.families)
    const matchLocations = locationMatches(index.locations, resolved.locations)
    const matchCompanies = companyMatches(item.company, resolved.companies)
    const matchSources = sourceMatches(index.source, resolved.sources)
    const matchVisa = visaMatches(item, resolved.visa)
    const matchPay = payMatches(item, resolved.pay, resolved.minHourly)
    const exceptWho = matchSeason && matchPosted && matchStatus && matchTracks && matchLocations && matchCompanies && matchSources && matchVisa && matchPay
    const exceptSeason = matchWho && matchPosted && matchStatus && matchTracks && matchLocations && matchCompanies && matchSources && matchVisa && matchPay
    const exceptPosted = matchWho && matchSeason && matchStatus && matchTracks && matchLocations && matchCompanies && matchSources && matchVisa && matchPay
    const exceptVisa = matchWho && matchSeason && matchPosted && matchStatus && matchTracks && matchLocations && matchCompanies && matchSources && matchPay
    const exceptStatus = matchWho && matchSeason && matchPosted && matchTracks && matchLocations && matchCompanies && matchSources && matchVisa && matchPay
    const exceptPay = matchWho && matchSeason && matchPosted && matchStatus && matchTracks && matchLocations && matchCompanies && matchSources && matchVisa
    const exceptTracks = matchWho && matchSeason && matchPosted && matchStatus && matchLocations && matchCompanies && matchSources && matchVisa && matchPay
    const exceptLocations = matchWho && matchSeason && matchPosted && matchStatus && matchTracks && matchCompanies && matchSources && matchVisa && matchPay
    const exceptCompanies = matchWho && matchSeason && matchPosted && matchStatus && matchTracks && matchLocations && matchSources && matchVisa && matchPay
    const exceptSources = matchWho && matchSeason && matchPosted && matchStatus && matchTracks && matchLocations && matchCompanies && matchVisa && matchPay

    if (exceptWho) {
      who.all += 1
      if (index.who.includes('undergrad')) {
        who.undergrad += 1
      }
      if (index.who.includes('grad')) {
        who.grad += 1
      }
    }
    if (exceptSeason) {
      season.all += 1
      season[item.season] += 1
    }
    if (exceptPosted) {
      posted.all += 1
      const age = listingPostedAgeDays(item, resolved.now)
      if (age !== null) {
        if (age <= POSTED_WITHIN_DAYS['1d']) {
          posted['1d'] += 1
        }
        if (age <= POSTED_WITHIN_DAYS['3d']) {
          posted['3d'] += 1
        }
        if (age <= POSTED_WITHIN_DAYS['7d']) {
          posted['7d'] += 1
        }
        if (age <= POSTED_WITHIN_DAYS['30d']) {
          posted['30d'] += 1
        }
      }
    }
    if (exceptVisa) {
      visa.all += 1
      if (item.usCitizen) {
        visa.citizen += 1
      }
      if (item.usCitizen || item.noSponsorship) {
        visa.auth += 1
      }
      if (!item.usCitizen && !item.noSponsorship) {
        visa.open += 1
      }
    }
    if (exceptStatus) {
      status.all += 1
      if (!item.closed) {
        status.open += 1
      }
    }
    if (exceptPay) {
      pay.all += 1
      if (listingHasPay(item)) {
        pay.disclosed += 1
      }
      minHourly.all += 1
      const hourly = listingHourlyMin(item)
      if (hourly != null) {
        if (hourly >= 40) {
          minHourly['40'] += 1
        }
        if (hourly >= 50) {
          minHourly['50'] += 1
        }
        if (hourly >= 60) {
          minHourly['60'] += 1
        }
      }
    }
    if (exceptTracks) {
      families[index.family] += 1
      tracks[item.track] = (tracks[item.track] ?? 0) + 1
    }
    if (exceptLocations) {
      for (const id of index.locations) {
        locations[id] += 1
      }
    }
    if (exceptCompanies) {
      companies[item.company] = (companies[item.company] ?? 0) + 1
    }
    if (exceptSources) {
      sources[index.source] += 1
    }
  }

  return { who, season, posted, visa, status, pay, minHourly, families, tracks, locations, companies, sources }
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

export function listingSource(item: Internship): { id: SourceId, label: string } {
  if (item.id.startsWith('usajobs-') || /usajobs\.gov/i.test(item.url)) {
    return { id: 'usajobs', label: SOURCE_LABEL.usajobs }
  }
  if (item.id.startsWith('yc-') || /workatastartup|ycombinator\.com/i.test(item.url)) {
    return { id: 'yc', label: SOURCE_LABEL.yc }
  }
  if (item.id.startsWith('idealist-') || /idealist\.org/i.test(item.url)) {
    return { id: 'idealist', label: SOURCE_LABEL.idealist }
  }
  if (
    item.id.startsWith('biotech-')
    || item.id.startsWith('company-')
    || item.id.startsWith('un-')
    || item.id.startsWith('unv-')
    || /myworkdayjobs\.com|metacareers\.com|amazon\.jobs|google\.com\/about\/careers|careers\.ford\.com|careers\.rivian\.com|careers\.un\.org|reliefweb\.int|app\.unv\.org/i.test(item.url)
  ) {
    return { id: 'ats', label: SOURCE_LABEL.ats }
  }
  return { id: 'github', label: SOURCE_LABEL.github }
}

const DEADLINE_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** Keep a stored YYYY-MM-DD only when it is a real date. Never invent one. */
export function isoDeadline(value?: string): string {
  const match = String(value || '').trim().match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!match) {
    return ''
  }
  const year = Number(match[1])
  const month = Number(match[2]) - 1
  const day = Number(match[3])
  if (month < 0 || month > 11 || day < 1 || day > 31) {
    return ''
  }
  return `${match[1]}-${match[2]}-${match[3]}`
}

const POSTED_MONTHS: Record<string, number> = Object.fromEntries(
  DEADLINE_MONTHS.map((label, index) => [label.toLowerCase(), index]),
)

function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

/** ISO datetime implied by a frozen posted label, anchored to `asOf` (usually scrape time). */
export function postedAtFromLabel(posted: string, asOf: Date = new Date()): string {
  const value = String(posted || '').trim().toLowerCase()
  if (!value || value === 'date unknown') {
    return ''
  }
  const now = asOf.getTime()
  if (value === 'today' || value === 'just posted') {
    return new Date(startOfLocalDay(asOf)).toISOString()
  }
  if (value === 'yesterday') {
    return new Date(startOfLocalDay(asOf) - 86_400_000).toISOString()
  }
  if (value === 'recently') {
    return new Date(now - 2 * 86_400_000).toISOString()
  }
  if (/^30\+\s*days?\s*ago$/.test(value)) {
    return new Date(now - 31 * 86_400_000).toISOString()
  }

  const relative = value.match(/^(\d+)\s*(mo|h|d|w|m)$/)
  if (relative) {
    const amount = Number(relative[1])
    const unit = relative[2]
    const ms = unit === 'm'
      ? amount * 60_000
      : unit === 'h'
        ? amount * 3_600_000
        : unit === 'd'
          ? amount * 86_400_000
          : unit === 'w'
            ? amount * 7 * 86_400_000
            : unit === 'mo'
              ? amount * 30 * 86_400_000
              : 0
    return ms ? new Date(now - ms).toISOString() : ''
  }

  const longDate = Date.parse(String(posted || '').trim())
  if (Number.isFinite(longDate) && /[0-9]{4}/.test(posted)) {
    return new Date(longDate).toISOString()
  }

  const calendar = value.match(/^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{1,2})$/)
  if (calendar) {
    const month = POSTED_MONTHS[calendar[1].slice(0, 3)]
    const day = Number(calendar[2])
    if (month === undefined || day < 1 || day > 31) {
      return ''
    }
    const today = startOfLocalDay(asOf)
    let year = asOf.getFullYear()
    let time = new Date(year, month, day).getTime()
    if (time > today + 86_400_000) {
      year -= 1
      time = new Date(year, month, day).getTime()
    }
    return new Date(time).toISOString()
  }

  return ''
}

function postedAtMs(postedAt?: string): number | null {
  const time = Date.parse(String(postedAt || ''))
  return Number.isFinite(time) ? time : null
}

/** Milliseconds since the listing was posted. Null when the posted string cannot be read. */
export function postedAgeMs(posted: string, asOf: Date = new Date()): number | null {
  const iso = postedAtFromLabel(posted, asOf)
  if (!iso) {
    return null
  }
  return asOf.getTime() - Date.parse(iso)
}

/** Prefer a stored postedAt, then fall back to parsing the frozen label. */
export function listingPostedAgeMs(item: Pick<Internship, 'posted' | 'postedAt'>, asOf: Date = new Date()): number | null {
  const stored = postedAtMs(item.postedAt)
  if (stored !== null) {
    return asOf.getTime() - stored
  }
  return postedAgeMs(item.posted, asOf)
}

/** Live compact label: 13m, 2h, 3d, then Aug 21. */
export function formatPostedAgo(item: Pick<Internship, 'posted' | 'postedAt'>, asOf: Date = new Date()): string {
  const ms = listingPostedAgeMs(item, asOf)
  if (ms === null) {
    return item.posted || ''
  }
  const age = Math.max(0, ms)
  const minutes = Math.floor(age / 60_000)
  if (minutes < 60) {
    return `${Math.max(1, minutes)}m`
  }
  const hours = Math.floor(age / 3_600_000)
  if (hours < 24) {
    return `${hours}h`
  }
  const days = Math.floor(age / 86_400_000)
  if (days < 14) {
    return `${days}d`
  }
  const date = new Date(asOf.getTime() - age)
  const label = `${DEADLINE_MONTHS[date.getMonth()]} ${date.getDate()}`
  return date.getFullYear() !== asOf.getFullYear() ? `${label}, ${date.getFullYear()}` : label
}

/** Days since the listing was posted. Null when the posted string cannot be read. */
export function postedAgeDays(posted: string, asOf: Date = new Date()): number | null {
  const ms = postedAgeMs(posted, asOf)
  if (ms === null) {
    return null
  }
  return Math.floor(ms / 86_400_000)
}

export function listingPostedAgeDays(item: Pick<Internship, 'posted' | 'postedAt'>, asOf: Date = new Date()): number | null {
  const ms = listingPostedAgeMs(item, asOf)
  if (ms === null) {
    return null
  }
  return Math.floor(ms / 86_400_000)
}

/** True when posted age is unknown or within the browse window. */
export function listingIsCurrent(item: Pick<Internship, 'posted' | 'postedAt'>, asOf: Date = new Date()) {
  const age = listingPostedAgeDays(item, asOf)
  return age === null || age <= MAX_LISTING_AGE_DAYS
}

export function currentListings(listings: Internship[], asOf: Date = new Date()) {
  return listings.filter((item) => listingIsCurrent(item, asOf))
}

function scrapeAsOf(scrapedAt?: string) {
  const raw = String(scrapedAt || '').trim()
  if (!raw) {
    return new Date()
  }
  const date = new Date(raw.length === 10 ? `${raw}T12:00:00` : raw)
  return Number.isNaN(date.getTime()) ? new Date() : date
}

/** Fill postedAt from a frozen label when a snapshot predates stored timestamps. */
export function hydratePostedAt(listings: Internship[], scrapedAt?: string): Internship[] {
  const asOf = scrapeAsOf(scrapedAt)
  return listings.map((item) => {
    if (item.postedAt && postedAtMs(item.postedAt) !== null) {
      return item
    }
    const postedAt = postedAtFromLabel(item.posted, asOf)
    return postedAt ? { ...item, postedAt } : item
  })
}

export function sortListingsByPosted(listings: Internship[], sort: PostedSort = 'none', asOf?: Date) {
  if (sort === 'none') {
    return listings
  }
  const now = asOf ?? new Date()
  const dir = sort === 'newest' ? 1 : -1
  return [...listings].sort((a, b) => {
    const ageA = listingPostedAgeMs(a, now)
    const ageB = listingPostedAgeMs(b, now)
    if (ageA === null && ageB === null) {
      return 0
    }
    if (ageA === null) {
      return 1
    }
    if (ageB === null) {
      return -1
    }
    return (ageA - ageB) * dir
  })
}

/** Format a stored YYYY-MM-DD application due date for the list. */
export function formatDeadline(iso: string): string {
  const value = isoDeadline(iso)
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) {
    return ''
  }
  const year = Number(match[1])
  const month = Number(match[2]) - 1
  const day = Number(match[3])
  const label = `${DEADLINE_MONTHS[month]} ${day}`
  return year !== new Date().getUTCFullYear() ? `${label}, ${year}` : label
}

export function listingSummary(item: Internship): string {
  const stored = String(item.summary || '').replace(/\s+/g, ' ').trim()
  if (stored) {
    return stored
  }
  const field = TRACK_LABEL[item.track]
  const season = seasonLabelFor(item)
  const place = item.location && !/^multiple locations$/i.test(item.location)
    ? ` in ${item.location}`
    : ''
  const due = formatDeadline(item.deadline || '')
  const when = due ? ` Apply by ${due}.` : ''
  return `${field} internship at ${item.company} for ${season}${place}.${when}`
}

/** True when payText is already a short, scannable money line (not scrape leftover). */
function isCleanPayText(text: string): boolean {
  if (!text || text.length > 56 || !/\$/.test(text)) {
    return false
  }
  if (/benefits|certif|description|withhol|unsolicited|navailable|trillion|network volume|#li-/i.test(text)) {
    return false
  }
  // Mid-sentence scrape fragments like "n, certifications, etc. $37,440…"
  if (/^[a-z]{1,4}[, ]/.test(text)) {
    return false
  }
  return true
}

function formatPayFromNumbers(item: Internship): string {
  if (item.payMin == null || !Number.isFinite(item.payMin)) {
    return ''
  }
  const min = item.payMin
  const max = item.payMax != null && Number.isFinite(item.payMax) ? item.payMax : min
  if (min <= 0 && max <= 0) {
    return ''
  }
  // Reject obvious false positives from body copy (e.g. "$1.5 trillion").
  if (item.payUnit === 'year' && max < 1000) {
    return ''
  }
  if (item.payUnit === 'hour' && max > 500) {
    return ''
  }
  const suffix = item.payUnit === 'hour' ? '/hr' : item.payUnit === 'month' ? '/mo' : item.payUnit === 'year' ? '/yr' : ''
  const fmt = (value: number) => {
    if (Number.isInteger(value)) {
      return value.toLocaleString('en-US')
    }
    return String(Math.round(value * 100) / 100)
  }
  if (max !== min) {
    return `$${fmt(min)}–$${fmt(max)}${suffix}`
  }
  return `$${fmt(min)}${suffix}`
}

export function listingPayLine(item: Internship): string {
  const stored = String(item.payText || '').replace(/\s+/g, ' ').trim()
  if (isCleanPayText(stored)) {
    return stored
  }
  return formatPayFromNumbers(item)
}

function maxEdits(len: number) {
  // Short tokens are too ambiguous for typos (uber≈user, meta≈mesa).
  if (len < 5) {
    return 0
  }
  return 1
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

/** "ama" → amazon, "seatt" → seattle. Skip java ⊂ javascript. */
function prefixMatches(word: string, token: string) {
  if (!word.startsWith(token) || word === token) {
    return false
  }
  if (token === 'java' && word.startsWith('javascript')) {
    return false
  }
  const rest = word.length - token.length
  // Short stems are for exploration; length-4 only allows a tiny finish (meta↛metals).
  if (token.length <= 3) {
    return true
  }
  if (token.length === 4) {
    return rest <= 1
  }
  return true
}

function fuzzyMatches(word: string, token: string) {
  if (word === token) {
    return true
  }
  const edits = maxEdits(token.length)
  if (!edits) {
    return false
  }
  // Typos: share the first two letters; don't treat "spacex" as a typo of "space".
  if (word[0] !== token[0] || word[1] !== token[1]) {
    return false
  }
  if (token.startsWith(word)) {
    return false
  }
  return withinEdits(token, word, edits)
}

export function queryMatches(haystack: string, query: string) {
  const q = query.trim().toLowerCase()
  if (!q) {
    return true
  }
  const lower = normalizeSearchText(haystack)
  const words = tokens(lower)
  return queryMatchesIndexed({
    haystack: lower,
    words,
    exploreWords: words,
    who: [],
    locations: [],
    family: 'other',
    source: 'github',
  }, q)
}

export function filterListings(listings: Internship[], options: Filters = {}, asOf?: Date) {
  const resolved = resolveListFilters(listings, options, asOf)

  return listings.filter((item) => listingPasses(item, listingIndex(item), resolved))
}

export function sidebarFilterCount(options: Filters = {}) {
  let count = 0
  if (options.who && options.who !== 'all') {
    count += 1
  }
  if (options.season && options.season !== 'all') {
    count += 1
  }
  if (options.posted && options.posted !== 'all') {
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
  if (options.sources?.length) {
    count += 1
  }
  if (options.visa && options.visa !== 'all') {
    count += 1
  }
  if (options.status && options.status !== 'open') {
    count += 1
  }
  if (options.pay && options.pay !== 'all') {
    count += 1
  }
  if (options.minHourly && options.minHourly > 0) {
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
