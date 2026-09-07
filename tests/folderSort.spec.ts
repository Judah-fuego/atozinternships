import { describe, expect, it } from 'vitest'
import {
  nextSheetSort,
  sortSheetRows,
  type SheetSortable,
} from '../app/utils/folderSort'

function row(partial: Partial<SheetSortable> & Pick<SheetSortable, 'id'>): SheetSortable {
  return {
    company: 'Acme',
    role: 'Intern',
    location: 'New York, NY',
    status: 'applying',
    appliedOn: '',
    followUp: '',
    deadline: '',
    ...partial,
  }
}

describe('sortSheetRows', () => {
  it('sorts companies A–Z then Z–A', () => {
    const rows = [
      row({ id: 'b', company: 'Beta' }),
      row({ id: 'a', company: 'Alpha' }),
      row({ id: 'c', company: 'Gamma' }),
    ]
    expect(sortSheetRows(rows, 'company', 'asc').map((item) => item.id)).toEqual(['a', 'b', 'c'])
    expect(sortSheetRows(rows, 'company', 'desc').map((item) => item.id)).toEqual(['c', 'b', 'a'])
  })

  it('sorts status by pipeline order', () => {
    const rows = [
      row({ id: 'offer', status: 'offer' }),
      row({ id: 'saved', status: 'saved' }),
      row({ id: 'applied', status: 'applied' }),
    ]
    expect(sortSheetRows(rows, 'status', 'asc').map((item) => item.id)).toEqual(['saved', 'applied', 'offer'])
  })

  it('keeps blank dates at the bottom in both directions', () => {
    const rows = [
      row({ id: 'empty', deadline: '' }),
      row({ id: 'late', deadline: '2026-10-01' }),
      row({ id: 'soon', deadline: '2026-09-01' }),
    ]
    expect(sortSheetRows(rows, 'deadline', 'asc').map((item) => item.id)).toEqual(['soon', 'late', 'empty'])
    expect(sortSheetRows(rows, 'deadline', 'desc').map((item) => item.id)).toEqual(['late', 'soon', 'empty'])
  })

  it('sorts locations by city, not state', () => {
    const rows = [
      row({ id: 'ny', location: 'New York, NY' }),
      row({ id: 'blank', location: '' }),
      row({ id: 'sf', location: 'San Francisco, CA' }),
      row({ id: 'austin', location: 'Austin, TX' }),
      row({ id: 'seattle-wa', location: 'Seattle, WA' }),
      row({ id: 'seattle-full', location: 'Seattle, Washington' }),
    ]
    expect(sortSheetRows(rows, 'location', 'asc').map((item) => item.id)).toEqual([
      'austin',
      'ny',
      'sf',
      'seattle-wa',
      'seattle-full',
      'blank',
    ])
  })
})

describe('nextSheetSort', () => {
  it('cycles none → asc → desc → none', () => {
    expect(nextSheetSort(null, 'asc', 'company')).toEqual({ key: 'company', dir: 'asc' })
    expect(nextSheetSort('company', 'asc', 'company')).toEqual({ key: 'company', dir: 'desc' })
    expect(nextSheetSort('company', 'desc', 'company')).toEqual({ key: null, dir: 'asc' })
    expect(nextSheetSort('company', 'asc', 'role')).toEqual({ key: 'role', dir: 'asc' })
  })
})
