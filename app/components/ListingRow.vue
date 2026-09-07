<script setup lang="ts">
import {
  TRACK_LABEL,
  eligibilityLine,
  formatDeadline,
  formatPostedAgo,
  listingPayLine,
  listingSource,
  listingSummary,
  parsePlaces,
  seasonLabelFor,
  type Internship,
} from '~/data/listings'

const props = defineProps<{
  item: Internship
  saved: boolean
  selected?: boolean
  selecting?: boolean
  folders?: Array<{ id: string, name: string }>
  folderIds?: string[]
}>()

const emit = defineEmits<{
  toggleSelect: [event: MouseEvent]
  save: [payload: { folderId?: string, newFolder?: string }]
  unsave: []
}>()

const open = ref(false)
const placesOpen = ref(false)
const now = useNow()
const source = computed(() => listingSource(props.item))
const places = computed(() => parsePlaces(props.item.location))
const postedLabel = computed(() => {
  if (props.item.deadline) {
    return `Due ${formatDeadline(props.item.deadline)}`
  }
  return formatPostedAgo(props.item, now.value)
})

function onRowClick(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (target.closest('a, button, select, input, .place-wrap, .folder-picker')) {
    return
  }
  if (props.selecting || event.shiftKey) {
    emit('toggleSelect', event)
    return
  }
  open.value = !open.value
}

function togglePlaces() {
  if (!places.value.compact) {
    return
  }
  placesOpen.value = !placesOpen.value
}
</script>

<template>
  <article
    class="row"
    :class="{ 'is-open': open, 'is-closed': item.closed, 'is-selected': selected, 'is-selecting': selecting }"
    :aria-pressed="selecting ? selected : undefined"
    @click="onRowClick"
  >
    <CompanyMark
      :company="item.company"
      :url="item.url"
    />
    <div class="company">
      {{ item.company }}
    </div>
    <div class="role">
      {{ item.role }}
    </div>
    <div class="meta">
      <div
        class="place"
        :class="{ 'place-wrap': places.compact, 'is-open': placesOpen }"
      >
        <button
          v-if="places.compact"
          class="place-trigger"
          type="button"
          :aria-expanded="placesOpen"
          @click.stop="togglePlaces"
        >
          {{ places.label }}
        </button>
        <template v-else>
          {{ places.label }}
        </template>
        <ul
          v-if="places.compact"
          class="place-tip"
        >
          <li
            v-for="place in places.places"
            :key="place"
          >
            {{ place }}
          </li>
        </ul>
      </div>
      <div class="posted">
        {{ postedLabel }}
      </div>
    </div>
    <ApplyMenu
      :company="item.company"
      :role="item.role"
      :url="item.url"
    />
    <FolderPicker
      class="save-menu"
      :folders="folders"
      :folder-ids="folderIds"
      title="Add to a folder"
      :allow-remove="saved"
      @pick="emit('save', $event)"
      @remove="emit('unsave')"
    >
      <template #default="{ open: menuOpen, toggle }">
        <button
          class="save"
          :class="{ 'is-on': saved }"
          type="button"
          :aria-expanded="menuOpen"
          aria-haspopup="dialog"
          :aria-label="saved ? `Change folders for ${item.role} at ${item.company}` : `Add ${item.role} at ${item.company} to a folder`"
          @click.stop="toggle"
        >
          {{ saved ? '✓' : '+' }}
        </button>
      </template>
    </FolderPicker>
    <div
      v-if="open"
      class="detail"
    >
      <div class="detail-block">
        <span class="detail-label">About</span>
        <p class="detail-about">
          {{ listingSummary(item) }}
        </p>
      </div>
      <div
        v-if="item.requirements"
        class="detail-block"
      >
        <span class="detail-label">Requirements</span>
        <p class="detail-fact">
          {{ item.requirements }}
        </p>
      </div>
      <div
        v-if="item.keywords"
        class="detail-block"
      >
        <span class="detail-label">Skills</span>
        <p class="detail-fact">
          {{ item.keywords }}
        </p>
      </div>
      <div
        v-if="listingPayLine(item)"
        class="detail-block"
      >
        <span class="detail-label">Pay</span>
        <p class="detail-fact">
          {{ listingPayLine(item) }}
        </p>
      </div>
      <p class="detail-meta">
        {{ eligibilityLine(item) }}
        · {{ TRACK_LABEL[item.track] }}
        · {{ seasonLabelFor(item) }}
        · {{ source.label }}
        <template v-if="item.closed">
          · Closed
        </template>
      </p>
      <div class="detail-actions">
        <a
          :href="item.url"
          target="_blank"
          rel="noopener noreferrer"
        >Open posting</a>
      </div>
    </div>
  </article>
</template>
