<script setup lang="ts">
import { companyInitial, companyLogoUrl } from '~/utils/companyLogo'

const props = defineProps<{
  company: string
  url: string
}>()

const src = ref<string | null>(null)
const logo = computed(() => companyLogoUrl(props.company, props.url))
const initial = computed(() => companyInitial(props.company))

async function verify(url: string | null) {
  src.value = null
  if (!url) {
    return
  }
  try {
    const res = await fetch(url)
    if (!res.ok) {
      return
    }
    const type = res.headers.get('content-type') || ''
    if (!type.startsWith('image/')) {
      return
    }
    src.value = url
  }
  catch {
    // letter mark
  }
}

onMounted(() => {
  void verify(logo.value)
})

watch(logo, (url) => {
  void verify(url)
})
</script>

<template>
  <img
    v-if="src"
    class="mark"
    :src="src"
    alt=""
    width="18"
    height="18"
  >
  <span
    v-else
    class="mark-fallback"
    aria-hidden="true"
  >{{ initial }}</span>
</template>
