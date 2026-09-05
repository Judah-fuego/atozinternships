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
  listingSource,
  listingSummary,
  parsePlaces,
  postedAgeDays,
  sidebarFilterCount,
  sortListingsByPosted,
  uniqueCompanies,
  visaLabel,
  type Internship,
} from '../app/data/listings'
import { extractKeywords, isWeakSummary, parseApplyTarget, summarizePosting } from '../scripts/job-summary.mjs'
import { internshipBoardForCompany, isSpecificPostingUrl } from '../scripts/apply-url.mjs'
import { ashbyJobListed, ashbyUnavailable } from '../scripts/check-internship-links.mjs'

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

  it('counts a posted recency filter', () => {
    expect(sidebarFilterCount({ posted: '7d' })).toBe(1)
    expect(sidebarFilterCount({ posted: 'all' })).toBe(0)
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
  })
})

describe('posting text', () => {
  it('pulls Java, Python, and Chinese out of a job description', () => {
    const text = 'Required: Java and Python. Mandarin Chinese is a plus. Equal opportunity employer.'
    expect(extractKeywords(text)).toBe('Python, Java, Chinese')
    expect(summarizePosting(text)).toMatch(/Java and Python/i)
    expect(summarizePosting(text)).not.toMatch(/equal opportunity/i)
  })

  it('keeps what you will do and skills, not culture or apply-page filler', () => {
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
    expect(summary).toMatch(/python/i)
    expect(summary).not.toMatch(/our culture/i)
    expect(summary).not.toMatch(/click the link/i)
    expect(extractKeywords(text)).toBe('Python, Java')
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
    expect(vertivSummary).toMatch(/excel/i)
    expect(vertivSummary).not.toMatch(/core principles/i)

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
    expect(amexSummary).toMatch(/python/i)
    expect(amexSummary).not.toMatch(/10-week/i)
    expect(amexSummary).not.toMatch(/business unit/i)
    expect(amexSummary).not.toMatch(/learn how products/i)
    expect(amexSummary).not.toMatch(/javascript/i)
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

  it('keeps a specific posting URL and drops a career-board homepage', () => {
    expect(isSpecificPostingUrl('https://jobs.ashbyhq.com/replit/7e0dafe8-3eec-442e-aa76-a4d84d779fb1')).toBe(true)
    expect(isSpecificPostingUrl('https://jobs.ashbyhq.com/replit')).toBe(false)
    expect(isSpecificPostingUrl('https://jobright.ai/jobs/info/abc')).toBe(false)
    expect(isSpecificPostingUrl('https://apply.careers.microsoft.com/careers?query=intern')).toBe(false)
    expect(isSpecificPostingUrl('https://careers-sig.icims.com/jobs/10837/job')).toBe(true)
    expect(isSpecificPostingUrl('https://jobs.bytedance.com/en/position/7537163899668531474/detail')).toBe(true)
    expect(isSpecificPostingUrl('https://apply.workable.com/quadric-dot-i-o-inc/j/AAE0675990/apply')).toBe(true)
    expect(isSpecificPostingUrl('https://careers.point72.com/CSJobDetail?jobCode=CPA-0014081')).toBe(true)
    expect(internshipBoardForCompany('Replit', 'https://jobs.ashbyhq.com/replit/7e0dafe8-3eec-442e-aa76-a4d84d779fb1')).toBe('https://jobs.ashbyhq.com/replit')
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
    ]
    expect(filterListings(rows, { query: 'pyhton' }).map((item) => item.id)).toEqual(['py'])
    expect(filterListings(rows, { query: 'microsft' }).map((item) => item.id)).toEqual(['ms'])
    expect(filterListings(rows, { query: 'engineer' }).map((item) => item.id)).toEqual(['eng'])
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
