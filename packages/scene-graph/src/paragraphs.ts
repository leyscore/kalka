/**
 * A text layer's paragraphs as Figma sets them: line height and letter spacing that follow the
 * font size, space after each paragraph, a first-line indent, and bulleted and numbered lists.
 * A paragraph is a line of the layer's `text`; the canvas, export and the text editor build their
 * blocks from the helpers here so they agree.
 */
import type { SceneNode, TextListLine, TextListType } from './types'

const PLAIN_LINE: TextListLine = { type: 'NONE', level: 0 }

/** The deepest list Kalka nests, as Figma stops at a few levels too. */
export const MAX_LIST_LEVEL = 5

function round(value: number, decimals: number): number {
  const scale = 10 ** decimals
  return Math.round(value * scale) / scale
}

/** A spacing in pixels as a percentage of the font size, to a hundredth of a percent. */
export function spacingPercent(pixels: number, fontSize: number): number {
  return fontSize > 0 ? round((pixels / fontSize) * 100, 2) : 0
}

/** A percentage of the font size in pixels. */
export function pixelsFromPercent(percent: number, fontSize: number): number {
  return round((percent / 100) * fontSize, 4)
}

/**
 * The changes with the spacings set as a percentage of the font size following a new font size,
 * as Figma keeps `150%` at 150% of whatever size the text takes. Spacings the changes set, or
 * that a variable gives, are left as they are.
 */
export function fontRelativeChanges(
  node: SceneNode,
  changes: Partial<SceneNode>
): Partial<SceneNode> {
  const fontSize = changes.fontSize
  if (node.type !== 'TEXT' || fontSize === undefined || fontSize === node.fontSize) return changes
  if (node.fontSize <= 0) return changes
  let derived = changes
  const lineHeightUnit = changes.lineHeightUnit ?? node.lineHeightUnit
  if (
    lineHeightUnit === 'PERCENT' &&
    !('lineHeight' in changes) &&
    node.lineHeight !== null &&
    !node.boundVariables.lineHeight
  ) {
    const percent = spacingPercent(node.lineHeight, node.fontSize)
    derived = { ...derived, lineHeight: pixelsFromPercent(percent, fontSize) }
  }
  const letterSpacingUnit = changes.letterSpacingUnit ?? node.letterSpacingUnit
  if (
    letterSpacingUnit === 'PERCENT' &&
    !('letterSpacing' in changes) &&
    !node.boundVariables.letterSpacing
  ) {
    const percent = spacingPercent(node.letterSpacing, node.fontSize)
    derived = { ...derived, letterSpacing: pixelsFromPercent(percent, fontSize) }
  }
  return derived
}

/** How many paragraphs a text has: one more than its line breaks. */
export function paragraphCount(text: string): number {
  let count = 1
  for (const character of text) if (character === '\n') count++
  return count
}

/** Each paragraph's list, one entry per line of the text, whatever `listLines` holds. */
export function textListLines(node: Pick<SceneNode, 'text' | 'listLines'>): TextListLine[] {
  const count = paragraphCount(node.text)
  return Array.from({ length: count }, (_, index) => {
    const line = node.listLines.at(index)
    if (!line || line.type === 'NONE') return { ...PLAIN_LINE }
    return { type: line.type, level: Math.min(Math.max(0, Math.round(line.level)), MAX_LIST_LEVEL) }
  })
}

/** Lines as `listLines` keeps them: empty when no paragraph is in a list. */
export function compactListLines(lines: readonly TextListLine[]): TextListLine[] {
  return lines.some((line) => line.type !== 'NONE') ? lines.map((line) => ({ ...line })) : []
}

/**
 * Whether the text has paragraphs to set apart: spacing between two paragraphs or more, an
 * indent or a list. A single paragraph's spacing sets nothing apart, so it stays inline.
 */
export function hasParagraphBlocks(
  node: Pick<SceneNode, 'text' | 'paragraphSpacing' | 'paragraphIndent' | 'listLines'>
): boolean {
  return (
    (node.paragraphSpacing !== 0 && node.text.includes('\n')) ||
    node.paragraphIndent !== 0 ||
    node.listLines.some((line) => line.type !== 'NONE')
  )
}

