/** Where the site is meant to live; it is not deployed yet. */
export const BASE = 'https://docs.kalka.design'

export const siteHead: [string, Record<string, string>][] = [
  ['link', { rel: 'icon', href: '/favicon.ico', sizes: 'any' }],
  ['link', { rel: 'icon', type: 'image/png', href: '/brand/favicon-96x96.png', sizes: '96x96' }],
  ['link', { rel: 'icon', type: 'image/svg+xml', href: '/brand/favicon.svg' }],
  ['link', { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' }],
  ['link', { rel: 'alternate', type: 'text/plain', title: 'llms.txt', href: '/llms.txt' }],
  ['link', { rel: 'alternate', type: 'text/plain', title: 'llms-full.txt', href: '/llms-full.txt' }],
  ['meta', { property: 'og:type', content: 'website' }],
  ['meta', { property: 'og:site_name', content: 'Kalka developer docs' }],
  ['meta', { name: 'twitter:card', content: 'summary' }],
  ['meta', { name: 'twitter:site', content: '@bedleybuilds' }]
]

type PageDataLike = {
  relativePath: string
  title?: string
  description?: string
  frontmatter: {
    head?: [string, Record<string, string>][]
  }
}

function slugForPath(path: string): string {
  return path
    .replace(/\.md$/, '')
    .replace(/\/index$/, '')
    .replace(/^index$/, '')
    .replace(/\/$/, '')
}

export function applyPageSeo(pageData: PageDataLike): void {
  const slug = slugForPath(pageData.relativePath)
  const pageUrl = slug ? `${BASE}/${slug}` : BASE

  pageData.frontmatter.head ??= []
  const head = pageData.frontmatter.head

  head.push(['link', { rel: 'canonical', href: pageUrl }])
  head.push(['meta', { property: 'og:url', content: pageUrl }])
  head.push(['meta', { property: 'og:locale', content: 'en_US' }])

  if (pageData.title) {
    const ogTitle = `${pageData.title} — Kalka`
    head.push(['meta', { property: 'og:title', content: ogTitle }])
    head.push(['meta', { name: 'twitter:title', content: ogTitle }])
  }

  if (pageData.description) {
    head.push(['meta', { property: 'og:description', content: pageData.description }])
    head.push(['meta', { name: 'twitter:description', content: pageData.description }])
    head.push(['meta', { name: 'description', content: pageData.description }])
  }
}
