#!/usr/bin/env node
/**
 * Snapshot public company internship lists:
 *   - vanshb03/Summer2027-Internships (tech / SWE / data)
 *   - SimplifyJobs/Summer2027-Internships (hardware)
 *   - jobright-ai/2026-Engineer-Internship (mechanical, electrical, civil, etc.)
 *   - zapplyjobs/Internships-2027 (business, health, science, and more)
 *   - USAJobs student / Pathways internships (health, policy, science)
 *   - Biotech / pharma Workday career boards (Amgen, Illumina, Dexcom, …)
 *   - Y Combinator internships page (ycombinator.com/internships)
 *     plus intern rows on the public Work at a Startup jobs board
 *   - Idealist U.S. nonprofit internships (public search + listing pages)
 *   - Official company boards (Greenhouse, Ashby, Lever, Workday) plus
 *     Meta, Google, and Amazon career search for large employers the
 *     GitHub lists often miss
 *
 * Usage (repo root):
 *   npm run scrape
 *   node scripts/scrape-internships.mjs --reclassify-only
 *   node scripts/scrape-internships.mjs --enrich-titles-only
 *   node scripts/scrape-internships.mjs --enrich-summaries
 *   node scripts/scrape-internships.mjs --enrich-summaries --force
 *   node scripts/scrape-internships.mjs --check-links
 *   node scripts/scrape-internships.mjs --company-only
 *
 * USAJobs needs USAJOBS_API_KEY + USAJOBS_EMAIL (https://developer.usajobs.gov/).
 * If those are missing, GitHub + biotech snapshots still refresh.
 *
 * Stores company, role, location, apply URL, posted date,
 * a short posting summary, searchable skill mentions (Python, Java, Chinese…),
 * and closed / citizenship / work-authorization flags when the source has them.
 * Does not clone Handshake or invent postings.
 * Truncated Zapply role labels (ending in "...") are expanded from apply-page
 * og:title when the listing URL allows it.
 */
import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isSpecificPostingUrl } from './apply-url.mjs'
import { pruneDeadInternshipListings } from './check-internship-links.mjs'
import { enrichListingSummaries, postingFields } from './job-summary.mjs'
import { loadEnv } from './load-env.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'app/data/listings.json')
const UA = 'InternshipsScraper/1.0'
const BROWSER_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'

const SOURCE = {
  vansh: 'https://github.com/vanshb03/Summer2027-Internships',
  vanshSummer: 'https://raw.githubusercontent.com/vanshb03/Summer2027-Internships/dev/README.md',
  vanshOffseason: 'https://raw.githubusercontent.com/vanshb03/Summer2027-Internships/dev/OFFSEASON_README.md',
  simplify: 'https://github.com/SimplifyJobs/Summer2027-Internships',
  simplifyListings: 'https://raw.githubusercontent.com/SimplifyJobs/Summer2027-Internships/dev/.github/scripts/listings.json',
  jobright: 'https://github.com/jobright-ai/2026-Engineer-Internship',
  jobrightReadme: 'https://raw.githubusercontent.com/jobright-ai/2026-Engineer-Internship/master/README.md',
  zapply: 'https://github.com/zapplyjobs/Internships-2027',
  zapplyReadme: 'https://raw.githubusercontent.com/zapplyjobs/Internships-2027/main/README.md',
  usajobs: 'https://www.usajobs.gov/',
  yc: 'https://www.ycombinator.com/internships',
  ycJobs: 'https://www.workatastartup.com/jobs',
  idealist: 'https://www.idealist.org/en/internships',
}

const TRACKS = [
  { id: 'clinical', test: /clinical research|clinical intern|clinical affairs|clinical ops|clinical operations|patient care|\bscribe\b|hospital intern|nursing intern|allied health|health research|medical intern(?!al)|medical education|\bpsychology\b|psycholog(?:y|ical) intern|mental health intern|behavioral health intern|counseling intern/i },
  { id: 'pharma', test: /pharmacolog|pharmaceutical|drug discovery|medicinal chem|formulation|biologics|\bvaccine\b|clinical pharmacology|process development|\bcmc\b|immunolog|proteomic|\bmrna\b|pharma technical/i },
  { id: 'public-health', test: /public health|epidemiolog|health policy|community health|population health|global health/i },
  { id: 'science', test: /chemist(?!ry engineer)|material scientist|\bbiology\b|\bbiologist\b|molecular biolog|biochem|microbiolog|neuroscie|wet[- ]?lab|life sciences?|application scientist|(?:chem(?:istry)?|biology|physics|life science) lab|materials science|analytical chem|(?:chemistry|biology|physics|life science) intern|environmental affairs|r&d process|research & development|research and development/i },
  { id: 'finance', test: /finance intern|\bfinance\b|financial|accounting|\baccounts\b|investment|invest(?:ment)?s?\b|audit intern|\baudit\b|tax intern|actuarial|wealth management|corporate risk|risk summer|risk intern|far program|alternatives inv|scholars business|\bfp&a\b|venture capital|fixed income|\bteller\b/i },
  { id: 'consulting', test: /consulting|\bconsultant\b|strategy intern|strategy consulting|deployment strategist|strategy & transformation|strategic planning/i },
  { id: 'sales', test: /sales intern|technical sales|client solutions|account (?:manager|executive|development)|business development|corporate part|gtm\b|go[- ]to[- ]market|customer success|sales prospect|\bbdr\b|sales academy|sales analyst|market development|\bsales\b/i },
  { id: 'marketing', test: /marketing|communications intern|internship - communications|communications and community|brand intern|\bbrand\b|growth intern|employer brand|market research|\bgrowth\b|policy comms/i },
  { id: 'retail', test: /retail store|store (?:executive|leadership|management)|store intern/i },
  { id: 'hr', test: /human resources?|\bhr intern|people intern|people operations|recruiting intern/i },
  { id: 'entertainment', test: /live entertainment|attractions|costume development|art studio intern|publicity intern|office of the president intern|stylized photography|television intern/i },
  { id: 'ops', test: /operations intern|intern[- –]+operations|supply chain|human resources|\bhr intern|recruiting|procurement|purchasing intern|business operations|logistics|service transformation|customer (?:ops|operations|experience)|corporate summer|corporate internship|operational excellence|tech ops|academy admin|production intern|operations program|global workplace|\bcustomer\b|field service|lifecycle services|operation(?:s)? manager|distribution center|inventory analyst|control room|client services|product support|integrated product support|advanced operations|operations planning|\behs\b|environment, health|health, and safety|government operations|\bcoo intern|investor relations|startup operations/i },
  { id: 'legal', test: /legal intern|legal research|legal fellowship|legal summer|law student|law clerk|general legal|\blegal\b/i },
  { id: 'education', test: /teaching intern|dean intern|explorer program|medical education|education intern|student trainee \(training/i },
  { id: 'policy', test: /policy intern|advocacy|public policy|government relations|foreign service|legislative intern|regulatory affairs|political science intern|\bcapitol hill\b|policy comms|regulatory submission|policy fellowship|climate justice|policy & governance/i },
  { id: 'gov', test: /government intern|government funded|legislative|congressional|public affairs intern|pathways intern|student trainee|police department/i },
  { id: 'nonprofit', test: /nonprofit|non-profit|\bngo\b|community outreach|community engagement|community organizing|life\.church|campus internship|development internship|field intern|campaign intern|member services|organizing intern|sanctuary intern|biodynamic|farming intern|respite provider/i },
  { id: 'architecture', test: /naval architect|urban (?:design|planning)|drafting student|facilities engineering|global real estate|property management|architect co-op|architect intern/i },
  { id: 'design', test: /\bux\b|\bui\b|graphic design|product design|industrial design|visual design|game design|level design|instructional design|show set|animator|animation|rigging|special effects|localization specialist|creative design|design integration|technical design|apparel development/i },
  { id: 'media', test: /journalis|news intern|social media|video intern|content intern|broadcast|creative video|print production|wdi\b|video &|multimedia intern/i },
  { id: 'writing', test: /\bwriter\b|editor intern|editorial intern|copywriter|technical writer/i },
  { id: 'ml', test: /machine learning|artificial intelligence|\bai\/ml\b|\bllm\b|\bgenai\b|\bai\b|\bml\b|deep learning|applied ml|research scientist|reinforcement learn|generative|3d vision|user modeling|autonomous driving|autonomous vehicles|interactive driving|human interactive|virtual network|large language models|graphics and simulation|agent development|applied science/i },
  { id: 'quant', test: /quant|trading|trader|market(s)? intern|fundamental research|research analyst/i },
  { id: 'pm', test: /product manager|product management|\bpm\b|product intern(?!ship program)|product analyst|product development internship|technical project manager|product strategy|program management|project management|business management/i },
  { id: 'data', test: /data scientist|data engineer|data analyst|data science|data scie|\bdata intern\b|analytics|data platform|business intelligence|business analyst|engineering and data|platform intelligence|fall data|statistical programming|data support|yield enhancement, data/i },
  { id: 'security', test: /security|cyber|\bnsa\b|penetration test/i },
  { id: 'hardware', test: /hardware|fpga|asic|embedded|firmware|circuits|circuit analysis|\bcircuit\b|analog|rtl\b|silicon|chip|vlsi|semiconductor|design verification|\bdv intern\b|\bdft\b|design for test|\bpd intern\b|physical design|p&r|mixed signal|rfic|hbm|mems|gpu intern|layout design|image sensor|wafer|characterization|verification intern|validation intern|\bvalidation\b|\bverification\b|system architecture|computer architecture|design architecture|digital physical|digital intern|digital circ|device build|inference intern|\bdram\b|\beuv\b|lithograph|nanofabricat|\bsige\b|photomask|yield enhancement|yield technology|mask technology|optical test|radio systems|spectrum dominance|intelligent sensing|module engineering|fab equipment|metrology|digital ip|device modell|technology development intern/i },
  { id: 'mechanical', test: /mechanical|mechatronic|turbomachin|gas turbine|manufacturing engineer|manufacturing controls|industrial engineer|injection molding|plastics engineer|thermal systems|cnc\b|prototyping shop|maintenance,\s*repair|mro\b|actuation|design release engineer|apparel materials/i },
  { id: 'electrical', test: /electrical|electronics|\bee intern|\bece intern|power systems|controls engineer|\brf\b|photonic|optical engineer|electro-optical|telematics/i },
  { id: 'civil', test: /civil|structural|geotech|water resources|\bbridge\b|transportation intern|roadway|transportation engineering|wastewater/i },
  { id: 'chemical', test: /chemical engineer|materials engineer|materials intern|process engineer|nanoengineer|nano engineer|metallurg/i },
  { id: 'biomedical', test: /biomed|bio[- ]?med|bioengineer|medtech|medical device|hip\/?knee/i },
  { id: 'aerospace', test: /aerospace|aeronautic|avionics|cabin engineering|flight hardware|flight test|\bgnc\b/i },
  { id: 'robotics', test: /robotic|automation internship|automation intern/i },
  { id: 'swe', test: /software|swe\b|sde\b|\bsdet\b|frontend|front-end|backend|back-end|full[-\s]?stack|programmer|developer|platform engineer|infrastructure|devops|sre\b|technology intern|application development|member of technical staff|forward deployed|tools and compilers|supercomputing|compilers|inference optimization|\bit\b|quality assurance|\bqa\b|risk technology|technology product|\bcis\/cs\b|\bcs internship\b|desktop systems|system(?:s)? administrator|performance tools|pipeline and test|systems performance|ip design/i },
  { id: 'engineering', test: /engineer(ing)? intern|intern[\s-]+engineering|engineer(ing)?(?:\s+\w+){0,3}\s+co-?op|nuclear|environmental en|welding|reliability|systems engineer|test engineer|application engineer|quality intern|\bquality\b|manufacturing\/?quality|product engineering|equipment engineer|engineering technician|lab technician|lab intern|field service technician|packaging|innovations team|design build|mfg test|processing intern|methods process|technical direction|design engineering|air mi engineering|ph\.?d\.? engineering/i },
]

const STEM_INCLUDE = /mechanical|electrical|\bee\b|\bece\b|civil|structural|chemical|biomed|bio[- ]?med|bioengineer|aerospace|aeronautic|industrial engineer|manufacturing engineer|materials engineer|environmental engineer|nuclear|robotic|hardware|analog|fpga|asic|embedded|firmware|\brf\b|geotech|water resources|turbomachin|welding|power systems|controls engineer|plastics|injection molding|product engineering|gas turbine|cabin engineering|engineering intern|engineer intern|engineering co-?op|co-?op.{0,24}engineer|process engineer|equipment engineer|reliability|systems engineer|test engineer|flight|avionics|mechatronic|optical engineer|photonic|nanoengineer|nano engineer|marine engineer|ocean engineer|metallurg|medtech|medical device/i

const STEM_EXCLUDE = /sch[uü]ler|skillbridge|procurement|software engineer|software development|\bswe\b|\bsde\b|frontend|backend|full[-\s]?stack|machine learning|\bai\/ml\b|\bai engineer|data scientist|data engineer|product manager|business analyst|it analyst|gtm |scholar|safety intern|plant intern|supply chain|sales intern|devops|developer intern|application development|cyber security/i

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function clean(text) {
  return String(text || '')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#160;/g, ' ')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/\s+/g, ' ')
    .trim()
}

function stripTags(html) {
  return clean(String(html || '').replace(/<[^>]+>/g, ' '))
}

function parseMdLink(raw) {
  const match = String(raw || '').match(/\[([^\]]+)\]\(([^)]+)\)/)
  if (!match) {
    return { text: stripTags(raw), href: '' }
  }
  return { text: stripTags(match[1]), href: match[2].trim() }
}

