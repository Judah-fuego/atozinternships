<script setup lang="ts">
import { ALL_FOLDER_ID } from '~/utils/saved'

const props = defineProps<{
  activeId?: string
}>()

const router = useRouter()
const saved = useSaved()
const tabs = useFolderTabs()

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

function closeTab(id: string) {
  tabs.close(id)
  const href = tabs.nextHref(id, props.activeId)
  if (href) {
    void router.push(href)
  }
}
</script>

<template>
  <nav
    v-if="items.length"
    class="folder-tabs"
    aria-label="Open folders"
  >
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
  </nav>
</template>
