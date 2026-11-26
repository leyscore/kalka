import {
  hasParagraphBlocks,
  listStyleType,
  textBlocks,
  textListLines,
  type CharacterStyleOverride,
  type SceneNode,
  type StyleRun,
  type TextListBlock
} from '@kalka/scene-graph'
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

/** How a text's runs are written. */
export interface TextRunOptions {
  /**
   * Whether a run with a web link is an `<a>`; false inside a link or button, where another
   * `<a>` is not allowed, so the run stays a `<span>`.
   */
  links?: boolean
}

/**
 * A run's element: an `<a>` opening its link in a new tab, as Figma's links do, which takes the
 * text's colour and decoration instead of the browser's link style; a `<span>` otherwise.
 */
function runElement(style: CharacterStyleOverride, text: string, links: boolean): DesignNode {
  const href = links && style.hyperlink?.type === 'URL' ? style.hyperlink.value : undefined
  const children: DesignNode[] = [{ type: 'text', text }]
  if (href === undefined)
    return {
      type: 'element',
      tagName: 'span',
      attrs: {},
      inlineStyle: characterStyleToCSS(style),
      children
    }
  return {
    type: 'element',
    tagName: 'a',
    attrs: { href, target: '_blank', rel: 'noopener noreferrer' },
    inlineStyle: { color: 'inherit', 'text-decoration': 'inherit', ...characterStyleToCSS(style) },
    children
  }
}

/** The characters of `text` from `from` to `to`, plain where no run styles them. */
function runChildren(
  text: string,
  runs: readonly StyleRun[],
  from: number,
  to: number,
  links: boolean
) {
  const children: DesignNode[] = []
  let cursor = from
  for (const run of runs) {
    const start = Math.max(run.start, from)
    const end = Math.min(run.start + run.length, to)
    if (start < cursor || start >= end) continue
    if (start > cursor) children.push({ type: 'text', text: text.slice(cursor, start) })
    children.push(runElement(run.style, text.slice(start, end), links))
    cursor = end
  }
  if (cursor < to) children.push({ type: 'text', text: text.slice(cursor, to) })
  return children
}

type TextBlockNode = Pick<
  SceneNode,
  'text' | 'styleRuns' | 'paragraphSpacing' | 'paragraphIndent' | 'listSpacing' | 'listLines'
>

/** How deep each nested list sits, past the marker of the list around it. */
export const LIST_INDENT = '1.5em'

/**
 * A text with paragraphs set apart, as blocks: a `<p>` per paragraph outside a list, `<ul>` and
 * `<ol>` for lists, a deeper list inside the item before it. Paragraph spacing is the space
 * below each block but the last; list spacing the space below each item but the last of its list
 * and above a nested list, so every item of a list is that far from the next. An empty paragraph
 * keeps its line with a `<br>`.
 */
function textBlockChildren(
  node: TextBlockNode,
  runs: readonly StyleRun[],
  links: boolean
): DesignNode[] {
  const paragraphs = node.text.split('\n')
  const starts: number[] = []
  let offset = 0
  for (const paragraph of paragraphs) {
    starts.push(offset)
    offset += paragraph.length + 1
  }
  const content = (index: number): DesignNode[] => {
    const start = starts[index] ?? 0
    const end = start + (paragraphs[index]?.length ?? 0)
    if (end === start) return [{ type: 'element', tagName: 'br', attrs: {}, children: [] }]
    return runChildren(node.text, runs, start, end, links)
  }
  const margin = (spacing: number) => (spacing === 0 ? '0' : `0 0 ${px(spacing)}`)
  const itemSpacing = node.listSpacing
  // A nested list sits the list spacing below the line of the item it is in.
  const nestedMargin = itemSpacing === 0 ? '0' : `${px(itemSpacing)} 0 0`
  const list = (block: TextListBlock, outerMargin: string): DesignNode => {
    const marker = listStyleType(block.type, block.level)
    return {
      type: 'element',
      tagName: block.type === 'ORDERED' ? 'ol' : 'ul',
      attrs: {},
      inlineStyle: {
        margin: outerMargin,
        'padding-inline-start': LIST_INDENT,
        'list-style-type': marker
      },
      children: block.items.map((item, index) => {
        // Each item names its marker too: a page's reset often takes list styles off items.
        const inlineStyle: DesignStyleDeclaration = { 'list-style-type': marker }
        if (itemSpacing !== 0 && index < block.items.length - 1)
          inlineStyle['margin-bottom'] = px(itemSpacing)
        return {
          type: 'element',
          tagName: 'li',
          attrs: {},
          inlineStyle,
          children: [
            ...content(item.paragraph),
            ...item.lists.map((inner) => list(inner, nestedMargin))
          ]
        }
      })
    }
  }
  const blocks = textBlocks(textListLines(node))
  return blocks.map((block, index) => {
    const spacing = index < blocks.length - 1 ? node.paragraphSpacing : 0
    if (block.kind === 'list') return list(block, margin(spacing))
    const inlineStyle: DesignStyleDeclaration = { margin: margin(spacing) }
    if (node.paragraphIndent !== 0) inlineStyle['text-indent'] = px(node.paragraphIndent)
    return {
      type: 'element',
      tagName: 'p',
      attrs: {},
      inlineStyle,
      children: content(block.paragraph)
    }
  })
}

/**
 * A text layer's characters as DOM children: plain text where the layer's own style applies,
 * a span with the run's CSS where a style run overrides it, a link where the run has one. A text with paragraph spacing, an
 * indent or a list is written as blocks instead.
 */
export function textRunChildren(node: TextBlockNode, options: TextRunOptions = {}): DesignNode[] {
  const { text } = node
  const links = options.links ?? true
  const runs = cleanRuns(node.styleRuns, text.length)
  if (hasParagraphBlocks(node)) return textBlockChildren(node, runs, links)
  if (runs.length === 0) return [{ type: 'text', text }]
  return runChildren(text, runs, 0, text.length, links)
}
