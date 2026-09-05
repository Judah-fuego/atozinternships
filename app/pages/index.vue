<script setup lang="ts">
import { filterListings, sidebarFilterCount, type Filters } from '~/data/listings'
import type { FolderPick } from '~/composables/useSaved'

const PAGE = 40
const route = useRoute()
const router = useRouter()
const { listings, scrapedAt, load } = useListings()
const saved = useSaved()
const store = saved.store
const initialQuery = typeof route.query.q === 'string' ? route.query.q : ''
const filters = ref<Filters>({
  who: 'all',
  season: 'all',
  status: 'open',
  ...(initialQuery ? { query: initialQuery } : {}),
})
const visible = ref(PAGE)
const filtersOpen = ref(false)
const selecting = ref(false)
const selected = ref<string[]>([])
const selectAnchorId = ref<string | null>(null)
let queryWrite: ReturnType<typeof setTimeout> | undefined

useSiteSeo({
  title: 'Internship finder — search open internships',
  description: 'Free internship finder for college students. Search open internships by company, role, and city, then apply on the company page. No account.',
  path: '/',
})

onMounted(() => {
  void load()
  saved.hydrate()
})

const rows = computed(() => filterListings(listings.value, filters.value))
const filterCount = computed(() => sidebarFilterCount(filters.value))
const shown = computed(() => rows.value.slice(0, visible.value))
const openCount = computed(() => listings.value.filter((item) => !item.closed).length)
const selectedSet = computed(() => new Set(selected.value))
const selectedCount = computed(() => selected.value.length)

watch(filters, () => {
  visible.value = PAGE
}, { deep: true })

watch(filtersOpen, (open) => {
  if (!import.meta.client) {
    return
  }
  document.body.style.overflow = open ? 'hidden' : ''
})

watch(() => filters.value.query, (query) => {
  if (!import.meta.client || route.path !== '/') {
    return
  }
  clearTimeout(queryWrite)
  queryWrite = setTimeout(() => {
    if (route.path !== '/') {
      return
    }
    const q = query?.trim() ?? ''
    const current = typeof route.query.q === 'string' ? route.query.q : ''
    if (q === current) {
      return
    }
    const next = { ...route.query }
    if (q) {
      next.q = q
    }
    else {
      delete next.q
    }
    void router.replace({ query: next })
  }, 350)
})

watch(() => route.query.q, (value) => {
  const q = typeof value === 'string' ? value : ''
  if ((filters.value.query ?? '') === q) {
    return
  }
  filters.value = { ...filters.value, query: q }
})

onBeforeUnmount(() => {
  clearTimeout(queryWrite)
  if (import.meta.client) {
    document.body.style.overflow = ''
  }
})

function onSave(listingId: string, payload: FolderPick) {
  saved.place([listingId], payload)
}

function onBulkSave(payload: FolderPick) {
  if (!selected.value.length) {
    return
  }
  saved.place(selected.value, payload)
  selected.value = []
  selecting.value = false
}

function toggleSelect(id: string, event?: MouseEvent) {
  if (!selecting.value) {
    selecting.value = true
  }

  const ids = shown.value.map((item) => item.id)
  const index = ids.indexOf(id)

  if (event?.shiftKey) {
    event.preventDefault()
    const anchorIndex = selectAnchorId.value
      ? ids.indexOf(selectAnchorId.value)
      : 0
    const from = anchorIndex === -1 ? 0 : anchorIndex
    const to = index === -1 ? from : index
    const start = Math.min(from, to)
    const end = Math.max(from, to)
    const next = new Set(selected.value)
    for (const rangeId of ids.slice(start, end + 1)) {
      next.add(rangeId)
    }
    selected.value = [...next]
    return
  }

  selectAnchorId.value = id
  selected.value = selectedSet.value.has(id)
    ? selected.value.filter((value) => value !== id)
    : [...selected.value, id]
}

function toggleSelecting() {
  selecting.value = !selecting.value
  if (!selecting.value) {
    selected.value = []
    selectAnchorId.value = null
  }
}
</script>

<template>
  <div class="browse">
    <h1 class="sr-only">
      Internship search
    </h1>
    <FilterToolbar
      v-model="filters"
      :open="filtersOpen"
      @close="filtersOpen = false"
    />
    <div class="browse-main">
      <div class="browse-top">
        <button
          class="filter-launch"
          type="button"
          @click="filtersOpen = true"
        >
          Filters
          <span
            v-if="filterCount"
            class="filter-launch-count"
          >{{ filterCount }}</span>
        </button>
        <div class="browse-search">
          <input
            class="search"
            type="text"
            placeholder="Company, role, Java, Python…"
            :value="filters.query ?? ''"
            @input="filters = { ...filters, query: ($event.target as HTMLInputElement).value }"
          >
          <div class="count">
            <template v-if="selecting">
              {{ selectedCount }} selected
              <template v-if="selectedCount">
                ·
                <FolderPicker
                  class="bulk-picker"
                  :folders="store.folders"
                  title="Add selected to a folder"
                  all-label="All saved"
                  create-placeholder="New folder"
                  @pick="onBulkSave"
                >
                  <template #default="{ open, toggle }">
                    <button
                      class="text-btn"
                      type="button"
                      :aria-expanded="open"
                      aria-haspopup="dialog"
                      @click.stop="toggle"
                    >
                      Add to folder
                    </button>
                  </template>
                </FolderPicker>
              </template>
              ·
              <button
                class="text-btn"
                type="button"
                @click="toggleSelecting"
              >
                Done
              </button>
            </template>
            <template v-else>
              {{ rows.length.toLocaleString() }} matching
              · {{ openCount.toLocaleString() }} open
              <template v-if="scrapedAt">
                · snapshot {{ scrapedAt }}
              </template>
              ·
              <button
                class="text-btn"
                type="button"
                :aria-pressed="false"
                @click="toggleSelecting"
              >
                Select
              </button>
            </template>
          </div>
        </div>
      </div>
      <div
        v-if="!listings.length"
        class="notice"
      >
        Loading listings…
      </div>
      <div
        v-else
        class="list"
      >
        <div class="list-head">
          <span />
          <span>Company</span>
          <span>Role</span>
          <span>Location</span>
          <span>Posted</span>
          <span class="list-head-end">Apply</span>
          <span />
        </div>
        <ListingRow
          v-for="item in shown"
          :key="item.id"
          :item="item"
          :saved="saved.saved(item.id)"
          :selected="selectedSet.has(item.id)"
          :selecting="selecting"
          :folders="store.folders"
          :folder-ids="store.items[item.id]?.folderIds ?? []"
          @toggle-select="toggleSelect(item.id, $event)"
          @save="onSave(item.id, $event)"
          @unsave="saved.unsave(item.id)"
        />
      </div>
      <button
        v-if="shown.length < rows.length"
        class="more"
        type="button"
        @click="visible += PAGE"
      >
        Show more ({{ (rows.length - shown.length).toLocaleString() }} left)
      </button>
      <p class="browse-foot">
        Free internship finder for college students.
        <NuxtLink to="/guide">How to find internships</NuxtLink>
        ·
        <NuxtLink to="/sources">Internship websites</NuxtLink>
      </p>
    </div>
  </div>
</template>
