import type { CharacterStyleOverride, StyleRun } from '@kalka/scene-graph'
import { parseCSSColor, parseCSSNumber } from '@kalka/scene-graph/css'

import type { DesignNode, DesignStyleDeclaration } from '../types'
import { paintColor } from './paint'

function decorationFromCSS(value: string): CharacterStyleOverride['textDecoration'] | undefined {
  if (value === 'underline') return 'UNDERLINE'
  if (value === 'line-through') return 'STRIKETHROUGH'
  if (value === 'none') return 'NONE'
  return undefined
}

/**
 * The part of a text's style a run's CSS changes, the inverse of `characterStyleToCSS`: only
 * what the declarations set, so the rest keeps inheriting from the text layer.
 */
export function characterStyleFromCSS(style: DesignStyleDeclaration): CharacterStyleOverride {
  const override: CharacterStyleOverride = {}
  const family = style['font-family']?.split(',')[0]?.replaceAll(/["']/g, '').trim()
  if (family) override.fontFamily = family
  const size = parseCSSNumber(style['font-size'])
  if (size !== null) override.fontSize = size
  const weight = parseCSSNumber(style['font-weight'])
  if (weight !== null) override.fontWeight = weight
  if ('font-style' in style) override.italic = style['font-style'] === 'italic'
  const letterSpacing = parseCSSNumber(style['letter-spacing'])
  if (letterSpacing !== null) override.letterSpacing = letterSpacing
  const lineHeight = parseCSSNumber(style['line-height'])
  if (lineHeight !== null) override.lineHeight = lineHeight
  const decoration = style['text-decoration-line']
  const textDecoration = decoration ? decorationFromCSS(decoration.trim()) : undefined
  if (textDecoration) override.textDecoration = textDecoration
  const color = parseCSSColor(style.color)
  if (color) override.fills = [{ type: 'SOLID', ...paintColor(color), visible: true }]
  return override
}

export interface TextContent {
  text: string
  styleRuns: StyleRun[]
}

/**
 * A text element's characters and style runs: plain text keeps the layer's own style, an inline
 * element with a `style` becomes a run with that style, and `<br>` a line break.
 */
export function textContentFromChildren(children: readonly DesignNode[]): TextContent {
  let text = ''
  const styleRuns: StyleRun[] = []
  const visit = (nodes: readonly DesignNode[], runStyle: DesignStyleDeclaration | undefined) => {
    for (const node of nodes) {
      if (node.type === 'text') {
        text += node.text
        continue
      }
      if (node.tagName.toLowerCase() === 'br') {
        text += '\n'
        continue
      }
      const start = text.length
      const style = { ...runStyle, ...node.inlineStyle }
      visit(node.children, style)
      // Runs do not nest: an element inside a run takes the run's style.
      if (runStyle) continue
      const override = characterStyleFromCSS(style)
      const length = text.length - start
      if (length > 0 && Object.keys(override).length > 0)
        styleRuns.push({ start, length, style: override })
    }
  }
  visit(children, undefined)
  return { text, styleRuns }
}
