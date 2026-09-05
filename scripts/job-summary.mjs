/**
 * Pull a short summary and searchable skill mentions from official
 * apply-page APIs (Greenhouse, Lever, Ashby, Workday, USAJobs) or
 * public posting metadata. Does not fetch Handshake, LinkedIn, or Indeed.
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
  { id: 'excel', label: 'Excel', test: /\bexcel\b|\bmicrosoft excel\b/i },
  { id: 'tableau', label: 'Tableau', test: /\btableau\b/i },
  { id: 'powerbi', label: 'Power BI', test: /\bpower\s*bi\b/i },
  { id: 'figma', label: 'Figma', test: /\bfigma\b/i },
  { id: 'solidworks', label: 'SolidWorks', test: /\bsolidworks\b/i },
  { id: 'autocad', label: 'AutoCAD', test: /\bautocad\b/i },
  { id: 'verilog', label: 'Verilog', test: /\bverilog\b|\bvhdl\b/i },
  { id: 'fpga', label: 'FPGA', test: /\bfpga\b/i },
  { id: 'cuda', label: 'CUDA', test: /\bcuda\b/i },
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

const SKIP_SENTENCE = /equal opportunity|eoe\b|click here to apply|apply now|we are an equal|proud to be|diversity and inclusion|reasonable accommodation|to apply[,:]|submit your (resume|application)|follow us|all qualified applicants|without regard to|race, color|sexual orientation|gender identity|veteran status|disability status|privacy policy|terms of (use|service)|cookie policy|linkedin|handshake|our values|guide how we hire/i

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
    .replace(/<\/(p|div|li|h[1-6]|tr)>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/\n{2,}/g, '\n')
    .trim())
    .replace(/\s+/g, ' ')
    .replace(/ ?\n ?/g, '\n')
    .trim()
}

function sentences(text) {
  return String(text || '')
    .split(/(?<=[.!?])\s+(?=[A-Z•])|\n+/)
    .map((part) => part.replace(/^•\s*/, '').replace(/\s+/g, ' ').trim())
    .filter((part) => part.length >= 20 && !/<[a-z/]|data-ccp-props/i.test(part))
}

function skillHits(text) {
  const value = String(text || '')
  return SKILL_TERMS.filter((term) => term.test.test(value)).map((term) => term.label)
}

function scoreSentence(sentence) {
  let score = 0
  if (SKIP_SENTENCE.test(sentence)) {
    return -10
  }
  if (skillHits(sentence).length) {
    score += 3
  }
  if (/you(?:'| wi)ll|responsib|required|qualif|must have|looking for|what you|this (?:role|intern)|work (?:on|with)|experience with/i.test(sentence)) {
    score += 2
  }
  if (sentence.length > 240) {
    score -= 1
  }
  return score
}

export function summarizePosting(text, { maxChars = 380 } = {}) {
  const clean = htmlToText(text).replace(/\s+/g, ' ').trim()
  if (!clean) {
    return ''
  }
  const ranked = sentences(clean)
    .map((sentence, index) => ({ sentence, index, score: scoreSentence(sentence) }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, 3)
    .sort((a, b) => a.index - b.index)
    .map((row) => row.sentence)

  let out = ranked.join(' ')
  if (!out) {
    const fallback = sentences(clean).find((sentence) => !SKIP_SENTENCE.test(sentence))
      || sentences(clean)[0]
      || ''
    out = fallback
  }
  if (out.length > maxChars) {
    out = `${out.slice(0, maxChars - 1).replace(/\s+\S*$/, '')}…`
  }
  return out
}

export function extractKeywords(text, { limit = 10 } = {}) {
  const clean = htmlToText(text)
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

export function postingFields(text) {
  const summary = summarizePosting(text)
  const keywords = extractKeywords(text)
  const extra = {}
  if (summary) {
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
    /^https:\/\/([^.]+)\.wd\d+\.myworkday(?:jobs|site)\.com\/(?:[a-z]{2}-[A-Z]{2}\/)?([^/?#]+)\/job\/([^?#]+)/i,
  )
  if (workday) {
    const origin = new URL(value).origin
    const path = stripQuery(`/${workday[3]}`).replace(/^\/+/, '')
    return {
      kind: 'workday',
      api: `${origin}/wday/cxs/${workday[1]}/${workday[2]}/job/${path}`,
    }
  }

  const usajobs = value.match(/usajobs\.gov\/(?:job\/)?(\d+)/i)
  if (usajobs) {
    return { kind: 'usajobs', api: `https://www.usajobs.gov/job/${usajobs[1]}` }
  }

  if (/ycombinator\.com|workatastartup\.com|idealist\.org/i.test(value)) {
    return { kind: 'html', api: stripQuery(value) }
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
          const text = node.description || node.qualifications || ''
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

function textFromHtml(html) {
  return jsonLdDescription(html)
    || metaContent(html, 'og:description')
    || metaContent(html, 'description')
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

export async function fetchPostingText(url) {
  const target = parseApplyTarget(url)
  if (!target) {
    return ''
  }
  try {
    if (target.kind === 'greenhouse') {
      return textFromGreenhouse(await fetchJson(target.api))
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
    return textFromHtml(await fetchHtml(target.api))
  }
  catch {
    if (target.kind !== 'html') {
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
        if (extra.summary && (!current.item.summary || force)) {
          current.item.summary = extra.summary
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
