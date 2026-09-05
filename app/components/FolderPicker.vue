<script setup lang="ts">
const props = defineProps<{
  folders?: Array<{ id: string, name: string }>
  folderIds?: string[]
  title?: string
  allLabel?: string
  createPlaceholder?: string
  allowRemove?: boolean
}>()

const emit = defineEmits<{
  pick: [payload: { folderId?: string, newFolder?: string }]
  remove: []
}>()

const open = ref(false)
const name = ref('')
const root = ref<HTMLElement | null>(null)

function close() {
  open.value = false
}

function toggle() {
  open.value = !open.value
}

function pick(payload: { folderId?: string, newFolder?: string } = {}) {
  emit('pick', payload)
  name.value = ''
  close()
}

function makeFolder() {
  const next = name.value.trim()
  if (!next) {
    return
  }
  pick({ newFolder: next })
}

function remove() {
  emit('remove')
  close()
}

function onDocumentClick(event: MouseEvent) {
  if (!open.value || !root.value) {
    return
  }
  if (!root.value.contains(event.target as Node)) {
    close()
  }
}

function onKey(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    close()
  }
}

onMounted(() => {
  document.addEventListener('mousedown', onDocumentClick)
  document.addEventListener('keydown', onKey)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onDocumentClick)
  document.removeEventListener('keydown', onKey)
})

defineExpose({ open, toggle, close })
</script>

<template>
  <div
    ref="root"
    class="folder-picker"
  >
    <slot
      :open="open"
      :toggle="toggle"
    />
    <div
      v-if="open"
      class="apply-pop"
      role="dialog"
      :aria-label="title || 'Choose a folder'"
      @click.stop
    >
      <p
        v-if="title"
        class="apply-pop-title"
      >
        {{ title }}
      </p>
      <form
        class="inline-form apply-new"
        @submit.prevent="makeFolder"
      >
        <input
          v-model="name"
          type="text"
          maxlength="40"
          :placeholder="createPlaceholder || 'New folder'"
        >
        <button
          class="create-btn"
          type="submit"
          :disabled="!name.trim()"
        >
          Create
        </button>
      </form>
      <div class="apply-folders">
        <button
          class="apply-choice"
          type="button"
          @click="pick({})"
        >
          {{ allLabel || 'All saved' }}
        </button>
        <button
          v-for="folder in folders"
          :key="folder.id"
          class="apply-choice"
          type="button"
          @click="pick({ folderId: folder.id })"
        >
          {{ folder.name }}
          <span
            v-if="folderIds?.includes(folder.id)"
            class="apply-choice-note"
          >already in</span>
        </button>
      </div>
      <button
        v-if="allowRemove"
        class="apply-choice apply-remove"
        type="button"
        @click="remove"
      >
        Remove
      </button>
    </div>
  </div>
</template>
