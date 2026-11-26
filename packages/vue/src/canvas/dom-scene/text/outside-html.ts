import { TextSelection, type Command } from 'prosemirror-state'
import type { EditorView } from 'prosemirror-view'

import { handleListShortcut } from '#vue/canvas/dom-scene/text/paragraphs'

const HTML_NAMESPACE = 'http://www.w3.org/1999/xhtml'

/**
 * Whether the browser edits text in `element` itself. It does not in an SVG, such as the glyph
 * outlines a text on a path draws as: there ProseMirror only types a key over a selection and
 * leaves a caret's typing, deleting and moving to the browser, which does nothing.
 */
export function editsNatively(element: Element): boolean {
  return element.namespaceURI === HTML_NAMESPACE
}

/** Types a pressed key through a transaction, as the browser would type it at the caret. */
export function typeKeyPress(view: EditorView, event: KeyboardEvent): boolean {
  if (!event.charCode || (event.ctrlKey && !event.altKey) || event.metaKey) return false
  const text = String.fromCodePoint(event.charCode)
  if (/[\r\n]/u.test(text)) return false
  const { from, to } = view.state.selection
  if (!handleListShortcut(view, from, to, text))
    view.dispatch(view.state.tr.insertText(text).scrollIntoView())
  return true
}

function caret(state: Parameters<Command>[0]) {
  const { selection } = state
  return selection instanceof TextSelection ? selection.$cursor : null
}

/** One character before or after the caret, within its paragraph. */
function deleteCharacter(direction: -1 | 1): Command {
  return (state, dispatch) => {
    const $cursor = caret(state)
    if (!$cursor) return false
    const at = $cursor.parentOffset
    if (direction < 0 ? at === 0 : at === $cursor.parent.content.size) return false
    const from = direction < 0 ? $cursor.pos - 1 : $cursor.pos
    dispatch?.(state.tr.delete(from, from + 1).scrollIntoView())
    return true
  }
}

/** The caret one character to the left or right, within its paragraph. */
function moveCaret(direction: -1 | 1): Command {
  return (state, dispatch) => {
    const { selection } = state
    if (!(selection instanceof TextSelection)) return false
    if (!selection.empty) {
      const to = direction < 0 ? selection.from : selection.to
      dispatch?.(state.tr.setSelection(TextSelection.create(state.doc, to)))
      return true
    }
    const $cursor = selection.$cursor
    if (!$cursor) return false
    const at = $cursor.parentOffset + direction
    if (at < 0 || at > $cursor.parent.content.size) return false
    dispatch?.(state.tr.setSelection(TextSelection.create(state.doc, $cursor.pos + direction)))
    return true
  }
}

/** The editing keys the browser leaves undone outside HTML, run by the editor instead. */
export const outsideHTMLKeymap: Record<string, Command> = {
  Backspace: deleteCharacter(-1),
  Delete: deleteCharacter(1),
  ArrowLeft: moveCaret(-1),
  ArrowRight: moveCaret(1)
}
