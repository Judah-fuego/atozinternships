<script setup lang="ts">
import { eligibilityLine } from '~/data/listings'
import { ALL_FOLDER_ID, STATUS_LABEL, STATUSES, type Status } from '~/utils/saved'

const route = useRoute()
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

const rows = computed(() => {
  const ids = new Set(saved.folderIds(folderId.value))
  return listings.value.filter((item) => ids.has(item.id))
})

watch(folder, (current) => {
  if (current) {
    tabs.open(current.id)
  }
}, { immediate: true })

function statusOf(id: string): Status {
  return store.value.items[id]?.status ?? 'saved'
}

function field(id: string, key: 'appliedOn' | 'followUp' | 'notes' | 'deadline') {
  return store.value.items[id]?.[key] ?? ''
}

function removeRow(id: string) {
  if (isAll.value) {
    saved.unsave(id)
    return
  }
  saved.takeOut(id, folderId.value)
}
</script>

<template>
  <div class="page">
    <div class="toolbar folder-toolbar">
      <NuxtLink to="/folders">
        ← Folders
      </NuxtLink>
      <FolderTabs :active-id="folderId" />
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
      <div
        v-if="rows.length"
        class="sheet-wrap"
      >
        <table class="sheet">
          <thead>
            <tr>
              <th>Status</th>
              <th>Company</th>
              <th>Role</th>
              <th>Who</th>
              <th>Location</th>
              <th>Deadline</th>
              <th>Applied</th>
              <th>Follow-up</th>
              <th>Notes</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in rows"
              :key="item.id"
            >
              <td>
                <select
                  :class="`status-${statusOf(item.id)}`"
                  :value="statusOf(item.id)"
                  :aria-label="`Status for ${item.role} at ${item.company}`"
                  @change="saved.patch(item.id, { status: ($event.target as HTMLSelectElement).value as Status })"
                >
                  <option
                    v-for="status in STATUSES"
                    :key="status"
                    :value="status"
                  >
                    {{ STATUS_LABEL[status] }}
                  </option>
                </select>
              </td>
              <td>
                <div class="sheet-company">
                  <span>{{ item.company }}</span>
                  <a
                    class="sheet-open"
                    :href="item.url"
                    target="_blank"
                    rel="noopener noreferrer"
                  >Open</a>
                </div>
              </td>
              <td>{{ item.role }}</td>
              <td>{{ eligibilityLine(item) }}</td>
              <td>{{ item.location }}</td>
              <td>
                <input
                  type="date"
                  :value="field(item.id, 'deadline')"
                  :aria-label="`Deadline for ${item.role} at ${item.company}`"
                  @change="saved.patch(item.id, { deadline: ($event.target as HTMLInputElement).value })"
                >
              </td>
              <td>
                <input
                  type="date"
                  :value="field(item.id, 'appliedOn')"
                  @change="saved.patch(item.id, { appliedOn: ($event.target as HTMLInputElement).value })"
                >
              </td>
              <td>
                <input
                  type="date"
                  :value="field(item.id, 'followUp')"
                  @change="saved.patch(item.id, { followUp: ($event.target as HTMLInputElement).value })"
                >
              </td>
              <td>
                <input
                  type="text"
                  :value="field(item.id, 'notes')"
                  placeholder="Notes"
                  @change="saved.patch(item.id, { notes: ($event.target as HTMLInputElement).value })"
                >
              </td>
              <td>
                <button
                  class="text-btn sheet-remove"
                  type="button"
                  :aria-label="`Remove ${item.role} at ${item.company}`"
                  @click="removeRow(item.id)"
                >
                  <span class="sheet-remove-label">Remove</span>
                  <span
                    class="sheet-remove-x"
                    aria-hidden="true"
                  >×</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p
        v-else
        class="notice"
      >
        This folder is empty. On Search, tap + or Select to add internships.
      </p>
    </template>
  </div>
</template>
