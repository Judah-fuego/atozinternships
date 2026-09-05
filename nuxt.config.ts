export default defineNuxtConfig({
  compatibilityDate: '2026-09-05',
  devtools: { enabled: false },
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: 'atozinternships.com',
      htmlAttrs: { lang: 'en' },
      meta: [
        { name: 'description', content: 'Free internship search for college students. No account. Apply on the company page, save folders, and track applications here.' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
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
