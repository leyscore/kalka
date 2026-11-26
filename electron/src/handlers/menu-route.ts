/** Where a click on the native menu goes. */
export type MenuRoute<W> =
  | { kind: 'send'; window: W }
  | { kind: 'close'; window: W }
  | { kind: 'open-editor' }
  | { kind: 'new-window' }

/**
 * Menu commands act on documents, so they go to the editor window even when another window,
 * such as Software Update, is in front; Close closes the window in front, as on any Mac app.
 * With no editor open, as on macOS once its last window closed, an editor window opens.
 * `editor` is the editor window in front, or the one last in front; New Window opens another.
 */
export function routeMenuEvent<W>(id: string, focused: W | null, editor: W | null): MenuRoute<W> {
  if (id === 'new-window') return { kind: 'new-window' }
  if (id === 'close' && focused && focused !== editor) return { kind: 'close', window: focused }
  if (editor) return { kind: 'send', window: editor }
  return { kind: 'open-editor' }
}
