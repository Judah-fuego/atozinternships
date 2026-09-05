#!/usr/bin/env node
/**
 * Probe apply URLs and drop listings that clearly 404 / "job not found".
 * 403/429/timeouts stay — many ATS boards block bots.
 *
 * Usage (repo root):
 *   node scripts/check-internship-links.mjs
 *   node scripts/check-internship-links.mjs --dry-run
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isAggregatorApplyUrl, isSpecificPostingUrl } from './apply-url.mjs'
import { parseApplyTarget } from './job-summary.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DATA = join(ROOT, 'app/data/listings.json')
const REPORT = join(ROOT, 'tmp/internship-link-report.json')
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
const CONCURRENCY = 12
const TIMEOUT_MS = 12000

const DEAD_STATUS = new Set([404, 410, 451])
const DEAD_BODY = [
  /this job (is )?(no longer (available|open)|closed|expired)/i,
  /this position (has been (filled|closed|removed)|is no longer available)/i,
  /the job you (are looking for|requested) (is no longer|could not be found|was not found)/i,
  /sorry,?\s+this job (is|has)/i,
  /sorry,?\s+this (position|role|opportunity) (is|has)/i,
  /we couldn'?t find (that|this) (job|page|posting)/i,
  /job posting (has )?(closed|expired|been removed|is no longer)/i,
  /this posting (is no longer|has (closed|expired|been removed))/i,
  /this opportunity (is|has been) (closed|filled|removed)/i,
  /oops,?\s+that job is closed/i,
  /no longer accepting applications/i,
  /applications? (for this (job|position|role) )?(are|have been) closed/i,
  /page you(?:'| a)?re looking for (doesn'?t|does not) exist/i,
  /<title[^>]*>\s*(page not found|404|job not found)/i,
  />\s*job not found\s*</i,
]

function jobrightMissing(url, body) {
  if (!/jobright\.ai/i.test(url)) {
    return false
  }
  const title = String(body || '').match(/<title[^>]*>([^<]+)/i)?.[1]?.trim() || ''
  return /^jobright\.ai$/i.test(title)
}

/** Workday career sites return HTTP 200 for closed jobs; the shell sets postingAvailable. */
function workdayUnavailable(url, body) {
  if (!/myworkdayjobs\.com|myworkdaysite\.com/i.test(url)) {
    return false
  }
  return /\bpostingAvailable:\s*false\b/.test(String(body || ''))
}

function pageTitle(body) {
  return String(body || '').match(/<title[^>]*>([^<]*)/i)?.[1]?.replace(/\s+/g, ' ').trim() || ''
}

