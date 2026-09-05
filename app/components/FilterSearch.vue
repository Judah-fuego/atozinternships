<script setup lang="ts">
export type FilterSearchOption = {
  id: string
  label: string
  count?: number
}

const props = defineProps<{
  placeholder: string
  listId: string
  options: FilterSearchOption[]
}>()

const selected = defineModel<string[]>({ required: true })
const query = ref('')
const open = ref(false)
const box = ref<HTMLElement | null>(null)
const listStyle = ref<Record<string, string>>({})

const selectedSet = computed(() => new Set(selected.value))

const matches = computed(() => {
  const q = query.value.trim().toLowerCase()
  const rows = q
    ? props.options.filter((item) => item.label.toLowerCase().includes(q))
    : props.options
  return rows.filter((item) => (item.count ?? 1) > 0 || selectedSet.value.has(item.id))
})

const selectedItems = computed(() => {
  const byId = new Map(props.options.map((item) => [item.id, item]))
  return selected.value.map((id) => {
    const item = byId.get(id)
    return { id, label: item?.label ?? id, count: item?.count }
  })
})

function formatCount(count: number) {
  return count.toLocaleString()
}

function toggle(id: string) {
  const current = selected.value
  selected.value = current.includes(id)
    ? current.filter((item) => item !== id)
    : [...current, id]
}

function closeSearch() {
  open.value = false
  query.value = ''
}

const VISIBLE_ROWS = 5

function fiveRowHeight(list: Element) {
  const items = [...list.querySelectorAll<HTMLElement>('[role=option]')]
  if (!items.length) {
    return 80
  }
  const last = items[Math.min(VISIBLE_ROWS, items.length) - 1]
  const first = items[0]
  if (!first || !last) {
    return 80
  }
  const styles = getComputedStyle(list)
  const pad = parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom)
  const border = parseFloat(styles.borderTopWidth) + parseFloat(styles.borderBottomWidth)
  return last.getBoundingClientRect().bottom - first.getBoundingClientRect().top + pad + border
}

function placeList() {
  const input = box.value?.querySelector('input')
  const list = box.value?.querySelector('.place-search-list')
  if (!input) {
    return
  }
  const rect = input.getBoundingClientRect()
  const spaceBelow = window.innerHeight - rect.bottom - 12
  const spaceAbove = rect.top - 12
  const preferred = list ? fiveRowHeight(list) : 140
  const flip = spaceBelow < preferred && spaceAbove > spaceBelow
  const maxHeight = Math.min(preferred, Math.max(72, flip ? spaceAbove : spaceBelow))
  const mobile = window.innerWidth <= 800
  const width = mobile
    ? Math.min(window.innerWidth - 24, Math.max(rect.width, 200))
    : Math.min(288, Math.max(rect.width, 232))
  const left = Math.min(Math.max(8, rect.left), window.innerWidth - width - 8)
  let top = rect.bottom + 4
  if (flip) {
    top = Math.max(8, rect.top - maxHeight - 4)
  }
  listStyle.value = {
    left: `${left}px`,
    top: `${top}px`,
    width: `${width}px`,
    maxHeight: `${maxHeight}px`,
  }
}

function onDocumentPointerDown(event: PointerEvent) {
  const el = box.value
  if (el && event.target instanceof Node && !el.contains(event.target)) {
    closeSearch()
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
  document.addEventListener('pointerdown', onDocumentPointerDown)
  document.addEventListener('scroll', onReposition, true)
  window.addEventListener('resize', onReposition)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocumentPointerDown)
  document.removeEventListener('scroll', onReposition, true)
  window.removeEventListener('resize', onReposition)
})
</script>

<template>
  <div
    ref="box"
    class="place-search"
  >
    <div class="place-search-field">
      <input
        class="search place-search-input"
        type="text"
        :placeholder="placeholder"
        :value="query"
        role="combobox"
        aria-autocomplete="list"
        :aria-controls="listId"
        :aria-expanded="open"
        @focus="open = true"
        @input="query = ($event.target as HTMLInputElement).value; open = true"
        @keydown.escape.prevent="closeSearch"
      >
      <div
        v-if="open"
        :id="listId"
        class="place-search-list"
        :style="listStyle"
        role="listbox"
      >
        <button
          v-for="item in matches"
          :key="item.id"
          class="chip"
          :class="{ 'is-on': selectedSet.has(item.id) }"
          type="button"
          role="option"
          :aria-selected="selectedSet.has(item.id)"
          @mousedown.prevent
          @click="toggle(item.id)"
        >
          <span>{{ item.label }}</span>
          <span
            v-if="item.count != null"
            class="chip-count"
          >{{ formatCount(item.count) }}</span>
        </button>
        <p
          v-if="!matches.length"
          class="place-search-empty"
        >
          No matches
        </p>
      </div>
    </div>
    <div
      class="filter-reveal"
      :class="{ 'is-open': selectedItems.length }"
      :inert="!selectedItems.length"
    >
      <div class="filter-reveal-inner">
        <div class="filter-options is-inline">
          <button
            v-for="item in selectedItems"
            :key="item.id"
            class="chip is-on"
            type="button"
            :aria-pressed="true"
            @click="toggle(item.id)"
          >
            <span>{{ item.label }}</span>
            <span
              v-if="item.count != null"
              class="chip-count"
            >{{ formatCount(item.count) }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