function parseLocation(raw) {
  const withDetails = String(raw || '').replace(
    /<details>[\s\S]*?<summary>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/gi,
    (_, summary, body) => `${stripTags(summary)} ${stripTags(body)}`,
  )
  return stripTags(withDetails.replace(/<br\s*\/?>/gi, ', '))
    .replace(/\*\*/g, '')
    .replace(/\s+,/g, ',')
    .replace(/,\s*,/g, ', ')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractHref(raw) {
  const md = parseMdLink(raw)
  if (/^https?:\/\//i.test(md.href)) {
    return md.href
  }
  const match = String(raw || '').match(/href="([^"]+)"/i)
  const href = match?.[1]?.trim() || ''
  if (!/^https?:\/\//i.test(href)) {
    return ''
  }
  return href
}

function inferTrack(role) {
  for (const track of TRACKS) {
    if (track.test.test(role)) {
      return track.id
    }
  }
  // Tech / PhD research titles without a science discipline → AI/ML, not generic Science.
  if (/phd.? research|research intern(?:,)?\s*phd|research(?:er)? intern/i.test(role)
    && !/biol|chemist|chemic|physics|physical science|wet[- ]?lab|life science|material|environment|geolog|ocean|marine|clinic|health|epidemiolog|medical/i.test(role)
  ) {
    return 'ml'
  }
  if (
    /research(?:er)? intern|scientist intern|research co-?op|phd.? research|fundamental research|application scientist/i.test(role)
    && !/software|\bai\b|\bml\b|machine learning|data scientist|vision|network|user modeling|reinforcement|generative|autonomous|compiler|virtual network/i.test(role)
  ) {
    return 'science'
  }
  if (/research(?:er)? intern|scientist intern|research co-?op|phd.? research/i.test(role)) {
    return 'ml'
  }
  if (/design intern|design and development/i.test(role) && !/engineer|mems|hbm|architecture|verification/i.test(role)) {
    return 'design'
  }
  return 'other'
}

function inferSeason(role, terms = []) {
  const hay = [role, ...terms].join(' ')
  if (/fall|autumn|winter|spring|off[-\s]?season|off[-\s]?cycle|co-?op/i.test(hay) && !/summer/i.test(hay)) {
    return 'offseason'
  }
  return 'summer'
}

function slugPart(value) {
  return clean(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48) || 'role'
}

function listingKey(item) {
  return [slugPart(item.company), slugPart(item.role), slugPart(item.location).slice(0, 40)].join('|')
}

function isoFromUnix(unix) {
  const value = Number(unix)
  if (!Number.isFinite(value) || value <= 0) {
    return ''
  }
  const ms = value > 1e12 ? value : value * 1000
  const date = new Date(ms)
  return Number.isNaN(date.getTime()) ? '' : date.toISOString()
}

function isoFromDateValue(value) {
  if (typeof value === 'number') {
    return isoFromUnix(value)
  }
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toISOString()
}

function formatPosted(unix) {
  const iso = isoFromUnix(unix)
  if (!iso) {
    return ''
  }
  const date = new Date(iso)
  return `${MONTHS[date.getUTCMonth()]} ${date.getUTCDate()}`
}

