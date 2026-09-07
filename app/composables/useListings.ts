import { hydratePostedAt, type Internship } from '~/data/listings'

type Snapshot = {
  scrapedAt?: string
  sources?: string[]
  note?: string
  listings?: Internship[]
}

const listings = shallowRef<Internship[]>([])
const scrapedAt = ref('')
const note = ref('')
let loadPromise: Promise<Internship[]> | null = null
let summariesPromise: Promise<void> | null = null

function mergeSummaries(rows: Internship[], map: Record<string, string>) {
  let changed = false
  const next = rows.map((item) => {
    const summary = map[item.id]
    if (!summary || item.summary === summary) {
      return item
    }
    changed = true
    return { ...item, summary }
  })
  return changed ? next : rows
}

function loadSummaries() {
  if (summariesPromise) {
    return summariesPromise
  }
  summariesPromise = import('~/data/listing-summaries.json')
    .then((module) => {
      const map = (module.default || module) as Record<string, string>
      listings.value = mergeSummaries(listings.value, map)
    })
    .catch(() => {
      summariesPromise = null
    })
  return summariesPromise
}

export function useListings() {
  async function load() {
    if (listings.value.length) {
      void loadSummaries()
      return listings.value
    }
    if (!loadPromise) {
      loadPromise = import('~/data/listings.json').then((module) => {
        const raw = module.default as Snapshot
        listings.value = hydratePostedAt(Array.isArray(raw.listings) ? raw.listings : [], raw.scrapedAt)
        scrapedAt.value = (raw.scrapedAt ?? '').slice(0, 10)
        note.value = raw.note ?? ''
        void loadSummaries()
        return listings.value
      }).catch((error) => {
        loadPromise = null
        throw error
      })
    }
    return loadPromise
  }

  return { listings, scrapedAt, note, load }
}
