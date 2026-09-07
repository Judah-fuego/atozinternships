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
  // Languages need skill context — bare "Spanish" is often a PDF/translation link.
  { id: 'spanish', label: 'Spanish', test: /\bspanish[- ]speaking\b|\bespa[nñ]ol\b|(?:speak(?:s|ing)?|spoken|fluent(?:ly)?|fluency|proficien(?:t|cy)|bilingual|native|language)\b[^.]{0,48}\bspanish\b|\bspanish\b[^.]{0,48}\b(?:speak|spoken|fluent|fluency|proficien(?:t|cy)|bilingual|language|required|preferred|plus)\b/i },
  { id: 'french', label: 'French', test: /\bfrench[- ]speaking\b|(?:speak(?:s|ing)?|spoken|fluent(?:ly)?|fluency|proficien(?:t|cy)|bilingual|native|language)\b[^.]{0,48}\bfrench\b|\bfrench\b[^.]{0,48}\b(?:speak|spoken|fluent|fluency|proficien(?:t|cy)|bilingual|language|required|preferred|plus)\b/i },
  { id: 'german', label: 'German', test: /\bgerman[- ]speaking\b|(?:speak(?:s|ing)?|spoken|fluent(?:ly)?|fluency|proficien(?:t|cy)|bilingual|native|language)\b[^.]{0,48}\bgerman\b|\bgerman\b[^.]{0,48}\b(?:speak|spoken|fluent|fluency|proficien(?:t|cy)|bilingual|language|required|preferred|plus)\b/i },
  { id: 'japanese', label: 'Japanese', test: /\bjapanese[- ]speaking\b|(?:speak(?:s|ing)?|spoken|fluent(?:ly)?|fluency|proficien(?:t|cy)|bilingual|native|language)\b[^.]{0,48}\bjapanese\b|\bjapanese\b[^.]{0,48}\b(?:speak|spoken|fluent|fluency|proficien(?:t|cy)|bilingual|language|required|preferred|plus)\b/i },
  { id: 'korean', label: 'Korean', test: /\bkorean[- ]speaking\b|(?:speak(?:s|ing)?|spoken|fluent(?:ly)?|fluency|proficien(?:t|cy)|bilingual|native|language)\b[^.]{0,48}\bkorean\b|\bkorean\b[^.]{0,48}\b(?:speak|spoken|fluent|fluency|proficien(?:t|cy)|bilingual|language|required|preferred|plus)\b/i },
  { id: 'arabic', label: 'Arabic', test: /\barabic[- ]speaking\b|(?:speak(?:s|ing)?|spoken|fluent(?:ly)?|fluency|proficien(?:t|cy)|bilingual|native|language)\b[^.]{0,48}\barabic\b|\barabic\b[^.]{0,48}\b(?:speak|spoken|fluent|fluency|proficien(?:t|cy)|bilingual|language|required|preferred|plus)\b/i },
  { id: 'portuguese', label: 'Portuguese', test: /\bportuguese[- ]speaking\b|(?:speak(?:s|ing)?|spoken|fluent(?:ly)?|fluency|proficien(?:t|cy)|bilingual|native|language)\b[^.]{0,48}\bportuguese\b|\bportuguese\b[^.]{0,48}\b(?:speak|spoken|fluent|fluency|proficien(?:t|cy)|bilingual|language|required|preferred|plus)\b/i },
  { id: 'hindi', label: 'Hindi', test: /\bhindi[- ]speaking\b|(?:speak(?:s|ing)?|spoken|fluent(?:ly)?|fluency|proficien(?:t|cy)|bilingual|native|language)\b[^.]{0,48}\bhindi\b|\bhindi\b[^.]{0,48}\b(?:speak|spoken|fluent|fluency|proficien(?:t|cy)|bilingual|language|required|preferred|plus)\b/i },
  { id: 'russian', label: 'Russian', test: /\brussian[- ]speaking\b|(?:speak(?:s|ing)?|spoken|fluent(?:ly)?|fluency|proficien(?:t|cy)|bilingual|native|language)\b[^.]{0,48}\brussian\b|\brussian\b[^.]{0,48}\b(?:speak|spoken|fluent|fluency|proficien(?:t|cy)|bilingual|language|required|preferred|plus)\b/i },
]

const SKIP_SENTENCE = /equal opportunity|eoe\b|click here to apply|apply now|we are an equal|proud to be|diversity and inclusion|reasonable accommodation|to apply[,:]|submit your (resume|application)|follow us|all qualified applicants|without regard to|race, color|sexual orientation|gender identity|veteran status|disability status|privacy policy|terms of (use|service)|cookie policy|linkedin|handshake|our values|guide how we hire|click the link|complete job description|view our opening|see all open jobs|learn more about what it|internship credit|consult with your advisor|print a copy|role description (?:is not|will not)|we strongly encourage applicants|core responsibilities of this job are described|we.?ll be supporting you with extensive training|brief internship description|work flexibility/i

const COMPANY_ABOUT = /^(?:.{0,48} )?(?:is (?:a |an |the )?(?:quantitative trading firm|leading|global|world-?class|fast-growing)|join the team redefining|millions of (?:individuals|people|teams)|we believe that developing the next generation|promotes and nurtures a diverse|our culture\b|defined by evolution|our mission is to|mission is to deliver results)/i

