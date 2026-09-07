<script setup lang="ts">
import { isoDeadline, parsePlaces } from '~/data/listings'
import {
  SHEET_SORT_KEYS,
  SHEET_SORT_LABEL,
  nextSheetSort,
  sortSheetRows,
  type SheetSortDir,
  type SheetSortKey,
  type SheetSortable,
} from '~/utils/folderSort'
import { ALL_FOLDER_ID, type Status } from '~/utils/saved'
import type { Internship } from '~/data/listings'

const route = useRoute()

useSiteSeo({
  title: 'Folder',
  description: 'Internships you saved in this folder.',
  path: route.path,
  index: false,
})

const { listings, load } = useListings()
const saved = useSaved()
const store = saved.store
const tabs = useFolderTabs()

onMounted(() => {
  void load()
  saved.hydrate()
})

const folderId = computed(() => String(route.params.id || ALL_FOLDER_ID))
const isAll = computed(() => folderId.value === ALL_FOLDER_ID)
const folder = computed(() =>
  isAll.value
    ? { id: ALL_FOLDER_ID, name: 'All saved' }
    : store.value.folders.find((entry) => entry.id === folderId.value) ?? null,
)

const sortKey = ref<SheetSortKey | null>(null)
const sortDir = ref<SheetSortDir>('asc')

const rows = computed(() => {
  const ids = new Set(saved.folderIds(folderId.value))
  return listings.value.filter((item) => ids.has(item.id))
})

const sortedRows = computed(() => {
  const keyed: Array<Internship & SheetSortable> = rows.value.map((item) => ({
    ...item,
    status: statusOf(item.id),
    location: locationOf(item),
    appliedOn: field(item.id, 'appliedOn'),
    followUp: field(item.id, 'followUp'),
    deadline: deadlineOf(item),
  }))
  return sortSheetRows(keyed, sortKey.value, sortDir.value)
})

watch(folder, (current) => {
  if (current) {
    tabs.open(current.id)
  }
}, { immediate: true })

watch(folderId, () => {
  sortKey.value = null
  sortDir.value = 'asc'
})

function statusOf(id: string): Status {
  return store.value.items[id]?.status ?? 'applying'
}

function field(id: string, key: 'appliedOn' | 'followUp' | 'notes' | 'location') {
  return store.value.items[id]?.[key] ?? ''
}

function deadlineOf(item: { id: string, deadline?: string }) {
  return isoDeadline(store.value.items[item.id]?.deadline) || isoDeadline(item.deadline)
}

function placesOf(item: { location: string }) {
  return parsePlaces(item.location)
}

function locationOf(item: { id: string, location: string }) {
  return field(item.id, 'location') || placesOf(item).label || item.location
}

function removeRow(id: string) {
  if (isAll.value) {
    saved.unsave(id)
    return
  }
  saved.takeOut(id, folderId.value)
}

function toggleSort(key: SheetSortKey) {
  const next = nextSheetSort(sortKey.value, sortDir.value, key)
  sortKey.value = next.key
  sortDir.value = next.dir
}

function sortAria(key: SheetSortKey) {
  if (sortKey.value !== key) {
    return 'none'
  }
  return sortDir.value === 'asc' ? 'ascending' : 'descending'
}

function sortLabel(key: SheetSortKey) {
  const name = SHEET_SORT_LABEL[key]
  if (sortKey.value !== key) {
    return `Sort by ${name}`
  }
  if (sortDir.value === 'asc') {
    return `Sorted by ${name}, ascending. Click for descending`
  }
  return `Sorted by ${name}, descending. Click to clear`
}
</script>

