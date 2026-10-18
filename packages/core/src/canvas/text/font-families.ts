import { uniq } from 'es-toolkit/array'

import { DEFAULT_INTER_VERSION, type InterVersion } from '@kalka/scene-graph'

import { ResourceCache } from '#core/cache/resource'
import { DEFAULT_FONT_FAMILY } from '#core/constants'
import { fontManager, weightToStyle } from '#core/text/fonts'
import { fontFamilyKey } from '#core/text/inter'

const familiesCache = new ResourceCache<string, string[]>({ maxEntries: 256 })

export function resolveParagraphFontFamilies(
  primary: string,
  style: string,
  arabicFallbacks: readonly string[] = fontManager.getArabicFallbackFamilies(),
  cjkFallbacks: readonly string[] = fontManager.getCJKFallbackFamilies(),
  symbolFallbacks: readonly string[] = fontManager.getSymbolFallbackFamilies(),
  /** The family text falls back to first, the document's Inter as Kalka loads it. */
  defaultFamily: string = DEFAULT_FONT_FAMILY
): string[] {
  const renderPrimary = fontManager.renderFamily(primary, style)
  const renderArabicFallbacks = arabicFallbacks.map((family) =>
    fontManager.renderFamily(family, 'Regular')
  )
  const renderCJKFallbacks = cjkFallbacks.map((family) =>
    fontManager.renderFamily(family, 'Regular')
  )
  const renderSymbolFallbacks = symbolFallbacks.map((family) =>
    fontManager.renderFamily(family, 'Regular')
  )
  const key = [
    renderPrimary,
    defaultFamily,
    ...renderArabicFallbacks,
    '',
    ...renderCJKFallbacks,
    '',
    ...renderSymbolFallbacks
  ].join('\0')
  const cached = familiesCache.peek(key)
  if (cached) return cached
  const families = [renderPrimary]
  // Inter 4 stays last before the script fallbacks: it is always loaded, so a glyph the
  // document's Inter 3.19 lacks, or a style of it not loaded yet, still draws.
  families.push(defaultFamily, DEFAULT_FONT_FAMILY)
  families.push(...renderArabicFallbacks, ...renderCJKFallbacks, ...renderSymbolFallbacks)
  const resolved = uniq(families)
  familiesCache.set(key, resolved)
  return resolved
}

/**
 * The families each run of a paragraph tries, in order, for a document using `interVersion`:
 * its own family as Kalka loads it, the document's Inter, then the fallbacks loaded so far.
 */
export function paragraphFontFamilyResolver(interVersion: InterVersion = DEFAULT_INTER_VERSION) {
  const arabicFallbacks = fontManager.getArabicFallbackFamilies()
  const cjkFallbacks = fontManager.getCJKFallbackFamilies()
  const symbolFallbacks = fontManager.getSymbolFallbackFamilies()
  const defaultFamily = fontFamilyKey(DEFAULT_FONT_FAMILY, interVersion)
  return (primary: string, weight: number, italic = false) =>
    resolveParagraphFontFamilies(
      fontFamilyKey(primary, interVersion),
      weightToStyle(weight, italic),
      arabicFallbacks,
      cjkFallbacks,
      symbolFallbacks,
      defaultFamily
    )
}
