export const STORAGE_KEY = 'internships.saved.v1'
export const ALL_FOLDER_ID = 'all'

export const STATUSES = [
  'saved',
  'applying',
  'applied',
  'interview',
  'offer',
  'rejected',
  'withdrawn',
] as const

export type Status = typeof STATUSES[number]

export const STATUS_LABEL: Record<Status, string> = {
  saved: 'Saved',
  applying: 'Applying',
  applied: 'Applied',
  interview: 'Interview',
  offer: 'Offer',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
}

export type Folder = { id: string, name: string }

export type SavedItem = {
  folderIds: string[]
  status: Status
  /** City the student picked when the posting lists several. */
  location: string
  appliedOn: string
  followUp: string
  notes: string
  deadline: string
}

export type SavedStore = {
  version: 1
  folders: Folder[]
  items: Record<string, SavedItem>
}

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function newFolderId() {
  return `folder_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`
}

function emptyItem(): SavedItem {
  return {
    folderIds: [],
    status: 'applying',
    location: '',
    appliedOn: '',
    followUp: '',
    notes: '',
    deadline: '',
  }
}

export function emptyStore(): SavedStore {
  return { version: 1, folders: [], items: {} }
}

function sanitize(value: unknown): SavedStore {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return emptyStore()
  }
  const raw = value as Record<string, unknown>
  if (raw.version !== 1) {
    return emptyStore()
  }

  const folders: Folder[] = []
  const seen = new Set<string>()
  if (Array.isArray(raw.folders)) {
    for (const entry of raw.folders) {
      if (!entry || typeof entry !== 'object') {
        continue
      }
      const folder = entry as Record<string, unknown>
      if (typeof folder.id !== 'string' || typeof folder.name !== 'string' || !folder.id) {
        continue
      }
      const name = folder.name.trim().slice(0, 40)
      if (!name || seen.has(folder.id) || folder.id === ALL_FOLDER_ID) {
        continue
      }
      seen.add(folder.id)
      folders.push({ id: folder.id, name })
    }
  }

  const folderIds = new Set(folders.map((folder) => folder.id))
  const items: Record<string, SavedItem> = {}
  if (raw.items && typeof raw.items === 'object' && !Array.isArray(raw.items)) {
    for (const [id, entry] of Object.entries(raw.items as Record<string, unknown>)) {
      if (!id || !entry || typeof entry !== 'object') {
        continue
      }
      const item = entry as Record<string, unknown>
      const status = STATUSES.includes(item.status as Status) ? item.status as Status : 'applying'
      items[id] = {
        folderIds: Array.isArray(item.folderIds)
          ? item.folderIds.filter((folderId): folderId is string => typeof folderId === 'string' && folderIds.has(folderId))
          : [],
        status,
        location: typeof item.location === 'string' ? item.location.slice(0, 120) : '',
        appliedOn: typeof item.appliedOn === 'string' ? item.appliedOn : '',
        followUp: typeof item.followUp === 'string' ? item.followUp : '',
        notes: typeof item.notes === 'string' ? item.notes.slice(0, 4000) : '',
        deadline: typeof item.deadline === 'string' ? item.deadline : '',
      }
    }
  }

  return { version: 1, folders, items }
}

export function readStore(): SavedStore {
  if (!canUseStorage()) {
    return emptyStore()
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? sanitize(JSON.parse(raw)) : emptyStore()
  }
  catch {
    return emptyStore()
  }
}

export function writeStore(store: SavedStore) {
  if (!canUseStorage()) {
    return
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitize(store)))
  }
  catch {
    // quota / private mode
  }
}

export function isSaved(store: SavedStore, id: string) {
  return Object.prototype.hasOwnProperty.call(store.items, id)
}

export function idsForFolder(store: SavedStore, folderId: string) {
  const ids = Object.keys(store.items)
  if (folderId === ALL_FOLDER_ID) {
    return ids
  }
  return ids.filter((id) => store.items[id]?.folderIds.includes(folderId))
}

export function saveItem(store: SavedStore, id: string): SavedStore {
  if (!id.trim() || isSaved(store, id)) {
    return store
  }
  const next = {
    ...store,
    items: { ...store.items, [id]: emptyItem() },
  }
  writeStore(next)
  return next
}

