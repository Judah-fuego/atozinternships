export default defineNuxtConfig({
  compatibilityDate: '2026-09-05',
  devtools: { enabled: false },
  modules: ['@vercel/analytics/nuxt'],
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: 'Internship finder — search open internships',
      titleTemplate: '%s · atoz',
      htmlAttrs: { lang: 'en' },
      meta: [
        { name: 'description', content: 'Free internship finder for college students. Search open internships by company, role, and city, then apply on the company page. No account.' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#ffffff' },
      ],
      link: [
        { key: 'icon-svg', rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg?v=3' },
        { key: 'icon-png', rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32.png?v=3' },
        { key: 'icon-ico', rel: 'icon', href: '/favicon.ico?v=3' },
        { key: 'apple-touch', rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png?v=3' },
      ],
    },
  },
  routeRules: {
    '/': { prerender: true },
    '/guide': { prerender: true },
    '/sources': { prerender: true },
    '/folders/**': { headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
  },
  nitro: {
    prerender: {
      crawlLinks: false,
      routes: ['/', '/guide', '/sources'],
    },
  },
  vite: {
    server: {
      watch: {
        ignored: ['**/node_modules/**', '**/app/data/listings.json', '**/app/data/listing-summaries.json'],
      },
    },
  },
})
