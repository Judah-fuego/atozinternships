<script setup lang="ts">
import { companyInitial, companyLogoUrl } from '~/utils/companyLogo'

const props = defineProps<{
  company: string
  url: string
}>()

const failed = ref(false)
const logo = computed(() => companyLogoUrl(props.company, props.url))
const initial = computed(() => companyInitial(props.company))

watch(logo, () => {
  failed.value = false
})
</script>

<template>
  <img
    v-if="logo && !failed"
    class="mark"
    :src="logo"
    alt=""
    width="18"
    height="18"
    loading="lazy"
    decoding="async"
    @error="failed = true"
  >
  <span
    v-else
    class="mark-fallback"
    aria-hidden="true"
  >{{ initial }}</span>
</template>
