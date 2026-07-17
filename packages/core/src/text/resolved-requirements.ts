import { textNeededFallbackScripts } from '#core/text/coverage'
import type { FontFallbackScript } from '#core/text/fallbacks'
import type { GraphFontRequirements } from '#core/text/requirements'

export function missingGraphFontScripts(requirements: GraphFontRequirements): FontFallbackScript[] {
  const scripts = new Set<FontFallbackScript>()
  for (const node of requirements.nodes) {
    if (node.type !== 'TEXT') continue
    for (const script of textNeededFallbackScripts(node)) scripts.add(script)
  }
  return Array.from(scripts)
}
