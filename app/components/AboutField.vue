<script setup lang="ts">
const props = defineProps<{
  text: string
  label: string
}>()

const open = ref(false)
const root = ref<HTMLElement | null>(null)
const pop = ref<HTMLElement | null>(null)
const popStyle = ref<Record<string, string>>({})

const body = computed(() => String(props.text || '').replace(/\s+/g, ' ').trim())

const preview = computed(() => {
  if (!body.value) {
    return ''
  }
  return body.value.length > 20 ? `${body.value.slice(0, 20).trimEnd()}…` : body.value
})

function close() {
  open.value = false
}

function toggle() {
  if (!body.value) {
    return
  }
  open.value = !open.value
}

function placePop() {
  const trigger = root.value?.querySelector<HTMLElement>('.about-trigger')
  if (!trigger) {
    return
  }
  const rect = trigger.getBoundingClientRect()
  const width = Math.min(360, Math.max(280, window.innerWidth - 16))
  const height = pop.value?.offsetHeight ?? 180
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
  nextTick(() => {
    placePop()
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
    class="about-field"
  >
    <button
      class="about-trigger"
      :class="{ 'is-empty': !preview }"
      type="button"
      :aria-label="label"
      :aria-haspopup="body ? 'dialog' : undefined"
      :aria-expanded="body ? open : undefined"
      @click.stop="toggle"
    >
      <span>{{ preview || 'About' }}</span>
    </button>
    <Teleport to="body">
      <div
        v-if="open && body"
        ref="pop"
        class="about-pop"
        role="dialog"
        :aria-label="label"
        :style="popStyle"
        @click.stop
      >
        <p class="about-body">
          {{ body }}
        </p>
        <div class="about-foot">
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