function postedAtFromLabel(posted, asOf = new Date()) {
  const value = String(posted || '').trim().toLowerCase()
  if (!value || value === 'date unknown') {
    return ''
  }
  const now = asOf.getTime()
  if (value === 'today' || value === 'just posted') {
    return new Date(asOf.getFullYear(), asOf.getMonth(), asOf.getDate()).toISOString()
  }
  if (value === 'yesterday') {
    return new Date(asOf.getFullYear(), asOf.getMonth(), asOf.getDate() - 1).toISOString()
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
  if (/[0-9]{4}/.test(posted)) {
    return isoFromDateValue(posted)
  }
  const calendar = value.match(/^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{1,2})$/)
  if (calendar) {
    const month = MONTHS.findIndex((label) => label.toLowerCase() === calendar[1].slice(0, 3))
    const day = Number(calendar[2])
    if (month < 0 || day < 1 || day > 31) {
      return ''
    }
    const today = new Date(asOf.getFullYear(), asOf.getMonth(), asOf.getDate()).getTime()
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

function withPostedAt(listings, asOf = new Date()) {
  return listings.map((item) => {
    if (item.postedAt && !Number.isNaN(Date.parse(item.postedAt))) {
      return item
    }
    const postedAt = postedAtFromLabel(item.posted, asOf)
    return postedAt ? { ...item, postedAt } : item
  })
}

function isOfficialUrl(url) {
  return Boolean(url)
    && /^https?:\/\//i.test(url)
    && !/jobright\.ai/i.test(url)
    && !/simplify\.jobs/i.test(url)
    && !/handshake\.com|linkedin\.com|indeed\.com/i.test(url)
}

function normalizeUrl(url) {
  const value = String(url || '').trim()
  if (/^http:\/\//i.test(value)) {
    return `https://${value.slice(7)}`
  }
  return value
}

function isInternshipRole(role) {
  return /\bintern(?:ship|ships)?\b|\bco-?op\b/i.test(role)
}

function isStemEngineeringRole(role) {
  if (!role || !isInternshipRole(role) || STEM_EXCLUDE.test(role)) {
    return false
  }
  return STEM_INCLUDE.test(role)
}

function isGenericInternRole(role) {
  const cleaned = String(role || '')
    .replace(/\b(summer|fall|winter|spring|autumn|paid|unpaid|2026|2027|2028)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return /^(intern(?:ship)?s?|co-?ops?|early career intern|internship opportunity|internships?\s*[-–]?\s*all disciplines)$/i.test(cleaned)
}

function isDroppedInternshipRole(role) {
  return /high[-\s]?school|skillbridge|sch[uü]ler|\bpharmacy intern\b|pharmacy students?|veteran skillbridge/i.test(role)
}

const FOREIGN_ONLY = /\b(germany|indonesia|mexico|saudi|china|beijing|shanghai|india|japan|korea|singapore|australia|france|brazil|tijuana|mexicali|al khobar|united kingdom|\buk\b|london,\s*uk|amsterdam,\s*nh|italy|italia|ireland|spain|netherlands|sweden|denmark|poland|belgium|switzerland|malaysia|czechia|czech republic|panama|hong kong|warsaw|jakarta|kuala lumpur|penang|munich)\b|\b(mx|id|sa)\b/i

function isKeptLocation(location) {
  const value = String(location || '')
  if (!value) {
    return false
  }
  if (/\bremote\b|united states|\busa\b|\bu\.s\./i.test(value)) {
    return true
  }
  if (FOREIGN_ONLY.test(value) && !/\b(united states|usa|canada|remote)\b/i.test(value)) {
    return false
  }
  return true
}

function parseRelativeAgeDays(posted) {
  const value = String(posted || '').trim().toLowerCase()
  if (!value || value === 'date unknown' || value === 'recently') {
    return null
  }
  const match = value.match(/^(\d+)\s*(mo|h|d|w|m)$/)
  if (!match) {
    return null
  }
  const amount = Number(match[1])
  const unit = match[2]
  if (unit === 'h' || unit === 'm') {
    return 0
  }
  if (unit === 'd') {
    return amount
  }
  if (unit === 'w') {
    return amount * 7
  }
  if (unit === 'mo') {
    return amount * 30
  }
  return null
}

function formatZapplyPosted(raw) {
  const value = stripTags(raw)
  if (!value || /^date unknown$/i.test(value)) {
    return ''
  }
  if (/^recently$/i.test(value)) {
    return 'Recently'
  }
  return value
}

function parseVanshTable(markdown, season) {
  const start = markdown.indexOf('<!-- Please leave a one line gap between this and the table TABLE_START')
  const table = start >= 0 ? markdown.slice(start) : markdown
  const rows = table.split('\n').filter((line) => /^\|/.test(line))
  const listings = []
  let company = ''

  for (const line of rows) {
    const cells = line.split('|').slice(1, -1).map((cell) => cell.trim())
    if (cells.length < 5) {
      continue
    }
    const [companyCell, roleCell, locationCell, applyCell, postedCell] = cells
    if (/^company$/i.test(companyCell) || /^-+$/.test(companyCell.replace(/\s/g, ''))) {
      continue
    }

    if (companyCell && companyCell !== '↳') {
      company = stripTags(companyCell)
    }
    if (!company) {
      continue
    }

    const roleRaw = roleCell || ''
    const applyRaw = applyCell || ''
    const closed = /🔒/.test(roleRaw) || /🔒/.test(applyRaw)
    const role = stripTags(roleRaw).replace(/[🔒🛂🇺🇸]/g, '').replace(/\s+/g, ' ').trim()
    const url = normalizeUrl(extractHref(applyRaw))
    if (!role) {
      continue
    }

    listings.push({
      id: `${season}-${slugPart(company)}-${slugPart(role)}-${slugPart(postedCell)}-${listings.length}`,
      company,
      role,
      location: parseLocation(locationCell),
      url,
      posted: stripTags(postedCell),
      season,
      track: inferTrack(role),
      closed,
      noSponsorship: /🛂/.test(roleRaw),
      usCitizen: /🇺🇸/.test(roleRaw),
    })
  }

  return listings
}

function parseSimplifyListings(rows) {
  const listings = []
  for (const row of rows) {
    if (!row || row.active === false || row.is_visible === false) {
      continue
    }
    const role = clean(row.title)
    const category = String(row.category || '')
    const hardware = /hardware/i.test(category)
    if (!isInternshipRole(role)) {
      continue
    }
    if (!hardware && !isStemEngineeringRole(role)) {
      continue
    }
    const url = normalizeUrl(row.url)
    if (!/^https:\/\//i.test(url)) {
      continue
    }
    const company = clean(row.company_name)
    if (!company || !role) {
      continue
    }
    const locations = Array.isArray(row.locations) ? row.locations.map(clean).filter(Boolean) : []
    const terms = Array.isArray(row.terms) ? row.terms : []
    listings.push({
      id: `simplify-${row.id || `${slugPart(company)}-${slugPart(role)}`}`,
      company,
      role,
      location: locations.join(', ') || 'Multiple locations',
      url,
      posted: formatPosted(row.date_posted),
      postedAt: isoFromUnix(row.date_posted),
      season: inferSeason(role, terms),
      track: inferTrack(role),
      closed: false,
      noSponsorship: /does not offer sponsorship|visa sponsorship not/i.test(String(row.sponsorship || '')),
      usCitizen: /citizenship is required/i.test(String(row.sponsorship || '')),
    })
  }
  return listings
}

function parseJobrightTable(markdown) {
  const rows = markdown.split('\n').filter((line) => /^\|/.test(line))
  const listings = []
  let company = ''

  for (const line of rows) {
    const cells = line.split('|').slice(1, -1).map((cell) => cell.trim())
    if (cells.length < 5) {
      continue
    }
    const [companyCell, roleCell, locationCell, modelCell, postedCell] = cells
    if (/^company$/i.test(stripTags(companyCell)) || /^-+$/.test(companyCell.replace(/[\s:-]/g, ''))) {
      continue
    }

    const companyLink = parseMdLink(companyCell)
    if (companyCell && companyCell !== '↳') {
      company = companyLink.text
    }
    if (!company) {
      continue
    }

    const roleLink = parseMdLink(roleCell)
    const role = roleLink.text.replace(/\s+/g, ' ').trim()
    if (!isStemEngineeringRole(role)) {
      continue
    }

    const location = parseLocation(locationCell)
    if (/\bDE\b|germany|österreich|austria|schweiz|switzerland/i.test(location) && !/\bde\b.*united states/i.test(location)) {
      continue
    }
    if (/sch[uü]ler|skillbridge/i.test(role)) {
      continue
    }

    const model = stripTags(modelCell)
    const locationWithRemote = /\bremote\b/i.test(model) && !/\bremote\b/i.test(location)
      ? `${location}, Remote`
      : location
    const url = normalizeUrl(roleLink.href)
    if (url && !/^https:\/\//i.test(url)) {
      continue
    }

    listings.push({
      id: `jobright-${slugPart(company)}-${slugPart(role)}-${slugPart(postedCell)}-${listings.length}`,
      company,
      role,
      location: locationWithRemote,
      url,
      posted: stripTags(postedCell),
      season: inferSeason(role),
      track: inferTrack(role),
      closed: false,
      noSponsorship: false,
      usCitizen: false,
    })
  }

  return listings
}

function parseZapplyTables(markdown) {
  const listings = []
  const lines = String(markdown || '').split('\n')
  let section = ''

  for (const line of lines) {
    const heading = line.match(/^\s*(?:#{1,3}\s+)?(?:[^\w#]\s*)?(Software Engineering|Data Science|Hardware|Business|Other Internships)\b/i)
    if (heading) {
      section = heading[1].toLowerCase()
      continue
    }
    if (!/^\|/.test(line)) {
      continue
    }

    const cells = line.split('|').slice(1, -1).map((cell) => cell.trim())
    if (cells.length < 4) {
      continue
    }

    const companyCell = cells[0]
    const roleCell = cells[1]
    const locationCell = cells[2]
    const postedCell = cells.length >= 6 ? cells[3] : cells[3]
    const applyCell = cells[cells.length - 1]
    if (/^company$/i.test(stripTags(companyCell)) || /^-+$/.test(companyCell.replace(/[\s:-]/g, ''))) {
      continue
    }
    if (/apply for more jobs/i.test(stripTags(companyCell))) {
      continue
    }

    const company = parseMdLink(companyCell).text.replace(/\*+/g, '').trim()
    const roleLink = parseMdLink(roleCell)
    const role = (roleLink.text || stripTags(roleCell)).replace(/\s+/g, ' ').trim()
    if (!company || !role || !isInternshipRole(role) || isGenericInternRole(role) || isDroppedInternshipRole(role)) {
      continue
    }

    const location = parseLocation(locationCell)
    if (!isKeptLocation(location)) {
      continue
    }

    const posted = formatZapplyPosted(postedCell)
    const ageDays = parseRelativeAgeDays(posted)
    if (ageDays !== null && ageDays > 90) {
      continue
    }

    const url = normalizeUrl(roleLink.href || extractHref(applyCell))
    if (url && !/^https:\/\//i.test(url)) {
      continue
    }

    let track = inferTrack(role)
    if (track === 'other' && /software/i.test(section)) {
      track = 'swe'
    }
    else if (track === 'other' && /data science/i.test(section)) {
      track = 'data'
    }
    else if (track === 'other' && /hardware/i.test(section)) {
      track = inferTrack(`${role} engineering intern`)
    }
    else if (track === 'other' && /business/i.test(section)) {
      track = 'ops'
    }

    listings.push({
      id: `zapply-${slugPart(company)}-${slugPart(role)}-${slugPart(posted)}-${listings.length}`,
      company,
      role,
      location,
      url,
      posted,
      season: inferSeason(role),
      track,
      closed: false,
      noSponsorship: false,
      usCitizen: false,
    })
  }

  return listings
}

function mergeListings(...groups) {
  const seen = new Map()
  for (const item of groups.flat()) {
    const key = listingKey(item)
    const existing = seen.get(key)
    if (!existing) {
      seen.set(key, item)
      continue
    }
    if (!isOfficialUrl(existing.url) && isOfficialUrl(item.url)) {
      seen.set(key, { ...existing, url: item.url })
    }
    if (!existing.deadline && item.deadline) {
      seen.set(key, { ...seen.get(key), deadline: item.deadline })
    }
    if (!existing.summary && item.summary) {
      seen.set(key, { ...seen.get(key), summary: item.summary })
    }
    if (!existing.keywords && item.keywords) {
      seen.set(key, { ...seen.get(key), keywords: item.keywords })
    }
    if (!existing.postedAt && item.postedAt) {
      seen.set(key, {
        ...seen.get(key),
        postedAt: item.postedAt,
        posted: existing.posted || item.posted,
      })
    }
  }
  return [...seen.values()]
}

const USAJOBS_KEEP_TRACKS = new Set([
  'clinical',
  'pharma',
  'public-health',
  'science',
  'biomedical',
  'chemical',
  'policy',
  'legal',
  'education',
  'gov',
  'nonprofit',
  'engineering',
  'architecture',
  'civil',
  'mechanical',
  'electrical',
  'swe',
  'data',
  'finance',
  'security',
  'ml',
  'hr',
])

/** California (and nearby SoCal) pins from USAJobs PositionLocation arrays. */
const USAJOBS_CA_LOCATION = /\bcalifornia\b|\bCA\b|san diego|los angeles|san francisco|sacramento|irvine|pasadena|oakland|berkeley|point mugu|camp pendleton|coronado|la jolla|china lake|edwards afb|beale afb|travis afb|vandenberg|monterey|fresno|riverside|anaheim|long beach|santa clara|san jose|palo alto|mountain view|davis|carlsbad|oceanside|chula vista|el segundo|seal beach|mcclellan|palmdale|santa ana|newport beach|torrance|burbank|glendale|ventura|oxnard|santa barbara|san bernardino|stockton|modesto|santa monica|culver city|redondo|huntington beach|fullerton|orange,\s*ca|san luis obispo/i

/** Drop clerical / evergreen career-pipeline spam that is not a useful student listing. */
const USAJOBS_DROP_ROLE = /office automation|clerical|\bmwr\b|morale,\s*well-?being|recreation internship|heavy mobile equipment|inventory management|human resources assistant/i

const BIOTECH_BOARDS = [
  { company: 'Amgen', host: 'https://amgen.wd1.myworkdayjobs.com', tenant: 'amgen', site: 'Careers' },
  { company: 'Moderna', host: 'https://modernatx.wd1.myworkdayjobs.com', tenant: 'modernatx', site: 'M_tx' },
  { company: 'Thermo Fisher', host: 'https://thermofisher.wd5.myworkdayjobs.com', tenant: 'thermofisher', site: 'ThermoFisherCareers' },
  { company: 'Pfizer', host: 'https://pfizer.wd1.myworkdayjobs.com', tenant: 'pfizer', site: 'PfizerCareers' },
  { company: 'Bristol Myers Squibb', host: 'https://bristolmyerssquibb.wd5.myworkdayjobs.com', tenant: 'bristolmyerssquibb', site: 'BMS' },
  { company: 'Illumina', host: 'https://illumina.wd1.myworkdayjobs.com', tenant: 'illumina', site: 'illumina-careers' },
  { company: 'Gilead', host: 'https://gilead.wd1.myworkdayjobs.com', tenant: 'gilead', site: 'gileadcareers' },
  { company: 'Dexcom', host: 'https://dexcom.wd1.myworkdayjobs.com', tenant: 'dexcom', site: 'DexCom' },
  { company: 'BD', host: 'https://bdx.wd1.myworkdayjobs.com', tenant: 'bdx', site: 'EXTERNAL_CAREER_SITE_USA' },
  { company: 'Merck', host: 'https://msd.wd5.myworkdayjobs.com', tenant: 'msd', site: 'SearchJobs' },
]

/** Public Greenhouse / Ashby / Lever boards for large employers. */
const COMPANY_ATS_BOARDS = [
  { company: 'Airbnb', kind: 'greenhouse', board: 'airbnb' },
  { company: 'Anduril', kind: 'greenhouse', board: 'andurilindustries' },
  { company: 'Anthropic', kind: 'greenhouse', board: 'anthropic' },
  { company: 'Asana', kind: 'greenhouse', board: 'asana' },
  { company: 'Affirm', kind: 'greenhouse', board: 'affirm' },
  { company: 'Block', kind: 'greenhouse', board: 'block' },
  { company: 'Brex', kind: 'greenhouse', board: 'brex' },
  { company: 'Chime', kind: 'greenhouse', board: 'chime' },
  { company: 'Cloudflare', kind: 'greenhouse', board: 'cloudflare' },
  { company: 'Coinbase', kind: 'greenhouse', board: 'coinbase' },
  { company: 'Databricks', kind: 'greenhouse', board: 'databricks' },
  { company: 'Datadog', kind: 'greenhouse', board: 'datadog' },
  { company: 'Discord', kind: 'greenhouse', board: 'discord' },
  { company: 'Dropbox', kind: 'greenhouse', board: 'dropbox' },
  { company: 'Duolingo', kind: 'greenhouse', board: 'duolingo' },
  { company: 'Figma', kind: 'greenhouse', board: 'figma' },
  { company: 'Flexport', kind: 'greenhouse', board: 'flexport' },
  { company: 'GitLab', kind: 'greenhouse', board: 'gitlab' },
  { company: 'Instacart', kind: 'greenhouse', board: 'instacart' },
  { company: 'Lucid Motors', kind: 'greenhouse', board: 'lucidmotors' },
  { company: 'Lyft', kind: 'greenhouse', board: 'lyft' },
  { company: 'MongoDB', kind: 'greenhouse', board: 'mongodb' },
  { company: 'Nuro', kind: 'greenhouse', board: 'nuro' },
  { company: 'Okta', kind: 'greenhouse', board: 'okta' },
  { company: 'Pinterest', kind: 'greenhouse', board: 'pinterest' },
  { company: 'Reddit', kind: 'greenhouse', board: 'reddit' },
  { company: 'Roblox', kind: 'greenhouse', board: 'roblox' },
  { company: 'Robinhood', kind: 'greenhouse', board: 'robinhood' },
  { company: 'Samsara', kind: 'greenhouse', board: 'samsara' },
  { company: 'Scale AI', kind: 'greenhouse', board: 'scaleai' },
  { company: 'SoFi', kind: 'greenhouse', board: 'sofi' },
  { company: 'Stripe', kind: 'greenhouse', board: 'stripe' },
  { company: 'Toast', kind: 'greenhouse', board: 'toast' },
  { company: 'Twilio', kind: 'greenhouse', board: 'twilio' },
  { company: 'Waymo', kind: 'greenhouse', board: 'waymo' },
  { company: 'xAI', kind: 'greenhouse', board: 'xai' },
  { company: 'Zscaler', kind: 'greenhouse', board: 'zscaler' },
  { company: 'Box', kind: 'greenhouse', board: 'boxinc' },
  { company: 'Elastic', kind: 'greenhouse', board: 'elastic' },
  { company: 'Cerebras', kind: 'ashby', board: 'cerebras' },
  { company: 'Cursor', kind: 'ashby', board: 'cursor' },
  { company: 'ElevenLabs', kind: 'ashby', board: 'elevenlabs' },
  { company: 'Linear', kind: 'ashby', board: 'linear' },
  { company: 'Notion', kind: 'ashby', board: 'notion' },
  { company: 'OpenAI', kind: 'ashby', board: 'openai' },
  { company: 'Perplexity', kind: 'ashby', board: 'perplexity' },
  { company: 'Physical Intelligence', kind: 'ashby', board: 'physicalintelligence' },
  { company: 'Ramp', kind: 'ashby', board: 'ramp' },
  { company: 'Replit', kind: 'ashby', board: 'replit' },
  { company: 'Sierra', kind: 'ashby', board: 'sierra' },
  { company: 'Palantir', kind: 'lever', board: 'palantir' },
  { company: 'Spotify', kind: 'lever', board: 'spotify' },
]

/** Official Workday career boards for large employers missing from GitHub lists. */
const COMPANY_WORKDAY_BOARDS = [
  { company: 'Nike', host: 'https://nike.wd1.myworkdayjobs.com', tenant: 'nike', site: 'nke' },
  { company: 'Target', host: 'https://target.wd5.myworkdayjobs.com', tenant: 'target', site: 'TargetCareers' },
  { company: 'BlackRock', host: 'https://blackrock.wd1.myworkdayjobs.com', tenant: 'blackrock', site: 'Blackrock_Professional' },
  { company: 'Citi', host: 'https://citi.wd5.myworkdayjobs.com', tenant: 'citi', site: '2' },
  { company: 'Mastercard', host: 'https://mastercard.wd1.myworkdayjobs.com', tenant: 'mastercard', site: 'CorporateCareers' },
  { company: 'PayPal', host: 'https://paypal.wd1.myworkdayjobs.com', tenant: 'paypal', site: 'jobs' },
  { company: 'Salesforce', host: 'https://salesforce.wd12.myworkdayjobs.com', tenant: 'salesforce', site: 'External_Career_Site' },
  { company: 'Workday', host: 'https://workday.wd5.myworkdayjobs.com', tenant: 'workday', site: 'Workday' },
  { company: '3M', host: 'https://3m.wd1.myworkdayjobs.com', tenant: '3m', site: 'Search' },
  { company: 'Cisco', host: 'https://cisco.wd5.myworkdayjobs.com', tenant: 'cisco', site: 'cisco_careers' },
  { company: 'CVS Health', host: 'https://cvshealth.wd1.myworkdayjobs.com', tenant: 'cvshealth', site: 'CVS_Health_Careers' },
  { company: 'Chevron', host: 'https://chevron.wd5.myworkdayjobs.com', tenant: 'chevron', site: 'jobs' },
  { company: 'Boeing', host: 'https://boeing.wd1.myworkdayjobs.com', tenant: 'boeing', site: 'EXTERNAL_CAREERS' },
  { company: 'Northrop Grumman', host: 'https://ngc.wd1.myworkdayjobs.com', tenant: 'ngc', site: 'Northrop_Grumman_External_Site' },
  { company: 'Stryker', host: 'https://stryker.wd1.myworkdayjobs.com', tenant: 'stryker', site: 'StrykerCareers' },
  { company: 'Roche', host: 'https://roche.wd3.myworkdayjobs.com', tenant: 'roche', site: 'roche-ext' },
  { company: 'Sanofi', host: 'https://sanofi.wd3.myworkdayjobs.com', tenant: 'sanofi', site: 'SanofiCareers' },
  { company: 'Adobe', host: 'https://adobe.wd5.myworkdayjobs.com', tenant: 'adobe', site: 'external_experienced' },
  { company: 'NVIDIA', host: 'https://nvidia.wd5.myworkdayjobs.com', tenant: 'nvidia', site: 'NVIDIAExternalCareerSite' },
  { company: 'Micron', host: 'https://micron.wd1.myworkdayjobs.com', tenant: 'micron', site: 'External' },
  { company: 'Applied Materials', host: 'https://amat.wd1.myworkdayjobs.com', tenant: 'amat', site: 'External' },
  { company: 'KLA', host: 'https://kla.wd1.myworkdayjobs.com', tenant: 'kla', site: 'Search' },
  { company: 'Autodesk', host: 'https://autodesk.wd1.myworkdayjobs.com', tenant: 'autodesk', site: 'Ext' },
  { company: 'The Walt Disney Company', host: 'https://disney.wd5.myworkdayjobs.com', tenant: 'disney', site: 'disneycareer' },
]

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const US_CA_CITY = /\b(san francisco|bay area|silicon valley|new york|nyc|brooklyn|manhattan|los angeles|seattle|bellevue|redmond|boston|cambridge|austin|chicago|atlanta|denver|boulder|miami|portland|dallas|houston|phoenix|philadelphia|washington|arlington|alexandria|mclean|reston|tysons|cupertino|sunnyvale|mountain view|palo alto|menlo park|redwood|san jose|santa clara|oakland|berkeley|irvine|san diego|sacramento|pasadena|burbank|el segundo|long beach|santa monica|foster city|milpitas|fremont|pleasanton|minneapolis|detroit|ann arbor|pittsburgh|cleveland|columbus|cincinnati|indianapolis|nashville|charlotte|raleigh|durham|richmond|baltimore|tampa|orlando|jacksonville|new orleans|kansas city|st\.?\s*louis|salt lake|boise|milwaukee|madison|omaha|hartford|buffalo|rochester|princeton|jersey city|hoboken|newark|stamford|plano|irving|fort worth|san antonio|memphis|louisville|huntsville|norfolk|virginia beach|reno|las vegas|honolulu|montreal|ottawa|calgary|edmonton|waterloo|kitchener|mississauga|markham|burnaby)\b/i

function isUsCanadaOrRemoteLocation(location) {
  const value = String(location || '')
  if (!value) {
    return false
  }
  if (/\bremote\b|united states|\busa\b|\bu\.s\.|\bus\s*-/i.test(value)) {
    return true
  }
  if (/\bmultiple locations?\b|\bvarious locations?\b|\bnationwide\b|\bacross the u\.?s/i.test(value)) {
    return true
  }
  if (/^(in[- ]?office|on[- ]?site|hybrid|office)$/i.test(value.trim())) {
    return true
  }
  if (US_CA_CITY.test(value)) {
    return true
  }
  if (FOREIGN_ONLY.test(value) && !/\b(united states|usa|canada|remote)\b/i.test(value) && !US_CA_CITY.test(value)) {
    return false
  }
  if (/^[A-Z]{3} - /.test(value) && !/^USA? - /.test(value)) {
    return false
  }
  if (
    /\b(alabama|alaska|arizona|arkansas|california|colorado|connecticut|delaware|florida|georgia|hawaii|idaho|illinois|indiana|iowa|kansas|kentucky|louisiana|maine|maryland|massachusetts|michigan|minnesota|mississippi|missouri|montana|nebraska|nevada|new hampshire|new jersey|new mexico|new york|north carolina|north dakota|ohio|oklahoma|oregon|pennsylvania|rhode island|south carolina|south dakota|tennessee|texas|utah|vermont|virginia|washington|west virginia|wisconsin|wyoming|district of columbia)\b/i.test(value)
  ) {
    return true
  }
  if (/,\s*(AL|AK|AZ|AR|CA|CO|CT|DC|DE|FL|GA|HI|IA|ID|IL|IN|KS|KY|LA|MA|MD|ME|MI|MN|MO|MS|MT|NC|ND|NE|NH|NJ|NM|NV|NY|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VA|VT|WA|WI|WV)\b/.test(value)) {
    return true
  }
  if (/\bcanada\b|\btoronto\b|vancouver|,\s*on\b|,\s*bc\b/i.test(value)) {
    return true
  }
  return false
}

function workdayLocation(job) {
  const fromPath = String(job.externalPath || '').match(/\/job\/([^/]+)\//)
  const pathLoc = fromPath
    ? fromPath[1].replace(/---/g, ', ').replace(/-/g, ' ')
    : ''
  const text = clean(job.locationsText || '')
  for (const candidate of [text, pathLoc]) {
    if (candidate && isUsCanadaOrRemoteLocation(candidate)) {
      return candidate
    }
  }
  return text || pathLoc
}

function biotechFallbackTrack(company, role, track) {
  if (track !== 'other') {
    return track
  }
  if (/dexcom|illumina|\bbd\b/i.test(company)) {
    return 'biomedical'
  }
  if (/amgen|moderna|pfizer|gilead|merck|thermo|sanofi/i.test(company) && /intern|co-?op/i.test(role)) {
    return 'pharma'
  }
  return track
}

function formatWorkdayPosted(raw) {
  const value = String(raw || '').replace(/^posted\s+/i, '').trim()
  if (!value) {
    return ''
  }
  const days = value.match(/^(\d+)\s+days?\s+ago$/i)
  if (days) {
    return `${days[1]}d`
  }
  const weeks = value.match(/^(\d+)\s+weeks?\s+ago$/i)
  if (weeks) {
    return `${weeks[1]}w`
  }
  if (/^today$/i.test(value) || /^just posted$/i.test(value)) {
    return 'Today'
  }
  return value
}

function formatIsoPosted(iso) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) {
    return ''
  }
  return `${MONTHS[date.getUTCMonth()]} ${date.getUTCDate()}`
}

function isoDateOnly(value) {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    const date = value > 1e12 ? new Date(value) : new Date(value * 1000)
    return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10)
  }
  const match = String(value || '').match(/^(\d{4}-\d{2}-\d{2})/)
  return match ? match[1] : ''
}

function isPastIsoDate(value) {
  const iso = isoDateOnly(value)
  if (!iso) {
    return false
  }
  return Date.parse(`${iso}T23:59:59Z`) < Date.now() - 86_400_000
}

function usaJobsCategoryCodes(descriptor) {
  const categories = descriptor?.JobCategory || descriptor?.JobCategories || []
  const codes = []
  for (const category of Array.isArray(categories) ? categories : [categories]) {
    const code = String(category?.Code || category?.JobCategoryCode || '').replace(/\D/g, '')
    if (code) {
      codes.push(code.padStart(4, '0').slice(0, 4))
    }
  }
  return codes
}

function trackFromUsaJobsSeries(code) {
  const full = String(code || '').padStart(4, '0').slice(0, 4)
  const group = full.slice(0, 2)
  if (full === '0180' || full === '0185') {
    return 'clinical'
  }
  if (full === '0685' || full === '0680' || full === '0610' || full === '0620') {
    return 'public-health'
  }
  if (group === '06') {
    return 'clinical'
  }
  if (group === '04' || group === '13') {
    return 'science'
  }
  if (full === '0130' || full === '0131' || group === '09') {
    return 'policy'
  }
  if (group === '01') {
    return 'policy'
  }
  if (group === '17') {
    return 'nonprofit'
  }
  if (group === '08') {
    return 'engineering'
  }
  if (group === '22') {
    return 'swe'
  }
  if (group === '15') {
    return 'data'
  }
  if (group === '05') {
    return 'finance'
  }
  if (group === '00' || group === '02') {
    return 'security'
  }
  if (group === '03') {
    return 'gov'
  }
  return ''
}

function trackFromUsaJobsTitle(title) {
  const value = String(title || '')
  if (/\bnsa\b/i.test(value) || /national security agency/i.test(value)) {
    return 'security'
  }
  if (/computer\s*(?:&|and)?\s*data science|data science|mathematics?\s*&?\s*statistics.*(?:computer|data)/i.test(value)) {
    return 'data'
  }
  if (/computer science|information technology|\bit\b|software/i.test(value)) {
    return 'swe'
  }
  if (/mechanical engineering/i.test(value)) {
    return 'mechanical'
  }
  if (/electrical|electronics engineer/i.test(value)) {
    return 'electrical'
  }
  if (/civil engineering/i.test(value)) {
    return 'civil'
  }
  if (/chemical engineer/i.test(value)) {
    return 'chemical'
  }
  if (/physical science|biological|chemist|environment/i.test(value)) {
    return 'science'
  }
  if (/\bsecurit|intelligence|counterintelligence/i.test(value)) {
    return 'security'
  }
  if (/audit|account|financial management|finance/i.test(value)) {
    return 'finance'
  }
  if (/legal|law\)|compliance and policy|public affairs|foreign affairs|political science/i.test(value)) {
    return 'policy'
  }
  if (/\bpsychology\b|mental health|behavioral health|social science/i.test(value)) {
    return 'clinical'
  }
  if (/scholar|pathways|student trainee|student volunteer|student intern/i.test(value)) {
    return 'gov'
  }
  return ''
}

function trackForUsaJobs(title, descriptor) {
  // Prefer parenthetical specialty (e.g. Student Trainee (Physical Science)) over the
  // generic "student trainee" → gov match in inferTrack.
  const fromSpecialty = trackFromUsaJobsTitle(title)
  if (fromSpecialty && USAJOBS_KEEP_TRACKS.has(fromSpecialty) && fromSpecialty !== 'gov') {
    return fromSpecialty
  }
  const fromTitle = inferTrack(title)
  if (USAJOBS_KEEP_TRACKS.has(fromTitle) && fromTitle !== 'gov') {
    return fromTitle
  }
  for (const code of usaJobsCategoryCodes(descriptor)) {
    const mapped = trackFromUsaJobsSeries(code)
    if (mapped && USAJOBS_KEEP_TRACKS.has(mapped)) {
      return mapped
    }
  }
  if (fromSpecialty === 'gov' || fromTitle === 'gov' || /student trainee|pathways|student volunteer|scholar/i.test(title)) {
    return 'gov'
  }
  return ''
}

function isUsaJobsStudentRole(title) {
  return (
    isInternshipRole(title)
    || /student trainee|pathways(?:\s+intern)?|student intern|student volunteer|scholars?\b|(?:graduate|law)\s+student\s+research|college intern/i.test(title)
  )
}

function isLowValueUsaJobsRole(title, organization) {
  const role = String(title || '')
  const org = String(organization || '')
  if (USAJOBS_DROP_ROLE.test(role) || isDroppedInternshipRole(role)) {
    return true
  }
  // High school / non-college pipelines.
  if (/high[-\s]?school|secondary school|\b9th\b|\b10th\b|\b11th\b|\b12th\b/i.test(role)) {
    return true
  }
  // Bare “Student Volunteer” with no field — not a real college internship.
  if (/^student volunteer$/i.test(role)) {
    return true
  }
  // Evergreen AF “STUDENT TRAINEE” with no specialty — career pipeline, not a concrete cohort.
  if (/^student trainee$/i.test(role) && /air force civilian career training/i.test(org)) {
    return true
  }
  // Generic admin/office Pathways without an analysis / policy specialty.
  if (/administration and office support/i.test(role) && !/policy|compliance|analysis|legal/i.test(role)) {
    return true
  }
  return false
}

function usaJobsLocationPins(descriptor) {
  const pins = []
  for (const entry of descriptor?.PositionLocation || []) {
    const name = clean(entry?.LocationName)
    if (name) {
      pins.push(name)
    }
  }
  return pins
}

function shortenUsaJobsCity(name) {
  return clean(name)
    .replace(/,\s*California$/i, ', CA')
    .replace(/\s+AFB,/i, ' AFB,')
}

function formatUsaJobsLocation(descriptor) {
  const pins = usaJobsLocationPins(descriptor)
  const caPins = [...new Set(pins.filter((pin) => USAJOBS_CA_LOCATION.test(pin)).map(shortenUsaJobsCity))]
  if (caPins.length) {
    const shown = caPins.slice(0, 3)
    const extra = pins.length > caPins.length || caPins.length > shown.length
    return extra ? `${shown.join('; ')} (+ more)` : shown.join('; ')
  }
  const display = clean(descriptor?.PositionLocationDisplay)
  if (display && !/^multiple locations$/i.test(display)) {
    return display
  }
  if (pins[0]) {
    return shortenUsaJobsCity(pins[0])
  }
  return display || 'United States'
}

function isRelevantUsaJobsListing(role, organization, location, pins) {
  if (isLowValueUsaJobsRole(role, organization)) {
    return false
  }
  const hay = [location, ...pins].join(' ')
  // Prefer California (including multi-site postings that list CA offices).
  if (USAJOBS_CA_LOCATION.test(hay)) {
    return true
  }
  // Named Summer / Spring 2027 (etc.) cohorts are concrete and useful nationally.
  if (/\b(?:summer|spring|fall|winter)\s*2027\b/i.test(role)) {
    return true
  }
  // Specialty STEM / policy Pathways — skip vague admin-only titles outside CA.
  if (
    /physical science|mechanical engineering|electrical|electronics|computer science|data science|chemical|civil|biolog|chemist|intelligence|public affairs|compliance and policy|legal intern|law\)|scholar|pathways intern|psychology|political science|social science|mental health/i.test(role)
  ) {
    return true
  }
  if (
    /national oceanic|national security agency|securities and exchange/i.test(organization)
    && /student trainee|intern|scholar/i.test(role)
  ) {
    return true
  }
  // Remote research assistant roles with a clear student framing.
  if (/research assistant/i.test(role) && /\bremote\b|anywhere in the u\.?s/i.test(hay)) {
    return true
  }
  return false
}

