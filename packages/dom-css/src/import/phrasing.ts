import { isEqual } from 'es-toolkit'

import type { CharacterStyleOverride, StyleRun } from '@open-pencil/scene-graph'

import type { DesignElement, DesignNode, DesignStyleDeclaration } from '../types'
import { mergedStyle, pickStyle } from './css-values'
import { inheritedTextStyle } from './measured'
import { characterStyleFromCSS, type TextContent } from './text-runs'

/**
 * Paragraphs as text layers: a block whose content is only text and inline elements (`a`,
 * `strong`, `span`...) becomes one text layer, its inline elements style runs, as a sentence with
 * a link in it is one text in a design tool, not words placed side by side.
 */

const INLINE_TAGS = new Set([
  'a',
  'abbr',
  'b',
  'bdi',
  'bdo',
  'br',
  'cite',
  'code',
  'del',
  'dfn',
  'em',
  'i',
  'ins',
  'kbd',
  'mark',
  'q',
  's',
  'samp',
  'small',
  'span',
  'strong',
  'sub',
  'sup',
  'time',
  'u',
  'var'
])

const NONE = /^(?:none|0px|0|rgba\(0, 0, 0, 0\)|transparent)?$/

/** `background-clip: text`: the background, a gradient most often, paints the letters. */
export function clipsBackgroundToText(style: DesignStyleDeclaration): boolean {
  return [pickStyle(style, 'background-clip'), pickStyle(style, '-webkit-background-clip')].some(
    (value) => value?.trim() === 'text'
  )
}

/** Whether an element paints a box of its own: a background, a border, padding or a shadow. */
export function paintsBox(style: DesignStyleDeclaration): boolean {
  const painted = (property: string) => !NONE.test(pickStyle(style, property)?.trim() ?? '')
  return (
    painted('background-color') ||
    (painted('background-image') && !clipsBackgroundToText(style)) ||
    painted('box-shadow') ||
    ['top', 'right', 'bottom', 'left'].some(
      (side) => painted(`border-${side}-width`) || painted(`padding-${side}`)
    )
  )
}

function isInlineRun(node: DesignNode): boolean {
  if (node.type === 'text') return true
  if (!INLINE_TAGS.has(node.tagName.toLowerCase())) return false
  const style = mergedStyle(node)
  const display = pickStyle(style, 'display') ?? 'inline'
  if (node.tagName.toLowerCase() !== 'br' && display !== 'inline') return false
  return !paintsBox(style) && node.children.every(isInlineRun)
}

/** Whether an element holds a run of text and inline elements only, with some text in it. */
export function isPhrasingBlock(element: DesignElement): boolean {
  const hasText = (node: DesignNode): boolean =>
    node.type === 'text' ? node.text.trim().length > 0 : node.children.some(hasText)
  return element.children.length > 0 && element.children.every(isInlineRun) && hasText(element)
}

function override(base: CharacterStyleOverride, style: CharacterStyleOverride) {
  const changes: CharacterStyleOverride = {}
  for (const key of Object.keys(style) as (keyof CharacterStyleOverride)[])
    if (!isEqual(style[key], base[key])) Object.assign(changes, { [key]: style[key] })
  return changes
}

/**
 * The text of a phrasing block as a browser shows it, white space collapsed, with a style run
 * for each inline element whose type differs from the block's.
 */
export function phrasingContent(element: DesignElement): TextContent {
  const base = characterStyleFromCSS(inheritedTextStyle(mergedStyle(element)))
  let text = ''
  const styleRuns: StyleRun[] = []
  const append = (piece: string) => {
    const collapsed = piece.replace(/[\t\n\r ]+/g, ' ')
    text +=
      text.endsWith(' ') || text.endsWith('\n') || text === ''
        ? collapsed.replace(/^ /, '')
        : collapsed
  }
  const visit = (nodes: readonly DesignNode[]) => {
    for (const node of nodes) {
      if (node.type === 'text') {
        append(node.text)
        continue
      }
      if (node.tagName.toLowerCase() === 'br') {
        text = text.replace(/ $/, '') + '\n'
        continue
      }
      const start = text.length
      visit(node.children)
      const style = override(base, characterStyleFromCSS(inheritedTextStyle(mergedStyle(node))))
      const length = text.length - start
      if (length > 0 && Object.keys(style).length > 0) styleRuns.push({ start, length, style })
    }
  }
  visit(element.children)
  const trimmed = text.replace(/\s+$/, '')
  return {
    text: trimmed,
    styleRuns: styleRuns
      .map((run) => ({ ...run, length: Math.min(run.length, trimmed.length - run.start) }))
      .filter((run) => run.length > 0)
  }
}