function ogTitle(body) {
  const og = String(body || '').match(
    /property=["']og:title["'][^>]*content=["']([^"']*)["']|content=["']([^"']*)["'][^>]*property=["']og:title["']/i,
  )
  return (og?.[1] || og?.[2] || '').replace(/\s+/g, ' ').trim()
}

export function ashbyPostingRef(url) {
  const match = String(url || '').match(/jobs\.ashbyhq\.com\/([^/?#]+)\/([0-9a-f-]{16,})/i)
  return match ? { board: decodeURIComponent(match[1]), id: match[2] } : null
}

/** Ashby 200s a board shell for missing jobs. Live pages set "{Role} @ {Company}" + og:title. */
export function ashbyUnavailable(url, body) {
  if (!/jobs\.ashbyhq\.com/i.test(url)) {
    return false
  }
  const title = pageTitle(body)
  const og = ogTitle(body)
  if (/job not found/i.test(title) || /job not found/i.test(og)) {
    return true
  }
  return /^jobs$/i.test(title) && !og
}

export function ashbyJobListed(id, jobs) {
  return (jobs || []).some((job) => job && job.id === id)
}

function classifyBody(url, status, body) {
  const text = String(body || '').slice(0, 80_000)
  if (DEAD_STATUS.has(status)) {
    return 'http-dead'
  }
  if (workdayUnavailable(url, text)) {
    return 'workday-unavailable'
  }
  if (ashbyUnavailable(url, text)) {
    return 'ashby-unavailable'
  }
  if (jobrightMissing(url, text)) {
    return 'jobright-missing'
  }
  for (const re of DEAD_BODY) {
    if (re.test(text)) {
      return 'body-dead'
    }
  }
  return null
}

async function fetchJson(url) {
  const res = await fetch(url, {
    redirect: 'follow',
    headers: {
      'user-agent': UA,
      accept: 'application/json',
    },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
  const text = await res.text()
  let json = null
  try {
    json = JSON.parse(text)
  }
  catch {
    json = null
  }
  return { status: res.status, json, text, url: res.url }
}

async function liveAshbyIds(board) {
  try {
    const { status, json } = await fetchJson(`https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(board)}`)
    if (status === 200 && Array.isArray(json?.jobs)) {
      return new Set(json.jobs.map((job) => job.id).filter(Boolean))
    }
    return null
  }
  catch {
    return null
  }
}

async function probeAtsApi(url) {
  const target = parseApplyTarget(url)
  if (!target || (target.kind !== 'greenhouse' && target.kind !== 'lever')) {
    return null
  }
  try {
    const { status, json } = await fetchJson(target.api)
    if (DEAD_STATUS.has(status) || status === 404) {
      return { verdict: 'dead', reason: `${target.kind}-missing`, status, finalUrl: target.api }
    }
    if (status === 200 && json && (json.id || json.title)) {
      return { verdict: 'ok', reason: `${target.kind}-api`, status, finalUrl: target.api }
    }
    if (status === 401 || status === 403 || status === 429) {
      return null
    }
    return null
  }
  catch {
    return null
  }
}

async function probe(url) {
  if (!url || !/^https:\/\//i.test(url)) {
    return { verdict: 'dead', reason: 'empty-url', status: 0, finalUrl: '' }
  }
  if (isAggregatorApplyUrl(url)) {
    return { verdict: 'dead', reason: 'aggregator', status: 0, finalUrl: url }
  }
  if (!isSpecificPostingUrl(url)) {
    return { verdict: 'dead', reason: 'board-only', status: 0, finalUrl: url }
  }
  const api = await probeAtsApi(url)
  if (api) {
    return api
  }
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      headers: {
        'user-agent': UA,
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'accept-language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    const body = await res.text()
    const reason = classifyBody(url, res.status, body)
    if (reason) {
      return { verdict: 'dead', reason, status: res.status, finalUrl: res.url }
    }
    if (res.status >= 500) {
      return { verdict: 'unknown', reason: `http-${res.status}`, status: res.status, finalUrl: res.url }
    }
    if (res.status === 401 || res.status === 403 || res.status === 429 || res.status === 999) {
      return { verdict: 'unknown', reason: `blocked-${res.status}`, status: res.status, finalUrl: res.url }
    }
    if (res.status >= 400) {
      return { verdict: 'dead', reason: `http-${res.status}`, status: res.status, finalUrl: res.url }
    }
    return { verdict: 'ok', reason: 'ok', status: res.status, finalUrl: res.url }
  }
  catch (err) {
    const message = String(err?.cause?.code || err?.name || err?.message || err)
    if (/Timeout|AbortError/i.test(message)) {
      return { verdict: 'unknown', reason: 'timeout', status: 0, finalUrl: '' }
    }
    if (/ENOTFOUND|EAI_AGAIN|ERR_NAME_NOT_RESOLVED/i.test(message)) {
      return { verdict: 'dead', reason: 'dns', status: 0, finalUrl: '' }
    }
    return { verdict: 'unknown', reason: message.slice(0, 80), status: 0, finalUrl: '' }
  }
}

async function mapPool(items, limit, fn) {
  const out = new Array(items.length)
  let next = 0
  async function worker() {
    while (next < items.length) {
      const i = next++
      out[i] = await fn(items[i], i)
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()))
  return out
}

export async function pruneDeadInternshipListings(listings, { onProgress } = {}) {
  const uniqueUrls = [...new Set(listings.map((item) => item.url || ''))]
  const ashbyBoards = [...new Set(uniqueUrls.map((url) => ashbyPostingRef(url)?.board).filter(Boolean))]
  const ashbyLive = new Map()
  const boardRows = await mapPool(ashbyBoards, 6, async (board) => [board, await liveAshbyIds(board)])
  for (const [board, ids] of boardRows) {
    ashbyLive.set(board, ids)
  }

  let done = 0
  const results = await mapPool(uniqueUrls, CONCURRENCY, async (url) => {
    const ashby = ashbyPostingRef(url)
    const listed = ashby ? ashbyLive.get(ashby.board) : null
    let result
    if (listed?.has(ashby.id)) {
      result = { verdict: 'ok', reason: 'ashby-api', status: 200, finalUrl: url }
    }
    else {
      result = await probe(url)
    }
    done += 1
    onProgress?.(done, uniqueUrls.length)
    return { url, ...result }
  })
  const byUrl = new Map(results.map((row) => [row.url, row]))
  const dead = []
  const unknown = []
  const kept = []
  for (const item of listings) {
    const row = byUrl.get(item.url || '') || { verdict: 'dead', reason: 'empty-url', status: 0 }
    const rec = {
      id: item.id,
      company: item.company,
      role: item.role,
      url: item.url,
      ...row,
    }
    if (row.verdict === 'dead') {
      dead.push(rec)
    }
    else if (row.verdict === 'unknown') {
      unknown.push(rec)
      kept.push(item)
    }
    else {
      kept.push(item)
    }
  }
  const reasons = {}
  for (const row of dead) {
    reasons[row.reason] = (reasons[row.reason] || 0) + 1
  }
  return {
    listings: kept,
    dead,
    unknown,
    uniqueUrls: uniqueUrls.length,
    reasons,
  }
}

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  const raw = JSON.parse(readFileSync(DATA, 'utf8'))
  process.stdout.write(`Checking ${raw.listings.length} internship apply links…\n`)
  const result = await pruneDeadInternshipListings(raw.listings, {
    onProgress(done, total) {
      if (done % 50 === 0 || done === total) {
        process.stdout.write(`  ${done}/${total}\n`)
      }
    },
  })
  mkdirSync(join(ROOT, 'tmp'), { recursive: true })
  writeFileSync(REPORT, `${JSON.stringify({
    checkedAt: new Date().toISOString(),
    listings: raw.listings.length,
    uniqueUrls: result.uniqueUrls,
    ok: raw.listings.length - result.dead.length - result.unknown.length,
    unknown: result.unknown.length,
    deadCount: result.dead.length,
    deadReasons: result.reasons,
    dead: result.dead,
    unknownSample: result.unknown.slice(0, 80),
  }, null, 2)}\n`)
  process.stdout.write(
    `ok ${raw.listings.length - result.dead.length - result.unknown.length}`
    + ` · unknown ${result.unknown.length} · dead ${result.dead.length}\n`
    + `dead reasons ${JSON.stringify(result.reasons)}\n`,
  )
  if (!dryRun) {
    raw.listings = result.listings
    raw.count = result.listings.length
    raw.openCount = result.listings.filter((item) => !item.closed).length
    writeFileSync(DATA, `${JSON.stringify(raw, null, 2)}\n`)
    process.stdout.write(`Wrote ${raw.count} internships (${raw.openCount} open) to ${DATA}\n`)
  }
  else {
    process.stdout.write('Dry run — JSON not rewritten\n')
  }
  process.stdout.write(`Report: ${REPORT}\n`)
}

const invokedDirectly = process.argv[1]
  && resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (invokedDirectly) {
  main().catch((error) => {
    console.error(error)
    process.exit(1)
  })
}
