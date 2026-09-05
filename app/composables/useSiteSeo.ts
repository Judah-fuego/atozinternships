import { SITE_NAME, siteUrl } from '~/utils/site'

export function useSiteSeo(options: {
  title: string
  description: string
  path: string
  index?: boolean
}) {
  const url = siteUrl(options.path)
  const branded = `${options.title} · ${SITE_NAME}`
  const index = options.index ?? true

  useSeoMeta({
    title: options.title,
    description: options.description,
    ogTitle: branded,
    ogDescription: options.description,
    ogType: 'website',
    ogUrl: url,
    ogSiteName: SITE_NAME,
    ogLocale: 'en_US',
    twitterCard: 'summary',
    twitterTitle: branded,
    twitterDescription: options.description,
    robots: index ? 'index, follow' : 'noindex, nofollow',
  })

  useHead({
    link: [{ key: 'canonical', rel: 'canonical', href: url }],
  })
}

export function useJsonLd(key: string, data: Record<string, unknown>) {
  useHead({
    script: [
      {
        key,
        type: 'application/ld+json',
        innerHTML: JSON.stringify(data),
      },
    ],
  })
}
