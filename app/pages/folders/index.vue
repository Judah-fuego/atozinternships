<script setup lang="ts">
import { ALL_FOLDER_ID, idsForFolder } from '~/utils/saved'

const saved = useSaved()
const store = saved.store
const tabs = useFolderTabs()
const { listings, load } = useListings()
const name = ref('')
const making = ref(false)
const openMenuId = ref<string | null>(null)
const menuMode = ref<'actions' | 'rename' | 'merge'>('actions')
const nextName = ref('')
const renameField = ref<HTMLInputElement | null>(null)
const pending = ref<{
  title: string
  body: string
  confirmLabel: string
  danger?: boolean
  run: () => void
} | null>(null)

function bindRenameField(el: Element | null) {
  renameField.value = el as HTMLInputElement | null
}

onMounted(() => {
  saved.hydrate()
  void load()
  document.addEventListener('mousedown', onDocumentClick)
  document.addEventListener('keydown', onKey)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onDocumentClick)
  document.removeEventListener('keydown', onKey)
})

const allCount = computed(() => idsForFolder(store.value, ALL_FOLDER_ID).length)

const byId = computed(() => {
  const map = new Map(listings.value.map((item) => [item.id, item]))
  return map
})

function cardFor(id: string, name: string, href: string, empty: string) {
  const names: string[] = []
  for (const listingId of idsForFolder(store.value, id)) {
    const company = byId.value.get(listingId)?.company
    if (!company || names.includes(company)) {
      continue
    }
    names.push(company)
    if (names.length === 3) {
      break
    }
  }
  const count = idsForFolder(store.value, id).length
  return {
    id,
    name,
    href,
    count,
    countLabel: count === 1 ? '1 internship' : `${count} internships`,
    preview: names.length ? names.join(' · ') : empty,
    canManage: id !== ALL_FOLDER_ID,
  }
}

const cards = computed(() => [
  cardFor(ALL_FOLDER_ID, 'All saved', '/folders/all', 'Everything you save lands here.'),
  ...store.value.folders.map((folder) =>
    cardFor(folder.id, folder.name, `/folders/${folder.id}`, 'Empty — add internships from Search.'),
  ),
])

function mergeTargets(sourceId: string) {
  return store.value.folders.filter((folder) => folder.id !== sourceId)
}

function add() {
  if (!name.value.trim()) {
    return
  }
  saved.addFolder(name.value)
  name.value = ''
  making.value = false
}

const createWrap = ref<HTMLElement | null>(null)
const createField = ref<HTMLInputElement | null>(null)

function closeMenus() {
  openMenuId.value = null
  menuMode.value = 'actions'
  nextName.value = ''
}

function startCreate() {
  closeMenus()
  making.value = true
  nextTick(() => {
    createField.value?.focus()
  })
}

function cancelCreate() {
  making.value = false
  name.value = ''
}

function toggleCreate() {
  if (making.value) {
    cancelCreate()
    return
  }
  startCreate()
}

function toggleMenu(id: string) {
  if (openMenuId.value === id) {
    closeMenus()
    return
  }
  cancelCreate()
  openMenuId.value = id
  menuMode.value = 'actions'
  nextName.value = ''
}

function startRename(id: string, current: string) {
  openMenuId.value = id
  menuMode.value = 'rename'
  nextName.value = current
  nextTick(() => {
    renameField.value?.focus()
    renameField.value?.select()
  })
}

function saveName(id: string) {
  saved.rename(id, nextName.value)
  closeMenus()
}

function startMerge(id: string) {
  if (!mergeTargets(id).length) {
    return
  }
  openMenuId.value = id
  menuMode.value = 'merge'
}

function mergeInto(sourceId: string, targetId: string, sourceName: string, targetName: string) {
  closeMenus()
  pending.value = {
    title: `Merge “${sourceName}” into “${targetName}”?`,
    body: `“${sourceName}” will be removed.`,
    confirmLabel: 'Merge',
    run: () => {
      tabs.close(sourceId)
      saved.merge(sourceId, targetId)
    },
  }
}

function destroy(id: string, folderName: string) {
  closeMenus()
  pending.value = {
    title: `Delete “${folderName}”?`,
    body: 'Internships stay in All saved.',
    confirmLabel: 'Delete',
    danger: true,
    run: () => {
      tabs.close(id)
      saved.removeFolder(id)
    },
  }
}

function cancelPending() {
  pending.value = null
}

function confirmPending() {
  const next = pending.value
  pending.value = null
  next?.run()
}

function onDocumentClick(event: MouseEvent) {
  const target = event.target as Node
  if (making.value && createWrap.value && !createWrap.value.contains(target)) {
    cancelCreate()
  }
  if (!openMenuId.value) {
    return
  }
  const wrap = (event.target as HTMLElement | null)?.closest?.(`[data-folder-menu="${openMenuId.value}"]`)
  if (!wrap) {
    closeMenus()
  }
}

function onKey(event: KeyboardEvent) {
  if (event.key !== 'Escape' || pending.value) {
    return
  }
  if (making.value) {
    cancelCreate()
  }
  if (openMenuId.value) {
    closeMenus()
  }
}