function usaJobsRequiresCitizenship(descriptor) {
  const hay = [
    descriptor?.QualificationSummary,
    JSON.stringify(descriptor?.UserArea || {}),
    JSON.stringify(descriptor?.PositionOfferingType || []),
  ].join(' ')
  if (/non[- ]citizens? may|open to all/i.test(hay) && !/united states citizens only/i.test(hay)) {
    return /must be a (?:u\.?s\.? )?citizen/i.test(hay)
  }
  return /united states citizens?|u\.?s\.? citizens? required|must be a (?:u\.?s\.? )?citizen/i.test(hay)
    || /pathways|student trainee/i.test(String(descriptor?.PositionTitle || ''))
}

function parseUsaJobsListings(searchResult) {
  const items = searchResult?.SearchResult?.SearchResultItems || []
  const listings = []
  for (const row of items) {
    const descriptor = row?.MatchedObjectDescriptor || {}
    const role = clean(descriptor.PositionTitle)
    const organization = clean(descriptor.OrganizationName) || 'U.S. Government'
    if (!role || !isUsaJobsStudentRole(role) || isGenericInternRole(role)) {
      continue
    }
    const track = trackForUsaJobs(role, descriptor)
    if (!track) {
      continue
    }
    const pins = usaJobsLocationPins(descriptor)
    const location = formatUsaJobsLocation(descriptor)
    if (FOREIGN_ONLY.test(location) && !/\b(united states|usa|canada|remote)\b/i.test(location)) {
      continue
    }
    if (isLowValueUsaJobsRole(role, organization)) {
      continue
    }
    const id = row?.MatchedObjectId || descriptor.PositionID || slugPart(role)
    const url = normalizeUrl(
      descriptor.PositionURI
      || descriptor.ApplyURI?.[0]
      || `https://www.usajobs.gov/job/${id}`,
    )
    if (url && !/^https:\/\//i.test(url)) {
      continue
    }
    listings.push({
      id: `usajobs-${slugPart(organization)}-${slugPart(role)}-${slugPart(id)}`.slice(0, 96),
      company: organization,
      role,
      location,
      url: url.replace(/:443\//, '/'),
      posted: formatIsoPosted(descriptor.PublicationStartDate),
      postedAt: isoFromDateValue(descriptor.PublicationStartDate),
      deadline: isoDateOnly(descriptor.ApplicationCloseDate),
      season: inferSeason(role),
      track,
      closed: false,
      noSponsorship: true,
      usCitizen: usaJobsRequiresCitizenship(descriptor),
      ...postingFields([
        descriptor?.UserArea?.Details?.JobSummary,
        descriptor?.QualificationSummary,
      ].filter(Boolean).join('\n')),
    })
  }
  return listings
}

async function fetchUsaJobs() {
  const key = String(process.env.USAJOBS_API_KEY || '').trim()
  const email = String(process.env.USAJOBS_EMAIL || process.env.USAJOBS_USER_AGENT || '').trim()
  if (!key || !email) {
    process.stderr.write(
      'USAJobs skipped: set USAJOBS_API_KEY and USAJOBS_EMAIL (https://developer.usajobs.gov/).\n',
    )
    return []
  }

  const listings = []
  let page = 1
  let pages = 1
  while (page <= pages && page <= 20) {
    const url = new URL('https://data.usajobs.gov/api/search')
    url.searchParams.set('HiringPath', 'STUDENT')
    url.searchParams.set('ResultsPerPage', '50')
    url.searchParams.set('Page', String(page))
    const response = await fetch(url, {
      headers: {
        Host: 'data.usajobs.gov',
        'User-Agent': email,
        'Authorization-Key': key,
        Accept: 'application/json',
      },
      redirect: 'follow',
    })
    if (!response.ok) {
      throw new Error(`USAJobs ${url} → ${response.status}`)
    }
    const data = await response.json()
    listings.push(...parseUsaJobsListings(data))
    const total = Number(data?.SearchResult?.SearchResultCountAll || 0)
    pages = Math.max(1, Math.ceil(total / 50))
    page += 1
    if (page <= pages) {
      await sleep(250)
    }
  }
  return listings
}

function ycVisaFlags(visa) {
  const value = String(visa || '')
  if (/will sponsor|not required/i.test(value)) {
    return { noSponsorship: false, usCitizen: false }
  }
  if (/citizen|visa only/i.test(value)) {
    return { noSponsorship: true, usCitizen: /citizen/i.test(value) }
  }
  return { noSponsorship: false, usCitizen: false }
}

function ycRoleTrack(role, ycRole) {
  const fromTitle = inferTrack(role)
  if (fromTitle !== 'other') {
    return fromTitle
  }
  const map = {
    Engineering: 'swe',
    eng: 'swe',
    Design: 'design',
    designer: 'design',
    Finance: 'finance',
    finance: 'finance',
    Legal: 'legal',
    legal: 'legal',
    Marketing: 'marketing',
    marketing: 'marketing',
    Operations: 'ops',
    operations: 'ops',
    Product: 'pm',
    'product-manager': 'pm',
    'Recruiting & HR': 'hr',
    recruiting: 'hr',
    Sales: 'sales',
    'sales-manager': 'sales',
    Science: 'science',
    science: 'science',
    Support: 'ops',
    Robotics: 'robotics',
    Mechanical: 'mechanical',
    Electrical: 'electrical',
    'Full stack': 'swe',
    'Machine learning': 'ml',
  }
  return map[ycRole] || 'other'
}

function decodeHtmlEntities(value) {
  return String(value || '')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}

function parseInertiaPage(html) {
  const match = String(html || '').match(/data-page="([^"]+)"/)
  if (!match) {
    return null
  }
  try {
    return JSON.parse(decodeHtmlEntities(match[1]))
  }
  catch {
    return null
  }
}

