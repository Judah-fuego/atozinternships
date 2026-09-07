<script setup lang="ts">
import { parsePlaces, type Internship } from '~/data/listings'
import type { Status } from '~/utils/saved'

const props = defineProps<{
  item: Internship
  status: Status
  location: string
  appliedOn: string
  followUp: string
  notes: string
  deadline: string
}>()

const emit = defineEmits<{
  patch: [payload: Partial<{
    status: Status
    location: string
    appliedOn: string
    followUp: string
    deadline: string
    notes: string
  }>]
  remove: []
}>()

const places = computed(() => parsePlaces(props.item.location))
const summary = computed(() => String(props.item.summary || '').replace(/\s+/g, ' ').trim())
</script>

<template>
  <article
    class="sheet-card"
    :class="`sheet-status-${status}`"
  >
    <div class="sheet-card-head">
      <div class="sheet-card-titles">
        <strong class="sheet-company">{{ item.company }}</strong>
        <span class="sheet-card-role">{{ item.role }}</span>
        <p
          v-if="summary"
          class="sheet-card-summary"
        >
          {{ summary }}
        </p>
      </div>
      <button
        class="text-btn sheet-remove"
        type="button"
        :aria-label="`Remove ${item.role} at ${item.company}`"
        @click="emit('remove')"
      >
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
    </div>

    <a
      class="sheet-open sheet-card-apply"
      :href="item.url"
      target="_blank"
      rel="noopener noreferrer"
      :aria-label="`Apply to ${item.role} at ${item.company}`"
    >Apply</a>

    <div class="sheet-card-primary">
      <StatusSelect
        :model-value="status"
        :label="`Status for ${item.role} at ${item.company}`"
        @update:model-value="emit('patch', { status: $event })"
      />
      <div class="sheet-card-due">
        <span class="sheet-card-label">Due</span>
        <DateField
          :model-value="deadline"
          :label="`Deadline for ${item.role} at ${item.company}`"
          @update:model-value="emit('patch', { deadline: $event })"
        />
      </div>
    </div>

    <div class="sheet-card-fields">
      <div class="sheet-card-field sheet-card-field-wide">
        <span class="sheet-card-label">Location</span>
        <PlaceField
          :model-value="location"
          :places="places.places"
          :fallback="places.label || item.location"
          :label="`Location for ${item.role} at ${item.company}`"
          @update:model-value="emit('patch', { location: $event })"
        />
      </div>
      <div class="sheet-card-field">
        <span class="sheet-card-label">Applied</span>
        <DateField
          :model-value="appliedOn"
          :label="`Applied date for ${item.role} at ${item.company}`"
          @update:model-value="emit('patch', { appliedOn: $event })"
        />
      </div>
      <div class="sheet-card-field">
        <span class="sheet-card-label">Follow-up</span>
        <DateField
          :model-value="followUp"
          :label="`Follow-up date for ${item.role} at ${item.company}`"
          @update:model-value="emit('patch', { followUp: $event })"
        />
      </div>
      <div class="sheet-card-field sheet-card-field-wide">
        <span class="sheet-card-label">Notes</span>
        <NotesField
          :model-value="notes"
          :label="`Notes for ${item.role} at ${item.company}`"
          @update:model-value="emit('patch', { notes: $event })"
        />
      </div>
    </div>
  </article>
</template>
