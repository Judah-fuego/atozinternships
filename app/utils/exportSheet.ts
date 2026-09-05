import type { Internship } from '~/data/listings'
import { eligibilityLine } from '~/data/listings'
import { STATUS_LABEL, type SavedItem } from '~/utils/saved'

export type SheetRow = {
  status: string
  company: string
  role: string
  who: string
  location: string
  applyUrl: string
  deadline: string
  appliedOn: string
  followUp: string
  notes: string
}

const HEADERS = [
  'Status',
  'Company',
  'Role',
  'Who can apply',
  'Location',
  'Apply',
  'Deadline',
  'Applied',
  'Follow-up',
  'Notes',
] as const

function escapeCsv(value: string) {
  const text = String(value ?? '')
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function buildSheetRows(
  listings: Internship[],
  items: Record<string, SavedItem>,
): SheetRow[] {
  return listings
    .slice()
    .sort((a, b) => a.company.localeCompare(b.company) || a.role.localeCompare(b.role))
    .map((listing) => {
      const saved = items[listing.id]
      return {
        status: STATUS_LABEL[saved?.status ?? 'saved'],
        company: listing.company,
        role: listing.role,
        who: eligibilityLine(listing),
        location: listing.location,
        applyUrl: listing.url,
        deadline: saved?.deadline ?? '',
        appliedOn: saved?.appliedOn ?? '',
        followUp: saved?.followUp ?? '',
        notes: saved?.notes ?? '',
      }
    })
}

function rowValues(row: SheetRow) {
  return [
    row.status,
    row.company,
    row.role,
    row.who,
    row.location,
    row.applyUrl,
    row.deadline,
    row.appliedOn,
    row.followUp,
    row.notes,
  ]
}

export function rowsToCsv(rows: SheetRow[], folderLabel: string) {
  const lines = [
    `Internships — ${folderLabel}`,
    HEADERS.join(','),
    ...rows.map((row) => rowValues(row).map(escapeCsv).join(',')),
  ]
  return `\uFEFF${lines.join('\n')}\n`
}

export function rowsToTsv(rows: SheetRow[]) {
  return [HEADERS.join('\t'), ...rows.map((row) => rowValues(row).join('\t'))].join('\n')
}

export function rowsToHtml(rows: SheetRow[], folderLabel: string) {
  const head = `<tr>${HEADERS.map((header) => `<td><b>${escapeHtml(header)}</b></td>`).join('')}</tr>`
  const body = rows.map((row) =>
    `<tr>${rowValues(row).map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`,
  ).join('')
  return `<html><body><p><b>Internships — ${escapeHtml(folderLabel)}</b></p><table>${head}${body}</table></body></html>`
}

export async function copyForSheets(rows: SheetRow[], folderLabel: string) {
  const tsv = rowsToTsv(rows)
  const html = rowsToHtml(rows, folderLabel)
  if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/plain': new Blob([tsv], { type: 'text/plain' }),
          'text/html': new Blob([html], { type: 'text/html' }),
        }),
      ])
      return
    }
    catch {
      // fall through
    }
  }
  await navigator.clipboard.writeText(tsv)
}

export function csvFilename(folderLabel: string, now = new Date()) {
  const slug = folderLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'saved'
  return `internships-${slug}-${now.toISOString().slice(0, 10)}.csv`
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const href = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = href
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(href)
}
