import { omit } from 'es-toolkit'

import {
  steppedFontSize,
  steppedFontWeight,
  steppedLetterSpacing,
  steppedLineHeight,
  type TextStep
} from '@kalka/core/editor'
import { weightToStyle } from '@kalka/core/text'
import {
  paragraphCount,
  withListType,
  type CharacterStyleOverride,
  type SceneNode,
  type TextListType
} from '@kalka/scene-graph'

import type { EditorStore } from '@/app/editor/active-store'
import { loadFont } from '@/app/editor/fonts'

type TextAlign = SceneNode['textAlignHorizontal']

/** The text layers a text command acts on: the one being edited, or the selected ones. */
export function targetTextNodes(store: EditorStore): SceneNode[] {
  const editing = store.state.editingTextId
  if (editing) {
    const node = store.graph.getNode(editing)
    return node?.type === 'TEXT' ? [node] : []
  }
  return store.selectedNodes.value.filter((node) => node.type === 'TEXT')
}

/**
 * Applies a character style: to the characters selected in the text being edited, or else to
 * each text layer as a whole, in one undo step.
 */
function applyTextStyle(
  store: EditorStore,
  label: string,
  style: (node: SceneNode) => CharacterStyleOverride
): void {
  const nodes = targetTextNodes(store)
  const [first] = nodes
  if (!first) return
  if (store.state.editingTextId && store.styleTextSelection(first.id, style(first))) return
  store.undo.runBatch(label, () => {
    for (const node of nodes)
      store.updateNodeWithUndo(node.id, wholeLayerStyle(node, style(node)), label)
  })
}

/** A style for a whole layer, which the runs that set the same fields stop overriding. */
function wholeLayerStyle(node: SceneNode, style: CharacterStyleOverride): Partial<SceneNode> {
  const keys = Object.keys(style)
  if (!node.styleRuns.some((run) => keys.some((key) => key in run.style))) return style
  const styleRuns = node.styleRuns
    .map((run) => ({ ...run, style: omit(run.style, keys as (keyof CharacterStyleOverride)[]) }))
    .filter((run) => Object.keys(run.style).length > 0)
  return { ...style, styleRuns }
}

/** Figma's Cmd+Alt+L, T, R and J. */
export function alignText(store: EditorStore, align: TextAlign): void {
  const nodes = targetTextNodes(store)
  if (nodes.length === 0) return
  store.undo.runBatch('Change text alignment', () => {
    for (const node of nodes)
      store.updateNodeWithUndo(node.id, { textAlignHorizontal: align }, 'Change text alignment')
  })
}

/** Figma's Cmd+Shift+> and Cmd+Shift+<. */
export function stepFontSize(store: EditorStore, step: TextStep): void {
  applyTextStyle(store, 'Change font size', (node) => ({
    fontSize: steppedFontSize(node, step)
  }))
}

/** Figma's Alt+Shift+> and Alt+Shift+<. */
export function stepLineHeight(store: EditorStore, step: TextStep): void {
  applyTextStyle(store, 'Change line height', (node) => ({
    lineHeight: steppedLineHeight(node, step)
  }))
}

/** Figma's Alt+> and Alt+<. */
export function stepLetterSpacing(store: EditorStore, step: TextStep): void {
  applyTextStyle(store, 'Change letter spacing', (node) => ({
    letterSpacing: steppedLetterSpacing(node, step)
  }))
}

/**
 * Figma's Cmd+Alt+> and Cmd+Alt+<: the next weight, once its face has loaded, so the layer never
 * names a face still on its way.
 */
export async function stepFontWeight(store: EditorStore, step: TextStep): Promise<void> {
  const nodes = targetTextNodes(store)
  const faces = new Set(
    nodes.map((node) => `${node.fontFamily}\0${weightToStyle(steppedFontWeight(node, step))}`)
  )
  await Promise.all(
    [...faces].map((face) => {
      const [family = '', style = ''] = face.split('\0')
      return loadFont(family, style)
    })
  )
  applyTextStyle(store, 'Change font weight', (node) => ({
    fontWeight: steppedFontWeight(node, step)
  }))
}

/** Figma's Cmd+Shift+X: strikethrough on, or off where it is on everywhere. */
export function toggleStrikethrough(store: EditorStore): void {
  const nodes = targetTextNodes(store)
  const allOn = nodes.length > 0 && nodes.every((node) => node.textDecoration === 'STRIKETHROUGH')
  applyTextStyle(store, 'Toggle strikethrough', () => ({
    textDecoration: allOn ? 'NONE' : 'STRIKETHROUGH'
  }))
}

/**
 * Figma's Cmd+Shift+7 and Cmd+Shift+8: the paragraphs the text edit's selection touches, or every
 * paragraph of each layer, become a list of the type, or leave it when they all are one already.
 */
export function toggleTextList(store: EditorStore, type: TextListType): void {
  const nodes = targetTextNodes(store)
  const [first] = nodes
  if (!first) return
  if (store.state.editingTextId && store.listTextSelection(first.id, type)) return
  store.undo.runBatch('Set list', () => {
    for (const node of nodes) {
      const paragraphs = Array.from({ length: paragraphCount(node.text) }, (_, index) => index)
      store.updateNodeWithUndo(
        node.id,
        { listLines: withListType(node, paragraphs, type) },
        'Set list'
      )
    }
  })
}