/** The paragraphs, by index, that a range of characters touches. */
export function paragraphsInRange(text: string, start: number, end: number): number[] {
  const first = paragraphCount(text.slice(0, Math.max(0, start))) - 1
  const last = paragraphCount(text.slice(0, Math.max(start, end))) - 1
  return Array.from({ length: last - first + 1 }, (_, index) => first + index)
}

/** The list type the paragraphs share, or null when they differ. */
export function sharedListType(
  lines: readonly TextListLine[],
  paragraphs: readonly number[]
): TextListType | null {
  const types = new Set(paragraphs.map((index) => lines.at(index)?.type ?? 'NONE'))
  return types.size === 1 ? ([...types][0] ?? null) : null
}

/**
 * The text's `listLines` with the paragraphs set to a list type, as Figma's list buttons do:
 * choosing the type they all have already takes them out of the list.
 */
export function withListType(
  node: Pick<SceneNode, 'text' | 'listLines'>,
  paragraphs: readonly number[],
  type: TextListType
): TextListLine[] {
  const lines = textListLines(node)
  const next = sharedListType(lines, paragraphs) === type ? 'NONE' : type
  for (const index of paragraphs) {
    const line = lines.at(index)
    if (!line) continue
    line.type = next
    if (next === 'NONE') line.level = 0
  }
  return compactListLines(lines)
}

/** The CSS `list-style-type` of a list at a nesting level, cycling as browsers nest lists. */
export function listStyleType(type: Exclude<TextListType, 'NONE'>, level: number): string {
  const styles =
    type === 'ORDERED' ? ['decimal', 'lower-alpha', 'lower-roman'] : ['disc', 'circle', 'square']
  return styles[level % styles.length] ?? styles[0]
}

/** A list in a text, its items in order; an item may hold deeper lists after its own line. */
export interface TextListBlock {
  kind: 'list'
  type: Exclude<TextListType, 'NONE'>
  level: number
  items: { paragraph: number; lists: TextListBlock[] }[]
}

/** A paragraph outside any list. */
export interface TextParagraphBlock {
  kind: 'paragraph'
  paragraph: number
}

export type TextBlock = TextParagraphBlock | TextListBlock

/**
 * The text's paragraphs grouped as HTML would hold them: plain paragraphs, and runs of list
 * items as lists, a deeper item nested in the list of the item before it.
 */
export function textBlocks(lines: readonly TextListLine[]): TextBlock[] {
  const blocks: TextBlock[] = []
  // The open lists, outermost first.
  const open: TextListBlock[] = []
  lines.forEach((line, paragraph) => {
    if (line.type === 'NONE') {
      open.length = 0
      blocks.push({ kind: 'paragraph', paragraph })
      return
    }
    const level = Math.min(line.level, open.length)
    open.length = Math.min(open.length, level + 1)
    let list: TextListBlock | undefined = open.at(level)
    if (list && list.type !== line.type) {
      open.length = level
      list = undefined
    }
    if (!list) {
      const created: TextListBlock = { kind: 'list', type: line.type, level, items: [] }
      const parent = open[level - 1]?.items.at(-1)
      if (parent) parent.lists.push(created)
      else blocks.push(created)
      open[level] = created
      list = created
    }
    list.items.push({ paragraph, lists: [] })
  })
  return blocks
}

/** A list item's place: the list it is in, how deep, and its number there from 1. */
export interface TextListItem {
  type: Exclude<TextListType, 'NONE'>
  level: number
  ordinal: number
}

/**
 * Each paragraph's place in its list, as the lists `textBlocks` builds number their items: the
 * count starts again after a paragraph outside the list, and a deeper list counts on its own.
 * Null for a paragraph that is no list item.
 */
export function textListItems(lines: readonly TextListLine[]): (TextListItem | null)[] {
  const items: (TextListItem | null)[] = lines.map(() => null)
  const visit = (list: TextListBlock) =>
    list.items.forEach((item, index) => {
      items[item.paragraph] = { type: list.type, level: list.level, ordinal: index + 1 }
      item.lists.forEach(visit)
    })
  for (const block of textBlocks(lines)) if (block.kind === 'list') visit(block)
  return items
}
