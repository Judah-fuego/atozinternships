<script setup lang="ts">
import { formatDeadline, isoDeadline } from '~/data/listings'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const

const props = defineProps<{
  modelValue: string
  label: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const open = ref(false)
const root = ref<HTMLElement | null>(null)
const pop = ref<HTMLElement | null>(null)
const popStyle = ref<Record<string, string>>({})
const view = ref(todayParts())

const selected = computed(() => isoDeadline(props.modelValue))
const selectedLabel = computed(() => formatDeadline(selected.value))
const today = computed(() => toIso(todayParts()))

const cells = computed(() => {
  const { year, month } = view.value
  const first = new Date(year, month, 1).getDay()
  const days = new Date(year, month + 1, 0).getDate()
  const leading = first
  const total = Math.ceil((leading + days) / 7) * 7
  const rows: Array<{ iso: string, day: number, muted: boolean }> = []
  for (let i = 0; i < total; i += 1) {
    const date = new Date(year, month, i - leading + 1)
    rows.push({
      iso: toIso(partsOf(date)),
      day: date.getDate(),
      muted: date.getMonth() !== month,
    })
  }
  return rows
})

function todayParts() {
  return partsOf(new Date())
}

function partsOf(date: Date) {
  return { year: date.getFullYear(), month: date.getMonth(), day: date.getDate() }
}

function toIso(parts: { year: number, month: number, day: number }) {
  const month = String(parts.month + 1).padStart(2, '0')
  const day = String(parts.day).padStart(2, '0')
  return `${parts.year}-${month}-${day}`
}

function parseIso(value: string) {
  const iso = isoDeadline(value)
  if (!iso) {
    return null
  }
  const [year, month, day] = iso.split('-').map(Number)
  return { year, month: month - 1, day }
}

function close() {
  open.value = false
}

function toggle() {
  open.value = !open.value
}

function pick(iso: string) {
  emit('update:modelValue', iso)
  close()
}

function clear() {
  emit('update:modelValue', '')
  close()
}

function shiftMonth(delta: number) {
  const next = new Date(view.value.year, view.value.month + delta, 1)
  view.value = { year: next.getFullYear(), month: next.getMonth(), day: 1 }
}

function placePop() {
  const trigger = root.value?.querySelector<HTMLElement>('.date-trigger')
  if (!trigger) {
    return
  }
  const rect = trigger.getBoundingClientRect()
  const width = 264
  const height = pop.value?.offsetHeight ?? 280
  const spaceBelow = window.innerHeight - rect.bottom - 8
  const spaceAbove = rect.top - 8
  const flip = spaceBelow < height && spaceAbove > spaceBelow
  const left = Math.min(Math.max(8, rect.left), window.innerWidth - width - 8)
  const top = flip
    ? Math.max(8, rect.top - height - 4)
    : rect.bottom + 4
  popStyle.value = {
    left: `${left}px`,
    top: `${top}px`,
    width: `${width}px`,
  }
}

function onDocumentClick(event: MouseEvent) {
  if (!open.value || !root.value) {
    return
  }
  const target = event.target as Node
  if (root.value.contains(target) || pop.value?.contains(target)) {
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
    placePop()
  }
}

watch(open, (isOpen) => {
  if (!isOpen) {
    return
  }
  view.value = parseIso(selected.value) ?? todayParts()
  nextTick(placePop)
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
    class="date-field"
  >
    <button
      class="date-trigger"
      :class="{ 'is-empty': !selectedLabel }"
      type="button"
      :aria-label="label"
      aria-haspopup="dialog"
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
        ref="pop"
        class="date-pop"
        role="dialog"
        :aria-label="label"
        :style="popStyle"
        @click.stop
      >
        <div class="date-head">
          <button
            class="text-btn ghost-btn"
            type="button"
            aria-label="Previous month"
            @click="shiftMonth(-1)"
          >
            ←
          </button>
          <p class="date-month">
            {{ MONTHS[view.month] }} {{ view.year }}
          </p>
          <button
            class="text-btn ghost-btn"
            type="button"
            aria-label="Next month"
            @click="shiftMonth(1)"
          >
            →
          </button>
        </div>
        <div
          class="date-week"
          aria-hidden="true"
        >
          <span
            v-for="(day, index) in WEEKDAYS"
            :key="`${day}-${index}`"
          >{{ day }}</span>
        </div>
        <div class="date-grid">
          <button
            v-for="cell in cells"
            :key="cell.iso"
            class="date-day"
            :class="{ 'is-muted': cell.muted, 'is-on': cell.iso === selected, 'is-today': cell.iso === today }"
            type="button"
            :aria-label="cell.iso"
            :aria-current="cell.iso === selected ? 'date' : undefined"
            @click="pick(cell.iso)"
          >
            {{ cell.day }}
          </button>
        </div>
        <div class="date-foot">
          <button
            class="text-btn ghost-btn"
            type="button"
            @click="clear"
          >
            Clear
          </button>
          <button
            class="text-btn"
            type="button"
            @click="pick(today)"
          >
            Today
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>
