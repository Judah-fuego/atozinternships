<script setup lang="ts">
import { SITE_NAME, SITE_URL, siteUrl } from '~/utils/site'

useHead({
  link: [
    { key: 'icon-svg', rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg?v=3' },
    { key: 'icon-png', rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32.png?v=3' },
    { key: 'icon-ico', rel: 'icon', href: '/favicon.ico?v=3' },
    { key: 'apple-touch', rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png?v=3' },
  ],
  script: [
    {
      key: 'ld-website',
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE_NAME,
        url: SITE_URL,
        description: 'Free internship finder for college students. Search open internships and apply on the company page.',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${siteUrl('/')}?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      }),
    },
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
