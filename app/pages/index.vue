<script setup lang="ts">
import { currentListings, filterListings, sidebarFilterCount, sortListingsByPosted, type Filters, type PostedSort } from '~/data/listings'
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
  posted: 'all',
  status: 'open',
  ...(initialQuery ? { query: initialQuery } : {}),
})
const visible = ref(PAGE)
const postedSort = ref<PostedSort>('none')
const postedSortOpen = ref(false)
const postedSortWrap = ref<HTMLElement | null>(null)
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
  if (import.meta.client) {
    document.addEventListener('click', onPostedSortDocumentClick)
  }
})

const rows = computed(() => sortListingsByPosted(filterListings(listings.value, filters.value), postedSort.value))
const postedSortLabel = computed(() => {
  if (postedSort.value === 'newest') {
    return 'newest first'
  }
  if (postedSort.value === 'oldest') {
    return 'oldest first'
  }
  return 'default order'
})
const filterCount = computed(() => sidebarFilterCount(filters.value))
const shown = computed(() => rows.value.slice(0, visible.value))
const openCount = computed(() => currentListings(listings.value).filter((item) => !item.closed).length)
const selectedSet = computed(() => new Set(selected.value))
const selectedCount = computed(() => selected.value.length)

watch(filters, () => {
  visible.value = PAGE
}, { deep: true })

watch(postedSort, () => {
  visible.value = PAGE
})

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
    document.removeEventListener('click', onPostedSortDocumentClick)
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

function onPostedSortDocumentClick(event: MouseEvent) {
  const wrap = postedSortWrap.value
  if (wrap && !wrap.contains(event.target as Node)) {
    postedSortOpen.value = false
  }
}

function setPostedSort(sort: Exclude<PostedSort, 'none'>) {
  postedSort.value = postedSort.value === sort ? 'none' : sort
  postedSortOpen.value = false
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
          <BrowseSearch
            :model-value="filters.query ?? ''"
            placeholder="Company, role, Java, Python…"
            @update:model-value="filters = { ...filters, query: $event }"
          />
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
          <div
            ref="postedSortWrap"
            class="list-sort-wrap"
            :class="{ 'is-open': postedSortOpen, 'is-on': postedSort !== 'none' }"
          >
            <button
              class="list-sort"
              :class="{ 'is-on': postedSort !== 'none' }"
              type="button"
              :aria-expanded="postedSortOpen"
              aria-haspopup="menu"
              :aria-sort="postedSort === 'newest' ? 'descending' : postedSort === 'oldest' ? 'ascending' : 'none'"
              :aria-label="`Sort by posted date, ${postedSortLabel}`"
              @click="postedSortOpen = !postedSortOpen"
            >
              Posted
              <span
                v-if="postedSort !== 'none'"
                class="list-sort-mark"
                aria-hidden="true"
              >{{ postedSort === 'newest' ? '↓' : '↑' }}</span>
              <span
                v-else
                class="list-sort-hint"
                aria-hidden="true"
              >Sort</span>
            </button>
            <div
              class="list-sort-pop"
              role="menu"
              aria-label="Sort by posted date"
            >
              <button
                class="apply-choice"
                :class="{ 'is-on': postedSort === 'newest' }"
                type="button"
                role="menuitem"
                @click="setPostedSort('newest')"
              >
                Recent
                <span
                  v-if="postedSort === 'newest'"
                  class="apply-choice-note"
                >On</span>
              </button>
              <button
                class="apply-choice"
                :class="{ 'is-on': postedSort === 'oldest' }"
                type="button"
                role="menuitem"
                @click="setPostedSort('oldest')"
              >
                Oldest
                <span
                  v-if="postedSort === 'oldest'"
                  class="apply-choice-note"
                >On</span>
              </button>
            </div>
          </div>
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
      <div class="browse-more">
        <button
          v-if="shown.length < rows.length"
          class="more"
          type="button"
          @click="visible += PAGE"
        >
          Show more ({{ (rows.length - shown.length).toLocaleString() }} left)
        </button>
        <span
          v-if="scrapedAt"
          class="browse-snapshot"
        >snapshot {{ scrapedAt }}</span>
      </div>
      <p class="browse-foot">
        Free internship finder for college students.
        <NuxtLink to="/guide">How to find internships</NuxtLink>
        ·
        <NuxtLink to="/sources">Internship websites</NuxtLink>
      </p>
    </div>
  </div>
</template>
