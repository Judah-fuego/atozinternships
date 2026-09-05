import { describe, expect, it } from 'vitest'
import {
  TRACK_FAMILY,
  TRACK_LABEL,
  audience,
  eligibilityLine,
  facetCounts,
  filterListings,
  formatDeadline,
  levelsFromRole,
  listingSource,
  parsePlaces,
  sidebarFilterCount,
  uniqueCompanies,
  visaLabel,
  type Internship,
} from '../app/data/listings'

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
