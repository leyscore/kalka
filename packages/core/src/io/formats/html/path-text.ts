import type { DesignElement, DesignNode } from '@open-pencil/dom-css/export'
import type { DerivedTextGlyph, SceneNode } from '@open-pencil/scene-graph'
import { colorToCSS } from '@open-pencil/scene-graph/color'

import { geometryBlobToSVGPath } from '#core/io/formats/svg/paths'

function round(value: number): number {
  return Math.round(value * 1000) / 1000
}

/**
 * The glyph's outline from font units to the layer: on the path at (x, y), resized, turned
 * along the path, then scaled to the font size with font space's y axis flipped. The same chain
 * as the canvas renderer's `applyGlyphEmTransform`, so fills and the saved stroke geometry stay
 * registered.
 */
function glyphTransform(glyph: DerivedTextGlyph): string {
  const parts = [`translate(${round(glyph.x)} ${round(glyph.y)})`]
  const scaleX = glyph.scaleX ?? 1
  const scaleY = glyph.scaleY ?? 1
  if (scaleX !== 1 || scaleY !== 1) parts.push(`scale(${round(scaleX)} ${round(scaleY)})`)
  const rotation = glyph.rotation ?? 0
  if (rotation !== 0) parts.push(`rotate(${round((-rotation * 180) / Math.PI)})`)
  parts.push(`scale(${round(glyph.fontSize)} ${round(-glyph.fontSize)})`)
  return parts.join(' ')
}

function path(d: string, fill: string): DesignNode {
  return { type: 'element', tagName: 'path', attrs: { d, fill }, children: [] }
}

/** The first visible solid paint as CSS, or null when nothing solid shows. */
function solidPaint(paints: SceneNode['fills']): string | null {
  const paint = paints.find((candidate) => candidate.visible && candidate.type === 'SOLID')
  if (!paint) return null
  return colorToCSS({ ...paint.color, a: paint.color.a * paint.opacity })
}

/**
 * Text set on a path, which CSS cannot lay out, as an SVG of the glyph outlines the file saved
 * along the curve, with its saved stroke outline underneath. Null for any other layer, and for
 * path text whose glyphs were not saved, which then draws as plain text.
 */
export function pathTextElement(node: SceneNode): DesignElement | null {
  if (node.type !== 'TEXT' || node.textPathData === null) return null
  const glyphs = node.derivedTextGlyphs
  if (!glyphs?.length) return null
  const children: DesignNode[] = []
  const stroke = solidPaint(node.strokes)
  if (stroke) {
    for (const geometry of node.strokeGeometry) {
      const d = geometryBlobToSVGPath(geometry.commandsBlob)
      if (d) children.push(path(d, stroke))
    }
  }
  const fill = solidPaint(node.fills) ?? 'currentColor'
  for (const glyph of glyphs) {
    const d = geometryBlobToSVGPath(glyph.commandsBlob, 4)
    if (!d) continue
    const run =
      glyph.firstCharacter === undefined
        ? undefined
        : node.styleRuns.find(
            (candidate) =>
              glyph.firstCharacter !== undefined &&
              glyph.firstCharacter >= candidate.start &&
              glyph.firstCharacter < candidate.start + candidate.length
          )
    const runFill = run?.style.fills ? solidPaint(run.style.fills) : null
    children.push({
      type: 'element',
      tagName: 'path',
      attrs: { d, fill: runFill ?? fill, transform: glyphTransform(glyph) },
      children: []
    })
  }
  return {
    type: 'element',
    tagName: 'svg',
    attrs: {
      xmlns: 'http://www.w3.org/2000/svg',
      width: String(round(node.width)),
      height: String(round(node.height)),
      viewBox: `0 0 ${round(node.width)} ${round(node.height)}`,
      'aria-label': node.text,
      role: 'img'
    },
    // The lettering follows its curve past the text box, as it does in Figma.
    inlineStyle: { overflow: 'visible' },
    children
  }
}
