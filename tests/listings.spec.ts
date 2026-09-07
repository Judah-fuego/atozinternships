import { describe, expect, it } from 'vitest'
import {
  TRACK_FAMILY,
  TRACK_LABEL,
  audience,
  eligibilityLine,
  facetCounts,
  filterListings,
  formatDeadline,
  isoDeadline,
  levelsFromRole,
  listingPayLine,
  listingSource,
  listingSummary,
  parsePlaces,
  formatPostedAgo,
  formatTermLabel,
  hydratePostedAt,
  listingPostedAgeMs,
  postedAgeDays,
  queryMatches,
  seasonLabelFor,
  sidebarFilterCount,
  sortListingsByPosted,
  uniqueCompanies,
  visaLabel,
  type Internship,
} from '../app/data/listings'
import { extractKeywords, extractPay, extractRequirements, extractDeadline, extractInternshipTerm, isWeakSummary, parseApplyTarget, parseDeadlineDate, postingFields, summarizePosting } from '../scripts/job-summary.mjs'
import { companyInternshipBoards, internshipBoardForCompany, isSpecificPostingUrl } from '../scripts/apply-url.mjs'
import { adpRecruitmentRef, ashbyJobListed, ashbyUnavailable } from '../scripts/check-internship-links.mjs'

function listing(partial: Partial<Internship> = {}): Internship {
  return {
    id: 'x',
    company: 'Acme',
    role: 'Software Engineer Intern',
    location: 'New York, NY',
    url: 'https://example.com/job',
    posted: 'Sep 1',
    season: 'summer',
    track: 'swe',
    closed: false,
    noSponsorship: false,
    usCitizen: false,
    ...partial,
  }
}

describe('levelsFromRole', () => {
  it('reads stated degree levels from the title', () => {
    expect(levelsFromRole('Software Engineer Intern')).toEqual([])
    expect(levelsFromRole('Software Engineer Intern, Undergrad')).toEqual(['undergrad'])
    expect(levelsFromRole("Software Engineering Intern, Master's")).toEqual(['masters'])
    expect(levelsFromRole('Quantitative Research Intern (PHD)')).toEqual(['phd'])
    expect(levelsFromRole('Product Management Intern, MBA')).toEqual(['mba'])
    expect(levelsFromRole("Investment Intern - Undergraduate & Master's")).toEqual(['undergrad', 'masters'])
    expect(levelsFromRole('Pathways Student Trainee')).toEqual(['undergrad', 'masters'])
    expect(levelsFromRole('Graduate Student Research Intern')).toEqual(['masters'])
  })
})

describe('audience', () => {
  it('labels unspecified internships as typical undergrad or master\'s', () => {
    const info = audience(listing())
    expect(info.label).toBe("Undergrad or Master's")
    expect(info.kind).toBe('typical')
    expect(info.who).toEqual(['undergrad', 'grad'])
  })

  it('keeps grad-only titles out of undergrad', () => {
    const info = audience(listing({ role: 'Research Intern, PhD' }))
    expect(info.label).toBe('PhD')
    expect(info.kind).toBe('stated')
    expect(info.who).toEqual(['grad'])
  })

  it('keeps undergrad-only titles out of grad-only', () => {
    const info = audience(listing({ role: 'Software Engineer Intern, Undergraduate' }))
    expect(info.label).toBe('Undergrad')
    expect(info.who).toEqual(['undergrad'])
  })
})

describe('eligibilityLine', () => {
  it('adds citizenship when the source says so', () => {
    expect(eligibilityLine(listing({
      role: 'Pathways Student Trainee',
      usCitizen: true,
    }))).toBe("Undergrad or Master's · U.S. citizens")
  })

  it('adds work-auth when sponsorship is off', () => {
    expect(visaLabel(listing({ noSponsorship: true }))).toBe('Needs U.S. work auth')
  })
})

describe('filterListings', () => {
  const rows = [
    listing({ id: 'ug', role: 'Intern, Undergraduate' }),
    listing({ id: 'phd', role: 'Research Intern, PhD', track: 'science' }),
    listing({ id: 'any', role: 'Software Engineer Intern' }),
  ]

  it('who=undergrad keeps undergrad and typical roles', () => {
    const ids = filterListings(rows, { who: 'undergrad' }).map((item) => item.id)
    expect(ids).toEqual(['ug', 'any'])
  })

  it('who=grad keeps grad and typical roles, not undergrad-only', () => {
    const ids = filterListings(rows, { who: 'grad' }).map((item) => item.id)
    expect(ids).toEqual(['phd', 'any'])
  })

  it('tracks filter beats family when both are set', () => {
    const mixed = [
      listing({ id: 'swe', track: 'swe' }),
      listing({ id: 'ml', track: 'ml' }),
      listing({ id: 'science', track: 'science' }),
    ]
    const ids = filterListings(mixed, { families: ['software'], tracks: ['ml'] }).map((item) => item.id)
    expect(ids).toEqual(['ml'])
  })

  it('companies filter keeps matching employers', () => {
    const mixed = [
      listing({ id: 'a', company: 'Acme' }),
      listing({ id: 'b', company: 'Beta' }),
    ]
    const ids = filterListings(mixed, { companies: ['Beta'] }).map((item) => item.id)
    expect(ids).toEqual(['b'])
  })

  it('sources filter keeps listings from those boards', () => {
    const mixed = [
      listing({ id: 'yc-1', url: 'https://www.ycombinator.com/companies/acme/jobs/1' }),
      listing({ id: 'usajobs-1', url: 'https://www.usajobs.gov/job/1' }),
      listing({ id: 'public-1', url: 'https://example.com/job' }),
    ]
    expect(filterListings(mixed, { sources: ['yc'] }).map((item) => item.id)).toEqual(['yc-1'])
    expect(filterListings(mixed, { sources: ['yc', 'usajobs'] }).map((item) => item.id)).toEqual(['yc-1', 'usajobs-1'])
  })

  it('posted filter keeps listings within the selected window', () => {
    const asOf = new Date(2026, 8, 5)
    const mixed = [
      listing({ id: 'today', posted: 'Today' }),
      listing({ id: 'hours', posted: '14m' }),
      listing({ id: 'yesterday', posted: 'Yesterday' }),
      listing({ id: 'week', posted: '1w' }),
      listing({ id: 'old', posted: 'Aug 04' }),
      listing({ id: 'unknown', posted: '' }),
    ]
    expect(filterListings(mixed, { posted: '1d' }, asOf).map((item) => item.id)).toEqual(['today', 'hours', 'yesterday'])
    expect(filterListings(mixed, { posted: '7d' }, asOf).map((item) => item.id)).toEqual(['today', 'hours', 'yesterday', 'week'])
    expect(filterListings(mixed, { posted: '30d' }, asOf).map((item) => item.id)).toEqual(['today', 'hours', 'yesterday', 'week'])
  })

  it('pay filters keep disclosed and min hourly roles', () => {
    const mixed = [
      listing({ id: 'paid', payText: '$57–$61/hr', payMin: 57, payMax: 61, payUnit: 'hour' }),
      listing({ id: 'low', payText: '$35/hr', payMin: 35, payMax: 35, payUnit: 'hour' }),
      listing({ id: 'yearly', payText: '$80,000/yr', payMin: 80000, payMax: 80000, payUnit: 'year' }),
      listing({ id: 'none' }),
    ]
    expect(filterListings(mixed, { pay: 'disclosed' }).map((item) => item.id)).toEqual(['paid', 'low', 'yearly'])
    expect(filterListings(mixed, { minHourly: 50 }).map((item) => item.id)).toEqual(['paid'])
    expect(listingPayLine(mixed[0])).toMatch(/\$57/)
  })

  it('hides postings older than a year from browse while keeping unknown ages', () => {
    const asOf = new Date('2026-09-06T12:00:00.000Z')
    const day = 86_400_000
    const mixed = [
      listing({ id: 'fresh', posted: 'Sep 1', postedAt: new Date(asOf.getTime() - 5 * day).toISOString() }),
      listing({ id: 'edge', posted: 'Sep 6, 2025', postedAt: new Date(asOf.getTime() - 365 * day).toISOString() }),
      listing({ id: 'stale', posted: 'Aug 5, 2024', postedAt: new Date(asOf.getTime() - 366 * day).toISOString() }),
      listing({ id: 'unknown', posted: '' }),
    ]
    expect(filterListings(mixed, { status: 'all' }, asOf).map((item) => item.id)).toEqual(['fresh', 'edge', 'unknown'])
    expect(facetCounts(mixed, { status: 'all' }, asOf).who.all).toBe(3)
  })
})

