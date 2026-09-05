import { companyInternshipBoards as fromApplyUrls } from '../../scripts/apply-url.mjs'
import type { Internship } from './listings'

export type CompanyBoard = {
  company: string
  boardUrl: string
  count: number
}

export function companyInternshipBoards(listings: Internship[]): CompanyBoard[] {
  return fromApplyUrls(listings)
}
