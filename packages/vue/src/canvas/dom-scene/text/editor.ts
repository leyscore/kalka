import { baseKeymap } from 'prosemirror-commands'
import { history, redo, undo } from 'prosemirror-history'
import { keymap } from 'prosemirror-keymap'
import type { Node as ProseMirrorNode } from 'prosemirror-model'
import { AllSelection, EditorState, TextSelection, type Command } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'

import type { Editor, ExternalTextEditor } from '@open-pencil/core/editor'
import type { CharacterStyleOverride, SceneNode } from '@open-pencil/scene-graph'

import type { DomSceneProjector } from '#vue/canvas/dom-scene/projector'
import { docToText, textSchema, textToDoc } from '#vue/canvas/dom-scene/text/schema'

type StyleKey = keyof CharacterStyleOverride

/** The style the characters in a range share for `key`, the layer's own where no run sets it. */
function effective(
  doc: ProseMirrorNode,
  from: number,
  to: number,
  node: SceneNode,
  key: StyleKey
): unknown[] {
  const values: unknown[] = []
  doc.nodesBetween(from, to, (child) => {
    if (!child.isText) return
    const style = child.marks[0]?.attrs.style as CharacterStyleOverride | undefined
    values.push(style?.[key] ?? node[key as keyof SceneNode])
  })
  return values
}

/**
 * Sets or clears one style field on the selection, keeping the rest of each run's style. With
 * no selection, it applies to what is typed next.
 */
function setStyle(key: StyleKey, value: unknown): Command {
  return (state, dispatch) => {
    const { from, to, empty } = state.selection
    const type = textSchema.marks.style
    const restyle = (style: CharacterStyleOverride): CharacterStyleOverride => {
      const entries = Object.entries(style).filter(([name]) => name !== key)
      if (value !== undefined) entries.push([key, value])
      return Object.fromEntries(entries)
    }
    if (!dispatch) return true
    const tr = state.tr
    if (empty) {
      const current = (state.storedMarks ?? state.selection.$from.marks()).find(
        (mark) => mark.type === type
      )
      const style = restyle((current?.attrs.style as CharacterStyleOverride | undefined) ?? {})
      tr.setStoredMarks(Object.keys(style).length > 0 ? [type.create({ style })] : [])
    } else {
      state.doc.nodesBetween(from, to, (child, pos) => {
        if (!child.isText) return
        const start = Math.max(from, pos)
        const end = Math.min(to, pos + child.nodeSize)
        const style = restyle(
          (child.marks[0]?.attrs.style as CharacterStyleOverride | undefined) ?? {}
        )
        tr.removeMark(start, end, type)
        if (Object.keys(style).length > 0) tr.addMark(start, end, type.create({ style }))
      })
    }
    dispatch(tr)
    return true
  }
}

/**
 * Text editing in the page: the layer's own element in its artboard becomes a ProseMirror
 * editor, so typing, selection, IME, spell checking and clipboard are the browser's. Each change
 * goes straight into the graph as `text` and `styleRuns`; the DOM layout engine measures the
 * element as it grows. In-edit undo is ProseMirror's; leaving the edit records one undo step.
 */
export class DomTextEditor implements ExternalTextEditor {
  private view: EditorView | null = null
  private nodeId: string | null = null
  private focusFrame = 0

  constructor(
    private readonly editor: Editor,
    private readonly projector: DomSceneProjector
  ) {}

