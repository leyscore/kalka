import { baseKeymap } from 'prosemirror-commands'
import { history, redo, undo } from 'prosemirror-history'
import { keymap } from 'prosemirror-keymap'
import type { Node as ProseMirrorNode } from 'prosemirror-model'
import { AllSelection, EditorState, TextSelection, type Command } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'

import type { Editor, ExternalTextEditor } from '@kalka/core/editor'
import type { CharacterStyleOverride, SceneNode, TextListType } from '@kalka/scene-graph'

import type { DomSceneProjector } from '#vue/canvas/dom-scene/projector'
import {
  handleListShortcut,
  indentListItem,
  liftListItem,
  paragraphDecorations,
  setListType,
  splitListItem
} from '#vue/canvas/dom-scene/text/paragraphs'
import { docToText, textSchema, textToDoc } from '#vue/canvas/dom-scene/text/schema'

type StyleKey = keyof CharacterStyleOverride

/** Keys held before the editor has focus that its keymap runs; any other is a character. */
const EDITING_KEYS = new Set(['Enter', 'Backspace'])

/** What held keys type into an empty text: characters, line breaks and deletions. */
function typedText(keys: readonly string[]): string {
  let text = ''
  for (const key of keys) {
    if (key === 'Backspace') text = text.slice(0, -1)
    else text += key === 'Enter' ? '\n' : key
  }
  return text
}

