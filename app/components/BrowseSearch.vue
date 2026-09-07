<script setup lang="ts">
const props = defineProps<{
  modelValue?: string
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const local = ref(props.modelValue ?? '')
let applyTimer: ReturnType<typeof setTimeout> | undefined
let editing = false

watch(() => props.modelValue, (value) => {
  const next = value ?? ''
  if (next === local.value) {
    editing = false
    return
  }
  if (editing) {
    return
  }
  local.value = next
})

onBeforeUnmount(() => {
  clearTimeout(applyTimer)
})

function flush() {
  clearTimeout(applyTimer)
  applyTimer = undefined
  emit('update:modelValue', local.value)
}

function onInput(event: Event) {
  editing = true
  local.value = (event.target as HTMLInputElement).value
  clearTimeout(applyTimer)
  if (!local.value.trim()) {
    flush()
    return
  }
  applyTimer = setTimeout(flush, 150)
}
</script>

<template>
  <label class="search-field">
    <svg
      class="search-icon"
      viewBox="0 0 16 16"
      aria-hidden="true"
    >
      <circle
        cx="6.5"
        cy="6.5"
        r="4.2"
        fill="none"
        stroke="currentColor"
        stroke-width="1.4"
      />
      <path
        d="M10 10l3.5 3.5"
        fill="none"
        stroke="currentColor"
        stroke-width="1.4"
        stroke-linecap="round"
      />
    </svg>
    <input
      class="search"
      type="text"
      :placeholder="placeholder"
      :value="local"
      autocomplete="off"
      autocorrect="off"
      spellcheck="false"
      @input="onInput"
      @keydown.enter.prevent="flush"
    >
  </label>
</template>
