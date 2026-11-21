import type { WebFontFetch } from '#core/text/web-fonts'

/** A family the fake catalogue serves. */
export interface FakeCatalogueFamily {
  id: string
  family: string
  license?: string
  variable?: boolean
  weights?: number[]
  styles?: Array<'normal' | 'italic'>
  /** Scripts the family is split into, with the characters each covers. */
  subsets?: Record<string, string>
  /** Whether its package serves a licence file. */
  licenseFile?: boolean
}

/** Font bytes that name the file they stand for, so a test can tell files apart. */
export function fakeFontBytes(name: string): Uint8Array {
  return new TextEncoder().encode(`wOF2${name}`)
}

/**
 * Fontsource's API and CDN as `fetch` answers them for `families`, recording every URL asked
 * for, so a test downloads real-shaped responses without the network.
 */
export function fakeFontCatalogue(families: readonly FakeCatalogueFamily[]) {
  const requests: string[] = []
  const json = (value: unknown) => new Response(JSON.stringify(value))
  const missing = () => new Response('Not found', { status: 404 })
  const byId = new Map(families.map((family) => [family.id, family]))
  const subsetsOf = (family: FakeCatalogueFamily) => family.subsets ?? { latin: 'U+0000-00FF' }

  const fetch: WebFontFetch = async (url) => {
    requests.push(url)
    const { hostname, pathname } = new URL(url)
    if (hostname === 'api.fontsource.org') {
      if (pathname === '/v1/fonts')
        return json(
          families.map((family) => ({
            id: family.id,
            family: family.family,
            category: 'sans-serif',
            license: family.license ?? 'OFL-1.1',
            weights: family.weights ?? [400, 700],
            styles: family.styles ?? ['normal'],
            variable: family.variable ?? false
          }))
        )
      const [, , kind, id] = pathname.split('/')
      const family = byId.get(decodeURIComponent(id))
      if (!family) return missing()
      if (kind === 'variable')
        return json({ family: family.family, axes: { wght: { min: '100', max: '900' } } })
      const subsets = subsetsOf(family)
      const variants: Record<string, Record<string, Record<string, unknown>>> = {}
      for (const weight of family.weights ?? [400, 700]) {
        variants[String(weight)] = {}
        for (const style of family.styles ?? ['normal']) {
          variants[String(weight)][style] = Object.fromEntries(
            Object.keys(subsets).map((subset) => {
              const base = `https://cdn.jsdelivr.net/fontsource/fonts/${family.id}@5.0.0/${subset}-${weight}-${style}`
              return [subset, { url: { woff2: `${base}.woff2`, ttf: `${base}.ttf` } }]
            })
          )
        }
      }
      return json({
        id: family.id,
        family: family.family,
        license: family.license ?? 'OFL-1.1',
        variable: family.variable ?? false,
        defSubset: 'latin',
        unicodeRange: subsets,
        variants
      })
    }
    if (hostname === 'cdn.jsdelivr.net') {
      if (pathname.endsWith('/LICENSE')) {
        const id = pathname.split('/').at(-2) ?? ''
        return byId.get(id)?.licenseFile === false
          ? missing()
          : new Response(`Copyright ${byId.get(id)?.family}\nSIL OPEN FONT LICENSE Version 1.1\n`)
      }
      return new Response(fakeFontBytes(pathname.split('/').at(-1) ?? ''))
    }
    return missing()
  }
  return { fetch, requests }
}
