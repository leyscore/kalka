import { splitBlockAs } from 'prosemirror-commands'
import type { Node as ProseMirrorNode } from 'prosemirror-model'
import type { Command, EditorState } from 'prosemirror-state'
import { Decoration, DecorationSet, type EditorView } from 'prosemirror-view'

import { LIST_INDENT } from '@kalka/dom-css/export'
import {
  MAX_LIST_LEVEL,
  listStyleType,
  textBlocks,
  textListItems,
  type SceneNode,
  type TextListItem,
  type TextListLine,
  type TextListType
} from '@kalka/scene-graph'

import { styleText } from '#vue/canvas/dom-scene/text/css'

/** A paragraph's list, as its node's attributes hold it. */
export function paragraphList(paragraph: ProseMirrorNode): TextListLine {
  const type = paragraph.attrs.list as TextListType
  const level = paragraph.attrs.level as number
  return type === 'NONE' ? { type, level: 0 } : { type, level }
}

function letters(ordinal: number): string {
  let name = ''
  for (let rest = ordinal; rest > 0; rest = Math.floor((rest - 1) / 26))
    name = String.fromCodePoint(97 + ((rest - 1) % 26)) + name
  return name
}

const ROMAN: readonly [number, string][] = [
  [1000, 'm'],
  [900, 'cm'],
  [500, 'd'],
  [400, 'cd'],
  [100, 'c'],
  [90, 'xc'],
  [50, 'l'],
  [40, 'xl'],
  [10, 'x'],
  [9, 'ix'],
  [5, 'v'],
  [4, 'iv'],
  [1, 'i']
]

function roman(ordinal: number): string {
  let rest = ordinal
  let name = ''
  for (const [value, digits] of ROMAN) {
    while (rest >= value) {
      name += digits
      rest -= value
    }
  }
  return name
}

/** How an ordered list's counter style writes a number. */
const COUNTERS: Readonly<Record<string, (ordinal: number) => string>> = {
  'lower-alpha': letters,
  'lower-roman': roman
}

/**
 * The marker an item shows, as the `<ul>` or `<ol>` the projection writes would draw it: the
 * bullet's keyword, or its number as a string, since paragraphs in the editor are not in a list
 * that counts them.
 */
export function listMarker(item: TextListItem): string {
  const style = listStyleType(item.type, item.level)
  if (item.type === 'UNORDERED') return style
  const counter = COUNTERS[style] ?? String
  return JSON.stringify(`${counter(item.ordinal)}. `)
}

/**
 * Each paragraph drawn as the projection draws the text: space below the last paragraph of each
 * block but the last, the first-line indent outside lists, and list items with their markers
 * and nesting.
 */
export function paragraphDecorations(
  doc: ProseMirrorNode,
  node: Pick<SceneNode, 'paragraphSpacing' | 'paragraphIndent'>
): DecorationSet {
  const lines: TextListLine[] = []
  doc.forEach((paragraph) => lines.push(paragraphList(paragraph)))
  const items = textListItems(lines)
  const blocks = textBlocks(lines)
  // The paragraph each block but the last ends with, which the paragraph spacing follows.
  const blockEnds = new Set(
    blocks.slice(1).map((block) => {
      const first = block.kind === 'list' ? (block.items[0]?.paragraph ?? 0) : block.paragraph
      return first - 1
    })
  )
  const decorations: Decoration[] = []
  doc.forEach((paragraph, offset, index) => {
    const style: Record<string, string> = {}
    if (blockEnds.has(index) && node.paragraphSpacing !== 0)
      style['margin-bottom'] = `${node.paragraphSpacing}px`
    const item = items[index]
    if (item) {
      style.display = 'list-item'
      style['list-style-type'] = listMarker(item)
      style['margin-inline-start'] = `calc(${LIST_INDENT} * ${item.level + 1})`
    } else if (node.paragraphIndent !== 0) {
      style['text-indent'] = `${node.paragraphIndent}px`
    }
    if (Object.keys(style).length === 0) return
    decorations.push(
      Decoration.node(offset, offset + paragraph.nodeSize, { style: styleText(style) })
    )
  })
  return DecorationSet.create(doc, decorations)
}

