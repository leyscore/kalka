import { fontFallbackScriptForCharacter } from '#core/text/coverage'
import type { FontFallbackScript } from '#core/text/fallbacks'

export interface ObservedShapedLine {
  textRange: { last: number }
  runs: Array<{ glyphs: Uint16Array; offsets: Uint32Array }>
}

interface CodePointSpan {
  character: string
  utf8Start: number
  utf16Start: number
}

function codePointSpans(text: string): { spans: CodePointSpan[]; utf8Length: number } {
  const spans: CodePointSpan[] = []
  let utf8Start = 0
  let utf16Start = 0
  const encoder = new TextEncoder()

  for (const character of text) {
    spans.push({ character, utf8Start, utf16Start })
    utf8Start += encoder.encode(character).byteLength
    utf16Start += character.length
  }

  return { spans, utf8Length: utf8Start }
}

export function missingGlyphCharacters(
  text: string,
  lines: readonly ObservedShapedLine[]
): string[] {
  if (!text || lines.length === 0) return []
  const { spans, utf8Length } = codePointSpans(text)
  const finalOffset = lines.at(-1)?.textRange.last
  const offsetsAreUtf16 = finalOffset === text.length && utf8Length !== text.length
  const spansByOffset = new Map<number, string>()
  for (const span of spans) {
    spansByOffset.set(offsetsAreUtf16 ? span.utf16Start : span.utf8Start, span.character)
  }

  const missing = new Set<string>()
  for (const line of lines) {
    for (const run of line.runs) {
      for (let index = 0; index < run.glyphs.length; index++) {
        if (run.glyphs[index] !== 0) continue
        const offset = run.offsets[index]
        const character = spansByOffset.get(offset)
        if (character) missing.add(character)
      }
    }
  }
  return [...missing]
}

export function missingGlyphScripts(
  text: string,
  lines: readonly ObservedShapedLine[]
): FontFallbackScript[] {
  const scripts = new Set<FontFallbackScript>()
  for (const character of missingGlyphCharacters(text, lines)) {
    const script = fontFallbackScriptForCharacter(character)
    if (script) scripts.add(script)
  }
  return [...scripts]
}
