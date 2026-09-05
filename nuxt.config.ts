export default defineNuxtConfig({
  compatibilityDate: '2026-09-05',
  devtools: { enabled: false },
  modules: ['@vercel/analytics/nuxt'],
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: 'atozinternships.com',
      htmlAttrs: { lang: 'en' },
      meta: [
        { name: 'description', content: 'Free internship search for college students. No account. Apply on the company page, save folders, and track applications here.' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [
        { key: 'icon-svg', rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg?v=3' },
        { key: 'icon-png', rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32.png?v=3' },
        { key: 'icon-ico', rel: 'icon', href: '/favicon.ico?v=3' },
        { key: 'apple-touch', rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png?v=3' },
      ],
    },
  },
  nitro: {
    prerender: {
      crawlLinks: false,
    },
  },
  vite: {
    server: {
      watch: {
        ignored: ['**/node_modules/**', '**/app/data/listings.json'],
      },
    },
  },
})
