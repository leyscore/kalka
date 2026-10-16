import type { CharacterStyleOverride, SceneNode, StyleRun } from '@kalka/scene-graph'
import { fillToCSS } from '@kalka/scene-graph/css-model'

import type { DesignNode, DesignStyleDeclaration } from '../types'

const px = (value: number) => `${value}px`

/**
 * The CSS of a character style override, the part of a text's style a run changes. Only what
 * the override sets is written; the rest inherits from the text layer.
 */
export function characterStyleToCSS(style: CharacterStyleOverride): DesignStyleDeclaration {
  const css: DesignStyleDeclaration = {}
  if (style.fontFamily !== undefined) css['font-family'] = style.fontFamily
  if (style.fontSize !== undefined) css['font-size'] = px(style.fontSize)
  if (style.fontWeight !== undefined) css['font-weight'] = String(style.fontWeight)
  if (style.italic !== undefined) css['font-style'] = style.italic ? 'italic' : 'normal'
  if (style.letterSpacing !== undefined) css['letter-spacing'] = px(style.letterSpacing)
  if (style.lineHeight !== undefined && style.lineHeight !== null)
    css['line-height'] = px(style.lineHeight)
  if (style.textDecoration !== undefined) css['text-decoration-line'] = decorationLine(style)
  const color = style.fills ? fillToCSS(style.fills.at(0)) : undefined
  if (color) css.color = color
  return css
}

function decorationLine(style: CharacterStyleOverride): string {
  if (style.textDecoration === 'UNDERLINE') return 'underline'
  if (style.textDecoration === 'STRIKETHROUGH') return 'line-through'
  return 'none'
}

/** Runs that set something, in order, without overlaps, clipped to the text. */
function cleanRuns(runs: readonly StyleRun[], length: number): StyleRun[] {
  return [...runs]
    .filter((run) => run.length > 0 && Object.keys(run.style).length > 0)
    .sort((a, b) => a.start - b.start)
    .map((run) => ({ ...run, length: Math.min(run.length, length - run.start) }))
    .filter((run) => run.start < length && run.length > 0)
}

/**
 * A text layer's characters as DOM children: plain text where the layer's own style applies,
 * a span with the run's CSS where a style run overrides it.
 */
export function textRunChildren(node: Pick<SceneNode, 'text' | 'styleRuns'>): DesignNode[] {
  const { text } = node
  const runs = cleanRuns(node.styleRuns, text.length)
  if (runs.length === 0) return [{ type: 'text', text }]
  const children: DesignNode[] = []
  let cursor = 0
  for (const run of runs) {
    if (run.start < cursor) continue
    if (run.start > cursor) children.push({ type: 'text', text: text.slice(cursor, run.start) })
    children.push({
      type: 'element',
      tagName: 'span',
      attrs: {},
      inlineStyle: characterStyleToCSS(run.style),
      children: [{ type: 'text', text: text.slice(run.start, run.start + run.length) }]
    })
    cursor = run.start + run.length
  }
  if (cursor < text.length) children.push({ type: 'text', text: text.slice(cursor) })
  return children
}
