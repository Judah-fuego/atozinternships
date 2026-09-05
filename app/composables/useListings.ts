import type { Internship } from '~/data/listings'

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

export function useListings() {
  async function load() {
    if (listings.value.length) {
      return listings.value
    }
    if (!loadPromise) {
      loadPromise = import('~/data/listings.json').then((module) => {
        const raw = module.default as Snapshot
        listings.value = Array.isArray(raw.listings) ? raw.listings : []
        scrapedAt.value = raw.scrapedAt ?? ''
        note.value = raw.note ?? ''
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
