<script setup lang="ts">
defineProps<{
  company: string
  role: string
  url: string
}>()
</script>

<template>
  <a
    class="apply apply-menu"
    :href="url"
    target="_blank"
    rel="noopener noreferrer"
    :aria-label="`Apply to ${role} at ${company}`"
    @click.stop
  >
    Apply
  </a>
</template>