<template>
  <div class="page">
    <div class="toolbar folder-toolbar">
      <NuxtLink to="/folders">
        ← Folders
      </NuxtLink>
      <ClientOnly>
        <FolderTabs :active-id="folderId" />
      </ClientOnly>
    </div>
    <p
      v-if="!folder"
      class="lede"
    >
      That folder is gone.
    </p>
    <template v-else>
      <div class="folder-tools">
        <p class="count">
          {{ rows.length }} {{ rows.length === 1 ? 'internship' : 'internships' }}
        </p>
        <ExportMenu
          :listings="rows"
          :folder-label="folder.name"
        />
      </div>
      <template v-if="rows.length">
        <div
          class="sheet-sort-bar"
          aria-label="Sort folder"
        >
          <button
            v-for="key in SHEET_SORT_KEYS"
            :key="key"
            class="sheet-sort"
            :class="{ 'is-on': sortKey === key }"
            type="button"
            :aria-pressed="sortKey === key"
            :aria-label="sortLabel(key)"
            @click="toggleSort(key)"
          >
            {{ SHEET_SORT_LABEL[key] }}
            <span
              v-if="sortKey === key"
              class="list-sort-mark"
              aria-hidden="true"
            >{{ sortDir === 'asc' ? '↑' : '↓' }}</span>
          </button>
        </div>
        <div class="sheet-wrap">
          <table class="sheet">
            <thead>
              <tr>
                <th
                  v-for="key in (['status', 'company', 'role'] as const)"
                  :key="key"
                  :aria-sort="sortAria(key)"
                >
                  <button
                    class="sheet-sort"
                    :class="{ 'is-on': sortKey === key }"
                    type="button"
                    :aria-label="sortLabel(key)"
                    @click="toggleSort(key)"
                  >
                    {{ SHEET_SORT_LABEL[key] }}
                    <span
                      v-if="sortKey === key"
                      class="list-sort-mark"
                      aria-hidden="true"
                    >{{ sortDir === 'asc' ? '↑' : '↓' }}</span>
                    <span
                      v-else
                      class="list-sort-hint"
                      aria-hidden="true"
                    >Sort</span>
                  </button>
                </th>
                <th>About</th>
                <th>Apply</th>
                <th
                  v-for="key in (['location', 'appliedOn', 'followUp', 'deadline'] as const)"
                  :key="key"
                  :aria-sort="sortAria(key)"
                >
                  <button
                    class="sheet-sort"
                    :class="{ 'is-on': sortKey === key }"
                    type="button"
                    :aria-label="sortLabel(key)"
                    @click="toggleSort(key)"
                  >
                    {{ SHEET_SORT_LABEL[key] }}
                    <span
                      v-if="sortKey === key"
                      class="list-sort-mark"
                      aria-hidden="true"
                    >{{ sortDir === 'asc' ? '↑' : '↓' }}</span>
                    <span
                      v-else
                      class="list-sort-hint"
                      aria-hidden="true"
                    >Sort</span>
                  </button>
                </th>
                <th>Notes</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in sortedRows"
                :key="item.id"
                :class="`sheet-status-${statusOf(item.id)}`"
              >
                <td>
                  <StatusSelect
                    :model-value="statusOf(item.id)"
                    :label="`Status for ${item.role} at ${item.company}`"
                    @update:model-value="saved.patch(item.id, { status: $event })"
                  />
                </td>
                <td class="sheet-company">
                  {{ item.company }}
                </td>
                <td>{{ item.role }}</td>
                <td>
                  <AboutField
                    :text="item.summary || ''"
                    :label="`About ${item.role} at ${item.company}`"
                  />
                </td>
                <td>
                  <a
                    class="sheet-open"
                    :href="item.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    :aria-label="`Apply to ${item.role} at ${item.company}`"
                  >Apply</a>
                </td>
                <td>
                  <PlaceField
                    :model-value="field(item.id, 'location')"
                    :places="placesOf(item).places"
                    :fallback="placesOf(item).label || item.location"
                    :label="`Location for ${item.role} at ${item.company}`"
                    @update:model-value="saved.patch(item.id, { location: $event })"
                  />
                </td>
                <td>
                  <DateField
                    :model-value="field(item.id, 'appliedOn')"
                    :label="`Applied date for ${item.role} at ${item.company}`"
                    @update:model-value="saved.patch(item.id, { appliedOn: $event })"
                  />
                </td>
                <td>
                  <DateField
                    :model-value="field(item.id, 'followUp')"
                    :label="`Follow-up date for ${item.role} at ${item.company}`"
                    @update:model-value="saved.patch(item.id, { followUp: $event })"
                  />
                </td>
                <td>
                  <DateField
                    :model-value="deadlineOf(item)"
                    :label="`Deadline for ${item.role} at ${item.company}`"
                    @update:model-value="saved.patch(item.id, { deadline: $event })"
                  />
                </td>
                <td>
                  <NotesField
                    :model-value="field(item.id, 'notes')"
                    :label="`Notes for ${item.role} at ${item.company}`"
                    @update:model-value="saved.patch(item.id, { notes: $event })"
                  />
                </td>
                <td>
                  <button
                    class="text-btn sheet-remove"
                    type="button"
                    :aria-label="`Remove ${item.role} at ${item.company}`"
                    @click="removeRow(item.id)"
                  >
                    <span class="sheet-remove-label">Remove</span>
                    <svg
                      class="sheet-remove-icon"
                      viewBox="0 0 16 16"
                      aria-hidden="true"
                    >
                      <path
                        d="M3.5 4.5h9M6.5 4.5V3.25A.75.75 0 0 1 7.25 2.5h1.5a.75.75 0 0 1 .75.75V4.5m1.5 0v8.25a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1V4.5M6.5 7v4M9.5 7v4"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.4"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="sheet-stack">
          <FolderSheetCard
            v-for="item in sortedRows"
            :key="item.id"
            :item="item"
            :status="statusOf(item.id)"
            :location="field(item.id, 'location')"
            :applied-on="field(item.id, 'appliedOn')"
            :follow-up="field(item.id, 'followUp')"
            :notes="field(item.id, 'notes')"
            :deadline="deadlineOf(item)"
            @patch="saved.patch(item.id, $event)"
            @remove="removeRow(item.id)"
          />
        </div>
      </template>
      <p
        v-else
        class="notice"
      >
        This folder is empty. On Search, tap + or Select to add internships.
      </p>
    </template>
  </div>
</template>