async function fetchYcPage(url) {
  const response = await fetch(url, {
    headers: {
      'user-agent': BROWSER_UA,
      accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8',
    },
    redirect: 'follow',
    signal: AbortSignal.timeout(20000),
  })
  if (!response.ok) {
    throw new Error(`${url} → ${response.status}`)
  }
  return response.text()
}

function listingFromYcJob(job) {
  if (!job || job.isIncomplete) {
    return null
  }
  let role = clean(job.title)
  const pretty = clean(job.prettyRole || job.roleType || job.role)
  if (!role) {
    return null
  }
  const type = String(job.type || job.jobType || '')
  if (!/intern/i.test(type) && !isInternshipRole(role)) {
    return null
  }
  if (isGenericInternRole(role)) {
    role = pretty && !/^intern/i.test(pretty) ? `${pretty} Intern` : 'Internship'
  }
  if (isDroppedInternshipRole(role)) {
    return null
  }
  const company = clean(job.companyName) || 'YC startup'
  const path = String(job.url || '')
  const url = normalizeUrl(
    /^https?:\/\//i.test(path)
      ? path
      : path.startsWith('/')
        ? `https://www.ycombinator.com${path}`
        : job.id
          ? `https://www.workatastartup.com/jobs/${job.id}`
          : '',
  )
  if (!/^https:\/\//i.test(url)) {
    return null
  }
  const visa = ycVisaFlags(job.visa)
  return {
    id: `yc-${job.id || `${slugPart(company)}-${slugPart(role)}`}`,
    company,
    role,
    location: clean(job.location) || 'Remote',
    url,
    posted: '',
    season: inferSeason(role),
    track: ycRoleTrack(role, pretty),
    closed: false,
    noSponsorship: visa.noSponsorship,
    usCitizen: visa.usCitizen,
    ...postingFields(job.description || job.body || job.jobDescription || ''),
  }
}

