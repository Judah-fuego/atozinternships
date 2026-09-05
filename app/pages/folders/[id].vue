<script setup lang="ts">
import { eligibilityLine, isoDeadline } from '~/data/listings'
import { ALL_FOLDER_ID, type Status } from '~/utils/saved'

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

function field(id: string, key: 'appliedOn' | 'followUp' | 'notes') {
  return store.value.items[id]?.[key] ?? ''
}

function deadlineOf(item: { id: string, deadline?: string }) {
  return isoDeadline(store.value.items[item.id]?.deadline) || isoDeadline(item.deadline)
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
                <StatusSelect
                  :model-value="statusOf(item.id)"
                  :label="`Status for ${item.role} at ${item.company}`"
                  @update:model-value="saved.patch(item.id, { status: $event })"
                />
              </td>
              <td>
                <div class="sheet-company">
                  <span>{{ item.company }}</span>
                  <a
                    class="sheet-open"
                    :href="item.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    :aria-label="`Apply to ${item.role} at ${item.company}`"
                  >Apply</a>
                </div>
              </td>
              <td>{{ item.role }}</td>
              <td>{{ eligibilityLine(item) }}</td>
              <td>{{ item.location }}</td>
              <td>
                <DateField
                  :model-value="deadlineOf(item)"
                  :label="`Deadline for ${item.role} at ${item.company}`"
                  @update:model-value="saved.patch(item.id, { deadline: $event })"
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
                  <svg
                    class="sheet-remove-pen"
                    viewBox="0 0 16 16"
                    aria-hidden="true"
                  >
                    <path
                      d="M11.2 2.3 13.7 4.8a1 1 0 0 1 0 1.4L6.2 13.7 2.5 14.5l.8-3.7 7.5-7.5a1 1 0 0 1 1.4 0Z"
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
      <p
        v-else
        class="notice"
      >
        This folder is empty. On Search, tap + or Select to add internships.
      </p>
    </template>
  </div>
</template>
