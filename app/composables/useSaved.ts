import {
  addManyToFolder,
  addToFolder,
  createFolder,
  deleteFolder,
  emptyStore,
  idsForFolder,
  isSaved,
  mergeFolders,
  readStore,
  removeFromFolder,
  removeItem,
  renameFolder,
  saveMany,
  toggleSaved,
  updateItem,
  type SavedItem,
  type SavedStore,
} from '~/utils/saved'

export type FolderPick = { folderId?: string, newFolder?: string }

export function useSaved() {
  const store = useState<SavedStore>('saved-store', () => emptyStore())
  const ready = useState('saved-ready', () => false)

  function hydrate() {
    if (ready.value || !import.meta.client) {
      return
    }
    store.value = readStore()
    ready.value = true
  }

  if (import.meta.client) {
    hydrate()
  }

  function saved(id: string) {
    return isSaved(store.value, id)
  }

  function folderIds(folderId: string) {
    return idsForFolder(store.value, folderId)
  }

  function toggle(id: string) {
    store.value = toggleSaved(store.value, id)
  }

  function patch(id: string, next: Partial<SavedItem>) {
    store.value = updateItem(store.value, id, next)
  }

  function addFolder(name: string) {
    const next = createFolder(store.value, name)
    const created = next.folders.find((folder) => !store.value.folders.some((existing) => existing.id === folder.id))
    store.value = next
    return created ?? null
  }

  function rename(folderId: string, name: string) {
    store.value = renameFolder(store.value, folderId, name)
  }

  function removeFolder(folderId: string) {
    store.value = deleteFolder(store.value, folderId)
  }

  function merge(sourceId: string, targetId: string) {
    store.value = mergeFolders(store.value, sourceId, targetId)
  }

  function putInFolder(id: string, folderId: string) {
    store.value = addToFolder(store.value, id, folderId)
  }

  function putManyInFolder(ids: string[], folderId: string) {
    store.value = addManyToFolder(store.value, ids, folderId)
  }

  function saveIds(ids: string[]) {
    store.value = saveMany(store.value, ids)
  }

  function place(ids: string[], payload: FolderPick) {
    let folderId = payload.folderId
    if (payload.newFolder) {
      folderId = addFolder(payload.newFolder)?.id
    }
    if (folderId) {
      putManyInFolder(ids, folderId)
      return
    }
    saveIds(ids)
  }

  function takeOut(id: string, folderId: string) {
    store.value = removeFromFolder(store.value, id, folderId)
  }

  function unsave(id: string) {
    store.value = removeItem(store.value, id)
  }

  return {
    store,
    ready,
    hydrate,
    saved,
    folderIds,
    toggle,
    patch,
    addFolder,
    rename,
    removeFolder,
    merge,
    putInFolder,
    putManyInFolder,
    saveIds,
    place,
    takeOut,
    unsave,
  }
}
