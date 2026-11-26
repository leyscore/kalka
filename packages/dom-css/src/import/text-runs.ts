import {
  compactListLines,
  urlHyperlink,
  type CharacterStyleOverride,
  type SceneNode,
  type StyleRun,
  type TextHyperlink,
  type TextListLine
} from '@kalka/scene-graph'
import { parseCSSColor, parseCSSNumber } from '@kalka/scene-graph/css'
import { paintColor } from '@kalka/scene-graph/css-model'

import type { DesignElement, DesignNode, DesignStyleDeclaration } from '../types'

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

/** The link an `<a href>` opens, as a run's hyperlink; none for another element or address. */
export function elementHyperlink(element: DesignElement): TextHyperlink | undefined {
  if (element.tagName.toLowerCase() !== 'a') return undefined
  const href = element.attrs.href
  return href ? (urlHyperlink(href) ?? undefined) : undefined
}

export interface TextContent {
  text: string
  styleRuns: StyleRun[]
  /** Set when the text is written as paragraph blocks, as the projection writes them. */
  paragraphs?: Pick<SceneNode, 'listLines' | 'paragraphSpacing' | 'paragraphIndent' | 'listSpacing'>
}

const BLOCK_TAGS = new Set(['p', 'div', 'ul', 'ol', 'li'])

function isBlock(node: DesignNode): node is DesignElement {
  return node.type === 'element' && BLOCK_TAGS.has(node.tagName.toLowerCase())
}

/** The bottom margin a block's CSS sets, from `margin-bottom` or the `margin` shorthand. */
function bottomMargin(style: DesignStyleDeclaration | undefined): number | null {
  const longhand = parseCSSNumber(style?.['margin-bottom'] ?? style?.['margin-block-end'])
  if (longhand !== null) return longhand
  const shorthand: string | undefined = style?.margin
  const values = shorthand?.trim().split(/\s+/) ?? []
  return parseCSSNumber(values.length >= 3 ? values[2] : values[0])
}

interface BlockParagraph {
  children: readonly DesignNode[]
  list: TextListLine
}

/** A text's paragraphs from its blocks: `<p>` and `<div>`, and the items of its lists. */
function blockParagraphs(children: readonly DesignNode[], level: number): BlockParagraph[] {
  const paragraphs: BlockParagraph[] = []
  const plain: TextListLine = { type: 'NONE', level: 0 }
  for (const child of children) {
    if (child.type === 'text') {
      if (child.text.trim()) paragraphs.push({ children: [child], list: plain })
      continue
    }
    const tag = child.tagName.toLowerCase()
    if (tag === 'ul' || tag === 'ol') {
      const type = tag === 'ol' ? 'ORDERED' : 'UNORDERED'
      for (const item of child.children) {
        if (item.type !== 'element' || item.tagName.toLowerCase() !== 'li') continue
        const inline = item.children.filter((node) => !isBlock(node))
        paragraphs.push({ children: inline, list: { type, level } })
        const nested = item.children.filter(isBlock)
        paragraphs.push(...blockParagraphs(nested, level + 1))
      }
    } else if (isBlock(child)) {
      paragraphs.push({ children: child.children, list: plain })
    } else {
      paragraphs.push({ children: [child], list: plain })
    }
  }
  return paragraphs
}

/** The top margin a block's CSS sets, from `margin-top` or the `margin` shorthand. */
function topMargin(style: DesignStyleDeclaration | undefined): number | null {
  const longhand = parseCSSNumber(style?.['margin-top'] ?? style?.['margin-block-start'])
  if (longhand !== null) return longhand
  const shorthand: string | undefined = style?.margin
  return parseCSSNumber(shorthand?.trim().split(/\s+/)[0])
}

function isList(node: DesignNode): node is DesignElement {
  return node.type === 'element' && ['ul', 'ol'].includes(node.tagName.toLowerCase())
}

/**
 * The list spacing as the projection writes it: the space below an item that has another after
 * it, or above a list nested in an item.
 */
function itemSpacing(lists: readonly DesignElement[], nested: boolean): number | null {
  for (const list of lists) {
    if (nested) {
      const above = topMargin(list.inlineStyle)
      if (above) return above
    }
    const items = list.children.filter(
      (item): item is DesignElement =>
        item.type === 'element' && item.tagName.toLowerCase() === 'li'
    )
    for (const [index, item] of items.entries()) {
      const below = index < items.length - 1 ? bottomMargin(item.inlineStyle) : null
      if (below) return below
      const inner = itemSpacing(item.children.filter(isList), true)
      if (inner !== null) return inner
    }
  }
  return null
}

/** The spacings and indent the first paragraph blocks set, as the projection writes them. */
function blockSpacing(children: readonly DesignNode[]) {
  const blocks = children.filter(isBlock)
  const spaced = blocks.length > 1 ? bottomMargin(blocks[0]?.inlineStyle) : null
  const first = blocks.find((block) => block.tagName.toLowerCase() === 'p')
  const indent = parseCSSNumber(first?.inlineStyle?.['text-indent'])
  return {
    paragraphSpacing: spaced ?? 0,
    paragraphIndent: indent ?? 0,
    listSpacing: itemSpacing(blocks.filter(isList), false) ?? 0
  }
}

/**
 * A text element's characters and style runs: plain text keeps the layer's own style, an inline
 * element with a `style` becomes a run with that style, and `<br>` a line break. A text written
 * as blocks, paragraphs and lists, has a line per paragraph and keeps each one's list.
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
      const hyperlink = elementHyperlink(node)
      if (hyperlink) override.hyperlink = hyperlink
      const length = text.length - start
      if (length > 0 && Object.keys(override).length > 0)
        styleRuns.push({ start, length, style: override })
    }
  }
  if (!children.some(isBlock)) {
    visit(children, undefined)
    return { text, styleRuns }
  }
  const paragraphs = blockParagraphs(children, 0)
  paragraphs.forEach((paragraph, index) => {
    if (index > 0) text += '\n'
    // A paragraph holding only a line break is an empty one, the break keeping its line.
    const empty = paragraph.children.every(
      (node) => node.type === 'element' && node.tagName.toLowerCase() === 'br'
    )
    if (!empty) visit(paragraph.children, undefined)
  })
  return {
    text,
    styleRuns,
    paragraphs: {
      ...blockSpacing(children),
      listLines: compactListLines(paragraphs.map((paragraph) => paragraph.list))
    }
  }
}
