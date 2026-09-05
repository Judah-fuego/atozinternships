import { ALL_FOLDER_ID } from '~/utils/saved'

const TABS_KEY = 'internships.folder-tabs.v1'

function readIds(): string[] {
  if (typeof window === 'undefined') {
    return []
  }
  try {
    const raw = sessionStorage.getItem(TABS_KEY)
    if (!raw) {
      return []
    }
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) {
      return []
    }
    return parsed.filter((id): id is string => typeof id === 'string' && Boolean(id))
  }
  catch {
    return []
  }
}

function writeIds(ids: string[]) {
  if (typeof window === 'undefined') {
    return
  }
  try {
    sessionStorage.setItem(TABS_KEY, JSON.stringify(ids))
  }
  catch {
    // quota / private mode
  }
}

export function useFolderTabs() {
  const openIds = useState<string[]>('folder-open-tabs', () => [])
  const ready = useState('folder-open-tabs-ready', () => false)

  function hydrate() {
    if (ready.value || !import.meta.client) {
      return
    }
    openIds.value = readIds()
    ready.value = true
  }

  function persist() {
    if (!import.meta.client) {
      return
    }
    writeIds(openIds.value)
  }

  function open(id: string) {
    hydrate()
    if (!id || openIds.value.includes(id)) {
      return
    }
    openIds.value = [...openIds.value, id]
    persist()
  }

  function close(id: string) {
    hydrate()
    openIds.value = openIds.value.filter((entry) => entry !== id)
    persist()
    return openIds.value
  }

  function prune(validIds: Set<string>) {
    hydrate()
    const next = openIds.value.filter((id) => validIds.has(id))
    if (next.length !== openIds.value.length) {
      openIds.value = next
      persist()
    }
  }

  function hrefFor(id: string) {
    return `/folders/${id}`
  }

  function nextHref(closedId: string, currentId?: string) {
    if (currentId && closedId !== currentId) {
      return null
    }
    const last = openIds.value[openIds.value.length - 1]
    return last ? hrefFor(last) : '/folders'
  }

  function validIds() {
    const saved = useSaved()
    return new Set([ALL_FOLDER_ID, ...saved.store.value.folders.map((folder) => folder.id)])
  }

  if (import.meta.client) {
    hydrate()
  }

  return {
    openIds,
    hydrate,
    open,
    close,
    prune,
    hrefFor,
    nextHref,
    validIds,
  }
}