async function fetchYcInternships() {
  const listings = []
  const seen = new Set()
  const add = (job) => {
    const item = listingFromYcJob(job)
    if (!item || seen.has(item.id)) {
      return
    }
    seen.add(item.id)
    listings.push(item)
  }

  try {
    const internshipsHtml = await fetchYcPage(SOURCE.yc)
    const internshipsPage = parseInertiaPage(internshipsHtml)
    for (const job of internshipsPage?.props?.jobPostings || []) {
      add(job)
    }
  }
  catch (error) {
    process.stderr.write(`YC internships page skipped: ${error.message}\n`)
  }

  try {
    const jobsHtml = await fetchYcPage(SOURCE.ycJobs)
    const jobsPage = parseInertiaPage(jobsHtml)
    for (const job of jobsPage?.props?.jobs || []) {
      add(job)
    }
  }
  catch (error) {
    process.stderr.write(`YC jobs board skipped: ${error.message}\n`)
  }

  return listings
}

const IDEALIST_SEARCH = {
  appId: 'NSV3AUESS7',
  apiKey: 'c2730ea10ab82787f2f3cc961e8c1e06',
  index: 'idealist7-production',
}

function idealistRscField(html, key) {
  const escaped = String(html || '').match(new RegExp(`\\\\"${key}\\\\",\\\\"([^\\\\"]*)\\\\"`))
  if (escaped?.[1]) {
    return escaped[1]
  }
  const plain = String(html || '').match(new RegExp(`"${key}","([^"]*)"`))
  return plain?.[1] || ''
}

function idealistListingPath(hit) {
  const path = hit?.url?.en || hit?.url?.['en'] || ''
  return String(path || '')
}

function isIdealistKeptHit(hit) {
  const country = String(hit?.country || '')
  const remoteCountry = String(hit?.remoteCountry || '')
  const locType = String(hit?.locationType || '')
  if (country === 'US' || country === 'CA') {
    return true
  }
  if (locType === 'REMOTE' && (remoteCountry === 'US' || remoteCountry === 'CA')) {
    return true
  }
  return false
}

function formatIdealistLocation(hit) {
  const locType = String(hit?.locationType || '')
  const city = clean(hit?.city)
  const state = clean(hit?.state || hit?.stateStr)
  const remote = locType === 'REMOTE' || locType === 'HYBRID'
  if (city && state) {
    return remote && locType === 'REMOTE' ? `${city}, ${state} / Remote` : `${city}, ${state}`
  }
  if (city) {
    return locType === 'REMOTE' ? `${city} / Remote` : city
  }
  if (locType === 'REMOTE') {
    return 'Remote'
  }
  return 'United States'
}

function parseIdealistJsonLd(html) {
  const match = String(html || '').match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i)
  if (!match) {
    return null
  }
  try {
    const data = JSON.parse(match[1])
    return Array.isArray(data) ? data.find((row) => row['@type'] === 'JobPosting') || data[0] : data
  }
  catch {
    return null
  }
}

function isUsableApplyUrl(url) {
  const value = normalizeUrl(url)
  if (!/^https:\/\//i.test(value)) {
    return false
  }
  if (/javascript:|mailto:/i.test(value)) {
    return false
  }
  if (/idealist\.org\/en\/internships\/?$/i.test(value)) {
    return false
  }
  return true
}

async function fetchIdealistSearchPage(page) {
  const response = await fetch('https://nsv3auess7-dsn.algolia.net/1/indexes/*/queries', {
    method: 'POST',
    headers: {
      'user-agent': BROWSER_UA,
      accept: 'application/json',
      'content-type': 'application/json',
      'x-algolia-application-id': IDEALIST_SEARCH.appId,
      'x-algolia-api-key': IDEALIST_SEARCH.apiKey,
    },
    body: JSON.stringify({
      requests: [{
        indexName: IDEALIST_SEARCH.index,
        hitsPerPage: 50,
        page,
        filters: "type:'INTERNSHIP'",
        attributesToRetrieve: [
          'objectID',
          'type',
          'published',
          'name',
          'city',
          'state',
          'stateStr',
          'country',
          'url',
          'orgName',
          'orgType',
          'locationType',
          'remoteCountry',
          'education',
        ],
        query: '',
      }],
    }),
    signal: AbortSignal.timeout(20000),
  })
  if (!response.ok) {
    throw new Error(`Idealist search → ${response.status}`)
  }
  const data = await response.json()
  return data?.results?.[0] || {}
}

async function enrichIdealistListing(hit) {
  const path = idealistListingPath(hit)
  if (!path.startsWith('/en/')) {
    return null
  }
  const listingUrl = `https://www.idealist.org${path}`
  let html = ''
  try {
    html = await fetchYcPage(listingUrl)
  }
  catch {
    return null
  }
  if (/<title[^>]*>\s*(page not found|404)/i.test(html) || html.length < 2000) {
    return null
  }
  const jsonLd = parseIdealistJsonLd(html)
  if (jsonLd?.employmentType && !/intern/i.test(String(jsonLd.employmentType))) {
    return null
  }
  const education = idealistRscField(html, 'education') || String(hit.education || '')
  if (/high[_\s-]?school/i.test(education)) {
    return null
  }
  let role = clean(jsonLd?.title || hit.name)
  if (!role) {
    return null
  }
  if (isDroppedInternshipRole(role) || /high[-\s]?school/i.test(role)) {
    return null
  }
  if (!isInternshipRole(role) && !/fellow/i.test(role)) {
    role = `${role} Intern`
  }
  if (isGenericInternRole(role)) {
    role = clean(hit.orgType) === 'NONPROFIT' ? 'Nonprofit Intern' : 'Internship'
  }
  const applyUrl = idealistRscField(html, 'applyUrl')
  const url = isUsableApplyUrl(applyUrl) ? normalizeUrl(applyUrl) : listingUrl
  if (!isUsableApplyUrl(url)) {
    return null
  }
  const deadline = isoDateOnly(idealistRscField(html, 'applicationDeadline'))
    || isoDateOnly(jsonLd?.validThrough)
  if (deadline && isPastIsoDate(deadline)) {
    return null
  }
  const company = clean(jsonLd?.hiringOrganization?.name || hit.orgName)
  if (!company) {
    return null
  }
  return {
    id: `idealist-${slugPart(company)}-${slugPart(role)}-${slugPart(hit.objectID)}`.slice(0, 96),
    company,
    role,
    location: formatIdealistLocation(hit),
    url,
    posted: formatIsoPosted(isoDateOnly(hit.published) || jsonLd?.datePosted),
    postedAt: isoFromDateValue(hit.published || jsonLd?.datePosted),
    deadline: deadline && !isPastIsoDate(deadline) ? deadline : '',
    season: inferSeason(role),
    track: inferTrack(role) === 'other' ? 'nonprofit' : inferTrack(role),
    closed: false,
    noSponsorship: false,
    usCitizen: false,
    ...postingFields(jsonLd?.description || ''),
  }
}

async function fetchIdealistInternships() {
  const hits = []
  const seen = new Set()
  try {
    let page = 0
    let pages = 1
    while (page < pages && page < 8) {
      const result = await fetchIdealistSearchPage(page)
      const rows = result.hits || []
      const total = Number(result.nbHits || 0)
      pages = Math.max(1, Math.ceil(total / 50))
      for (const hit of rows) {
        if (hit?.type !== 'INTERNSHIP' || !hit.objectID || seen.has(hit.objectID)) {
          continue
        }
        if (!isIdealistKeptHit(hit)) {
          continue
        }
        seen.add(hit.objectID)
        hits.push(hit)
      }
      page += 1
      if (page < pages) {
        await sleep(150)
      }
    }
  }
  catch (error) {
    process.stderr.write(`Idealist search skipped: ${error.message}\n`)
    return []
  }

  const listings = []
  const workers = 6
  let cursor = 0
  async function worker() {
    while (cursor < hits.length) {
      const index = cursor
      cursor += 1
      try {
        const item = await enrichIdealistListing(hits[index])
        if (item) {
          listings.push(item)
        }
      }
      catch (error) {
        process.stderr.write(`Idealist listing ${hits[index]?.objectID}: ${error.message}\n`)
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(workers, hits.length) }, worker))
  return listings
}

async function fetchWorkdaySearch(board, searchText, offset) {
  const url = `${board.host}/wday/cxs/${board.tenant}/${board.site}/jobs`
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'user-agent': UA,
      accept: 'application/json',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      appliedFacets: {},
      limit: 20,
      offset,
      searchText,
    }),
    redirect: 'follow',
  })
  if (!response.ok) {
    throw new Error(`${url} → ${response.status}`)
  }
  return response.json()
}

function parseWorkdayPostings(board, postings, idPrefix = 'biotech') {
  const listings = []
  for (const job of postings || []) {
    const role = clean(job.title)
    if (!role || !isInternshipRole(role) || isGenericInternRole(role) || isDroppedInternshipRole(role)) {
      continue
    }
    const location = workdayLocation(job)
    if (!isUsCanadaOrRemoteLocation(location)) {
      continue
    }
    const path = String(job.externalPath || '')
    const url = path
      ? normalizeUrl(`${board.host}/en-US/${board.site}${path}`)
      : ''
    if (url && !/^https:\/\//i.test(url)) {
      continue
    }
    const track = idPrefix === 'biotech'
      ? biotechFallbackTrack(board.company, role, inferTrack(role))
      : inferTrack(role)
    listings.push({
      id: `${idPrefix}-${slugPart(board.company)}-${slugPart(role)}-${slugPart(job.bulletFields?.[0] || location)}`,
      company: board.company,
      role,
      location,
      url,
      posted: formatWorkdayPosted(job.postedOn),
      season: inferSeason(role),
      track,
      closed: false,
      noSponsorship: false,
      usCitizen: false,
    })
  }
  return listings
}

async function fetchWorkdayInternships(boards, idPrefix, label) {
  const listings = []
  for (const board of boards) {
    const seen = new Set()
    for (const searchText of ['internship', 'intern', 'co-op']) {
      let offset = 0
      let total = Infinity
      let pages = 0
      while (offset < total && pages < 8) {
        try {
          const data = await fetchWorkdaySearch(board, searchText, offset)
          const postings = data.jobPostings || []
          total = Number.isFinite(Number(data.total)) ? Number(data.total) : postings.length
          for (const item of parseWorkdayPostings(board, postings, idPrefix)) {
            if (seen.has(item.id)) {
              continue
            }
            seen.add(item.id)
            listings.push(item)
          }
          offset += 20
          pages += 1
          if (offset < total) {
            await sleep(200)
          }
        }
        catch (error) {
          process.stderr.write(`${label} ${board.company} ${searchText}: ${error.message}\n`)
          break
        }
      }
      await sleep(150)
    }
  }
  return listings
}

function fetchBiotechInternships() {
  return fetchWorkdayInternships(BIOTECH_BOARDS, 'biotech', 'Biotech')
}

function fetchCompanyWorkdayInternships() {
  return fetchWorkdayInternships(COMPANY_WORKDAY_BOARDS, 'company', 'Company')
}

function atsLocation(raw) {
  if (!raw) {
    return ''
  }
  if (Array.isArray(raw)) {
    const parts = raw
      .map((item) => atsLocation(item))
      .filter(Boolean)
    return [...new Set(parts)].join(', ')
  }
  if (typeof raw === 'object') {
    return clean(raw.name || raw.locationName || raw.city || raw.location || '')
  }
  return clean(raw)
}

function keepAtsLocation(location) {
  if (!location) {
    return true
  }
  return isUsCanadaOrRemoteLocation(location)
}

function listingFromAts(board, role, location, url, posted, extra = {}) {
  if (!role || !isInternshipRole(role) || isGenericInternRole(role) || isDroppedInternshipRole(role)) {
    return null
  }
  if (!keepAtsLocation(location)) {
    return null
  }
  const href = normalizeUrl(url)
  if (!/^https:\/\//i.test(href)) {
    return null
  }
  return {
    id: `company-${slugPart(board.company)}-${slugPart(role)}-${slugPart(location)}`,
    company: board.company,
    role,
    location: location || 'See posting',
    url: href,
    posted,
    season: inferSeason(role),
    track: inferTrack(role),
    closed: false,
    noSponsorship: false,
    usCitizen: false,
    ...extra,
  }
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      'user-agent': UA,
      accept: 'application/json',
      ...options.headers,
    },
    redirect: 'follow',
    signal: AbortSignal.timeout(options.timeoutMs || 15000),
  })
  if (!response.ok) {
    throw new Error(`${url} → ${response.status}`)
  }
  return response.json()
}

