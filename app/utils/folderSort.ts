import { isoDeadline } from '../data/listings'
import { STATUSES, type Status } from './saved'

export const SHEET_SORT_KEYS = [
  'status',
  'company',
  'role',
  'location',
  'appliedOn',
  'followUp',
  'deadline',
] as const

export type SheetSortKey = typeof SHEET_SORT_KEYS[number]
export type SheetSortDir = 'asc' | 'desc'

export type SheetSortable = {
  id: string
  company: string
  role: string
  location: string
  status: Status
  appliedOn: string
  followUp: string
  deadline: string
}

export const SHEET_SORT_LABEL: Record<SheetSortKey, string> = {
  status: 'Status',
  company: 'Company',
  role: 'Role',
  location: 'Location',
  appliedOn: 'Applied',
  followUp: 'Follow-up',
  deadline: 'Deadline',
}

function compareText(a: string, b: string) {
  return a.localeCompare(b, undefined, { sensitivity: 'base', numeric: true })
}

/** Prefer the city (“Austin” from “Austin, TX”); fall back to the whole string. */
export function citySortKey(location: string) {
  const raw = String(location || '').replace(/\s+/g, ' ').trim()
  if (!raw) {
    return ''
  }
  const comma = raw.indexOf(',')
  if (comma > 0) {
    return raw.slice(0, comma).trim()
  }
  return raw
}

function compareDate(a: string, b: string, dir: SheetSortDir) {
  const left = isoDeadline(a)
  const right = isoDeadline(b)
  if (!left && !right) {
    return 0
  }
  if (!left) {
    return 1
  }
  if (!right) {
    return -1
  }
  const result = left.localeCompare(right)
  return dir === 'asc' ? result : -result
}

function compareStatus(a: Status, b: Status) {
  return STATUSES.indexOf(a) - STATUSES.indexOf(b)
}

export function compareSheetRows(
  a: SheetSortable,
  b: SheetSortable,
  key: SheetSortKey,
  dir: SheetSortDir,
) {
  const sign = dir === 'asc' ? 1 : -1
  let result = 0
  if (key === 'status') {
    result = compareStatus(a.status, b.status) * sign
  }
  else if (key === 'company') {
    result = compareText(a.company, b.company) * sign
  }
  else if (key === 'role') {
    result = compareText(a.role, b.role) * sign
  }
  else if (key === 'location') {
    const left = citySortKey(a.location)
    const right = citySortKey(b.location)
    if (!left && !right) {
      result = 0
    }
    else if (!left) {
      result = 1
    }
    else if (!right) {
      result = -1
    }
    else {
      result = compareText(left, right) * sign
      if (result === 0) {
        result = compareText(a.location.trim(), b.location.trim()) * sign
      }
    }
  }
  else if (key === 'appliedOn') {
    result = compareDate(a.appliedOn, b.appliedOn, dir)
  }
  else if (key === 'followUp') {
    result = compareDate(a.followUp, b.followUp, dir)
  }
  else {
    result = compareDate(a.deadline, b.deadline, dir)
  }
  if (result !== 0) {
    return result
  }
  return compareText(a.company, b.company) || compareText(a.role, b.role) || a.id.localeCompare(b.id)
}

export function sortSheetRows<T extends SheetSortable>(
  rows: T[],
  key: SheetSortKey | null,
  dir: SheetSortDir,
) {
  if (!key) {
    return rows
  }
  return [...rows].sort((a, b) => compareSheetRows(a, b, key, dir))
}

export function nextSheetSort(
  currentKey: SheetSortKey | null,
  currentDir: SheetSortDir,
  nextKey: SheetSortKey,
): { key: SheetSortKey | null, dir: SheetSortDir } {
  if (currentKey !== nextKey) {
    return { key: nextKey, dir: 'asc' }
  }
  if (currentDir === 'asc') {
    return { key: nextKey, dir: 'desc' }
  }
  return { key: null, dir: 'asc' }
}