</script>

<template>
  <div class="page folders-page">
    <div class="folders-head">
      <div>
        <h1>Folders</h1>
        <p class="lede">
          Lists you make while browsing. Open a few at once as tabs, or export a CSV.
        </p>
      </div>
      <div
        ref="createWrap"
        class="folders-create-wrap"
      >
        <button
          class="text-btn"
          type="button"
          :aria-expanded="making"
          aria-haspopup="dialog"
          @click="toggleCreate"
        >
          New folder
        </button>
        <form
          v-if="making"
          class="folders-create-pop"
          role="dialog"
          aria-label="Create a folder"
          @submit.prevent="add"
        >
          <input
            ref="createField"
            v-model="name"
            type="text"
            maxlength="40"
            placeholder="Folder name"
            aria-label="Folder name"
          >
          <div class="folders-create-actions">
            <button
              class="text-btn ghost-btn"
              type="button"
              @click="cancelCreate"
            >
              Cancel
            </button>
            <button
              class="text-btn create-btn"
              type="submit"
              :disabled="!name.trim()"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>

    <ClientOnly>
      <FolderTabs />
      <div class="folder-grid">
        <article
          v-for="card in cards"
          :key="card.id"
          class="folder-card"
          :class="{ 'is-menu-open': openMenuId === card.id }"
        >
          <NuxtLink
            class="folder-card-link"
            :class="{ 'has-menu': card.canManage }"
            :to="card.href"
          >
            <strong>{{ card.name }}</strong>
            <span class="folder-meta">{{ card.countLabel }}</span>
            <p class="folder-preview">
              {{ card.preview }}
            </p>
          </NuxtLink>
          <div
            v-if="card.canManage"
            class="folder-card-actions"
            :class="{ 'is-open': openMenuId === card.id }"
            :data-folder-menu="card.id"
          >
            <button
              class="icon-btn folder-card-more"
              type="button"
              :aria-expanded="openMenuId === card.id"
              aria-haspopup="menu"
              :aria-label="`Folder actions for ${card.name}`"
              @click.stop="toggleMenu(card.id)"
            >
              <svg
                viewBox="0 0 16 16"
                aria-hidden="true"
              >
                <circle
                  cx="8"
                  cy="3.5"
                  r="1.2"
                  fill="currentColor"
                />
                <circle
                  cx="8"
                  cy="8"
                  r="1.2"
                  fill="currentColor"
                />
                <circle
                  cx="8"
                  cy="12.5"
                  r="1.2"
                  fill="currentColor"
                />
              </svg>
            </button>
            <div
              v-if="openMenuId === card.id && menuMode === 'actions'"
              class="folder-card-pop"
              role="menu"
              :aria-label="`Actions for ${card.name}`"
            >
              <button
                class="apply-choice"
                type="button"
                role="menuitem"
                @click.stop="startRename(card.id, card.name)"
              >
                Rename
              </button>
              <button
                class="apply-choice"
                type="button"
                role="menuitem"
                :disabled="!mergeTargets(card.id).length"
                @click.stop="startMerge(card.id)"
              >
                Merge with another folder
              </button>
              <button
                class="apply-choice apply-remove"
                type="button"
                role="menuitem"
                @click.stop="destroy(card.id, card.name)"
              >
                Delete
              </button>
            </div>
            <form
              v-else-if="openMenuId === card.id && menuMode === 'rename'"
              class="folder-card-pop folder-card-rename"
              @submit.prevent="saveName(card.id)"
            >
              <input
                :ref="bindRenameField"
                v-model="nextName"
                type="text"
                maxlength="40"
                placeholder="Folder name"
                aria-label="Folder name"
              >
              <div class="folders-create-actions">
                <button
                  class="text-btn ghost-btn"
                  type="button"
                  @click.stop="closeMenus"
                >
                  Cancel
                </button>
                <button
                  class="text-btn create-btn"
                  type="submit"
                  :disabled="!nextName.trim()"
                >
                  Save
                </button>
              </div>
            </form>
            <div
              v-else-if="openMenuId === card.id && menuMode === 'merge'"
              class="folder-card-pop"
              role="menu"
              aria-label="Merge into another folder"
            >
              <p class="apply-pop-title">
                Merge into
              </p>
              <button
                v-for="target in mergeTargets(card.id)"
                :key="target.id"
                class="apply-choice"
                type="button"
                role="menuitem"
                @click.stop="mergeInto(card.id, target.id, card.name, target.name)"
              >
                {{ target.name }}
              </button>
            </div>
          </div>
        </article>
      </div>
      <ConfirmDialog
        v-if="pending"
        :title="pending.title"
        :body="pending.body"
        :confirm-label="pending.confirmLabel"
        :danger="pending.danger"
        @cancel="cancelPending"
        @confirm="confirmPending"
      />
      <p
        v-if="!allCount && !store.folders.length"
        class="notice"
      >
        Nothing saved yet. On Search, tap + on a row to pick a folder.
      </p>
      <template #fallback>
        <p class="notice">
          Loading folders…
        </p>
      </template>
    </ClientOnly>
  </div>
</template>
