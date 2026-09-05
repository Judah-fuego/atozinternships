<script setup lang="ts">
defineProps<{
  title: string
  body: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const titleId = useId()
const bodyId = useId()
const dialog = ref<HTMLElement | null>(null)
const cancelBtn = ref<HTMLButtonElement | null>(null)
let previous: HTMLElement | null = null
let overflow = ''

function onKey(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    emit('cancel')
    return
  }
  if (event.key !== 'Tab' || !dialog.value) {
    return
  }
  const focusable = [...dialog.value.querySelectorAll<HTMLElement>('button')]
  if (focusable.length < 2) {
    return
  }
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  const active = document.activeElement
  if (event.shiftKey && active === first) {
    event.preventDefault()
    last.focus()
  }
  else if (!event.shiftKey && active === last) {
    event.preventDefault()
    first.focus()
  }
}

onMounted(() => {
  previous = document.activeElement instanceof HTMLElement ? document.activeElement : null
  overflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  document.addEventListener('keydown', onKey)
  nextTick(() => {
    cancelBtn.value?.focus()
  })
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKey)
  document.body.style.overflow = overflow
  previous?.focus()
})
</script>

<template>
  <Teleport to="body">
    <div class="confirm-layer">
      <button
        class="confirm-backdrop"
        type="button"
        tabindex="-1"
        aria-label="Dismiss"
        @click="emit('cancel')"
      />
      <div
        ref="dialog"
        class="confirm-dialog"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        :aria-describedby="bodyId"
      >
        <h2 :id="titleId">
          {{ title }}
        </h2>
        <p :id="bodyId">
          {{ body }}
        </p>
        <div class="confirm-actions">
          <button
            ref="cancelBtn"
            class="text-btn ghost-btn"
            type="button"
            @click="emit('cancel')"
          >
            {{ cancelLabel || 'Cancel' }}
          </button>
          <button
            class="text-btn"
            :class="{ 'confirm-danger': danger }"
            type="button"
            @click="emit('confirm')"
          >
            {{ confirmLabel || 'OK' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