describe('uniqueCompanies', () => {
  it('sorts unique employer names', () => {
    expect(uniqueCompanies([
      listing({ company: 'Beta' }),
      listing({ company: 'Acme' }),
      listing({ company: 'Beta' }),
    ])).toEqual(['Acme', 'Beta'])
  })
})

describe('sidebarFilterCount', () => {
  it('counts company and location filters', () => {
    expect(sidebarFilterCount({ companies: ['Acme'], locations: ['new-york'] })).toBe(2)
  })

  it('counts a source filter once', () => {
    expect(sidebarFilterCount({ sources: ['yc', 'usajobs'] })).toBe(1)
    expect(sidebarFilterCount({ sources: [] })).toBe(0)
  })

  it('counts a posted recency filter', () => {
    expect(sidebarFilterCount({ posted: '7d' })).toBe(1)
    expect(sidebarFilterCount({ posted: 'all' })).toBe(0)
  })

  it('counts pay filters', () => {
    expect(sidebarFilterCount({ pay: 'disclosed', minHourly: 50 })).toBe(2)
    expect(sidebarFilterCount({ pay: 'all', minHourly: undefined })).toBe(0)
  })
})

describe('postedAgeDays', () => {
  const asOf = new Date(2026, 8, 5)

  it('reads relative ages and calendar dates', () => {
    expect(postedAgeDays('14m', asOf)).toBe(0)
    expect(postedAgeDays('23h', asOf)).toBe(0)
    expect(postedAgeDays('Today', asOf)).toBe(0)
    expect(postedAgeDays('Yesterday', asOf)).toBe(1)
    expect(postedAgeDays('1d', asOf)).toBe(1)
    expect(postedAgeDays('2d', asOf)).toBe(2)
    expect(postedAgeDays('1w', asOf)).toBe(7)
    expect(postedAgeDays('Recently', asOf)).toBe(2)
    expect(postedAgeDays('30+ Days Ago', asOf)).toBe(31)
    expect(postedAgeDays('Sep 5', asOf)).toBe(0)
    expect(postedAgeDays('Sep 4', asOf)).toBe(1)
    expect(postedAgeDays('Sep 1', asOf)).toBe(4)
    expect(postedAgeDays('Aug 21', asOf)).toBe(15)
    expect(postedAgeDays('Aug 04', asOf)).toBe(32)
    expect(postedAgeDays('Oct 30', asOf)).toBe(310)
    expect(postedAgeDays('', asOf)).toBeNull()
  })
})

describe('formatPostedAgo', () => {
  const asOf = new Date(2026, 8, 5, 16, 13, 50)

  it('ages a stored timestamp instead of the frozen scrape label', () => {
    const postedAt = new Date(2026, 8, 5, 14, 0, 50).toISOString()
    expect(formatPostedAgo({ posted: '13m', postedAt }, asOf)).toBe('2h')
    expect(listingPostedAgeMs({ posted: '13m', postedAt }, asOf)).toBe(asOf.getTime() - Date.parse(postedAt))
  })

  it('falls back to the posted label when there is no timestamp', () => {
    expect(formatPostedAgo({ posted: '13m' }, asOf)).toBe('13m')
    expect(formatPostedAgo({ posted: 'Sep 1' }, asOf)).toBe('4d')
    expect(formatPostedAgo({ posted: 'Aug 21' }, asOf)).toBe('Aug 21')
  })
})

describe('hydratePostedAt', () => {
  it('anchors relative labels to scrape time so they can age later', () => {
    const scrapedAt = '2026-09-05T14:13:50-05:00'
    const [row] = hydratePostedAt([listing({ posted: '13m' })], scrapedAt)
    expect(row.postedAt).toBe(new Date(Date.parse(scrapedAt) - 13 * 60_000).toISOString())
    expect(formatPostedAgo(row, new Date('2026-09-05T16:13:50-05:00'))).toBe('2h')
  })
})