const DATE_ONLY = /internship will take place|approximate dates? of this internship|must graduate|expected to start around|minimum of \d+ weeks|this intern will work full-time through|if pursuing internship credit|actively enrolled in an academic program/i

const PROGRAM_FLUFF = /join a \d+-week|summer internship program|we empower future|learn how (?:products|software|security|ai|intelligent)|to learn how\b|grow your career|foundational confidence|participate in social events|early careers programming|candidate value proposition|employment eligibility|will not pursue visa|these skills will give you the tools/i

/** Perks / side benefits — keep after real work when useful, never as the main summary. */
const PERK_LINE = /opportunity to publish|attend (?:tier[-\s]?1 |industry )?conferences?|industry conferences|networking events?|social events?|mentorship (?:events?|opportunities)|coffee chats?|speaker series|team (?:outings?|events?|building)|swag\b|free lunch|housing stipend|relocation (?:bonus|assistance)/i

const SOFT_TRAIT = /^(?:thoughtful|empathetic|team player|ai enthusiast|put users first|not ideological|problem-?solving|communication|collaborat|you(?:'|’)re comfortable|you enjoy|you care|you think|you understand|you may be opinionated|for you,)/i

const DUTY_HEADING = /^(?:what you(?:'|’)?ll (?:do|get to work on|be working on|work on)|what you will (?:do|get to work on|be working on|work on)|what you get to work on|what to expect|responsibilit(?:y|ies)(?:\s*[&/:].*)?|key (?:tasks|duties|responsibilities)|day[- ]to[- ]day|about (?:the |this )?(?:role|internship|position|job)|the (?:role|internship|position)|your (?:role|work|impact)|how you(?:'|’)?ll|in this (?:role|internship)|(?:job|position) (?:summary|description)|overview|the opportunity|potential project areas|role description)$/i

const DUTY_HEADING_PREFIX = /^(?:what type of work|how will you make an impact|what you(?:'|’)?ll get to work on|what you will get to work on)\b/i

const SKILL_HEADING = /^(?:qualifications?|requirements?|basic qualifications?|preferred qualifications?|minimum qualifications?|required (?:skills|qualifications)|preferred (?:skills|experience)|technical skills|skills(?: we| you| required| needed)?|what (?:we(?:'|’)re looking for|you(?:'|’)?ll (?:need|bring)|you bring)|must have|who you are|about you|you may be a good fit|required|preferred)$/i

const SKIP_HEADING = /^(?:about (?:us|the company|the team|american express)|who we are|our (?:culture|values|mission|benefits|core principles)|benefits|compensation|perks|equal opportunity|how to apply|to apply|legal|eeo|diversity|accommodation|work flexibility|what you get|why (?:join|us|you.?ll love)|life at|company description|additional information|learning opportunities|what you(?:'|’)?ll learn|preferred characteristics|physical(?: and| &)? environmental demands|time travel required|candidate value proposition)$/i

const ACTION_START = /^(?:you(?:'|’)?ll|you will|the intern(?:s)? will|interns? will|this (?:intern|role) will)?\s*(?:design|develop|build|create|write|implement|analyze|research|support|help|work(?:ing)? (?:on|with|alongside)|collaborate|assist|contribute|own|improve|test|debug|maintain|deploy|train|review|document|present|partner|drive|deliver|produce|evaluate|model|simulate|prototype|code|program|optimize|productionize|apply|use|perform|conduct|participate|lead|manage|coordinate|prepare|translate|define|instrument|monitor|harden|operate|ship|orchestrat\w*|scale)/i

const WEAK_META = /view our opening|see all open jobs|learn more about what it|click the link|complete job description|current openings/i

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
  'verition.com': 'veritiongroupllc',
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
    .replace(/\s*[•·*]\s*/g, '\n• ')
    .replace(/\s+(?=(?:What You(?:'|’)ll (?:Do|Get to Work On|Be Working On|Work On)|What You Will (?:Do|Get to Work On|Be Working On|Work On)|What You Get to Work On|What To Expect|What You(?:'|’)ll Learn|What type of work|How will you make an impact|Key Responsibilities|(?<!Key )Responsibilities|Minimum Qualifications|Preferred Qualifications|Basic Qualifications|Required Skills|Technical Skills|(?<!(?:Minimum|Preferred|Basic) )Qualifications|Requirements|About the Role|About This Role|About the Internship|About the Team|Job Description|Job Summary|Position Summary|Role Description|What You(?:'|’)ll Bring|What You Bring|What We(?:'|’)re Looking For|About Us|About the Company|Benefits|Compensation|How to Apply|Business Unit(?:\/Role)?(?: Specific)?(?: Info(?:rmation)?)?|Potential Project Areas|Learning Opportunities|Candidate Value Proposition)\b)/gi, '\n')
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

function headingLabel(line) {
  const value = String(line || '').replace(/[:.\s?]+$/, '').trim()
  if (!value) {
    return ''
  }
  if (DUTY_HEADING_PREFIX.test(value) && value.length <= 160) {
    return 'duty'
  }
  if (value.length <= 72 && DUTY_HEADING.test(value)) {
    return 'duty'
  }
  if (value.length <= 72 && SKILL_HEADING.test(value)) {
    return 'skill'
  }
  if (value.length <= 72 && SKIP_HEADING.test(value)) {
    return 'skip'
  }
  return ''
}

const QUAL_LINE = /^(?:strong (?:programming |technical )?skills?|proficien(?:t|cy)|experience (?:with|in)|familiar(?:ity)? with|solid (?:understanding|knowledge|background)|knowledge of|ability to|must have|required:|preferred:)/i

function isUsefulDuty(line) {
  if (!line || line.length < 24) {
    return false
  }
  if (headingLabel(line)) {
    return false
  }
  if (SKIP_SENTENCE.test(line) || DATE_ONLY.test(line) || COMPANY_ABOUT.test(line) || PROGRAM_FLUFF.test(line)) {
    return false
  }
  if (PERK_LINE.test(line) || SOFT_TRAIT.test(line) || QUAL_LINE.test(line)) {
    return false
  }
  if (/^job description:?$/i.test(line)) {
    return false
  }
  if (/^(?:pursuing|currently (?:pursuing|enrolled)|must (?:be|graduate)|graduat)/i.test(line)) {
    return false
  }
  // Real work copy — not a qualifications bullet that happens to name Python.
  return ACTION_START.test(line)
    || /you(?:'|’| wi)ll|intern(?:s)? will|this (?:role|intern) will|responsibilit/i.test(line)
}

function scoreDuty(line) {
  let score = 1
  if (headingLabel(line)) {
    return -10
  }
  if (SKIP_SENTENCE.test(line) || DATE_ONLY.test(line) || COMPANY_ABOUT.test(line) || PROGRAM_FLUFF.test(line)) {
    return -10
  }
  if (PERK_LINE.test(line) || SOFT_TRAIT.test(line) || QUAL_LINE.test(line)) {
    return -8
  }
  if (/^(?:pursuing|currently (?:pursuing|enrolled)|must (?:be|graduate)|graduat)/i.test(line)) {
    return -8
  }
  if (ACTION_START.test(line)) {
    score += 6
  }
  if (/you(?:'|’| wi)ll|intern(?:s)? will|this (?:role|intern) will/i.test(line)) {
    score += 2
  }
  if (skillHits(line).length) {
    score += 2
  }
  if (/\b(?:infrastructure|pipeline|cluster|model|api|systems?|prototype|algorithm|data)\b/i.test(line)) {
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

function pickDuties(sections, max = 5) {
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
  // Never promote a qualifications bullet into the About blurb.
  return []
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

function composeSummary(duties, { maxChars = 720 } = {}) {
  const dutyParts = duties.map(finishSentence).filter(Boolean)
  if (!dutyParts.length) {
    return ''
  }

  // Keep as much of the "what you'll do" copy as fits — skills/requirements live in their own fields.
  for (let n = dutyParts.length; n >= 1; n -= 1) {
    const out = dutyParts.slice(0, n).join(' ')
    if (out.length <= maxChars) {
      return out
    }
  }

  const cut = dutyParts[0].slice(0, maxChars - 1).replace(/\s+\S*$/, '').replace(/[,;:\s]+$/, '')
  return cut ? `${cut}…` : ''
}

export function summarizePosting(text, { maxChars = 720 } = {}) {
  const clean = htmlToText(text)
  if (!flatten(clean)) {
    return ''
  }
  const sections = sectionize(clean)
  const duties = pickDuties(sections, 5)
  let out = composeSummary(duties, { maxChars })
  if (out && !SKIP_SENTENCE.test(out) && !WEAK_META.test(out) && !isWeakSummary(out)) {
    return out
  }

  const ranked = sections
    .filter((row) => row.kind === 'duty' || row.kind === 'body')
    .flatMap((row) => row.lines)
    .filter(isUsefulDuty)
    .map((line, index) => ({ line, index, score: scoreDuty(line) }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, 5)
    .sort((a, b) => a.index - b.index)
    .map((row) => row.line)

  out = composeSummary(ranked, { maxChars })
  if (out && !SKIP_SENTENCE.test(out) && !WEAK_META.test(out) && !isWeakSummary(out)) {
    return out
  }
  // No real work copy — leave About empty. Mentions / requirements still fill their own fields.
  return ''
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
  if (PROGRAM_FLUFF.test(value) && !ACTION_START.test(value)) {
    return true
  }
  // Heading leaked into the summary instead of the actual work bullets.
  if (/^what you(?:'|’)?ll (?:do|get to work on|be working on|work on)\.?\s*/i.test(value)) {
    const rest = value.replace(/^what you(?:'|’)?ll (?:do|get to work on|be working on|work on)\.?\s*/i, '')
    if (!rest || !ACTION_START.test(rest)) {
      return true
    }
  }
  if (/^what you will (?:do|get to work on|be working on|work on)\.?\s*/i.test(value)) {
    const rest = value.replace(/^what you will (?:do|get to work on|be working on|work on)\.?\s*/i, '')
    if (!rest || !ACTION_START.test(rest)) {
      return true
    }
  }
  // Skills / quals are shown separately — never use them as the main About blurb.
  if (/^relevant skills:/i.test(value)) {
    return true
  }
  if (QUAL_LINE.test(value) && !ACTION_START.test(value)) {
    return true
  }
  if (/relevant skills:/i.test(value) && !ACTION_START.test(value)) {
    return true
  }
  return false
}

const HARD_REQUIREMENT = /(?:must\s+)?graduate\s+(?:by|before|no later than)[^.!?\n]{0,90}20\d{2}|(?:expected\s+(?:to\s+)?graduate|graduation\s+(?:by|before|date))[^.!?\n]{0,80}20\d{2}|(?:currently\s+)?(?:pursuing|enrolled in|working toward(?:s)?|seeking)\b[^.!?\n]{0,120}(?:bachelor|master|ph\.?d|mba|degree|computer science|engineering)|(?:bachelor|master)'?s(?:\s+or\s+(?:a\s+)?(?:master|bachelor)'?s)?(?:\s+degree)?\b[^.!?\n]{0,100}(?:computer science|engineering|related field|or another)|must\s+be\s+(?:currently\s+)?enrolled\b[^.!?\n]{0,100}|class\s+of\s+20\d{2}|graduat(?:e|ing)\s+(?:before|by|in)\s+(?:spring|summer|fall|winter)?\s*20\d{2}/i

function parseMoney(value) {
  if (value == null || value === '') {
    return null
  }
  const raw = String(value).replace(/,/g, '').trim()
  if (!raw) {
    return null
  }
  const num = Number(raw)
  return Number.isFinite(num) ? num : null
}

function unitFromLabel(label) {
  const value = String(label || '').toLowerCase()
  if (/hour|hr\b/.test(value)) {
    return 'hour'
  }
  if (/month|mo\b/.test(value)) {
    return 'month'
  }
  if (/year|yr\b|annual|annum/.test(value)) {
    return 'year'
  }
  return ''
}

function moneyUnitRank(unit) {
  if (unit === 'hour') {
    return 3
  }
  if (unit === 'year') {
    return 2
  }
  if (unit === 'month') {
    return 1
  }
  return 0
}

function formatPayAmount(value) {
  if (!Number.isFinite(value)) {
    return ''
  }
  if (Number.isInteger(value)) {
    return value.toLocaleString('en-US')
  }
  return String(Math.round(value * 100) / 100)
}

function formatPayText(min, max, unit) {
  if (!Number.isFinite(min)) {
    return ''
  }
  const suffix = unit === 'hour' ? '/hr' : unit === 'month' ? '/mo' : unit === 'year' ? '/yr' : ''
  if (Number.isFinite(max) && max !== min) {
    return `$${formatPayAmount(min)}–$${formatPayAmount(max)}${suffix}`
  }
  return `$${formatPayAmount(min)}${suffix}`
}

function pushPayHit(hits, min, max, unit, snippet) {
  if (!Number.isFinite(min)) {
    return
  }
  const hi = Number.isFinite(max) ? max : min
  hits.push({
    min: Math.min(min, hi),
    max: Math.max(min, hi),
    unit: unit || '',
    snippet: flatten(snippet).slice(0, 160),
  })
}

function salaryFromJsonLdNode(node) {
  const rows = []
  const push = (value) => {
    if (value == null || value === '') {
      return
    }
    if (Array.isArray(value)) {
      value.forEach(push)
      return
    }
    rows.push(value)
  }
  push(node?.baseSalary)
  push(node?.estimatedSalary)
  const hits = []
  for (const row of rows) {
    if (typeof row === 'number' || typeof row === 'string') {
      const amount = parseMoney(row)
      if (amount != null) {
        pushPayHit(hits, amount, amount, '', `$${formatPayAmount(amount)}`)
      }
      continue
    }
    if (!row || typeof row !== 'object') {
      continue
    }
    const value = row.value && typeof row.value === 'object' ? row.value : row
    const unit = unitFromLabel(
      row.unitText || row.unitCode || value.unitText || value.unitCode || '',
    )
    const min = parseMoney(value.minValue ?? value.min ?? value.value ?? row.minValue)
    const max = parseMoney(value.maxValue ?? value.max ?? value.value ?? row.maxValue ?? min)
    if (min != null) {
      pushPayHit(hits, min, max ?? min, unit, formatPayText(min, max ?? min, unit))
    }
  }
  return hits
}

function jsonLdPayHits(html) {
  const hits = []
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
          hits.push(...salaryFromJsonLdNode(node))
        }
      }
    }
    catch {
      // ignore broken JSON-LD
    }
  }
  return hits
}

function payHitsFromText(text) {
  const clean = htmlToText(text)
  const flat = flatten(clean)
  const hits = []
  if (!flat) {
    return hits
  }

  const patterns = [
    /\$\s*([\d,]+(?:\.\d+)?)\s*(?:[-–—]|to)\s*\$?\s*([\d,]+(?:\.\d+)?)\s*(?:\/|\s*per\s*)\s*(h(?:ou)?r|hours?|yr|years?|annum|annual|mo|months?)\b/gi,
    /\$\s*([\d,]+(?:\.\d+)?)\s*(?:\/|\s*per\s*)\s*(h(?:ou)?r|hours?|yr|years?|annum|annual|mo|months?)\b/gi,
    /(?:hourly|per hour|an hour)[^$]{0,40}\$\s*([\d,]+(?:\.\d+)?)(?:\s*(?:[-–—]|to)\s*\$?\s*([\d,]+(?:\.\d+)?))?/gi,
    /(?:annual|yearly|per year)[^$]{0,40}\$\s*([\d,]+(?:\.\d+)?)(?:\s*(?:[-–—]|to)\s*\$?\s*([\d,]+(?:\.\d+)?))?/gi,
  ]

  for (const re of patterns) {
    re.lastIndex = 0
    let match
    while ((match = re.exec(flat))) {
      const a = parseMoney(match[1])
      const b = parseMoney(match[2])
      const unit = unitFromLabel(match[3] || match[0])
      if (a == null) {
        continue
      }
      const start = Math.max(0, match.index - 24)
      const end = Math.min(flat.length, match.index + match[0].length + 48)
      pushPayHit(hits, a, b ?? a, unit, flat.slice(start, end))
    }
  }

  // Dual posted rates: "$57/hr for Bachelors and $61/hr for Master's"
  const dual = [...flat.matchAll(/\$\s*([\d,]+(?:\.\d+)?)\s*(?:\/|\s*per\s*)\s*h(?:ou)?r\b/gi)]
  if (dual.length >= 2) {
    const amounts = dual.map((row) => parseMoney(row[1])).filter((n) => n != null)
    if (amounts.length >= 2) {
      const min = Math.min(...amounts)
      const max = Math.max(...amounts)
      const first = dual[0]
      const last = dual[dual.length - 1]
      const start = Math.max(0, first.index - 40)
      const end = Math.min(flat.length, last.index + last[0].length + 40)
      pushPayHit(hits, min, max, 'hour', flat.slice(start, end))
    }
  }

  return hits
}

export function extractPay(text, { html = '' } = {}) {
  const hits = [...payHitsFromText(text), ...jsonLdPayHits(html)]
  if (!hits.length) {
    return {}
  }

  let bestUnit = ''
  for (const hit of hits) {
    if (moneyUnitRank(hit.unit) > moneyUnitRank(bestUnit)) {
      bestUnit = hit.unit
    }
  }
  const preferred = bestUnit
    ? hits.filter((hit) => hit.unit === bestUnit || !hit.unit)
    : hits
  const pool = preferred.length ? preferred : hits
  const min = Math.min(...pool.map((hit) => hit.min))
  const max = Math.max(...pool.map((hit) => hit.max))
  // Always store a short formatted range — raw snippets drag in benefits/legal fluff.
  const payText = formatPayText(min, max, bestUnit || pool[0]?.unit || '')

  const extra = { payText }
  if (Number.isFinite(min)) {
    extra.payMin = min
  }
  if (Number.isFinite(max)) {
    extra.payMax = max
  }
  if (bestUnit || pool[0]?.unit) {
    extra.payUnit = bestUnit || pool[0].unit
  }
  return extra
}

function isHardRequirementLine(line) {
  const value = flatten(line)
  if (!value || value.length < 18 || value.length > 220) {
    return false
  }
  if (SOFT_TRAIT.test(value) || SKIP_SENTENCE.test(value) || COMPANY_ABOUT.test(value) || PROGRAM_FLUFF.test(value)) {
    return false
  }
  if (!HARD_REQUIREMENT.test(value)) {
    return false
  }
  // Soft trait paragraphs that happen to mention "engineering" in a metaphor still fail length/shape checks above.
  if (/^[A-Z][a-z]+(?:\s+[a-z]+){0,3}:\s/.test(value) && !/graduate|degree|enrolled|pursuing|bachelor|master|ph\.?d/i.test(value.slice(0, 40))) {
    return false
  }
  return true
}

function scoreRequirement(line) {
  let score = 1
  if (/graduate|graduation|class of/i.test(line)) {
    score += 4
  }
  if (/pursuing|enrolled|working toward/i.test(line)) {
    score += 3
  }
  if (/bachelor|master|ph\.?d|degree/i.test(line)) {
    score += 2
  }
  if (/computer science|engineering|related field/i.test(line)) {
    score += 1
  }
  if (line.length > 180) {
    score -= 1
  }
  return score
}

export function extractRequirements(text, { maxChars = 220 } = {}) {
  const clean = htmlToText(text)
  if (!flatten(clean)) {
    return ''
  }
  const sections = sectionize(clean)
  const fromSkills = sections
    .filter((row) => /skill/.test(row.kind))
    .flatMap((row) => row.lines)
  const fromBody = sections
    .filter((row) => row.kind === 'body' || row.kind === 'duty')
    .flatMap((row) => row.lines)
  let pool = [...fromSkills, ...fromBody].filter(isHardRequirementLine)
  if (!pool.length) {
    // Fallback: scan flattened sentences when headings were missing.
    pool = clean
      .split(/(?<=[.!?])\s+|\n+/)
      .map((part) => part.replace(/^•\s*/, '').replace(/\s+/g, ' ').trim())
      .filter(isHardRequirementLine)
  }

  const picked = [...new Set(pool)]
    .map((line, index) => ({ line, index, score: scoreRequirement(line) }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, 2)
    .sort((a, b) => a.index - b.index)
    .map((row) => finishSentence(row.line))

  if (!picked.length) {
    return ''
  }

  let out = picked.join(' ')
  if (out.length <= maxChars) {
    return out
  }
  out = picked[0]
  if (out.length <= maxChars) {
    return out
  }
  return `${out.slice(0, maxChars - 1).replace(/\s+\S*$/, '').trim()}…`
}

const MONTH_INDEX = {
  january: 0, jan: 0,
  february: 1, feb: 1,
  march: 2, mar: 2,
  april: 3, apr: 3,
  may: 4,
  june: 5, jun: 5,
  july: 6, jul: 6,
  august: 7, aug: 7,
  september: 8, sep: 8, sept: 8,
  october: 9, oct: 9,
  november: 10, nov: 10,
  december: 11, dec: 11,
}

/** Keep YYYY-MM-DD only when it is a real calendar day. */
export function isoDateOnly(value) {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    const date = value > 1e12 ? new Date(value) : new Date(value * 1000)
    return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10)
  }
  const match = String(value || '').trim().match(/^(\d{4}-\d{2}-\d{2})/)
  return match ? match[1] : ''
}

function isPastIsoDate(value) {
  const iso = isoDateOnly(value)
  if (!iso) {
    return false
  }
  return Date.parse(`${iso}T23:59:59Z`) < Date.now() - 86_400_000
}

/** Parse a human or ISO date into YYYY-MM-DD, or '' when unclear. */
export function parseDeadlineDate(value) {
  const raw = String(value || '').replace(/\s+/g, ' ').trim()
  if (!raw) {
    return ''
  }
  const iso = isoDateOnly(raw)
  if (iso) {
    return isPastIsoDate(iso) ? '' : iso
  }
  const named = raw.match(/^([A-Za-z]+)\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})$/)
  if (named) {
    const month = MONTH_INDEX[named[1].toLowerCase()]
    const day = Number(named[2])
    const year = Number(named[3])
    if (month == null || day < 1 || day > 31 || year < 2000) {
      return ''
    }
    const next = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return isPastIsoDate(next) ? '' : next
  }
  const slash = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (slash) {
    const month = Number(slash[1])
    const day = Number(slash[2])
    const year = Number(slash[3])
    if (month < 1 || month > 12 || day < 1 || day > 31 || year < 2000) {
      return ''
    }
    const next = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return isPastIsoDate(next) ? '' : next
  }
  return ''
}

/**
 * Pull an application end / close date from posting copy when the ATS
 * exposes one in plain text (e.g. "End Date: October 23, 2026").
 */
export function extractDeadline(text) {
  const raw = String(text || '')
  if (!raw.trim()) {
    return ''
  }
  const patterns = [
    /\bend\s*date\s*[:\-]?\s*([A-Za-z]+\.?\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4}|\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4})/i,
    /\bapplication\s+(?:deadline|closes?|closing(?:\s+date)?)\s*[:\-]?\s*([A-Za-z]+\.?\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4}|\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4})/i,
    /\b(?:apply\s+by|applications?\s+close(?:s|d)?(?:\s+on)?|closing\s+date|deadline\s+to\s+apply)\s*[:\-]?\s*([A-Za-z]+\.?\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4}|\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4})/i,
  ]
  for (const pattern of patterns) {
    const match = raw.match(pattern)
    if (!match) {
      continue
    }
    const parsed = parseDeadlineDate(match[1])
    if (parsed) {
      return parsed
    }
  }
  return ''
}

function deadlineFromWorkday(data) {
  const info = data?.jobPostingInfo || {}
  return parseDeadlineDate(info.endDate)
    || parseDeadlineDate(String(info.jobPostingEndDateAsText || '').replace(/^end\s*date\s*[:\-]?\s*/i, ''))
}

export function postingFields(text, { html = '', title = '', role = '', url = '' } = {}) {
  const summary = summarizePosting(text)
  const keywords = extractKeywords(text)
  const pay = extractPay(text, { html })
  const requirements = extractRequirements(text)
  const deadline = extractDeadline(text) || extractDeadline(htmlToText(html))
  const termInfo = extractInternshipTerm(title, role, url, text, htmlToText(html))
  const extra = {}
  if (summary && !isWeakSummary(summary)) {
    extra.summary = summary
  }
  if (keywords) {
    extra.keywords = keywords
  }
  Object.assign(extra, pay)
  if (requirements) {
    extra.requirements = requirements
  }
  if (deadline) {
    extra.deadline = deadline
  }
  if (termInfo?.term) {
    extra.term = termInfo.term
    extra.season = termInfo.season
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
    /boards(?:-api)?\.greenhouse\.io\/(?:v1\/boards\/|embed\/job_board\/js\?for=)?([a-z0-9-]+)|job-boards\.greenhouse\.io\/([a-z0-9-]+)|[?&]for=([a-z0-9-]+)/i,
  )
  const board = match?.[1] || match?.[2] || match?.[3] || ''
  if (!board || /^(embed|v1|boards|job_app|jobs|js)$/i.test(board)) {
    return ''
  }
  return board
}

const TERM_NAME = {
  summer: 'Summer',
  fall: 'Fall',
  autumn: 'Fall',
  winter: 'Winter',
  spring: 'Spring',
}

/**
 * Pull a concrete cohort like "Summer 2027" / "Fall 2026" from titles and
 * posting copy. Used to correct summer-vs-offseason buckets and show the year.
 */
export function extractInternshipTerm(...parts) {
  const hay = parts.filter(Boolean).map((part) => String(part)).join('\n')
  if (!hay.trim()) {
    return null
  }

  const dated = hay.match(
    /\b(summer|fall|autumn|winter|spring)\s*(?:['’]?\s*)?(20\d{2}|\d{2})\b/i,
  ) || hay.match(
    /\b(20\d{2})\s+(summer|fall|autumn|winter|spring)\b/i,
  ) || hay.match(
    /\(\s*(summer|fall|autumn|winter|spring)\s*(20\d{2}|\d{2})?\s*\)/i,
  )
  if (dated) {
    const a = dated[1]
    const b = dated[2]
    const seasonRaw = /^(20\d{2}|\d{2})$/.test(a) ? b : a
    const yearRaw = /^(20\d{2}|\d{2})$/.test(a) ? a : b
    const key = String(seasonRaw).toLowerCase()
    const label = TERM_NAME[key]
    let year
    if (yearRaw && /^(20\d{2}|\d{2})$/.test(yearRaw)) {
      year = yearRaw.length === 2 ? 2000 + Number(yearRaw) : Number(yearRaw)
    }
    else {
      year = key === 'summer' ? 2027 : (key === 'fall' || key === 'autumn' ? 2026 : 2027)
    }
    if (!label || !Number.isFinite(year) || year < 2024 || year > 2035) {
      return null
    }
    return {
      term: `${label} ${year}`,
      season: key === 'summer' ? 'summer' : 'offseason',
    }
  }

  // "2027 Technology Internship" + "Summer Internship Program" nearby
  const yearOnly = hay.match(/\b(20(?:2[6-9]|3[0-5]))\b/)
  const seasonOnly = hay.match(/\b(summer|fall|autumn|winter|spring)\s+internship\b/i)
    || hay.match(/\b(?:internship|intern)\s+program\b[^.]{0,80}\b(summer|fall|autumn|winter|spring)\b/i)
    || hay.match(/\b(summer|fall|autumn|winter|spring)\s+(?:intern(?:ship)?|co-?op|program)\b/i)
  if (yearOnly && seasonOnly) {
    const key = String(seasonOnly[1]).toLowerCase()
    const label = TERM_NAME[key]
    const year = Number(yearOnly[1])
    if (label) {
      return {
        term: `${label} ${year}`,
        season: key === 'summer' ? 'summer' : 'offseason',
      }
    }
  }

  if (seasonOnly) {
    const key = String(seasonOnly[1]).toLowerCase()
    const label = TERM_NAME[key]
    if (!label) {
      return null
    }
    // Default cohort year for this cycle when the posting omits it.
    const year = key === 'summer' ? 2027 : (key === 'fall' || key === 'autumn' ? 2026 : 2027)
    return {
      term: `${label} ${year}`,
      season: key === 'summer' ? 'summer' : 'offseason',
    }
  }

  return null
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

  const smartApi = value.match(
    /api\.smartrecruiters\.com\/v1\/companies\/([^/?#]+)\/postings\/(\d+)/i,
  )
  if (smartApi) {
    return {
      kind: 'smartrecruiters',
      api: `https://api.smartrecruiters.com/v1/companies/${smartApi[1]}/postings/${smartApi[2]}`,
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
          const payBits = salaryFromJsonLdNode(node)
            .map((hit) => hit.snippet || formatPayText(hit.min, hit.max, hit.unit))
            .filter(Boolean)
          const text = [
            node.description,
            node.qualifications,
            node.responsibilities,
            node.skills,
            payBits.length ? `Compensation\n${payBits.join('\n')}` : '',
          ]
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

function titleFromGreenhouse(data) {
  return String(data?.title || '').replace(/\s+/g, ' ').trim()
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
      const data = await fetchJson(
        `https://boards-api.greenhouse.io/v1/boards/${board}/jobs/${target.id}`,
      )
      return {
        text: textFromGreenhouse(data),
        title: titleFromGreenhouse(data),
        html: '',
      }
    }
    catch {
      // fall through to page text
    }
  }
  return { text: textFromHtml(html), title: '', html }
}

export async function fetchPostingText(url) {
  const empty = { text: '', html: '', deadline: '', title: '' }
  const target = parseApplyTarget(url)
  if (!target) {
    return empty
  }
  try {
    if (target.kind === 'greenhouse') {
      try {
        const data = await fetchJson(target.api)
        return {
          text: textFromGreenhouse(data),
          title: titleFromGreenhouse(data),
          html: '',
          deadline: '',
        }
      }
      catch {
        // Wrong host→board map or stale board token: rediscover from the page.
        const id = greenhouseJobId(url)
        if (id) {
          const recovered = await textFromGreenhousePage({ api: url, id })
          return { ...empty, ...recovered }
        }
        throw new Error('greenhouse job missing')
      }
    }
    if (target.kind === 'greenhouse-page') {
      const recovered = await textFromGreenhousePage(target)
      return { ...empty, ...recovered }
    }
    if (target.kind === 'lever') {
      const data = await fetchJson(target.api)
      return {
        text: textFromLever(data),
        title: String(data?.text || data?.title || '').replace(/\s+/g, ' ').trim(),
        html: '',
        deadline: '',
      }
    }
    if (target.kind === 'ashby') {
      return { text: await textFromAshbyBoard(url), title: '', html: '', deadline: '' }
    }
    if (target.kind === 'workday') {
      const data = await fetchJson(target.api)
      return {
        text: textFromWorkday(data),
        title: String(data?.jobPostingInfo?.title || '').replace(/\s+/g, ' ').trim(),
        html: '',
        deadline: deadlineFromWorkday(data),
      }
    }
    if (target.kind === 'smartrecruiters') {
      const data = await fetchJson(target.api)
      return {
        text: textFromSmartrecruiters(data),
        title: String(data?.name || data?.title || '').replace(/\s+/g, ' ').trim(),
        html: '',
        deadline: '',
      }
    }
    if (target.kind === 'tesla') {
      return { text: textFromTesla(await fetchJson(target.api)), title: '', html: '', deadline: '' }
    }
    if (target.kind === 'oracle') {
      return { text: textFromOracle(await fetchJson(target.api)), title: '', html: '', deadline: '' }
    }
    const html = await fetchHtml(target.api)
    return { text: textFromHtml(html), title: '', html, deadline: '' }
  }
  catch {
    if (target.kind !== 'html' && target.kind !== 'greenhouse-page') {
      try {
        const id = greenhouseJobId(url)
        if (id) {
          const recovered = await textFromGreenhousePage({ api: url, id })
          return { ...empty, ...recovered }
        }
        const html = await fetchHtml(url)
        return { text: textFromHtml(html), title: '', html, deadline: '' }
      }
      catch {
        return empty
      }
    }
    return empty
  }
}

function isWorkdayApplyUrl(url) {
  return /myworkday(?:jobs|site)\.com/i.test(String(url || ''))
}

function needsPostingEnrichment(item, force) {
  if (force) {
    return true
  }
  // New or incomplete rows get pay/requirements on first enrich.
  // Weak / skills-only About blurbs get another try so "what you'll do" can win.
  // Workday boards publish endDate — backfill deadlines even when summary exists.
  // Re-run with --force to refresh existing summary+keyword rows.
  if (!item.summary || !item.keywords || isWeakSummary(item.summary)) {
    return true
  }
  // detailsVersion < 2 on offseason rows: one pass to recover Summer/Fall/Winter
  // from the official title when the GitHub list omitted it.
  if ((item.detailsVersion || 0) < 2 && item.season === 'offseason' && !item.term) {
    return true
  }
  return !item.deadline && isWorkdayApplyUrl(item.url)
}

function applyPostingFields(item, extra, { force = false } = {}) {
  let filled = false
  if (extra.summary && (!item.summary || force || isWeakSummary(item.summary))) {
    item.summary = extra.summary
    filled = true
  }
  else if ((force || isWeakSummary(item.summary)) && !extra.summary && item.summary) {
    delete item.summary
    filled = true
  }
  if (extra.keywords && (!item.keywords || force)) {
    item.keywords = extra.keywords
    filled = true
  }
  if (extra.payText && (!item.payText || force)) {
    item.payText = extra.payText
    filled = true
  }
  if (extra.payMin != null && (item.payMin == null || force)) {
    item.payMin = extra.payMin
    filled = true
  }
  if (extra.payMax != null && (item.payMax == null || force)) {
    item.payMax = extra.payMax
    filled = true
  }
  if (extra.payUnit && (!item.payUnit || force)) {
    item.payUnit = extra.payUnit
    filled = true
  }
  if (extra.requirements && (!item.requirements || force)) {
    item.requirements = extra.requirements
    filled = true
  }
  if (extra.deadline && (!item.deadline || force)) {
    item.deadline = extra.deadline
    filled = true
  }
  if (extra.term && (!item.term || force)) {
    item.term = extra.term
    filled = true
  }
  // Explicit season in the posting/title beats the source-list bucket.
  if (extra.season && extra.term && (force || item.season !== extra.season || !item.term)) {
    if (item.season !== extra.season) {
      item.season = extra.season
      filled = true
    }
  }
  return filled
}

export async function enrichListingSummaries(listings, { onProgress, force = false } = {}) {
  const targets = listings
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => {
      if (!/^https:\/\//i.test(item.url) || SKIPPED_APPLY_HOSTS.test(item.url)) {
        return false
      }
      if (!needsPostingEnrichment(item, force)) {
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
        const { text, html, deadline, title } = await fetchPostingText(current.item.url)
        const extra = postingFields(text, {
          html,
          title,
          role: current.item.role,
          url: current.item.url,
        })
        if (deadline) {
          extra.deadline = deadline
        }
        if (applyPostingFields(current.item, extra, { force })) {
          filled += 1
        }
        current.item.detailsVersion = 2
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
