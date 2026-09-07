<script setup lang="ts">
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
const area = ref<HTMLTextAreaElement | null>(null)
const popStyle = ref<Record<string, string>>({})
const draft = ref(props.modelValue)

const preview = computed(() => String(props.modelValue || '').replace(/\s+/g, ' ').trim())
const empty = computed(() => !preview.value)

watch(() => props.modelValue, (value) => {
  if (!open.value) {
    draft.value = value
  }
})

function commit() {
  const next = draft.value.slice(0, 4000)
  if (next !== props.modelValue) {
    emit('update:modelValue', next)
  }
}

function close() {
  commit()
  open.value = false
}

function toggle() {
  open.value = !open.value
}

function placePop() {
  const trigger = root.value?.querySelector<HTMLElement>('.notes-trigger')
  if (!trigger) {
    return
  }
  const rect = trigger.getBoundingClientRect()
  const width = Math.min(360, Math.max(280, window.innerWidth - 16))
  const height = pop.value?.offsetHeight ?? 220
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
  if (event.key === 'Escape' && open.value) {
    event.preventDefault()
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
  draft.value = props.modelValue
  nextTick(() => {
    placePop()
    area.value?.focus()
    const end = area.value?.value.length ?? 0
    area.value?.setSelectionRange(end, end)
  })
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
    class="notes-field"
  >
    <button
      class="notes-trigger"
      :class="{ 'is-empty': empty }"
      type="button"
      :aria-label="label"
      :title="preview || undefined"
      aria-haspopup="dialog"
      :aria-expanded="open"
      @click.stop="toggle"
    >
      <span class="notes-preview">{{ preview || 'Notes' }}</span>
    </button>
    <Teleport to="body">
      <div
        v-if="open"
        ref="pop"
        class="notes-pop"
        role="dialog"
        :aria-label="label"
        :style="popStyle"
        @click.stop
      >
        <textarea
          ref="area"
          v-model="draft"
          class="notes-area"
          rows="8"
          maxlength="4000"
          placeholder="Interview tips, recruiter name, what to follow up on…"
          @keydown.meta.enter.prevent="close"
          @keydown.ctrl.enter.prevent="close"
        />
        <div class="notes-foot">
          <span class="notes-hint">⌘/Ctrl+Enter to close</span>
          <button
            class="text-btn"
            type="button"
            @click="close"
          >
            Done
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>