describe('sortListingsByPosted', () => {
  const asOf = new Date(2026, 8, 5, 14, 18)
  const mixed = [
    listing({ id: 'day', posted: 'Sep 5' }),
    listing({ id: 'mins', posted: '13m' }),
    listing({ id: 'hours', posted: '18h' }),
    listing({ id: 'old', posted: 'Aug 04' }),
    listing({ id: 'unknown', posted: '' }),
  ]

  it('leaves source order alone until a sort is chosen', () => {
    expect(sortListingsByPosted(mixed, 'none', asOf).map((item) => item.id)).toEqual(['day', 'mins', 'hours', 'old', 'unknown'])
  })

  it('puts minutes ahead of a same-day calendar date', () => {
    expect(sortListingsByPosted(mixed, 'newest', asOf).map((item) => item.id)).toEqual(['mins', 'day', 'hours', 'old', 'unknown'])
  })

  it('sorts oldest first and keeps unknown dates last', () => {
    expect(sortListingsByPosted(mixed, 'oldest', asOf).map((item) => item.id)).toEqual(['old', 'hours', 'day', 'mins', 'unknown'])
  })
})

describe('facetCounts', () => {
  it('counts jobs per option and ignores the current facet', () => {
    const rows = [
      listing({ id: 'ug', role: 'Intern, Undergraduate', company: 'Acme', location: 'New York, NY' }),
      listing({ id: 'phd', role: 'Research Intern, PhD', track: 'science', company: 'Beta', location: 'Boston, MA' }),
      listing({ id: 'any', role: 'Software Engineer Intern', company: 'Acme', location: 'San Francisco, CA' }),
    ]
    const counts = facetCounts(rows, { who: 'undergrad' })
    expect(counts.who.all).toBe(3)
    expect(counts.who.undergrad).toBe(2)
    expect(counts.who.grad).toBe(2)
    expect(counts.companies.Acme).toBe(2)
    expect(counts.companies.Beta).toBeUndefined()
    expect(counts.families.software).toBe(2)
    expect(counts.families.health).toBe(0)
  })

  it('keeps facet counts aligned with filterListings when a query is set', () => {
    const rows = [
      listing({ id: 'java', role: 'Software Engineer Intern', keywords: 'Java, SQL' }),
      listing({ id: 'cn', role: 'Policy Intern', track: 'policy', keywords: 'Chinese, Mandarin' }),
      listing({ id: 'plain', role: 'Software Engineer Intern' }),
    ]
    const options = { query: 'java', status: 'all' as const }
    const counts = facetCounts(rows, options)
    expect(counts.who.all).toBe(filterListings(rows, { ...options, who: 'all' }).length)
    expect(counts.who.undergrad).toBe(filterListings(rows, { ...options, who: 'undergrad' }).length)
    expect(counts.season.all).toBe(filterListings(rows, { ...options, season: 'all' }).length)
    expect(counts.status.all).toBe(filterListings(rows, { ...options, status: 'all' }).length)
    expect(counts.companies.Acme).toBe(1)
  })

  it('counts sources without applying the current source filter', () => {
    const rows = [
      listing({ id: 'yc-1', url: 'https://www.ycombinator.com/companies/acme/jobs/1' }),
      listing({ id: 'usajobs-1', url: 'https://www.usajobs.gov/job/1' }),
      listing({ id: 'public-1', url: 'https://example.com/job' }),
    ]
    const counts = facetCounts(rows, { sources: ['yc'] })
    expect(counts.sources.yc).toBe(1)
    expect(counts.sources.usajobs).toBe(1)
    expect(counts.sources.github).toBe(1)
    expect(counts.who.all).toBe(1)
  })
})

describe('tracks', () => {
  it('gives every field a family, including the newer Other splits', () => {
    expect(TRACK_LABEL.retail).toBe('Retail')
    expect(TRACK_LABEL.hr).toBe('HR')
    expect(TRACK_LABEL.legal).toBe('Legal')
    expect(TRACK_LABEL.education).toBe('Education')
    expect(TRACK_LABEL.entertainment).toBe('Entertainment')
    expect(TRACK_LABEL.architecture).toBe('Architecture')
    expect(TRACK_FAMILY.retail).toBe('business')
    expect(TRACK_FAMILY.legal).toBe('policy')
    expect(TRACK_FAMILY.architecture).toBe('engineering')
    expect(TRACK_FAMILY.entertainment).toBe('arts')
    expect(Object.keys(TRACK_LABEL).sort()).toEqual(Object.keys(TRACK_FAMILY).sort())
  })
})

describe('isoDeadline', () => {
  it('keeps a real YYYY-MM-DD and otherwise stays empty', () => {
    expect(isoDeadline('2026-10-03')).toBe('2026-10-03')
    expect(isoDeadline('2026-10-03T12:00:00Z')).toBe('2026-10-03')
    expect(isoDeadline('')).toBe('')
    expect(isoDeadline('soon')).toBe('')
    expect(isoDeadline('2026-10')).toBe('')
  })
})

describe('formatDeadline', () => {
  it('formats a due date and keeps the year when it is not this year', () => {
    expect(formatDeadline('2026-10-03')).toBe('Oct 3')
    expect(formatDeadline('2027-01-29')).toBe('Jan 29, 2027')
    expect(formatDeadline('')).toBe('')
  })
})

describe('listingSource', () => {
  it('labels Idealist and USAJobs rows', () => {
    expect(listingSource(listing({ id: 'idealist-aclu-intern-1', url: 'https://www.aclu.org/jobs' })).label).toBe('Idealist')
    expect(listingSource(listing({ id: 'usajobs-nsa-intern-1', url: 'https://www.usajobs.gov/job/1' })).label).toBe('USAJobs')
    expect(listingSource(listing({
      id: 'company-google-software-engineer-intern-mountain-view',
      url: 'https://www.google.com/about/careers/applications/jobs/results/1-software-engineering-intern',
    })).label).toBe('Company career page')
    expect(listingSource(listing({
      id: 'yc-75704',
      url: 'https://www.ycombinator.com/companies/safetykit/jobs/eQpUzRD-full-stack-engineer-intern-summer-2026',
    }))).toEqual({ id: 'yc', label: 'Y Combinator' })
  })
})

