/**
 * Pull a short summary and searchable skill mentions from official
 * apply-page APIs (Greenhouse, Lever, Ashby, Workday, SmartRecruiters,
 * Oracle Cloud, USAJobs) or public posting text. Prefers what the intern will do and
 * the tools they ask for — not culture, EEO, or “click to apply” copy.
 * Does not fetch Handshake, LinkedIn, or Indeed.
 */
export const SKIPPED_APPLY_HOSTS = /handshake\.com|joinhandshake\.com|linkedin\.com|indeed\.com/i

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
const TIMEOUT_MS = 12000

const SKILL_TERMS = [
  { id: 'python', label: 'Python', test: /\bpython\b/i },
  { id: 'java', label: 'Java', test: /\bjava\b(?!\s*script)/i },
  { id: 'javascript', label: 'JavaScript', test: /\bjavascript\b|\bnode\.?js\b/i },
  { id: 'typescript', label: 'TypeScript', test: /\btypescript\b/i },
  { id: 'cpp', label: 'C++', test: /\bc\+\+\b|\bcpp\b/i },
  { id: 'csharp', label: 'C#', test: /\bc#\b|\bdotnet\b|\b\.net\b/i },
  { id: 'golang', label: 'Go', test: /\bgolang\b|\bgo lang\b/i },
  { id: 'rust', label: 'Rust', test: /\brust\b/i },
  { id: 'ruby', label: 'Ruby', test: /\bruby\b|\brails\b/i },
  { id: 'swift', label: 'Swift', test: /\bswift\b/i },
  { id: 'kotlin', label: 'Kotlin', test: /\bkotlin\b/i },
  { id: 'scala', label: 'Scala', test: /\bscala\b/i },
  { id: 'matlab', label: 'MATLAB', test: /\bmatlab\b/i },
  { id: 'rlang', label: 'R', test: /\br studio\b|\br language\b|\buse r\b|\bprogramming in r\b/i },
  { id: 'sql', label: 'SQL', test: /\bsql\b|\bpostgres|\bmysql\b|\bsnowflake\b/i },
  { id: 'react', label: 'React', test: /\breact(?:\.?js| native)?\b/i },
  { id: 'vue', label: 'Vue', test: /\bvue(?:\.?js)?\b/i },
  { id: 'angular', label: 'Angular', test: /\bangular\b/i },
  { id: 'django', label: 'Django', test: /\bdjango\b/i },
  { id: 'flask', label: 'Flask', test: /\bflask\b/i },
  { id: 'spring', label: 'Spring', test: /\bspring boot\b|\bspring framework\b/i },
  { id: 'pytorch', label: 'PyTorch', test: /\bpytorch\b/i },
  { id: 'tensorflow', label: 'TensorFlow', test: /\btensorflow\b/i },
  { id: 'pandas', label: 'Pandas', test: /\bpandas\b/i },
  { id: 'spark', label: 'Spark', test: /\b(?:apache )?spark\b/i },
  { id: 'aws', label: 'AWS', test: /\baws\b|\bamazon web services\b/i },
  { id: 'azure', label: 'Azure', test: /\bazure\b/i },
  { id: 'gcp', label: 'GCP', test: /\bgcp\b|\bgoogle cloud\b/i },
  { id: 'docker', label: 'Docker', test: /\bdocker\b/i },
  { id: 'kubernetes', label: 'Kubernetes', test: /\bkubernetes\b|\bk8s\b/i },
  { id: 'linux', label: 'Linux', test: /\blinux\b/i },
  { id: 'git', label: 'Git', test: /\bgit\b/i },
  { id: 'excel', label: 'Excel', test: /\bexcel\b|\bmicrosoft excel\b/i },
  { id: 'tableau', label: 'Tableau', test: /\btableau\b/i },
  { id: 'powerbi', label: 'Power BI', test: /\bpower\s*bi\b/i },
  { id: 'figma', label: 'Figma', test: /\bfigma\b/i },
  { id: 'solidworks', label: 'SolidWorks', test: /\bsolidworks\b/i },
  { id: 'autocad', label: 'AutoCAD', test: /\bautocad\b/i },
  { id: 'revit', label: 'Revit', test: /\brevit\b/i },
  { id: 'catia', label: 'CATIA', test: /\bcatia\b/i },
  { id: 'ansys', label: 'ANSYS', test: /\bansys\b/i },
  { id: 'labview', label: 'LabVIEW', test: /\blabview\b/i },
  { id: 'verilog', label: 'Verilog', test: /\bverilog\b|\bvhdl\b/i },
  { id: 'fpga', label: 'FPGA', test: /\bfpga\b/i },
  { id: 'cuda', label: 'CUDA', test: /\bcuda\b/i },
  { id: 'salesforce', label: 'Salesforce', test: /\bsalesforce\b/i },
  { id: 'stata', label: 'Stata', test: /\bstata\b/i },
  { id: 'sas', label: 'SAS', test: /\bsas\b/i },
  { id: 'chinese', label: 'Chinese', test: /\bchinese\b|\bmandarin\b|\bcantonese\b/i },
  { id: 'spanish', label: 'Spanish', test: /\bspanish\b|\bespa[nñ]ol\b/i },
  { id: 'french', label: 'French', test: /\bfrench\b/i },
  { id: 'german', label: 'German', test: /\bgerman\b/i },
  { id: 'japanese', label: 'Japanese', test: /\bjapanese\b/i },
  { id: 'korean', label: 'Korean', test: /\bkorean\b/i },
  { id: 'arabic', label: 'Arabic', test: /\barabic\b/i },
  { id: 'portuguese', label: 'Portuguese', test: /\bportuguese\b/i },
  { id: 'hindi', label: 'Hindi', test: /\bhindi\b/i },
  { id: 'russian', label: 'Russian', test: /\brussian\b/i },
]

const SKIP_SENTENCE = /equal opportunity|eoe\b|click here to apply|apply now|we are an equal|proud to be|diversity and inclusion|reasonable accommodation|to apply[,:]|submit your (resume|application)|follow us|all qualified applicants|without regard to|race, color|sexual orientation|gender identity|veteran status|disability status|privacy policy|terms of (use|service)|cookie policy|linkedin|handshake|our values|guide how we hire|click the link|complete job description|view our opening|see all open jobs|learn more about what it|internship credit|consult with your advisor|print a copy|role description (?:is not|will not)|we strongly encourage applicants|core responsibilities of this job are described|we.?ll be supporting you with extensive training|brief internship description|work flexibility/i

const COMPANY_ABOUT = /^(?:.{0,48} )?(?:is (?:a |an |the )?(?:quantitative trading firm|leading|global|world-?class|fast-growing)|join the team redefining|millions of (?:individuals|people|teams)|we believe that developing the next generation|promotes and nurtures a diverse|our culture\b|defined by evolution|our mission is to|mission is to deliver results)/i

const DATE_ONLY = /internship will take place|approximate dates? of this internship|must graduate|expected to start around|minimum of \d+ weeks|this intern will work full-time through|if pursuing internship credit|actively enrolled in an academic program/i

const PROGRAM_FLUFF = /join a \d+-week|summer internship program|we empower future|learn how (?:products|software|security|ai|intelligent)|to learn how\b|grow your career|foundational confidence|participate in social events|early careers programming|candidate value proposition|employment eligibility|will not pursue visa|these skills will give you the tools/i

const DUTY_HEADING = /^(?:what you(?:'|’)?ll do|what you will do|what you will be doing|what to expect|responsibilit(?:y|ies)(?:\s*[&/:].*)?|key (?:tasks|duties|responsibilities)|day[- ]to[- ]day|about (?:the |this )?(?:role|internship|position|job)|the (?:role|internship|position)|your (?:role|work|impact)|how you(?:'|’)?ll|in this (?:role|internship)|(?:job|position) (?:summary|description)|overview|the opportunity|potential project areas|role description)$/i

const DUTY_HEADING_PREFIX = /^(?:what type of work|how will you make an impact)\b/i

const SKILL_HEADING = /^(?:qualifications?|requirements?|basic qualifications?|preferred qualifications?|minimum qualifications?|required (?:skills|qualifications)|preferred (?:skills|experience)|technical skills|skills(?: we| you| required| needed)?|what (?:we(?:'|’)re looking for|you(?:'|’)?ll (?:need|bring)|you bring)|must have|who you are|about you|you may be a good fit|required|preferred)$/i

const SKIP_HEADING = /^(?:about (?:us|the company|the team|american express)|who we are|our (?:culture|values|mission|benefits|core principles)|benefits|compensation|perks|equal opportunity|how to apply|to apply|legal|eeo|diversity|accommodation|work flexibility|what you get|why (?:join|us|you.?ll love)|life at|company description|additional information|learning opportunities|what you(?:'|’)?ll learn|preferred characteristics|physical(?: and| &)? environmental demands|time travel required|candidate value proposition)$/i

const ACTION_START = /^(?:you(?:'|’)?ll|you will|the intern(?:s)? will|interns? will|this (?:intern|role) will)?\s*(?:design|develop|build|create|write|implement|analyze|research|support|help|work(?:ing)? (?:on|with|alongside)|collaborate|assist|contribute|own|improve|test|debug|maintain|deploy|train|review|document|present|partner|drive|deliver|produce|evaluate|model|simulate|prototype|code|program|optimize|apply|use|perform|conduct|participate|lead|manage|coordinate|prepare|translate|define)/i

const WEAK_META = /view our opening|see all open jobs|learn more about what it|click the link|complete job description|current openings|^[\w .,'/-]{0,80}$/i

/** Custom career hosts that embed a Greenhouse job id. */
const GREENHOUSE_HOST_BOARD = {
  'janestreet.com': 'janestreet',
  'careers.withwaymo.com': 'waymo',
  'akunacapital.com': 'akunacapital',
  'careers.formlabs.com': 'formlabs',
  'samsara.com': 'samsara',
  'epicgames.com': 'epicgames',
  'careers.roblox.com': 'roblox',
  'jumptrading.com': 'jumptrading',
  'databricks.com': 'databricks',
  'careers.datadoghq.com': 'datadog',
  'optiver.com': 'optiver',
  'block.xyz': 'block',
  'stripe.com': 'stripe',
  'psiquantum.com': 'psiquantum',
  'oldmissioncapital.com': 'oldmission',
  'tower-research.com': 'towerresearchcapital',
  'pathai.com': 'pathai',
  'pindrop.com': 'pindrop',
  'hudsonrivertrading.com': 'hudsonrivertrading',
  'nuro.ai': 'nuro',
  'stokespace.com': 'stokespace',
  'verition.com': 'veritionfund',
  'x.company': 'x',
  'peakenergy.com': 'peakenergy',
  'pinterestcareers.com': 'pinterest',
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

export function htmlToText(html) {
  const decoded = decodeEntities(decodeEntities(String(html || '')))
  return decodeEntities(decoded
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<(h[1-6])[^>]*>/gi, '\n')
    .replace(/<\/(p|div|li|h[1-6]|tr|section|article|ul|ol)>/gi, '\n')
    .replace(/<li[^>]*>/gi, '\n• ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/\n{2,}/g, '\n')
    .trim())
}

function flatten(text) {
  return String(text || '').replace(/\s+/g, ' ').trim()
}

function skillHits(text) {
  const value = String(text || '')
  return SKILL_TERMS.filter((term) => term.test.test(value)).map((term) => term.label)
}

function isHeading(line) {
  const value = String(line || '').replace(/[:.\s?]+$/, '').trim()
  if (!value) {
    return ''
  }
  if (DUTY_HEADING_PREFIX.test(value) && value.length <= 160) {
    return 'duty'
  }
  if (value.length > 72) {
    return ''
  }
  if (DUTY_HEADING.test(value)) {
    return 'duty'
  }
  if (SKILL_HEADING.test(value)) {
    if (/preferred|areas and skills/i.test(value)) {
      return 'skill-preferred'
    }
    if (/minimum|required|basic|must have/i.test(value)) {
      return 'skill-required'
    }
    return 'skill'
  }
  if (SKIP_HEADING.test(value)) {
    return 'skip'
  }
  return ''
}

function splitHeadingRuns(text) {
  return String(text || '')
    .replace(/\s*[•·]\s*/g, '\n• ')
    .replace(/\s+(?=(?:What You(?:'|’)ll Do|What You Will Do|What You Will Be Doing|What To Expect|What You(?:'|’)ll Learn|What type of work|How will you make an impact|Key Responsibilities|(?<!Key )Responsibilities|Minimum Qualifications|Preferred Qualifications|Basic Qualifications|Required Skills|Technical Skills|(?<!(?:Minimum|Preferred|Basic) )Qualifications|Requirements|About the Role|About This Role|About the Internship|About the Team|Job Description|Job Summary|Position Summary|Role Description|What You(?:'|’)ll Bring|What We(?:'|’)re Looking For|About Us|About the Company|Benefits|Compensation|How to Apply|Business Unit(?:\/Role)?(?: Specific)?(?: Info(?:rmation)?)?|Potential Project Areas|Learning Opportunities|Candidate Value Proposition)\b)/gi, '\n')
}

function expandLines(lines) {
  return lines.flatMap((line) => line
    .split(/(?<=[.!?])\s+(?=[A-Z•])/)
    .map((part) => part.replace(/^•\s*/, '').replace(/\s+/g, ' ').trim())
    .filter((part) => part.length >= 12))
}

function sectionize(text) {
  const prepared = splitHeadingRuns(htmlToText(text))
  const sections = []
  let current = { kind: 'body', lines: [] }

  const push = () => {
    if (current.lines.length) {
      current.lines = expandLines(current.lines)
      if (current.lines.length) {
        sections.push(current)
      }
    }
  }

  for (const raw of prepared.split('\n')) {
    const line = raw.replace(/^•\s*/, '').replace(/\s+/g, ' ').trim()
    if (!line) {
      continue
    }
    const kind = isHeading(line)
    if (kind) {
      push()
      current = { kind, lines: [] }
      continue
    }
    current.lines.push(line)
  }
  push()
  return sections
}

function isUsefulDuty(line) {
  if (!line || line.length < 24) {
    return false
  }
  if (SKIP_SENTENCE.test(line) || DATE_ONLY.test(line) || COMPANY_ABOUT.test(line) || PROGRAM_FLUFF.test(line)) {
    return false
  }
  if (/^job description:?$/i.test(line)) {
    return false
  }
  return ACTION_START.test(line)
    || /you(?:'|’| wi)ll|intern(?:s)? will|this (?:role|intern) will|responsibilit/i.test(line)
    || skillHits(line).length > 0
}

function scoreDuty(line) {
  let score = 1
  if (SKIP_SENTENCE.test(line) || DATE_ONLY.test(line) || COMPANY_ABOUT.test(line) || PROGRAM_FLUFF.test(line)) {
    return -10
  }
  if (ACTION_START.test(line)) {
    score += 4
  }
  if (/you(?:'|’| wi)ll|intern(?:s)? will|this (?:role|intern) will/i.test(line)) {
    score += 3
  }
  if (skillHits(line).length) {
    score += 2
  }
  if (line.length > 280) {
    score -= 1
  }
  if (line.length < 40 && !ACTION_START.test(line)) {
    score -= 1
  }
  return score
}

function pickLines(lines, max) {
  return lines
    .map((line, index) => ({ line, index, score: scoreDuty(line) }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, max)
    .sort((a, b) => a.index - b.index)
    .map((row) => row.line.replace(/^[•\-*]\s*/, ''))
}

function pickDuties(sections, max = 2) {
  const fromDuty = sections.filter((row) => row.kind === 'duty').flatMap((row) => row.lines)
  const pool = fromDuty.filter(isUsefulDuty)
  if (pool.length) {
    return pickLines(pool, max)
  }
  const fromBody = sections
    .filter((row) => row.kind === 'duty' || row.kind === 'body')
    .flatMap((row) => row.lines)
    .filter(isUsefulDuty)
  if (fromBody.length) {
    return pickLines(fromBody, max)
  }
  return pickLines(
    sections
      .filter((row) => row.kind !== 'skip')
      .flatMap((row) => row.lines)
      .filter((line) => skillHits(line).length && !SKIP_SENTENCE.test(line) && !DATE_ONLY.test(line)),
    1,
  )
}

function skillText(sections, fallback) {
  const required = sections.filter((row) => row.kind === 'skill-required').flatMap((row) => row.lines).join('\n')
  if (required) {
    return required
  }
  const fromSkill = sections.filter((row) => row.kind === 'skill').flatMap((row) => row.lines).join('\n')
  if (fromSkill) {
    return fromSkill
  }
  const preferred = sections.filter((row) => row.kind === 'skill-preferred').flatMap((row) => row.lines).join('\n')
  return preferred || fallback
}

function finishSentence(text) {
  const value = flatten(text).replace(/^[•\-*]\s*/, '')
  if (!value) {
    return ''
  }
  if (/[.!?]$/.test(value)) {
    return value
  }
  return `${value.replace(/[,;:\s]+$/, '')}.`
}

function composeSummary(duties, keywords, { maxChars = 420 } = {}) {
  const dutyParts = duties.map(finishSentence).filter(Boolean)
  const labels = keywords ? keywords.split(', ').filter(Boolean).slice(0, 5) : []

  const tryJoin = (usedDuties, usedSkills) => {
    const duty = usedDuties.join(' ')
    const suffix = usedSkills.length ? `Relevant skills: ${usedSkills.join(', ')}.` : ''
    if (!duty) {
      return suffix
    }
    return suffix ? `${duty} ${suffix}` : duty
  }

  for (let n = dutyParts.length; n >= 1; n -= 1) {
    for (let k = labels.length; k >= 0; k -= 1) {
      const out = tryJoin(dutyParts.slice(0, n), labels.slice(0, k))
      if (out && out.length <= maxChars) {
        return out
      }
    }
  }

  if (labels.length) {
    const skillsOnly = `Relevant skills: ${labels.join(', ')}.`
    if (skillsOnly.length <= maxChars) {
      return skillsOnly
    }
  }
  return ''
}

export function summarizePosting(text, { maxChars = 420 } = {}) {
  const clean = htmlToText(text)
  if (!flatten(clean)) {
    return ''
  }
  const sections = sectionize(clean)
  const duties = pickDuties(sections)
  const keywords = extractKeywords(skillText(sections, clean))
  let out = composeSummary(duties, keywords, { maxChars })
  if (out && !SKIP_SENTENCE.test(out) && !WEAK_META.test(out)) {
    return out
  }

  const ranked = sections
    .filter((row) => row.kind !== 'skip')
    .flatMap((row) => row.lines)
    .map((line, index) => ({ line, index, score: scoreDuty(line) }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, 2)
    .sort((a, b) => a.index - b.index)
    .map((row) => row.line)

  out = composeSummary(ranked, keywords, { maxChars })
  if (out && !SKIP_SENTENCE.test(out) && !WEAK_META.test(out)) {
    return out
  }
  return keywords ? `Relevant skills: ${keywords}.` : ''
}

export function extractKeywords(text, { limit = 10 } = {}) {
  const clean = flatten(htmlToText(text))
  const found = []
  const seen = new Set()
  for (const term of SKILL_TERMS) {
    if (!term.test.test(clean) || seen.has(term.id)) {
      continue
    }
    seen.add(term.id)
    found.push(term.label)
    if (found.length >= limit) {
      break
    }
  }
  return found.join(', ')
}

export function isWeakSummary(text) {
  const value = flatten(text)
  if (!value) {
    return true
  }
  if (SKIP_SENTENCE.test(value) || WEAK_META.test(value) || COMPANY_ABOUT.test(value)) {
    return true
  }
  if (/\b[a-z]{1,3}\.{2,3}$/i.test(value)) {
    return true
  }
  if (/^business unit\b/i.test(value) && !/you(?:'|’)ll|you will|intern(?:s)? will/i.test(value)) {
    return true
  }
  if (PROGRAM_FLUFF.test(value)) {
    return true
  }
  if (/[a-z]\s+Relevant skills:/i.test(value)) {
    return true
  }
  return false
}

export function postingFields(text) {
  const summary = summarizePosting(text)
  const keywords = extractKeywords(text)
  const extra = {}
  if (summary && !isWeakSummary(summary)) {
    extra.summary = summary
  }
  if (keywords) {
    extra.keywords = keywords
  }
  return extra
}

function stripQuery(url) {
  return String(url || '').split('#')[0].split('?')[0]
}

function applyHost(url) {
  try {
    return new URL(String(url || '')).hostname.replace(/^www\./i, '').toLowerCase()
  }
  catch {
    return ''
  }
}

function greenhouseJobId(url) {
  const value = String(url || '')
  return (
    value.match(/[?&](?:gh_jid|token)=(\d+)/i)?.[1]
    || value.match(/\/jobs\/(\d+)/i)?.[1]
    || value.match(/janestreet\.com\/join-jane-street\/(?:position|apply)\/(\d+)/i)?.[1]
    || ''
  )
}

function greenhouseBoardFromHost(url) {
  const host = applyHost(url)
  if (GREENHOUSE_HOST_BOARD[host]) {
    return GREENHOUSE_HOST_BOARD[host]
  }
  if (/greenhouse\.io$/i.test(host)) {
    const board = String(url || '').match(/greenhouse\.io\/(?:embed\/job_app\?for=)?([^/?#&]+)/i)?.[1]
    if (board && board !== 'embed' && board !== 'job_app') {
      return decodeURIComponent(board)
    }
  }
  return ''
}

function greenhouseBoardFromHtml(html) {
  const match = String(html || '').match(
    /boards(?:-api)?\.greenhouse\.io\/(?:v1\/boards\/)?([a-z0-9-]+)|job-boards\.greenhouse\.io\/([a-z0-9-]+)|[?&]for=([a-z0-9-]+)/i,
  )
  const board = match?.[1] || match?.[2] || match?.[3] || ''
  if (!board || /^(embed|v1|boards|job_app|jobs)$/i.test(board)) {
    return ''
  }
  return board
}

export function parseApplyTarget(url) {
  const value = String(url || '').trim()
  if (!/^https:\/\//i.test(value) || SKIPPED_APPLY_HOSTS.test(value)) {
    return null
  }

  const greenhouse = value.match(
    /greenhouse\.io\/(?:embed\/job_app\?for=([^&]+).*?(?:token|gh_jid)=(\d+)|([^/?#]+)\/jobs\/(\d+))/i,
  )
  if (greenhouse) {
    const board = decodeURIComponent(greenhouse[1] || greenhouse[3] || '')
    const id = greenhouse[2] || greenhouse[4]
    if (board && id && board !== 'embed') {
      return {
        kind: 'greenhouse',
        api: `https://boards-api.greenhouse.io/v1/boards/${board}/jobs/${id}`,
      }
    }
  }

  const ghId = greenhouseJobId(value)
  const ghBoard = greenhouseBoardFromHost(value)
  if (ghId && ghBoard) {
    return {
      kind: 'greenhouse',
      api: `https://boards-api.greenhouse.io/v1/boards/${ghBoard}/jobs/${ghId}`,
    }
  }
  if (ghId) {
    return { kind: 'greenhouse-page', api: value, id: ghId }
  }

  const lever = value.match(/jobs(?:\.eu)?\.lever\.co\/([^/?#]+)\/([0-9a-f-]{16,})/i)
  if (lever) {
    const host = /jobs\.eu\.lever\.co/i.test(value) ? 'https://api.eu.lever.co' : 'https://api.lever.co'
    return { kind: 'lever', api: `${host}/v0/postings/${lever[1]}/${lever[2]}` }
  }

  const ashby = value.match(/jobs\.ashbyhq\.com\/([^/?#]+)\/([0-9a-f-]{16,})/i)
  if (ashby) {
    return {
      kind: 'ashby',
      api: `https://api.ashbyhq.com/posting-api/job-board/${decodeURIComponent(ashby[1])}/job/${ashby[2]}`,
    }
  }

  const workday = value.match(
    /^https:\/\/([^.]+)\.wd\d+\.myworkday(?:jobs|site)\.com\/(?:[a-z]{2}-[A-Z]{2}\/)?([^/?#]+)\/(?:job|details)\/([^?#]+)/i,
  )
  if (workday) {
    const origin = new URL(value).origin
    const path = stripQuery(`/${workday[3]}`).replace(/^\/+/, '')
    return {
      kind: 'workday',
      api: `${origin}/wday/cxs/${workday[1]}/${workday[2]}/job/${path}`,
    }
  }

  const smart = value.match(/jobs\.smartrecruiters\.com\/([^/?#]+)\/(\d+)/i)
  if (smart) {
    return {
      kind: 'smartrecruiters',
      api: `https://api.smartrecruiters.com/v1/companies/${smart[1]}/postings/${smart[2]}`,
    }
  }

  const tesla = value.match(/tesla\.com\/careers\/search\/job\/(?:[a-z0-9-]+-)?(\d+)/i)
  if (tesla) {
    return { kind: 'tesla', api: `https://www.tesla.com/cua-api/careers/job/${tesla[1]}` }
  }

  const oracle = value.match(
    /^https:\/\/([^/]*oraclecloud\.com)\/hcmUI\/CandidateExperience\/[^/]+\/sites\/([^/?#]+)\/job\/(\d+)/i,
  )
  if (oracle) {
    const params = new URLSearchParams({
      onlyData: 'true',
      finder: `ById;Id=${oracle[3]},siteNumber=${oracle[2]}`,
    })
    return {
      kind: 'oracle',
      api: `https://${oracle[1]}/hcmRestApi/resources/latest/recruitingCEJobRequisitionDetails?${params}`,
    }
  }

  const usajobs = value.match(/usajobs\.gov\/(?:job\/)?(\d+)/i)
  if (usajobs) {
    return { kind: 'usajobs', api: `https://www.usajobs.gov/job/${usajobs[1]}` }
  }

  if (/jobright\.ai|simplify\.jobs/i.test(value)) {
    return null
  }

  return { kind: 'html', api: value }
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

function jsonLdDescription(html) {
  const blocks = String(html || '').matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)
  for (const block of blocks) {
    try {
      const data = JSON.parse(block[1])
      const rows = Array.isArray(data) ? data : [data]
      for (const row of rows) {
        const graph = Array.isArray(row['@graph']) ? row['@graph'] : [row]
        for (const node of graph) {
          if (!node || (node['@type'] && !/jobposting/i.test(String(node['@type'])))) {
            continue
          }
          const text = [node.description, node.qualifications, node.responsibilities, node.skills]
            .filter(Boolean)
            .join('\n')
          if (text) {
            return String(text)
          }
        }
      }
    }
    catch {
      // ignore broken JSON-LD
    }
  }
  return ''
}

function walkJobText(value, found, depth = 0) {
  if (found.best && found.best.length > 1200) {
    return
  }
  if (depth > 8 || value == null) {
    return
  }
  if (typeof value === 'string') {
    const text = value.trim()
    if (text.length >= 80 && text.length <= 20000 && /you will|responsib|qualif|intern|experience with|design|develop/i.test(text)) {
      if (!found.best || text.length > found.best.length) {
        found.best = text
      }
    }
    return
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      walkJobText(item, found, depth + 1)
    }
    return
  }
  if (typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) {
      if (/description|responsibilit|qualification|requirement|jobAd|aboutTheJob|jobSummary/i.test(key)) {
        walkJobText(item, found, depth + 1)
      }
    }
  }
}

function embeddedJsonDescription(html) {
  const scripts = String(html || '').matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)
  for (const block of scripts) {
    const body = block[1].trim()
    if (body.length < 80 || !/description|jobDescription|responsibilit/i.test(body)) {
      continue
    }
    const json = body.replace(/^\s*window\.[A-Z_]+\s*=\s*/i, '').replace(/;?\s*$/, '')
    if (!json.startsWith('{') && !json.startsWith('[')) {
      continue
    }
    try {
      const found = { best: '' }
      walkJobText(JSON.parse(json), found)
      if (found.best) {
        return found.best
      }
    }
    catch {
      // ignore
    }
  }
  return ''
}

function mainContentHtml(html) {
  const stripped = String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<nav[\s\S]*?<\/nav>/gi, ' ')
    .replace(/<footer[\s\S]*?<\/footer>/gi, ' ')
    .replace(/<header[\s\S]*?<\/header>/gi, ' ')
  const regions = [
    /<(?:div|section|article)[^>]*(?:id|class)=["'][^"']*(?:job-?description|jobDescription|posting-?description|job-?details|job_description|opening-description)[^"']*["'][^>]*>([\s\S]{120,20000}?)<\/(?:div|section|article)>/i,
    /<(?:div|section)[^>]*(?:id|class)=["'][^"']*(?:content|main)[^"']*["'][^>]*>([\s\S]{200,20000}?)<\/(?:div|section)>/i,
  ]
  for (const re of regions) {
    const match = stripped.match(re)
    if (match?.[1] && htmlToText(match[1]).length > 120) {
      return match[1]
    }
  }
  return ''
}

function usefulMeta(html) {
  const og = metaContent(html, 'og:description') || metaContent(html, 'description')
  if (!og || WEAK_META.test(og) || og.length < 80) {
    return ''
  }
  return og
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: { 'user-agent': UA, accept: 'application/json' },
    redirect: 'follow',
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
  if (!response.ok) {
    throw new Error(`${url} → ${response.status}`)
  }
  return response.json()
}

async function fetchHtml(url) {
  const response = await fetch(url, {
    headers: {
      'user-agent': UA,
      accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8',
      'accept-language': 'en-US,en;q=0.9',
    },
    redirect: 'follow',
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
  const html = await response.text()
  if (!response.ok) {
    throw new Error(`${url} → ${response.status}`)
  }
  return html
}

function textFromGreenhouse(data) {
  return data?.content || ''
}

function textFromLever(data) {
  const lists = (data?.lists || [])
    .map((row) => `${row.text || ''}\n${row.content || ''}`)
    .join('\n')
  return [data?.descriptionPlain, data?.description, lists].filter(Boolean).join('\n')
}

function textFromAshby(data) {
  const job = data?.job || data
  return job?.descriptionPlain || job?.descriptionHtml || job?.description || ''
}

function textFromWorkday(data) {
  return data?.jobPostingInfo?.jobDescription
    || data?.jobPostingInfo?.jobDescriptionHtml
    || ''
}

function textFromSmartrecruiters(data) {
  const sections = data?.jobAd?.sections || {}
  return [sections.jobDescription?.text, sections.qualifications?.text].filter(Boolean).join('\n')
}

function textFromTesla(data) {
  return [data?.jobDescription, data?.jobResponsibilities, data?.jobRequirements].filter(Boolean).join('\n')
}

function textFromOracle(data) {
  const job = data?.items?.[0] || data
  const parts = [
    job?.ExternalDescriptionStr,
    job?.ExternalResponsibilitiesStr,
    job?.ExternalQualificationsStr,
  ].filter((value) => value && String(value).trim())
  if (parts.length) {
    return parts.join('\n')
  }
  return job?.ShortDescriptionStr || ''
}

function textFromHtml(html) {
  const jsonLd = jsonLdDescription(html)
  const embedded = embeddedJsonDescription(html)
  const main = mainContentHtml(html)
  const candidates = [jsonLd, embedded, main]
    .map((value) => ({ value, text: flatten(htmlToText(value)) }))
    .filter((row) => row.text.length > 80 && !WEAK_META.test(row.text))
    .sort((a, b) => b.text.length - a.text.length)
  if (candidates[0]) {
    return candidates[0].value
  }
  return usefulMeta(html)
}

const ashbyBoards = new Map()

async function textFromAshbyBoard(url) {
  const match = String(url || '').match(/jobs\.ashbyhq\.com\/([^/?#]+)\/([0-9a-f-]{16,})/i)
  if (!match) {
    return ''
  }
  const board = decodeURIComponent(match[1])
  const id = match[2]
  if (!ashbyBoards.has(board)) {
    ashbyBoards.set(board, fetchJson(`https://api.ashbyhq.com/posting-api/job-board/${board}`).catch(() => null))
  }
  const data = await ashbyBoards.get(board)
  const jobs = data?.jobs || data?.results || []
  const job = jobs.find((row) => String(row.id) === id)
  return textFromAshby(job)
}

async function textFromGreenhousePage(target) {
  const html = await fetchHtml(target.api)
  const board = greenhouseBoardFromHtml(html)
  if (board && target.id) {
    try {
      return textFromGreenhouse(await fetchJson(
        `https://boards-api.greenhouse.io/v1/boards/${board}/jobs/${target.id}`,
      ))
    }
    catch {
      // fall through to page text
    }
  }
  return textFromHtml(html)
}

export async function fetchPostingText(url) {
  const target = parseApplyTarget(url)
  if (!target) {
    return ''
  }
  try {
    if (target.kind === 'greenhouse') {
      return textFromGreenhouse(await fetchJson(target.api))
    }
    if (target.kind === 'greenhouse-page') {
      return await textFromGreenhousePage(target)
    }
    if (target.kind === 'lever') {
      return textFromLever(await fetchJson(target.api))
    }
    if (target.kind === 'ashby') {
      return await textFromAshbyBoard(url)
    }
    if (target.kind === 'workday') {
      return textFromWorkday(await fetchJson(target.api))
    }
    if (target.kind === 'smartrecruiters') {
      return textFromSmartrecruiters(await fetchJson(target.api))
    }
    if (target.kind === 'tesla') {
      return textFromTesla(await fetchJson(target.api))
    }
    if (target.kind === 'oracle') {
      return textFromOracle(await fetchJson(target.api))
    }
    return textFromHtml(await fetchHtml(target.api))
  }
  catch {
    if (target.kind !== 'html' && target.kind !== 'greenhouse-page') {
      try {
        return textFromHtml(await fetchHtml(url))
      }
      catch {
        return ''
      }
    }
    return ''
  }
}

export async function enrichListingSummaries(listings, { onProgress, force = false } = {}) {
  const targets = listings
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => {
      if (!/^https:\/\//i.test(item.url) || SKIPPED_APPLY_HOSTS.test(item.url)) {
        return false
      }
      if (!force && item.summary && item.keywords) {
        return false
      }
      return Boolean(parseApplyTarget(item.url))
    })

  let done = 0
  let filled = 0
  let cursor = 0
  const concurrency = 8

  async function worker() {
    while (cursor < targets.length) {
      const current = targets[cursor]
      cursor += 1
      try {
        const text = await fetchPostingText(current.item.url)
        const extra = postingFields(text)
        if (extra.summary && (!current.item.summary || force || isWeakSummary(current.item.summary))) {
          current.item.summary = extra.summary
        }
        else if (force && !extra.summary && isWeakSummary(current.item.summary)) {
          delete current.item.summary
        }
        if (extra.keywords && (!current.item.keywords || force)) {
          current.item.keywords = extra.keywords
        }
        if (extra.summary || extra.keywords) {
          filled += 1
        }
      }
      catch {
        // ATS boards often block bots; leave the row as-is.
      }
      done += 1
      onProgress?.(done, targets.length)
    }
  }

  await Promise.all(Array.from(
    { length: Math.min(concurrency, Math.max(1, targets.length)) },
    () => worker(),
  ))
  return { targets: targets.length, filled }
}