async function fetchGreenhouseBoard(board) {
  const data = await fetchJson(`https://boards-api.greenhouse.io/v1/boards/${board.board}/jobs?content=true`)
  const listings = []
  for (const job of data.jobs || []) {
    const offices = (job.offices || []).map((office) => office.name).filter(Boolean)
    const location = atsLocation(job.location?.name) || atsLocation(offices)
    const item = listingFromAts(
      board,
      clean(job.title),
      location,
      job.absolute_url,
      formatIsoPosted(job.first_published || job.updated_at),
      {
        postedAt: isoFromDateValue(job.first_published || job.updated_at),
        ...postingFields(job.content || ''),
      },
    )
    if (item) {
      listings.push(item)
    }
  }
  return listings
}

async function fetchAshbyBoard(board) {
  const data = await fetchJson(`https://api.ashbyhq.com/posting-api/job-board/${board.board}`)
  const jobs = data.jobs || data.results || []
  const listings = []
  for (const job of jobs) {
    const location = atsLocation(job.location)
      || atsLocation(job.locations)
      || atsLocation(job.address?.postalAddress?.addressLocality)
    const item = listingFromAts(
      board,
      clean(job.title),
      location,
      job.jobUrl || job.applyUrl || (job.id ? `https://jobs.ashbyhq.com/${board.board}/${job.id}` : ''),
      formatIsoPosted(job.publishedAt || job.publishedDate),
      {
        postedAt: isoFromDateValue(job.publishedAt || job.publishedDate),
        ...postingFields(job.descriptionPlain || job.descriptionHtml || job.description || ''),
      },
    )
    if (item) {
      listings.push(item)
    }
  }
  return listings
}

async function fetchLeverBoard(board) {
  const data = await fetchJson(`https://api.lever.co/v0/postings/${board.board}?mode=json`, {
    timeoutMs: 25000,
  })
  const jobs = Array.isArray(data) ? data : []
  const listings = []
  for (const job of jobs) {
    const location = atsLocation(job.categories?.location)
      || atsLocation(job.categories?.allLocations)
    const created = Number(job.createdAt)
    const lists = (job.lists || []).map((row) => `${row.text || ''}\n${row.content || ''}`).join('\n')
    const item = listingFromAts(
      board,
      clean(job.text || job.title),
      location,
      job.hostedUrl || job.applyUrl,
      Number.isFinite(created) && created > 0 ? formatPosted(Math.floor(created / 1000)) : '',
      {
        postedAt: Number.isFinite(created) && created > 0 ? isoFromUnix(created) : '',
        ...postingFields([job.descriptionPlain, job.description, lists].filter(Boolean).join('\n')),
      },
    )
    if (item) {
      listings.push(item)
    }
  }
  return listings
}

async function fetchCompanyAtsInternships() {
  const listings = []
  for (const board of COMPANY_ATS_BOARDS) {
    try {
      const rows = board.kind === 'ashby'
        ? await fetchAshbyBoard(board)
        : board.kind === 'lever'
          ? await fetchLeverBoard(board)
          : await fetchGreenhouseBoard(board)
      listings.push(...rows)
    }
    catch (error) {
      process.stderr.write(`Company ${board.company}: ${error.message}\n`)
    }
    await sleep(120)
  }
  return listings
}

function extractAfCallback(html, key) {
  const marker = `AF_initDataCallback({key: '${key}'`
  const start = html.indexOf(marker)
  if (start < 0) {
    return null
  }
  const dataStart = html.indexOf('data:', start) + 5
  let depth = 0
  let i = dataStart
  while (i < html.length) {
    const ch = html[i]
    if (ch === '[' || ch === '{') {
      depth += 1
    }
    else if (ch === ']' || ch === '}') {
      depth -= 1
      if (depth === 0) {
        i += 1
        break
      }
    }
    else if (ch === '"') {
      i += 1
      while (i < html.length) {
        if (html[i] === '"' && html[i - 1] !== '\\') {
          break
        }
        i += 1
      }
    }
    i += 1
  }
  try {
    return JSON.parse(html.slice(dataStart, i))
  }
  catch {
    return null
  }
}

async function fetchHtml(url) {
  const response = await fetch(url, {
    headers: {
      'user-agent': BROWSER_UA,
      accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'accept-language': 'en-US,en;q=0.9',
    },
    redirect: 'follow',
    signal: AbortSignal.timeout(20000),
  })
  if (!response.ok) {
    throw new Error(`${url} → ${response.status}`)
  }
  return response.text()
}

function formatAtsPlaces(parts) {
  const places = [...new Set((parts || []).map(clean).filter(Boolean))]
  if (!places.length) {
    return 'See posting'
  }
  if (places.length >= 3) {
    return `${places.length} locations ${places.join(', ')}`
  }
  return places.join(', ')
}

async function fetchAmazonInternships() {
  const listings = []
  const seen = new Set()
  for (const country of ['USA', 'CAN']) {
    let offset = 0
    let hits = Infinity
    let pages = 0
    while (offset < hits && pages < 15) {
      const url = new URL('https://www.amazon.jobs/en/search.json')
      url.searchParams.set('base_query', 'intern')
      url.searchParams.set('offset', String(offset))
      url.searchParams.set('result_limit', '100')
      url.searchParams.set('sort', 'relevant')
      url.searchParams.set('country', country)
      const data = await fetchJson(url, { timeoutMs: 20000 })
      const jobs = data.jobs || []
      hits = Number.isFinite(Number(data.hits)) ? Number(data.hits) : jobs.length
      for (const job of jobs) {
        const role = clean(job.title)
        const location = clean(job.normalized_location || job.location || [job.city, job.state].filter(Boolean).join(', '))
        const path = String(job.job_path || '')
        const href = path
          ? `https://www.amazon.jobs${path}`
          : job.id_icims
            ? `https://www.amazon.jobs/en/jobs/${job.id_icims}`
            : ''
        const item = listingFromAts(
          { company: 'Amazon' },
          role,
          location,
          href,
          formatPosted(Date.parse(job.posted_date) / 1000) || formatWorkdayPosted(job.updated_time),
          {
            postedAt: isoFromDateValue(job.posted_date) || postedAtFromLabel(formatWorkdayPosted(job.updated_time)),
            ...postingFields([job.description_short, job.description, job.basic_qualifications].filter(Boolean).join('\n')),
          },
        )
        if (!item || seen.has(item.url)) {
          continue
        }
        seen.add(item.url)
        item.id = `company-amazon-${slugPart(role)}-${slugPart(job.id_icims || job.id || location)}`
        listings.push(item)
      }
      if (!jobs.length) {
        break
      }
      offset += jobs.length
      pages += 1
      if (offset < hits) {
        await sleep(150)
      }
    }
  }
  return listings
}

async function fetchGoogleInternships() {
  const listings = []
  const seen = new Set()
  let page = 1
  let total = Infinity
  while (page <= 8 && listings.length < total) {
    const url = new URL('https://www.google.com/about/careers/applications/jobs/results')
    url.searchParams.set('q', 'intern')
    if (page > 1) {
      url.searchParams.set('page', String(page))
    }
    const html = await fetchHtml(url)
    const data = extractAfCallback(html, 'ds:1')
    const jobs = Array.isArray(data?.[0]) ? data[0] : []
    if (typeof data?.[2] === 'number') {
      total = data[2]
    }
    for (const job of jobs) {
      if (!Array.isArray(job)) {
        continue
      }
      const id = String(job[0] || '')
      const role = clean(job[1])
      if (!id || seen.has(id)) {
        continue
      }
      const company = clean(job[7]) || 'Google'
      const locRows = Array.isArray(job[9]) ? job[9] : []
      const places = locRows.map((row) => (Array.isArray(row) ? clean(row[0] || row[2]) : '')).filter(Boolean)
      const location = formatAtsPlaces(places)
      const postedAt = Array.isArray(job[12]) ? isoFromUnix(job[12][0]) : ''
      const about = Array.isArray(job[10]) ? job[10][1] : ''
      const item = listingFromAts(
        { company },
        role,
        location,
        `https://www.google.com/about/careers/applications/jobs/results/${id}-${slugPart(role)}`,
        postedAt ? formatPosted(Date.parse(postedAt) / 1000) : '',
        {
          postedAt,
          ...postingFields([about, Array.isArray(job[3]) ? job[3][1] : '', Array.isArray(job[4]) ? job[4][1] : ''].filter(Boolean).join('\n')),
        },
      )
      if (!item) {
        continue
      }
      seen.add(id)
      item.id = `company-google-${slugPart(role)}-${id.slice(-8)}`
      listings.push(item)
    }
    if (!jobs.length) {
      break
    }
    page += 1
    await sleep(200)
  }
  return listings
}

function parseMetaSearchHtml(html) {
  const listings = []
  const seen = new Set()
  const re = /\/profile\/job_details\/(\d+)/g
  let match = re.exec(html)
  while (match) {
    const id = match[1]
    if (seen.has(id)) {
      match = re.exec(html)
      continue
    }
    seen.add(id)
    const window = html.slice(Math.max(0, match.index - 400), match.index + 800)
    const title = clean(
      (window.match(/"title":"([^"]+)"/) || window.match(/<h3[^>]*>([^<]+)<\/h3>/) || [])[1] || '',
    )
    const location = clean(
      (window.match(/"locations?":\["([^"]+)"/) || window.match(/([A-Z][A-Za-z .]+,\s*[A-Z]{2})/) || [])[1] || '',
    )
    const item = listingFromAts(
      { company: 'Meta' },
      title,
      location,
      `https://www.metacareers.com/jobs/${id}`,
      '',
    )
    if (item) {
      item.id = `company-meta-${slugPart(item.role)}-${id.slice(-8)}`
      listings.push(item)
    }
    match = re.exec(html)
  }
  return listings
}

async function fetchMetaInternships() {
  const listings = []
  const seen = new Set()
  const queries = [
    ['roles', 'https://www.metacareers.com/jobsearch/?roles[0]=Internship'],
    ['intern', 'https://www.metacareers.com/jobsearch/?q=intern&roles[0]=Internship'],
    ['software', 'https://www.metacareers.com/jobsearch/?q=software+engineer+intern'],
  ]
  for (const [label, href] of queries) {
    try {
      const html = await fetchHtml(href)
      for (const item of parseMetaSearchHtml(html)) {
        if (seen.has(item.url)) {
          continue
        }
        seen.add(item.url)
        listings.push(item)
      }
    }
    catch (error) {
      process.stderr.write(`Meta ${label}: ${error.message}\n`)
    }
    await sleep(200)
  }
  return listings
}

async function fetchCompanyInternships() {
  const [ats, workday, amazon, google, meta] = await Promise.all([
    fetchCompanyAtsInternships(),
    fetchCompanyWorkdayInternships(),
    fetchAmazonInternships().catch((error) => {
      process.stderr.write(`Amazon: ${error.message}\n`)
      return []
    }),
    fetchGoogleInternships().catch((error) => {
      process.stderr.write(`Google: ${error.message}\n`)
      return []
    }),
    fetchMetaInternships(),
  ])
  return [...ats, ...workday, ...amazon, ...google, ...meta]
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: { 'user-agent': UA, accept: 'text/plain, application/json;q=0.9, */*;q=0.8' },
    redirect: 'follow',
  })
  if (!response.ok) {
    throw new Error(`${url} → ${response.status}`)
  }
  return response.text()
}

const ENRICH_CONCURRENCY = 10
const ENRICH_TIMEOUT_MS = 12000

function isTruncatedRole(role) {
  return /\.\.\.\s*$|…\s*$/.test(String(role || ''))
}

function decodeEntities(text) {
  return String(text || '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#160;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/&rsquo;/g, '’')
    .replace(/&lsquo;/g, '‘')
    .replace(/&rdquo;/g, '”')
    .replace(/&ldquo;/g, '“')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(Number.parseInt(n, 16)))
}

function metaContent(html, property) {
  const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']+)["'][^>]*>|<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${escaped}["'][^>]*>`,
    'i',
  )
  const match = String(html || '').match(re)
  return decodeEntities(match?.[1] || match?.[2] || '').replace(/\s+/g, ' ').trim()
}