  start(nodeId: string): void {
    this.stop()
    const node = this.editor.graph.getNode(nodeId)
    const element = node ? this.projector.lock(nodeId) : undefined
    if (!node || !element) {
      this.projector.unlock(nodeId)
      return
    }
    this.nodeId = nodeId
    const toggle =
      (key: StyleKey, on: unknown, off: unknown, isOn: (value: unknown) => boolean): Command =>
      (state, dispatch) => {
        const current = this.editor.graph.getNode(nodeId)
        if (!current) return false
        const { from, to } = state.selection
        const values = effective(state.doc, from, to, current, key)
        const allOn = values.length > 0 ? values.every(isOn) : isOn(current[key as keyof SceneNode])
        const value = allOn ? off : on
        // Back to the layer's own value: the run stops overriding it.
        return setStyle(key, value === current[key as keyof SceneNode] ? undefined : value)(
          state,
          dispatch
        )
      }
    const state = EditorState.create({
      doc: textToDoc(node.text, node.styleRuns),
      plugins: [
        history(),
        keymap({
          'Mod-z': undo,
          'Shift-Mod-z': redo,
          'Mod-y': redo,
          'Mod-b': toggle('fontWeight', 700, 400, (weight) => Number(weight) >= 600),
          'Mod-i': toggle('italic', true, false, (italic) => italic === true),
          'Mod-u': toggle(
            'textDecoration',
            'UNDERLINE',
            'NONE',
            (decoration) => decoration === 'UNDERLINE'
          ),
          Escape: () => {
            this.editor.commitTextEdit()
            return true
          }
        }),
        keymap(baseKeymap)
      ]
    })
    this.view = new EditorView(
      // The artboard's own realm: `instanceof HTMLElement` from this one would be false.
      { mount: element as HTMLElement },
      {
        state,
        dispatchTransaction: (tr) => this.dispatch(tr),
        // Pasted text keeps the style where it lands, as in Figma; formatting from elsewhere does not.
        handlePaste: (view, event) => {
          const text = event.clipboardData?.getData('text/plain')
          if (text === undefined) return false
          view.dispatch(view.state.tr.insertText(text))
          return true
        }
      }
    )
    this.selectAll()
    this.focus()
  }

  stop(): void {
    cancelAnimationFrame(this.focusFrame)
    const id = this.nodeId
    this.view?.destroy()
    this.view = null
    this.nodeId = null
    if (id) this.projector.unlock(id)
  }

  selectAll(): void {
    const view = this.view
    if (!view) return
    view.dispatch(view.state.tr.setSelection(new AllSelection(view.state.doc)))
    this.focus()
  }

  setCursorAt(x: number, y: number, extend = false): void {
    const view = this.view
    const position = this.positionAt(x, y)
    if (!view || position === null) return
    const anchor = extend ? view.state.selection.anchor : position
    view.dispatch(
      view.state.tr.setSelection(TextSelection.create(view.state.doc, anchor, position))
    )
    this.focus()
  }

  selectWordAt(x: number, y: number): void {
    const view = this.view
    const position = this.positionAt(x, y)
    if (!view || position === null) return
    const $pos = view.state.doc.resolve(position)
    const text = $pos.parent.textContent
    const offset = $pos.parentOffset
    const isWord = (char: string | undefined) =>
      char !== undefined && /[\p{L}\p{N}_'’-]/u.test(char)
    let start = offset
    let end = offset
    while (start > 0 && isWord(text[start - 1])) start--
    while (end < text.length && isWord(text[end])) end++
    const base = position - offset
    view.dispatch(
      view.state.tr.setSelection(TextSelection.create(view.state.doc, base + start, base + end))
    )
    this.focus()
  }

  /** A point in the layer's own coordinates, as a document position. */
  private positionAt(x: number, y: number): number | null {
    const view = this.view
    if (!view) return null
    const box = view.dom.getBoundingClientRect()
    const clamp = (value: number, min: number, max: number) =>
      Math.min(Math.max(value, min + 1), max - 1)
    const hit = view.posAtCoords({
      left: clamp(box.left + x, box.left, box.right),
      top: clamp(box.top + y, box.top, box.bottom)
    })
    return hit?.pos ?? null
  }

  /** The page takes focus back after the pointer event that placed the caret. */
  private focus(): void {
    cancelAnimationFrame(this.focusFrame)
    this.focusFrame = requestAnimationFrame(() => this.view?.focus())
  }

  private dispatch(tr: Parameters<EditorView['dispatch']>[0]): void {
    const view = this.view
    if (!view || !this.nodeId) return
    view.updateState(view.state.apply(tr))
    if (!tr.docChanged) return
    this.editor.updateTextEditNode(this.nodeId, docToText(view.state.doc))
  }
}
