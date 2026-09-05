<script setup lang="ts">
import { ALL_FOLDER_ID } from '~/utils/saved'

const props = defineProps<{
  activeId?: string
}>()

const router = useRouter()
const saved = useSaved()
const tabs = useFolderTabs()
const picking = ref(false)
const pickWrap = ref<HTMLElement | null>(null)

watch(() => saved.store.value.folders, () => {
  tabs.prune(tabs.validIds())
}, { immediate: true })

const items = computed(() => {
  const names = new Map<string, string>([
    [ALL_FOLDER_ID, 'All saved'],
    ...saved.store.value.folders.map((folder) => [folder.id, folder.name] as const),
  ])
  return tabs.openIds.value.flatMap((id) => {
    const name = names.get(id)
    return name ? [{ id, name, href: tabs.hrefFor(id) }] : []
  })
})

const closed = computed(() => {
  const open = new Set(tabs.openIds.value)
  const next = []
  if (!open.has(ALL_FOLDER_ID)) {
    next.push({ id: ALL_FOLDER_ID, name: 'All saved' })
  }
  for (const folder of saved.store.value.folders) {
    if (!open.has(folder.id)) {
      next.push({ id: folder.id, name: folder.name })
    }
  }
  return next
})

function closeTab(id: string) {
  tabs.close(id)
  const href = tabs.nextHref(id, props.activeId)
  if (href) {
    void router.push(href)
  }
}

function openFolder(id: string) {
  picking.value = false
  void router.push(tabs.hrefFor(id))
}

function onDocumentClick(event: MouseEvent) {
  if (picking.value && pickWrap.value && !pickWrap.value.contains(event.target as Node)) {
    picking.value = false
  }
}

function onKey(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    picking.value = false
  }
}

onMounted(() => {
  document.addEventListener('mousedown', onDocumentClick)
  document.addEventListener('keydown', onKey)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onDocumentClick)
  document.removeEventListener('keydown', onKey)
})
</script>

<template>
  <nav
    v-if="items.length"
    class="folder-tabs"
    aria-label="Open folders"
  >
    <div class="folder-tabs-list">
      <div
        v-for="tab in items"
        :key="tab.id"
        class="folder-tab"
        :class="{ 'is-active': tab.id === activeId }"
      >
        <NuxtLink
          class="folder-tab-link"
          :to="tab.href"
        >
          {{ tab.name }}
        </NuxtLink>
        <button
          class="folder-tab-close"
          type="button"
          :aria-label="`Close ${tab.name}`"
          @click="closeTab(tab.id)"
        >
          ×
        </button>
      </div>
    </div>
    <div
      v-if="closed.length"
      ref="pickWrap"
      class="folder-tab-add"
    >
      <button
        class="folder-tab-add-btn"
        type="button"
        :aria-expanded="picking"
        aria-haspopup="menu"
        aria-label="Open another folder"
        @click="picking = !picking"
      >
        +
      </button>
      <div
        v-if="picking"
        class="apply-pop"
        role="menu"
        aria-label="Open a folder"
      >
        <button
          v-for="folder in closed"
          :key="folder.id"
          class="apply-choice"
          type="button"
          role="menuitem"
          @click="openFolder(folder.id)"
        >
          {{ folder.name }}
        </button>
      </div>
    </div>
  </nav>
</template>