describe('parsePlaces', () => {
  it('keeps a single city as the label', () => {
    expect(parsePlaces('San Jose, CA')).toEqual({
      label: 'San Jose, CA',
      places: ['San Jose, CA'],
      compact: false,
    })
  })

  it('compacts a long multi-city string', () => {
    const parsed = parsePlaces('31 locations Everett, WA Saint Charles, MO Huntsville, AL Charleston, SC Oklahoma City, OK Berkeley, MO Huntington Beach, CA Hazelwood, MO El Segundo, CA Herndon, VA Plano, TX Arlington, VA Ridley Park, PA Tukwila, WA North Charleston, SC Fairfax, VA Colorado Springs, CO Chicago, IL Seal Beach, CA Mukilteo, WA Long Beach, CA Atlanta, GA Renton, WA Dallas, TX Seattle, WA Auburn, WA Bellevue, WA San Antonio, TX Kent, WA Mesa, AZ Tukwila, WA')
    expect(parsed.compact).toBe(true)
    expect(parsed.label).toBe('31 locations')
    expect(parsed.places).toContain('Everett, WA')
    expect(parsed.places).toContain('Mesa, AZ')
    expect(parsed.places.length).toBeGreaterThan(20)
  })
})

describe('listingSummary', () => {
  it('uses the scraped posting summary when one exists', () => {
    expect(listingSummary(listing({
      summary: 'You will write Python services and work with Java testers.',
    }))).toBe('You will write Python services and work with Java testers.')
  })

  it('falls back to a generated line', () => {
    expect(listingSummary(listing())).toContain('Software internship at Acme')
    expect(listingSummary(listing())).toMatch(/Summer '27/)
  })

  it('prefers a concrete cohort term in the fallback line', () => {
    expect(formatTermLabel('Summer 2027')).toBe("Summer '27")
    expect(formatTermLabel('Fall 2026')).toBe("Fall '26")
    expect(seasonLabelFor(listing({ term: 'Winter 2027', season: 'offseason' }))).toBe("Winter '27")
    expect(listingSummary(listing({
      summary: '',
      term: 'Fall 2026',
      season: 'offseason',
    }))).toContain("Fall '26")
  })
})

describe('listingPayLine', () => {
  it('keeps short clean pay text', () => {
    expect(listingPayLine(listing({
      payText: '$57–$61/hr',
      payMin: 57,
      payMax: 61,
      payUnit: 'hour',
    }))).toBe('$57–$61/hr')
  })

  it('formats from numbers when payText is scrape noise', () => {
    expect(listingPayLine(listing({
      payText: 'n, certifications, etc. $37,440 - $96,800 per year Description of Benefits Humana, Inc. and its af',
      payMin: 37440,
      payMax: 96800,
      payUnit: 'year',
    }))).toBe('$37,440–$96,800/yr')
  })

  it('hides zero and false-positive pay', () => {
    expect(listingPayLine(listing({
      payText: 'NAVAILABLE Compensation $0/yr',
      payMin: 0,
      payMax: 0,
      payUnit: 'year',
    }))).toBe('')
    expect(listingPayLine(listing({
      payText: 'contribute more than $1.5 trillion in network volume',
      payMin: 1.5,
      payMax: 1.5,
      payUnit: 'year',
    }))).toBe('')
  })
})

describe('posting text', () => {
  it('pulls Java, Python, and Chinese out of a job description', () => {
    const text = 'Required: Java and Python. Mandarin Chinese is a plus. Equal opportunity employer.'
    expect(extractKeywords(text)).toBe('Python, Java, Chinese')
    // Skills alone are not an About blurb — they show under Skills.
    expect(summarizePosting(text)).toBe('')
  })

  it('keeps Spanish only when it is a real skill, not a PDF link', () => {
    expect(extractKeywords('Download the Spanish PDF of this job description. Required: Python.')).toBe('Python')
    expect(extractKeywords('Fluent in Spanish and Portuguese. Experience with Excel.')).toBe('Excel, Spanish, Portuguese')
    expect(extractKeywords('Provide mentorship to Spanish-speaking clients.')).toBe('Spanish')
    expect(extractKeywords('View Spanish translation of this posting.')).toBe('')
  })

  it('keeps what you will do as the main blurb, not culture or skills', () => {
    const text = `
      Our Culture We promote a diverse and inclusive environment and commit to responsibility for our communities.
      What You Will Do
      • Design and develop production systems for model deployment
      • Build APIs that expose statistical models to trading systems
      Qualifications
      • Experience with Python and Java
      Click the link provided to see the complete job description.
    `
    const summary = summarizePosting(text)
    expect(summary).toMatch(/design and develop production systems/i)
    expect(summary).toMatch(/build apis/i)
    expect(summary).not.toMatch(/relevant skills/i)
    expect(summary).not.toMatch(/our culture/i)
    expect(summary).not.toMatch(/click the link/i)
    expect(extractKeywords(text)).toBe('Python, Java')
    expect(isWeakSummary('Strong programming skills in Python, C++, or Java, with a focus on writing production-quality code. Relevant skills: Python, Java.')).toBe(true)
  })

  it('puts what you get to work on first and skips conference perks', () => {
    const text = `
      What you'll get to work on
      Build and operate training, data, or evaluation infrastructure used daily by the wider SW team.
      Work with GPU clusters, orchestration, and data pipelines at scale.
      Instrument, monitor, and harden the pipeline you ship.
      Test your work on real robots at the office.
      Opportunity to publish (for PhD interns).
      Attend Tier-1 industry conferences.
      Qualifications
      Strong Python; familiarity with cloud services (AWS/GCP), containers, and CI/CD.
    `
    const summary = summarizePosting(text)
    expect(summary).toMatch(/build and operate training/i)
    expect(summary).toMatch(/gpu clusters|data pipelines|harden the pipeline/i)
    expect(summary.length).toBeGreaterThan(200)
    expect(summary).not.toMatch(/^what you(?:'|’)ll get to work on/i)
    expect(summary).not.toMatch(/opportunity to publish/i)
    expect(summary).not.toMatch(/tier-1|conferences/i)
    expect(summary).not.toMatch(/relevant skills/i)
    expect(isWeakSummary('What you\'ll get to work on. Strong Python; familiarity with cloud services (AWS/GCP), containers, and CI/CD. Relevant skills: Python.')).toBe(true)
  })

  it('keeps a long what-you-ll-do block from star bullets like Eightfold postings', () => {
    const text = `
What You’ll Do

  * Design and develop production systems for model deployment, serving, and monitoring at scale
  * Build APIs and services that expose statistical models, risk calculations, and portfolio analytics to trading systems
  * Productionize research models by optimizing performance, strengthening error handling, and ensuring numerical stability
  * Develop high-performance infrastructure for real-time pricing, risk calculations, and portfolio optimization
  * Build data pipelines and quantitative tools that support back-testing, statistical analysis, market simulation, and model inference

What You Bring

  * Strong programming skills in Python, C++, or Java, with a focus on writing production-quality code
  * Pursuing a Bachelor’s or Master’s degree in Computer Science, Mathematics, Physics, Engineering, or a related quantitative field
    `
    const summary = summarizePosting(text)
    expect(summary).toMatch(/design and develop production systems/i)
    expect(summary).toMatch(/build apis/i)
    expect(summary).toMatch(/data pipelines/i)
    expect(summary).not.toMatch(/strong programming/i)
    expect(summary).not.toMatch(/relevant skills/i)
    expect(extractKeywords(text)).toMatch(/Python/)
  })

  it('drops view-our-opening filler instead of keeping it as the description', () => {
    expect(summarizePosting('View our opening for Software Engineer Intern - 2027 Summer and learn more about what it\'s like to work at TikTok!')).toBe('')
  })

  it('skips internship-credit and company-about boilerplate', () => {
    const text = `
      Acme is a quantitative trading firm and liquidity provider with a unique focus on technology.
      This intern will work full-time through the Summer of 2027. If pursuing internship credit through your university, it is your responsibility to consult with your advisor.
      Responsibilities
      You will write Python services that monitor live market data and help research new trading signals.
    `
    const summary = summarizePosting(text)
    expect(summary).toMatch(/python services/i)
    expect(summary).not.toMatch(/quantitative trading firm/i)
    expect(summary).not.toMatch(/internship credit/i)
  })

  it('extracts dual hourly rates into pay fields', () => {
    const text = 'In San Francisco or New York City, the estimated hourly range for this role is $57/hr for Bachelors and $61/hr for Master’s.'
    const pay = extractPay(text)
    expect(pay.payMin).toBe(57)
    expect(pay.payMax).toBe(61)
    expect(pay.payUnit).toBe('hour')
    expect(pay.payText).toBe('$57–$61/hr')
  })

  it('extracts graduation and degree requirements, not soft-skill walls', () => {
    const text = `
      What You Will Do
      • Design and develop production systems for model deployment
      Qualifications
      Pursuing a bachelor's or master’s degree in computer science, engineering, or another related field. Must graduate before Summer 2028.
      Thoughtful problem-solving: For you, problem-solving starts with a clear and accurate understanding of the context. You can decompose tricky problems and work towards a clean solution, by yourself or with teammates. You're comfortable asking for help when you get stuck.
      Put users first: You think critically about the implications of what you're building, and how it shapes real people's lives.
      Team player: For you, work isn't a solo endeavor. You enjoy collaborating cross-functionally to accomplish shared goals.
      AI enthusiast: You have built or prototyped features with AI technologies (LLMs, Embeddings, ML) and are interested in learning more.
    `
    const requirements = extractRequirements(text)
    expect(requirements).toMatch(/bachelor/i)
    expect(requirements).toMatch(/graduate before Summer 2028/i)
    expect(requirements).not.toMatch(/thoughtful problem-solving/i)
    expect(requirements).not.toMatch(/team player/i)
    expect(requirements).not.toMatch(/ai enthusiast/i)

    const summary = summarizePosting(text)
    expect(summary).toMatch(/design and develop production systems/i)
    expect(summary).not.toMatch(/thoughtful problem-solving/i)
    expect(summary).not.toMatch(/must graduate/i)
  })

  it('reads JSON-LD baseSalary from html', () => {
    const html = `
      <script type="application/ld+json">
        {"@type":"JobPosting","description":"Build APIs with Python.","baseSalary":{"@type":"MonetaryAmount","currency":"USD","value":{"@type":"QuantitativeValue","minValue":40,"maxValue":45,"unitText":"HOUR"}}}
      </script>
    `
    const pay = extractPay('Build APIs with Python.', { html })
    expect(pay.payMin).toBe(40)
    expect(pay.payMax).toBe(45)
    expect(pay.payUnit).toBe('hour')
  })

  it('postingFields returns pay, requirements, summary, and keywords together', () => {
    const text = `
      Compensation
      $50/hr
      What You Will Do
      You will write Python services for trading systems.
      Qualifications
      Must graduate before Summer 2028. Experience with Python.
    `
    const fields = postingFields(text)
    expect(fields.payMin).toBe(50)
    expect(fields.payUnit).toBe('hour')
    expect(fields.requirements).toMatch(/graduate before Summer 2028/i)
    expect(fields.summary).toMatch(/python/i)
    expect(fields.keywords).toMatch(/Python/)
  })

  it('extracts application end dates from posting copy', () => {
    expect(extractDeadline('End Date: October 23, 2026 (30+ days left to apply)')).toBe('2026-10-23')
    expect(extractDeadline('Application deadline: Nov 1, 2026')).toBe('2026-11-01')
    expect(extractDeadline('Apply by 12/15/2026')).toBe('2026-12-15')
    expect(extractDeadline('Start Date: August 7, 2026')).toBe('')
    expect(parseDeadlineDate('2026-10-23')).toBe('2026-10-23')
    expect(postingFields('End Date: October 23, 2026\nYou will analyze flight data with Python.').deadline).toBe('2026-10-23')
  })

  it('extracts cohort terms like Summer 2027 from titles and posting copy', () => {
    expect(extractInternshipTerm('Software Engineer Intern (Winter 2027)')).toEqual({
      term: 'Winter 2027',
      season: 'offseason',
    })
    expect(extractInternshipTerm('Software Engineer Intern (Fall 2026) - Austin, TX')).toEqual({
      term: 'Fall 2026',
      season: 'offseason',
    })
    expect(extractInternshipTerm(
      '2027 Technology Internship (US)',
      'Our 10-week Summer Internship Program pairs you with a technology team',
    )).toEqual({
      term: 'Summer 2027',
      season: 'summer',
    })
    expect(extractInternshipTerm('Software Engineering Intern (Winter)')).toEqual({
      term: 'Winter 2027',
      season: 'offseason',
    })
    expect(extractInternshipTerm('Backend Software Engineer Intern')).toBeNull()
  })

  it('maps Greenhouse, Lever, Ashby, SmartRecruiters, and Jane Street URLs', () => {
    expect(parseApplyTarget('https://job-boards.greenhouse.io/thenuclearcompany/jobs/5391923008?utm_source=x')).toEqual({
      kind: 'greenhouse',
      api: 'https://boards-api.greenhouse.io/v1/boards/thenuclearcompany/jobs/5391923008',
    })
    expect(parseApplyTarget('https://jobs.lever.co/palantir/373367a9-3160-49d8-b7af-2efec062fad1')).toEqual({
      kind: 'lever',
      api: 'https://api.lever.co/v0/postings/palantir/373367a9-3160-49d8-b7af-2efec062fad1',
    })
    expect(parseApplyTarget('https://jobs.ashbyhq.com/replit/7e0dafe8-3eec-442e-aa76-a4d84d779fb1')).toEqual({
      kind: 'ashby',
      api: 'https://api.ashbyhq.com/posting-api/job-board/replit/job/7e0dafe8-3eec-442e-aa76-a4d84d779fb1',
    })
    expect(parseApplyTarget('https://jobs.smartrecruiters.com/Canva/6000000001291655-phd-research-scientist-intern')).toEqual({
      kind: 'smartrecruiters',
      api: 'https://api.smartrecruiters.com/v1/companies/Canva/postings/6000000001291655',
    })
    expect(parseApplyTarget('https://api.smartrecruiters.com/v1/companies/AbbVie/postings/3743990014930726')).toEqual({
      kind: 'smartrecruiters',
      api: 'https://api.smartrecruiters.com/v1/companies/AbbVie/postings/3743990014930726',
    })
    expect(parseApplyTarget('https://www.verition.com/open-positions?gh_jid=5214784007')).toEqual({
      kind: 'greenhouse',
      api: 'https://boards-api.greenhouse.io/v1/boards/veritiongroupllc/jobs/5214784007',
    })
    expect(parseApplyTarget('https://www.janestreet.com/join-jane-street/position/8599644002/')).toEqual({
      kind: 'greenhouse',
      api: 'https://boards-api.greenhouse.io/v1/boards/janestreet/jobs/8599644002',
    })
    expect(parseApplyTarget('https://careers.withwaymo.com/jobs?gh_jid=8174504')).toEqual({
      kind: 'greenhouse',
      api: 'https://boards-api.greenhouse.io/v1/boards/waymo/jobs/8174504',
    })
    expect(parseApplyTarget('https://boeing.wd1.myworkdayjobs.com/en-US/EXTERNAL_CAREERS/details/Intern_JR2026520976-1')).toEqual({
      kind: 'workday',
      api: 'https://boeing.wd1.myworkdayjobs.com/wday/cxs/boeing/EXTERNAL_CAREERS/job/Intern_JR2026520976-1',
    })
    expect(parseApplyTarget('https://www.linkedin.com/jobs/view/1')).toBeNull()
    expect(parseApplyTarget('https://egup.fa.us2.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX/job/20278958?utm_source=x')).toEqual({
      kind: 'oracle',
      api: 'https://egup.fa.us2.oraclecloud.com/hcmRestApi/resources/latest/recruitingCEJobRequisitionDetails?onlyData=true&finder=ById%3BId%3D20278958%2CsiteNumber%3DCX',
    })
    expect(parseApplyTarget('https://egug.fa.us2.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_1/job/26010970')).toEqual({
      kind: 'oracle',
      api: 'https://egug.fa.us2.oraclecloud.com/hcmRestApi/resources/latest/recruitingCEJobRequisitionDetails?onlyData=true&finder=ById%3BId%3D26010970%2CsiteNumber%3DCX_1',
    })
  })

  it('treats truncated Oracle meta blurbs as missing so the full posting can replace them', () => {
    expect(isWeakSummary('As a Software Engineer Intern, you’ll j...')).toBe(true)
    expect(isWeakSummary('Business Unit/Role Specific Information Global Merchant & Network Services brings together American Express')).toBe(true)
    expect(isWeakSummary('You will write Python services that monitor live market data and help research new trading signals.')).toBe(false)
  })

  it('keeps Vertiv and Amex work plus required skills, not program fluff', () => {
    const vertiv = `
      Position Summary
      The Product Management MBA Intern will support Vertiv's Power Solutions business by assisting with product strategy, portfolio management, and market analysis.
      Key Responsibilities
      Conduct market, competitive, and customer research to identify growth opportunities.
      Analyze product portfolio performance, revenue trends, and profitability drivers.
      Qualifications
      Required
      Proficiency with Microsoft Excel and PowerPoint.
      About Us
      The successful candidate will embrace Vertiv’s Core Principles.
    `
    const vertivSummary = summarizePosting(vertiv)
    expect(vertivSummary).toMatch(/market, competitive|product portfolio/i)
    expect(vertivSummary).not.toMatch(/excel/i)
    expect(vertivSummary).not.toMatch(/core principles/i)
    expect(extractKeywords(vertiv)).toMatch(/Excel/i)

    const amex = `
      Business Unit/Role Specific Information The Enterprise Technology Services organization partners with every part of the American Express business.
      As an AI Engineer Intern, you’ll join a 10-week Summer Internship Program and contribute to real-world technology projects.
      You’ll build software, collaborate with Agile teams, and learn how products are designed, developed, tested, and delivered.
      What type of work can you expect? How will you make an impact in this role?
      • Support the development and integration of AI/ML models, LLM integrations, or intelligent services into production-like systems.
      • Assist with data collection, preprocessing, transformation, and management to enable model training and evaluation.
      Minimum Qualifications
      • Knowledge of Python and foundational data processing technologies.
      Preferred Qualifications
      • Experience using Java, JavaScript, or similar technologies.
    `
    const amexSummary = summarizePosting(amex)
    expect(amexSummary).toMatch(/AI\/ML models|data collection/i)
    expect(amexSummary).not.toMatch(/python/i)
    expect(amexSummary).not.toMatch(/10-week/i)
    expect(amexSummary).not.toMatch(/business unit/i)
    expect(amexSummary).not.toMatch(/learn how products/i)
    expect(amexSummary).not.toMatch(/javascript/i)
    expect(extractKeywords(amex)).toMatch(/Python/)
  })
})

describe('closed apply pages', () => {
  it('treats an Ashby 200 "Jobs" shell with no og:title as missing', () => {
    const dead = '<html><head><title>Jobs</title></head><body>Job not found</body></html>'
    const live = '<html><head><title>Software Engineer Intern @ Notion</title><meta property="og:title" content="Software Engineer Intern @ Notion"></head></html>'
    expect(ashbyUnavailable('https://jobs.ashbyhq.com/replit/7e0dafe8-3eec-442e-aa76-a4d84d779fb1', dead)).toBe(true)
    expect(ashbyUnavailable('https://jobs.ashbyhq.com/notion/3fba1c39-c5cb-47d7-9ad2-1cec4d7e9d0c', live)).toBe(false)
    expect(ashbyJobListed('7e0dafe8-3eec-442e-aa76-a4d84d779fb1', [{ id: 'other' }])).toBe(false)
    expect(ashbyJobListed('7e0dafe8-3eec-442e-aa76-a4d84d779fb1', [{ id: '7e0dafe8-3eec-442e-aa76-a4d84d779fb1' }])).toBe(true)
  })

  it('flags ADP recruitment links missing cid (SPA error shell)', () => {
    const broken = adpRecruitmentRef(
      'https://workforcenow.adp.com/mascsr/default/mdf/recruitment/recruitment.html?jobId=565843',
    )
    const complete = adpRecruitmentRef(
      'https://workforcenow.adp.com/mascsr/default/mdf/recruitment/recruitment.html?cid=abc&ccId=19000101_000001&jobId=565843',
    )
    expect(broken).toEqual({ jobId: '565843', cid: '', ccId: '' })
    expect(complete).toEqual({ jobId: '565843', cid: 'abc', ccId: '19000101_000001' })
  })

  it('keeps a specific posting URL and drops a career-board homepage', () => {
    expect(isSpecificPostingUrl('https://jobs.ashbyhq.com/replit/7e0dafe8-3eec-442e-aa76-a4d84d779fb1')).toBe(true)
    expect(isSpecificPostingUrl('https://jobs.ashbyhq.com/replit')).toBe(false)
    expect(isSpecificPostingUrl('https://jobright.ai/jobs/info/abc')).toBe(false)
    expect(isSpecificPostingUrl('https://apply.careers.microsoft.com/careers?query=intern')).toBe(false)
    expect(isSpecificPostingUrl('https://careers-sig.icims.com/jobs/10837/job')).toBe(true)
    expect(isSpecificPostingUrl('https://jobs.bytedance.com/en/position/7537163899668531474/detail')).toBe(true)
    expect(isSpecificPostingUrl('https://apply.workable.com/quadric-dot-i-o-inc/j/AAE0675990/apply')).toBe(true)
    expect(isSpecificPostingUrl('https://careers.point72.com/CSJobDetail?jobCode=CPA-0014081')).toBe(true)
    expect(isSpecificPostingUrl('https://www.amazon.jobs/en/jobs/10503471/software-development-engineer-intern')).toBe(true)
    expect(isSpecificPostingUrl('https://www.amazon.jobs/en/search?base_query=intern')).toBe(false)
    expect(isSpecificPostingUrl('https://www.google.com/about/careers/applications/jobs/results/85564713261245126-software-engineering-intern-bs-summer-2027')).toBe(true)
    expect(isSpecificPostingUrl('https://www.metacareers.com/jobs/1027438186737957')).toBe(true)
    expect(isSpecificPostingUrl('https://www.metacareers.com/careerprograms/students')).toBe(false)
    expect(internshipBoardForCompany('Replit', 'https://jobs.ashbyhq.com/replit/7e0dafe8-3eec-442e-aa76-a4d84d779fb1')).toBe('https://jobs.ashbyhq.com/replit')
    expect(internshipBoardForCompany('Johnson & Johnson', '')).toBe('https://jj.wd5.myworkdayjobs.com/en-US/JJ?q=intern')
    expect(internshipBoardForCompany('Ford', '')).toBe('https://www.careers.ford.com/search-jobs/intern')
    expect(internshipBoardForCompany('General Motors', '')).toBe('https://generalmotors.wd5.myworkdayjobs.com/Careers_GM?q=intern')
    expect(internshipBoardForCompany('UN Volunteers', '')).toBe('https://app.unv.org/explore/assignments')
    expect(internshipBoardForCompany('PwC', '')).toBe('https://jobs-us.pwc.com/us/en/search-results?keywords=intern')
    expect(internshipBoardForCompany('Shell', '')).toBe('https://shell.wd3.myworkdayjobs.com/ShellCareers?q=intern')
    expect(internshipBoardForCompany('ExxonMobil', '')).toBe('https://jobs.exxonmobil.com/search/?q=intern')
    expect(internshipBoardForCompany('Two Sigma', '')).toBe('https://careers.twosigma.com/')
    expect(isSpecificPostingUrl('https://www.careers.ford.com/job/dearborn/software-engineering-intern/48560/97059791888')).toBe(true)
    expect(isSpecificPostingUrl('https://www.careers.ford.com/search-jobs/intern')).toBe(false)
    expect(isSpecificPostingUrl('https://careers.rivian.com/careers-home/jobs/33385')).toBe(true)
    expect(isSpecificPostingUrl('https://careers.un.org/jobSearchDescription/282585')).toBe(true)
    expect(isSpecificPostingUrl('https://careers.un.org/jobsearch')).toBe(false)
    const boards = companyInternshipBoards([])
    expect(boards.find((row) => row.company === 'Ford')?.boardUrl).toBe('https://www.careers.ford.com/search-jobs/intern')
    expect(boards.find((row) => row.company === 'Johnson & Johnson')?.count).toBe(0)
  })
})

describe('search over posting specifics', () => {
  it('finds Java or Chinese from keywords even when the title is generic', () => {
    const rows = [
      listing({ id: 'java', role: 'Software Engineer Intern', keywords: 'Java, SQL' }),
      listing({ id: 'cn', role: 'Policy Intern', keywords: 'Chinese, Mandarin' }),
      listing({ id: 'plain', role: 'Software Engineer Intern' }),
    ]
    expect(filterListings(rows, { query: 'java' }).map((item) => item.id)).toEqual(['java'])
    expect(filterListings(rows, { query: 'chinese' }).map((item) => item.id)).toEqual(['cn'])
  })

  it('does not treat JavaScript as Java', () => {
    const rows = [
      listing({ id: 'js', role: 'Software Engineer Intern', keywords: 'JavaScript, TypeScript' }),
      listing({ id: 'java', role: 'Backend Intern', keywords: 'Java, SQL' }),
    ]
    expect(filterListings(rows, { query: 'java' }).map((item) => item.id)).toEqual(['java'])
  })

  it('still finds a posting when the query is a little off', () => {
    const rows = [
      listing({ id: 'py', role: 'Backend Intern', keywords: 'Python, SQL' }),
      listing({ id: 'ms', company: 'Microsoft', role: 'Product Intern' }),
      listing({ id: 'eng', role: 'Software Engineering Intern' }),
      listing({ id: 'amz', company: 'Amazon', role: 'SDE Intern' }),
    ]
    expect(filterListings(rows, { query: 'pyhton' }).map((item) => item.id)).toEqual(['py'])
    expect(filterListings(rows, { query: 'microsft' }).map((item) => item.id)).toEqual(['ms'])
    expect(filterListings(rows, { query: 'engineer' }).map((item) => item.id)).toEqual(['eng'])
    expect(filterListings(rows, { query: 'ama' }).map((item) => item.id)).toEqual(['amz'])
    expect(filterListings(rows, { query: 'amazo' }).map((item) => item.id)).toEqual(['amz'])
  })

  it('locks onto a known company name instead of fuzzy near-misses', () => {
    const rows = [
      listing({ id: 'notion', company: 'Notion', role: 'Software Engineer Intern' }),
      listing({ id: 'motion', company: 'DiDi Global', role: 'Motion Planning Engineer Intern' }),
      listing({ id: 'uber', company: 'Uber', role: 'Software Engineer Intern' }),
      listing({ id: 'user', company: 'Snap', role: 'User Experience Intern' }),
      listing({ id: 'slack', company: 'Slack', role: 'Software Engineer Intern' }),
      listing({ id: 'stack', company: 'Nash', role: 'Full Stack Engineering Intern' }),
      listing({ id: 'spacex', company: 'SpaceX', role: 'Avionics Intern' }),
      listing({ id: 'space', company: 'Stoke Space', role: 'Software Engineer Intern' }),
      listing({ id: 'meta', company: 'Meta', role: 'Software Engineer Intern' }),
      listing({ id: 'mesa', company: 'Boeing', role: 'Data Analytics Intern', location: 'Mesa, AZ' }),
    ]
    expect(filterListings(rows, { query: 'notion' }).map((item) => item.id)).toEqual(['notion'])
    expect(filterListings(rows, { query: 'uber' }).map((item) => item.id)).toEqual(['uber'])
    expect(filterListings(rows, { query: 'slack' }).map((item) => item.id)).toEqual(['slack'])
    expect(filterListings(rows, { query: 'spacex' }).map((item) => item.id)).toEqual(['spacex'])
    expect(filterListings(rows, { query: 'meta' }).map((item) => item.id)).toEqual(['meta'])
  })

  it('stays explorible for prefixes and skills without a company lock', () => {
    const rows = [
      listing({ id: 'amz', company: 'Amazon', role: 'SDE Intern' }),
      listing({ id: 'ms', company: 'Microsoft', role: 'Product Intern' }),
      listing({ id: 'py', role: 'Backend Intern', keywords: 'Python, SQL' }),
      listing({ id: 'js', role: 'Software Engineer Intern', keywords: 'JavaScript' }),
    ]
    expect(filterListings(rows, { query: 'ama' }).map((item) => item.id)).toEqual(['amz'])
    expect(filterListings(rows, { query: 'amazo' }).map((item) => item.id)).toEqual(['amz'])
    expect(filterListings(rows, { query: 'micro' }).map((item) => item.id)).toEqual(['ms'])
    expect(filterListings(rows, { query: 'python' }).map((item) => item.id)).toEqual(['py'])
    expect(filterListings(rows, { query: 'java' }).map((item) => item.id)).toEqual([])
  })

  it('returns no junk rows for a known brand with no listings', () => {
    const rows = [
      listing({ id: 'metals', company: 'Micron', role: 'Process Engineer, Metals' }),
      listing({ id: 'stack', company: 'Nash', role: 'Full Stack Engineering Intern' }),
    ]
    expect(filterListings(rows, { query: 'meta' }).map((item) => item.id)).toEqual([])
    expect(filterListings(rows, { query: 'slack' }).map((item) => item.id)).toEqual([])
  })

  it('matches Ph.D. titles when searching phd', () => {
    const rows = [
      listing({ id: 'dot', role: 'Ph.D. Research Intern' }),
      listing({ id: 'plain', role: 'Research Intern' }),
    ]
    expect(filterListings(rows, { query: 'phd' }).map((item) => item.id)).toEqual(['dot'])
  })

  it('does not treat near-miss words as the company name', () => {
    expect(queryMatches('Motion Planning', 'notion')).toBe(false)
    expect(queryMatches('options trading', 'notion')).toBe(false)
    expect(queryMatches('user experience', 'uber')).toBe(false)
    expect(queryMatches('full stack', 'slack')).toBe(false)
    expect(queryMatches('space systems', 'spacex')).toBe(false)
  })

  it('matches short company and city prefixes in search', () => {
    expect(queryMatches('Amazon', 'ama')).toBe(true)
    expect(queryMatches('Amazon.com Services LLC', 'ama')).toBe(true)
    expect(queryMatches('Seattle, WA', 'seatt')).toBe(true)
    expect(queryMatches('Boeing', 'boe')).toBe(true)
    // "meta" must not prefix into unrelated stems in body copy.
    expect(queryMatches('metallurgy requirements', 'meta')).toBe(false)
    expect(queryMatches('Mesa, AZ', 'meta')).toBe(false)
  })
})

describe('sheet deadline', () => {
  it('uses a scraped deadline and does not invent one', () => {
    const known = listing({ deadline: '2026-10-03' })
    const unknown = listing()
    expect(isoDeadline('') || isoDeadline(known.deadline)).toBe('2026-10-03')
    expect(isoDeadline('') || isoDeadline(unknown.deadline)).toBe('')
  })
})

describe('saved location pick', () => {
  it('parses cities so the folder sheet can offer a city picker', () => {
    const places = parsePlaces('31 locations Everett, WA Saint Charles, MO Huntsville, AL Charleston, SC')
    expect(places.compact).toBe(true)
    expect(places.label).toBe('31 locations')
    expect(places.places).toContain('Everett, WA')
    expect(places.places).toContain('Huntsville, AL')
  })
})
