<script setup lang="ts">
import { STATUS_LABEL, STATUSES, type Status } from '~/utils/saved'

const props = defineProps<{
  modelValue: Status
  label: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Status]
}>()

const open = ref(false)
const root = ref<HTMLElement | null>(null)
const list = ref<HTMLElement | null>(null)
const listStyle = ref<Record<string, string>>({})

function close() {
  open.value = false
}

function toggle() {
  open.value = !open.value
}

function pick(status: Status) {
  emit('update:modelValue', status)
  close()
}

function placeList() {
  const trigger = root.value?.querySelector<HTMLElement>('.status-trigger')
  if (!trigger) {
    return
  }
  const rect = trigger.getBoundingClientRect()
  const width = Math.max(rect.width, 148)
  const height = list.value?.offsetHeight ?? 220
  const spaceBelow = window.innerHeight - rect.bottom - 8
  const spaceAbove = rect.top - 8
  const flip = spaceBelow < height && spaceAbove > spaceBelow
  const left = Math.min(Math.max(8, rect.left), window.innerWidth - width - 8)
  const top = flip
    ? Math.max(8, rect.top - height - 4)
    : rect.bottom + 4
  listStyle.value = {
    left: `${left}px`,
    top: `${top}px`,
    minWidth: `${width}px`,
  }
}

function onDocumentClick(event: MouseEvent) {
  if (!open.value || !root.value) {
    return
  }
  const target = event.target as Node
  if (root.value.contains(target) || list.value?.contains(target)) {
    return
  }
  close()
}

function onKey(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    close()
  }
}

function onReposition() {
  if (open.value) {
    placeList()
  }
}

watch(open, (isOpen) => {
  if (isOpen) {
    nextTick(placeList)
  }
})

onMounted(() => {
  document.addEventListener('mousedown', onDocumentClick)
  document.addEventListener('keydown', onKey)
  document.addEventListener('scroll', onReposition, true)
  window.addEventListener('resize', onReposition)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onDocumentClick)
  document.removeEventListener('keydown', onKey)
  document.removeEventListener('scroll', onReposition, true)
  window.removeEventListener('resize', onReposition)
})
</script>

<template>
  <div
    ref="root"
    class="status-select"
  >
    <button
      class="status-trigger"
      :class="`status-${modelValue}`"
      type="button"
      :aria-label="label"
      aria-haspopup="listbox"
      :aria-expanded="open"
      @click.stop="toggle"
    >
      <span>{{ STATUS_LABEL[modelValue] }}</span>
      <span
        class="status-caret"
        aria-hidden="true"
      />
    </button>
    <Teleport to="body">
      <div
        v-if="open"
        ref="list"
        class="status-list filter-options is-pick"
        role="listbox"
        :aria-label="label"
        :style="listStyle"
        @click.stop
      >
        <button
          v-for="status in STATUSES"
          :key="status"
          class="chip"
          :class="{ 'is-on': modelValue === status }"
          type="button"
          role="option"
          :aria-selected="modelValue === status"
          @mousedown.prevent
          @click="pick(status)"
        >
          {{ STATUS_LABEL[status] }}
        </button>
      </div>
    </Teleport>
  </div>
</template>
