<script setup lang="ts">
const props = defineProps<{
  modelValue: string
  places: string[]
  fallback: string
  label: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const open = ref(false)
const root = ref<HTMLElement | null>(null)
const list = ref<HTMLElement | null>(null)
const listStyle = ref<Record<string, string>>({})

const selectable = computed(() => props.places.length >= 2)
const selectedLabel = computed(() => {
  if (props.modelValue) {
    return props.modelValue
  }
  if (selectable.value) {
    return props.fallback || `${props.places.length} locations`
  }
  return props.fallback || props.places[0] || ''
})

function close() {
  open.value = false
}

function toggle() {
  if (!selectable.value) {
    return
  }
  open.value = !open.value
}

function pick(place: string) {
  emit('update:modelValue', place)
  close()
}

function clear() {
  emit('update:modelValue', '')
  close()
}

function placeList() {
  const trigger = root.value?.querySelector<HTMLElement>('.place-field-trigger')
  if (!trigger) {
    return
  }
  const rect = trigger.getBoundingClientRect()
  const width = Math.max(rect.width, 180)
  const height = list.value?.offsetHeight ?? 280
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
    v-if="selectable"
    ref="root"
    class="place-field"
  >
    <button
      class="place-field-trigger"
      :class="{ 'is-empty': !modelValue }"
      type="button"
      :aria-label="label"
      aria-haspopup="listbox"
      :aria-expanded="open"
      @click.stop="toggle"
    >
      <span>{{ selectedLabel }}</span>
      <span
        class="status-caret"
        aria-hidden="true"
      />
    </button>
    <Teleport to="body">
      <div
        v-if="open"
        ref="list"
        class="place-field-list status-list filter-options is-pick"
        role="listbox"
        :aria-label="label"
        :style="listStyle"
        @click.stop
      >
        <button
          v-if="modelValue"
          class="chip"
          type="button"
          role="option"
          :aria-selected="false"
          @mousedown.prevent
          @click="clear"
        >
          All locations
        </button>
        <button
          v-for="place in places"
          :key="place"
          class="chip"
          :class="{ 'is-on': modelValue === place }"
          type="button"
          role="option"
          :aria-selected="modelValue === place"
          @mousedown.prevent
          @click="pick(place)"
        >
          {{ place }}
        </button>
      </div>
    </Teleport>
  </div>
  <span
    v-else
    class="place-field-plain"
  >{{ selectedLabel }}</span>
</template>
