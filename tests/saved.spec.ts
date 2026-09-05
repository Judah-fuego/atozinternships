import { describe, expect, it } from 'vitest'
import {
  ALL_FOLDER_ID,
  addManyToFolder,
  createFolder,
  emptyStore,
  idsForFolder,
  mergeFolders,
  removeFromFolder,
  saveMany,
} from '../app/utils/saved'

describe('saveMany', () => {
  it('saves new ids and skips ones already saved', () => {
    const first = saveMany(emptyStore(), ['a', 'b'])
    const next = saveMany(first, ['b', 'c'])
    expect(Object.keys(next.items).sort()).toEqual(['a', 'b', 'c'])
  })
})

describe('addManyToFolder', () => {
  it('creates items and attaches them to one folder', () => {
    const withFolder = createFolder(emptyStore(), 'SWE')
    const folderId = withFolder.folders[0]?.id
    expect(folderId).toBeTruthy()
    const next = addManyToFolder(withFolder, ['x', 'y', 'x'], folderId!)
    expect(idsForFolder(next, folderId!)).toEqual(['x', 'y'])
    expect(next.items.x?.folderIds).toEqual([folderId])
  })

  it('does nothing for an unknown folder', () => {
    const store = saveMany(emptyStore(), ['x'])
    expect(addManyToFolder(store, ['x'], 'missing')).toBe(store)
  })
})

describe('removeFromFolder', () => {
  it('keeps the item saved but drops that folder', () => {
    const withFolder = createFolder(emptyStore(), 'SWE')
    const folderId = withFolder.folders[0]!.id
    const placed = addManyToFolder(withFolder, ['x'], folderId)
    const next = removeFromFolder(placed, 'x', folderId)
    expect(next.items.x).toBeTruthy()
    expect(next.items.x?.folderIds).toEqual([])
  })
})

describe('mergeFolders', () => {
  function twoFolders() {
    const first = createFolder(emptyStore(), 'A')
    const second = createFolder(first, 'B')
    return {
      store: second,
      sourceId: second.folders[0]!.id,
      targetId: second.folders[1]!.id,
    }
  }

  it('moves items into the target and removes the source', () => {
    const { store, sourceId, targetId } = twoFolders()
    const placed = addManyToFolder(store, ['x', 'y'], sourceId)
    const next = mergeFolders(placed, sourceId, targetId)
    expect(next.folders.map((folder) => folder.name)).toEqual(['B'])
    expect(idsForFolder(next, targetId)).toEqual(['x', 'y'])
    expect(next.items.x?.folderIds).toEqual([targetId])
  })

  it('keeps items already in the target without duplicating', () => {
    const { store, sourceId, targetId } = twoFolders()
    const inBoth = addManyToFolder(addManyToFolder(store, ['x'], sourceId), ['x', 'z'], targetId)
    const next = mergeFolders(inBoth, sourceId, targetId)
    expect(idsForFolder(next, targetId).sort()).toEqual(['x', 'z'])
    expect(next.items.x?.folderIds).toEqual([targetId])
  })

  it('does not merge into All saved', () => {
    const { store, sourceId } = twoFolders()
    const placed = addManyToFolder(store, ['x'], sourceId)
    expect(mergeFolders(placed, sourceId, ALL_FOLDER_ID)).toBe(placed)
  })

  it('does nothing for All saved or a folder merged with itself', () => {
    const { store, sourceId, targetId } = twoFolders()
    expect(mergeFolders(store, ALL_FOLDER_ID, targetId)).toBe(store)
    expect(mergeFolders(store, sourceId, sourceId)).toBe(store)
  })
})