export function removeItem(store: SavedStore, id: string): SavedStore {
  if (!isSaved(store, id)) {
    return store
  }
  const items = { ...store.items }
  delete items[id]
  const next = { ...store, items }
  writeStore(next)
  return next
}

export function toggleSaved(store: SavedStore, id: string): SavedStore {
  return isSaved(store, id) ? removeItem(store, id) : saveItem(store, id)
}

export function updateItem(store: SavedStore, id: string, patch: Partial<SavedItem>): SavedStore {
  const current = store.items[id] ?? emptyItem()
  const next = {
    ...store,
    items: {
      ...store.items,
      [id]: { ...current, ...patch },
    },
  }
  writeStore(next)
  return next
}

export function addToFolder(store: SavedStore, id: string, folderId: string): SavedStore {
  return addManyToFolder(store, [id], folderId)
}

export function saveMany(store: SavedStore, ids: string[]): SavedStore {
  const items = { ...store.items }
  let changed = false
  for (const id of new Set(ids)) {
    if (!id || items[id]) {
      continue
    }
    items[id] = emptyItem()
    changed = true
  }
  if (!changed) {
    return store
  }
  const next = { ...store, items }
  writeStore(next)
  return next
}

export function addManyToFolder(store: SavedStore, ids: string[], folderId: string): SavedStore {
  if (!store.folders.some((folder) => folder.id === folderId)) {
    return store
  }
  const items = { ...store.items }
  let changed = false
  for (const id of new Set(ids)) {
    if (!id) {
      continue
    }
    const current = items[id] ?? emptyItem()
    if (items[id] && current.folderIds.includes(folderId)) {
      continue
    }
    items[id] = {
      ...current,
      folderIds: current.folderIds.includes(folderId)
        ? current.folderIds
        : [...current.folderIds, folderId],
    }
    changed = true
  }
  if (!changed) {
    return store
  }
  const next = { ...store, items }
  writeStore(next)
  return next
}

export function createFolder(store: SavedStore, name: string): SavedStore {
  const trimmed = name.trim().slice(0, 40)
  if (!trimmed) {
    return store
  }
  const next = {
    ...store,
    folders: [...store.folders, { id: newFolderId(), name: trimmed }],
  }
  writeStore(next)
  return next
}

export function renameFolder(store: SavedStore, folderId: string, name: string): SavedStore {
  const trimmed = name.trim().slice(0, 40)
  if (!trimmed) {
    return store
  }
  const next = {
    ...store,
    folders: store.folders.map((folder) => folder.id === folderId ? { ...folder, name: trimmed } : folder),
  }
  writeStore(next)
  return next
}

export function removeFromFolder(store: SavedStore, id: string, folderId: string): SavedStore {
  const current = store.items[id]
  if (!current || !current.folderIds.includes(folderId)) {
    return store
  }
  const next = {
    ...store,
    items: {
      ...store.items,
      [id]: {
        ...current,
        folderIds: current.folderIds.filter((value) => value !== folderId),
      },
    },
  }
  writeStore(next)
  return next
}

export function deleteFolder(store: SavedStore, folderId: string): SavedStore {
  const items: Record<string, SavedItem> = {}
  for (const [id, item] of Object.entries(store.items)) {
    items[id] = { ...item, folderIds: item.folderIds.filter((value) => value !== folderId) }
  }
  const next = {
    ...store,
    folders: store.folders.filter((folder) => folder.id !== folderId),
    items,
  }
  writeStore(next)
  return next
}

export function mergeFolders(store: SavedStore, sourceId: string, targetId: string): SavedStore {
  if (!sourceId || !targetId || sourceId === targetId) {
    return store
  }
  if (sourceId === ALL_FOLDER_ID || targetId === ALL_FOLDER_ID) {
    return store
  }
  if (!store.folders.some((folder) => folder.id === sourceId)) {
    return store
  }
  if (!store.folders.some((folder) => folder.id === targetId)) {
    return store
  }
  return deleteFolder(addManyToFolder(store, idsForFolder(store, sourceId), targetId), sourceId)
}