/** Whether a key event was meant for a field of the app, such as a panel input. */
function targetsField(event: KeyboardEvent): boolean {
  const target = event.target
  if (!(target instanceof HTMLElement)) return false
  return target.isContentEditable || target.localName === 'input' || target.localName === 'textarea'
}

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
  private openFrame = 0
  private stopWatchingParagraphs: (() => void) | null = null
  /**
   * Keys pressed between the start of the edit and the editor's focus, which reach the app's
   * window instead: a new layer's artboard may still be loading. Null once the editor has focus.
   */
  private early: string[] | null = null

  constructor(
    private readonly editor: Editor,
    private readonly projector: DomSceneProjector
  ) {}

  start(nodeId: string): void {
    this.stop()
    this.early = []
    window.addEventListener('keydown', this.holdEarlyKey, { capture: true })
    this.open(nodeId)
  }

  /**
   * As in Figma, typing right after the click lands in the new text: keys that reach the app
   * before the editor has focus are kept, so neither are they lost nor do they run shortcuts,
   * and replayed into the editor once it has focus. Escape ends the edit.
   */
  private readonly holdEarlyKey = (event: KeyboardEvent): void => {
    const early = this.early
    if (!early || event.isComposing || targetsField(event)) return
    if (event.metaKey || event.ctrlKey || event.altKey) return
    const { key } = event
    // One character, as a key's value is unless it names the key, such as `ArrowLeft`.
    const character = key.length === 1 || (key.length === 2 && (key.codePointAt(0) ?? 0) > 0xffff)
    const held = EDITING_KEYS.has(key) || character
    if (!held && key !== 'Escape') return
    event.preventDefault()
    event.stopImmediatePropagation()
    if (held) {
      early.push(key)
      return
    }
    const id = this.editor.state.editingTextId
    if (this.view) {
      this.replayEarlyKeys()
    } else if (id && typedText(early)) {
      // The editor has not opened yet: what was typed is the text, as the editor would have made it.
      this.editor.updateTextEditNode(id, { text: typedText(early), styleRuns: [] })
    }
    this.editor.commitTextEdit()
  }

  /** Types the keys held before the editor had focus, and stops holding keys. */
  private replayEarlyKeys(): void {
    const early = this.early
    this.stopHoldingKeys()
    const view = this.view
    if (!view || !early) return
    for (const key of early) {
      if (EDITING_KEYS.has(key)) {
        baseKeymap[key]?.(view.state, (tr) => this.dispatch(tr), view)
      } else {
        this.dispatch(view.state.tr.insertText(key))
      }
    }
  }

  private stopHoldingKeys(): void {
    this.early = null
    window.removeEventListener('keydown', this.holdEarlyKey, { capture: true })
  }

  private open(nodeId: string): void {
    const node = this.editor.graph.getNode(nodeId)
    const element = node ? this.projector.lock(nodeId) : undefined
    if (!node || !element) {
      this.projector.unlock(nodeId)
      // A layer added just now, such as by a quick click of the text tool, has no element until
      // its artboard loads; the edit opens once it does, unless it has ended meanwhile.
      if (node && this.editor.state.editingTextId === nodeId)
        this.openFrame = requestAnimationFrame(() => this.open(nodeId))
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
      doc: textToDoc(node.text, node.styleRuns, node.listLines),
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
          },
          Enter: splitListItem,
          Backspace: liftListItem,
          Tab: indentListItem(1),
          'Shift-Tab': indentListItem(-1)
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
        // Paragraph spacing, indent and list markers, drawn as the projection draws them.
        decorations: (current) => {
          const layer = this.editor.graph.getNode(nodeId)
          return layer ? paragraphDecorations(current.doc, layer) : null
        },
        handleTextInput: handleListShortcut,
        // Pasted text keeps the style where it lands, as in Figma; formatting from elsewhere does not.
        handlePaste: (view, event) => {
          const text = event.clipboardData?.getData('text/plain')
          if (text === undefined) return false
          view.dispatch(view.state.tr.insertText(text))
          return true
        }
      }
    )
    // Keys reach the artboard's own window; app shortcuts listen on the editor's.
    this.view.dom.addEventListener('keydown', this.forwardShortcut)
    // Spacing set in the panel while typing redraws the paragraphs.
    this.stopWatchingParagraphs = this.editor.onEditorEvent('node:updated', (id, changes) => {
      if (id !== nodeId || !('paragraphSpacing' in changes || 'paragraphIndent' in changes)) return
      this.view?.updateState(this.view.state)
    })
    this.selectAll()
    this.focus()
  }

  /**
   * A shortcut the text editor leaves alone, such as save or open, goes on to the app as if it
   * were pressed there. Undo, formatting and plain typing stay the editor's.
   */
  private readonly forwardShortcut = (event: KeyboardEvent): void => {
    if (event.defaultPrevented || !(event.metaKey || event.ctrlKey)) return
    const forwarded = new KeyboardEvent('keydown', {
      key: event.key,
      code: event.code,
      metaKey: event.metaKey,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      altKey: event.altKey,
      repeat: event.repeat,
      bubbles: true,
      cancelable: true
    })
    window.dispatchEvent(forwarded)
    // Handled by the app, it must not also do what the browser would, such as saving the page.
    if (forwarded.defaultPrevented) event.preventDefault()
  }

  stop(): void {
    this.stopHoldingKeys()
    cancelAnimationFrame(this.openFrame)
    cancelAnimationFrame(this.focusFrame)
    const id = this.nodeId
    const frame = this.view?.dom.ownerDocument.defaultView?.frameElement
    this.view?.dom.removeEventListener('keydown', this.forwardShortcut)
    this.stopWatchingParagraphs?.()
    this.stopWatchingParagraphs = null
    this.view?.destroy()
    // Focus leaves the artboard with the edit, so the app's shortcuts hear the next key.
    if (frame && document.activeElement === frame && frame instanceof HTMLElement) frame.blur()
    this.view = null
    this.nodeId = null
    if (id) this.projector.unlock(id)
  }

  styleSelection(style: CharacterStyleOverride): boolean {
    const view = this.view
    if (!view || view.state.selection.empty) return false
    for (const [key, value] of Object.entries(style)) {
      setStyle(key as StyleKey, value)(view.state, (tr) => this.dispatch(tr))
    }
    return true
  }

  listSelection(type: TextListType): boolean {
    const view = this.view
    if (!view) return false
    return setListType(type)(view.state, (tr) => this.dispatch(tr))
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
    this.focusFrame = requestAnimationFrame(() => {
      this.view?.focus()
      if (this.early) this.replayEarlyKeys()
    })
  }

  private dispatch(tr: Parameters<EditorView['dispatch']>[0]): void {
    const view = this.view
    if (!view || !this.nodeId) return
    view.updateState(view.state.apply(tr))
    if (!tr.docChanged) return
    this.editor.updateTextEditNode(this.nodeId, docToText(view.state.doc))
  }
}