function pageTitle(html) {
  const raw = String(html || '').match(/<title[^>]*>([^<]+)/i)?.[1] || ''
  return decodeEntities(raw).replace(/\s+/g, ' ').trim()
}

function cleanFetchedTitle(raw, company = '', location = '') {
  let title = decodeEntities(raw).replace(/\s+/g, ' ').trim()
  if (!title) {
    return ''
  }
  const jobApp = title.match(/^job application for\s+(.+?)\s+at\s+.+$/i)
  if (jobApp) {
    title = jobApp[1].trim()
  }
  title = title
    .replace(/\s*[|\u2013\u2014-]\s*(careers?|jobs?|early careers?)\s*$/i, '')
    .replace(/\s+at\s+[A-Z][\w .,&'-]{1,60}$/u, (suffix) => {
      const name = suffix.replace(/^\s+at\s+/i, '').trim()
      if (company && name.toLowerCase().includes(String(company).toLowerCase().slice(0, 12))) {
        return ''
      }
      return suffix
    })
    .replace(/\s+/g, ' ')
    .trim()

  if (location) {
    const loc = String(location).replace(/, United States$/i, '').trim()
    const locShort = loc.split(',')[0]?.trim() || ''
    const escape = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    if (loc.length >= 4) {
      title = title.replace(new RegExp(`\\s*[-–—]\\s*${escape(loc)}\\s*$`, 'i'), '').trim()
    }
    if (locShort.length >= 4) {
      title = title.replace(new RegExp(`\\s*[-–—]\\s*${escape(locShort)}(?:,.*)?\\s*$`, 'i'), '').trim()
    }
  }
  return title
}

function roleStem(role) {
  return String(role || '')
    .replace(/\.\.\.\s*$|…\s*$/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

function isBetterRoleTitle(current, next) {
  const cleaned = String(next || '').replace(/\s+/g, ' ').trim()
  if (!cleaned || isTruncatedRole(cleaned) || cleaned.length < 8) {
    return false
  }
  const stem = roleStem(current)
  const stemLen = stem.length
  if (!stemLen) {
    return false
  }
  const lower = cleaned.toLowerCase()
  // Require the fetched title to continue the truncated label, not replace it
  // with a shorter/unrelated ATS title.
  if (!lower.startsWith(stem) && !lower.startsWith(stem.replace(/\s*[-–—,:]\s*$/, ''))) {
    return false
  }
  return cleaned.length >= stemLen + 3
}

async function fetchListingTitle(url, company = '', location = '') {
  const response = await fetch(url, {
    redirect: 'follow',
    headers: {
      'user-agent': BROWSER_UA,
      accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8',
      'accept-language': 'en-US,en;q=0.9',
    },
    signal: AbortSignal.timeout(ENRICH_TIMEOUT_MS),
  })
  const html = await response.text()
  if (!response.ok) {
    return ''
  }
  return cleanFetchedTitle(metaContent(html, 'og:title') || pageTitle(html), company, location)
}

async function enrichTruncatedListings(listings, { onProgress } = {}) {
  const targets = listings
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => isTruncatedRole(item.role) && /^https:\/\//i.test(item.url))
  let done = 0
  let expanded = 0
  let cursor = 0

  async function worker() {
    while (cursor < targets.length) {
      const current = targets[cursor]
      cursor += 1
      try {
        const title = await fetchListingTitle(current.item.url, current.item.company, current.item.location)
        if (title && isBetterRoleTitle(current.item.role, title)) {
          current.item.role = title
          current.item.track = inferTrack(title)
          expanded += 1
        }
      }
      catch {
        // Many ATS boards block bots; keep the truncated label.
      }
      done += 1
      onProgress?.(done, targets.length)
    }
  }

  const workers = Array.from(
    { length: Math.min(ENRICH_CONCURRENCY, Math.max(1, targets.length)) },
    () => worker(),
  )
  await Promise.all(workers)
  return { targets: targets.length, expanded }
}

function enrichExistingTitlesOnly() {
  return (async () => {
    const raw = JSON.parse(readFileSync(OUT, 'utf8'))
    process.stdout.write(`Enriching truncated internship titles in ${OUT}…\n`)
    const stats = await enrichTruncatedListings(raw.listings, {
      onProgress(done, total) {
        if (done % 25 === 0 || done === total) {
          process.stdout.write(`  ${done}/${total}\n`)
        }
      },
    })
    writeFileSync(OUT, `${JSON.stringify(raw, null, 2)}\n`)
    process.stdout.write(`Expanded ${stats.expanded}/${stats.targets} truncated titles\n`)
  })()
}

async function writeSummaryProgress(label, listings, { force = false, persist } = {}) {
  process.stdout.write(`${label}\n`)
  const stats = await enrichListingSummaries(listings, {
    force,
    onProgress(done, total) {
      if (done % 25 === 0 || done === total) {
        process.stdout.write(`  ${done}/${total}\n`)
      }
      if (persist && (done % 50 === 0 || done === total)) {
        persist()
      }
    },
  })
  process.stdout.write(`  filled ${stats.filled}/${stats.targets}\n`)
  return stats
}

function enrichExistingSummariesOnly() {
  return (async () => {
    const raw = JSON.parse(readFileSync(OUT, 'utf8'))
    const persist = () => writeFileSync(OUT, `${JSON.stringify(raw, null, 2)}\n`)
    await writeSummaryProgress(`Enriching posting summaries in ${OUT}…`, raw.listings, {
      force: process.argv.includes('--force'),
      persist,
    })
    const withSummary = raw.listings.filter((item) => item.summary).length
    const withKeywords = raw.listings.filter((item) => item.keywords).length
    persist()
    process.stdout.write(`Summaries ${withSummary}/${raw.listings.length} · keywords ${withKeywords}/${raw.listings.length}\n`)
  })()
}

function trackForListing(item) {
  const id = String(item.id || '')
  let next = inferTrack(item.role)
  if (id.startsWith('biotech-') || /sanofi/i.test(item.company)) {
    next = biotechFallbackTrack(item.company, item.role, next)
  }
  if (id.startsWith('idealist-') && next === 'other') {
    next = 'nonprofit'
  }
  return next
}

function reclassifyExisting() {
  const raw = JSON.parse(readFileSync(OUT, 'utf8'))
  const before = {}
  const after = {}
  let changed = 0
  for (const item of raw.listings) {
    before[item.track] = (before[item.track] || 0) + 1
    const next = trackForListing(item)
    if (next !== item.track) {
      changed += 1
      item.track = next
    }
    after[item.track] = (after[item.track] || 0) + 1
  }
  writeFileSync(OUT, `${JSON.stringify(raw, null, 2)}\n`)
  process.stdout.write(
    `Reclassified ${changed}/${raw.listings.length} internship tracks in ${OUT}\n`
    + `  before other=${before.other || 0}\n`
    + `  after  other=${after.other || 0}\n`
    + `  tracks ${JSON.stringify(after)}\n`,
  )
}

async function main() {
  loadEnv()
  if (process.argv.includes('--reclassify-only')) {
    reclassifyExisting()
    return
  }
  if (process.argv.includes('--enrich-titles-only')) {
    await enrichExistingTitlesOnly()
    return
  }
  if (process.argv.includes('--enrich-summaries')) {
    await enrichExistingSummariesOnly()
    return
  }
  if (process.argv.includes('--company-only')) {
    const raw = JSON.parse(readFileSync(OUT, 'utf8'))
    process.stdout.write('Fetching official company career boards…\n')
    const existingAsOf = existsSync(OUT) ? statSync(OUT).mtime : new Date()
    const company = await fetchCompanyInternships()
    const listings = withPostedAt(
      mergeListings(withPostedAt(raw.listings || [], existingAsOf), withPostedAt(company)),
      new Date(),
    ).filter((item) => isSpecificPostingUrl(item.url))
    const openCount = listings.filter((item) => !item.closed).length
    const payload = {
      ...raw,
      scrapedAt: new Date().toISOString().slice(0, 10),
      note: raw.note || 'Public snapshot of internships from GitHub lists, USAJobs, Y Combinator, and official company career boards.',
      count: listings.length,
      openCount,
      listings,
    }
    writeFileSync(OUT, `${JSON.stringify(payload, null, 2)}\n`)
    process.stdout.write(
      `Wrote ${listings.length} internships (${openCount} open) to ${OUT}\n`
      + `  company boards ${company.length} · net ${(listings.length - (raw.listings || []).length)}\n`,
    )
    return
  }

  const [summerMd, offseasonMd, simplifyJson, jobrightMd, zapplyMd, usajobs, biotech, yc, idealist, company] = await Promise.all([
    fetchText(SOURCE.vanshSummer),
    fetchText(SOURCE.vanshOffseason),
    fetchText(SOURCE.simplifyListings),
    fetchText(SOURCE.jobrightReadme),
    fetchText(SOURCE.zapplyReadme),
    fetchUsaJobs(),
    fetchBiotechInternships(),
    fetchYcInternships(),
    fetchIdealistInternships(),
    fetchCompanyInternships(),
  ])

  const vansh = [
    ...parseVanshTable(summerMd, 'summer'),
    ...parseVanshTable(offseasonMd, 'offseason'),
  ]
  const simplify = parseSimplifyListings(JSON.parse(simplifyJson))
  const jobright = parseJobrightTable(jobrightMd)
  const zapply = parseZapplyTables(zapplyMd)
  let listings = withPostedAt(
    mergeListings(vansh, simplify, jobright, zapply, usajobs, biotech, yc, idealist, company),
  ).filter((item) => isSpecificPostingUrl(item.url))
  if (process.argv.includes('--check-links')) {
    process.stdout.write(`Checking ${listings.length} apply links…\n`)
    const pruned = await pruneDeadInternshipListings(listings, {
      onProgress(done, total) {
        if (done % 50 === 0 || done === total) {
          process.stdout.write(`  ${done}/${total}\n`)
        }
      },
    })
    process.stdout.write(
      `  dropped ${pruned.dead.length} dead links`
      + ` · kept ${pruned.unknown.length} unverified (blocked/timeout)\n`
      + `  dead reasons ${JSON.stringify(pruned.reasons)}\n`,
    )
    listings = pruned.listings
  }

  process.stdout.write('Enriching truncated role titles from apply pages…\n')
  const enrichStats = await enrichTruncatedListings(listings, {
    onProgress(done, total) {
      if (done % 25 === 0 || done === total) {
        process.stdout.write(`  ${done}/${total}\n`)
      }
    },
  })
  process.stdout.write(`  expanded ${enrichStats.expanded}/${enrichStats.targets}\n`)

  await writeSummaryProgress('Enriching posting summaries from official apply pages…', listings)

  const openCount = listings.filter((item) => !item.closed).length
  const tracks = listings.reduce((counts, item) => {
    counts[item.track] = (counts[item.track] || 0) + 1
    return counts
  }, {})
  const sources = [SOURCE.vansh, SOURCE.simplify, SOURCE.jobright, SOURCE.zapply]
  if (usajobs.length) {
    sources.push(SOURCE.usajobs)
  }
  if (yc.length) {
    sources.push(SOURCE.yc)
  }
  if (idealist.length) {
    sources.push(SOURCE.idealist)
  }

  const payload = {
    scrapedAt: new Date().toISOString().slice(0, 10),
    source: SOURCE.vansh,
    sources,
    note: 'Public snapshot of internships from GitHub lists, USAJobs student openings, Y Combinator, Idealist, and official company career boards. Apply on the listing page; roles close without notice and deadlines are rarely published.',
    count: listings.length,
    openCount,
    listings,
  }

  writeFileSync(OUT, `${JSON.stringify(payload, null, 2)}\n`)
  process.stdout.write(
    `Wrote ${listings.length} internships (${openCount} open) to ${OUT}\n`
    + `  vansh ${vansh.length} · simplify ${simplify.length} · jobright ${jobright.length} · zapply ${zapply.length}`
    + ` · usajobs ${usajobs.length} · biotech ${biotech.length} · yc ${yc.length} · idealist ${idealist.length} · company ${company.length}\n`
    + `  tracks ${JSON.stringify(tracks)}\n`,
  )
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