/** The paragraphs the selection touches, with their positions. */
function selectedParagraphs(state: EditorState): { node: ProseMirrorNode; pos: number }[] {
  const { from, to } = state.selection
  const paragraphs: { node: ProseMirrorNode; pos: number }[] = []
  state.doc.nodesBetween(from, to, (node, pos) => {
    if (node.type.name !== 'paragraph') return true
    paragraphs.push({ node, pos })
    return false
  })
  return paragraphs
}

/**
 * Figma's list buttons on the paragraphs the selection touches: they become a list of the type,
 * or leave the list when they all are one already.
 */
export function setListType(type: TextListType): Command {
  return (state, dispatch) => {
    const paragraphs = selectedParagraphs(state)
    if (paragraphs.length === 0) return false
    const all = paragraphs.every(({ node }) => node.attrs.list === type)
    const next = all ? 'NONE' : type
    if (dispatch) {
      const tr = state.tr
      for (const { node, pos } of paragraphs) {
        const level = next === 'NONE' ? 0 : (node.attrs.level as number)
        tr.setNodeMarkup(pos, null, { list: next, level })
      }
      dispatch(tr)
    }
    return true
  }
}

/** The list item the caret is in, with its position, when the selection is a caret. */
function caretItem(state: EditorState) {
  const { $from, empty } = state.selection
  if (!empty || $from.parent.attrs.list === 'NONE') return null
  return { node: $from.parent, pos: $from.before(), offset: $from.parentOffset }
}

/** Tab and Shift-Tab in a list nest an item one level deeper or bring it back out. */
export function indentListItem(delta: 1 | -1): Command {
  return (state, dispatch) => {
    const paragraphs = selectedParagraphs(state).filter(({ node }) => node.attrs.list !== 'NONE')
    if (paragraphs.length === 0) return false
    if (dispatch) {
      const tr = state.tr
      for (const { node, pos } of paragraphs) {
        const level = Math.min(Math.max(0, (node.attrs.level as number) + delta), MAX_LIST_LEVEL)
        tr.setNodeMarkup(pos, null, { ...node.attrs, level })
      }
      dispatch(tr)
    }
    return true
  }
}

/**
 * Enter in a list starts the next item, as in Figma; on an empty item it leaves the list
 * instead. Outside lists it leaves Enter to the base keymap.
 */
export const splitListItem: Command = (state, dispatch, view) => {
  if (state.selection.$from.parent.attrs.list === 'NONE') return false
  const item = caretItem(state)
  if (item && item.node.content.size === 0) {
    dispatch?.(state.tr.setNodeMarkup(item.pos, null, { list: 'NONE', level: 0 }))
    return true
  }
  return splitBlockAs((node) => ({ type: node.type, attrs: node.attrs }))(state, dispatch, view)
}

/**
 * Backspace at the start of a list item takes its marker away first, as Figma does: a nested
 * item moves out a level, an outer one leaves the list.
 */
export const liftListItem: Command = (state, dispatch) => {
  const item = caretItem(state)
  if (!item || item.offset !== 0) return false
  const level = item.node.attrs.level as number
  const attrs = level > 0 ? { ...item.node.attrs, level: level - 1 } : { list: 'NONE', level: 0 }
  dispatch?.(state.tr.setNodeMarkup(item.pos, null, attrs))
  return true
}

/** What typed at the start of a paragraph starts a list: `- `, `* ` or `1. `. */
const LIST_SHORTCUTS: readonly [RegExp, Exclude<TextListType, 'NONE'>][] = [
  [/^[-*•]$/, 'UNORDERED'],
  [/^1[.)]$/, 'ORDERED']
]

/** Typing `- ` or `1. ` at the start of a paragraph makes it a list item, as in Figma. */
export function handleListShortcut(view: EditorView, from: number, to: number, text: string) {
  const { state } = view
  const { $from, empty } = state.selection
  if (text !== ' ' || !empty || from !== to || $from.parent.attrs.list !== 'NONE') return false
  const typed = $from.parent.textBetween(0, $from.parentOffset)
  const type = LIST_SHORTCUTS.find(([pattern]) => pattern.test(typed))?.[1]
  if (!type) return false
  const tr = state.tr.delete($from.start(), from)
  tr.setNodeMarkup($from.before(), null, { list: type, level: 0 })
  view.dispatch(tr)
  return true
}
