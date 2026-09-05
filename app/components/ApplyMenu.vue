<script setup lang="ts">
const props = defineProps<{
  company: string
  role: string
  url: string
  folders?: Array<{ id: string, name: string }>
  folderIds?: string[]
}>()

const emit = defineEmits<{
  apply: [payload: { folderId?: string, newFolder?: string }]
}>()

function apply(payload: { folderId?: string, newFolder?: string } = {}) {
  emit('apply', payload)
  window.open(props.url, '_blank', 'noopener,noreferrer')
}
</script>

<template>
  <FolderPicker
    class="apply-menu"
    :folders="folders"
    :folder-ids="folderIds"
    title="Save to a folder, then open the company page."
    @pick="apply"
  >
    <template #default="{ open, toggle }">
      <button
        class="apply"
        type="button"
        :aria-expanded="open"
        aria-haspopup="dialog"
        :aria-label="`Apply to ${role} at ${company}`"
        @click.stop="toggle"
      >
        Apply
      </button>
    </template>
  </FolderPicker>
</template>
