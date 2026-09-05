<script setup lang="ts">
useHead({
  link: [
    { key: 'icon-svg', rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg?v=3' },
    { key: 'icon-png', rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32.png?v=3' },
    { key: 'icon-ico', rel: 'icon', href: '/favicon.ico?v=3' },
    { key: 'apple-touch', rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png?v=3' },
  ],
})
</script>

<template>
  <div class="app">
    <AppHeader />
    <main class="main">
      <NuxtPage />
    </main>
  </div>
</template>
