import type { BrowserWindow } from 'electron'
import * as v from 'valibot'

import { emit, type CallContext } from '../ipc'
import { setChecked } from './menu'
import { createTabMoves, TabMove } from './window-list'
import {
  editorWindowSummaries,
  isEditorWindow,
  labelOf,
  openEditorWindow,
  setEditorDocuments,
  windowByLabel
} from './windows'

/** Tells an editor page that tabs moved to it wait to be taken (`take_tab_moves`). */
export const TAB_MOVES_EVENT = 'tab-moves'

const moves = createTabMoves<BrowserWindow>()

/** Tauri-style commands that concern the window that calls them. */
export const windowCommands = {
  set_native_menu_checked: (
    { id, checked }: { id: string; checked: boolean },
    context: CallContext
  ) => setChecked(context.window, id, checked),
  set_window_documents: ({ documents }: { documents: unknown }, context: CallContext) => {
    if (context.window && isEditorWindow(context.window))
      setEditorDocuments(context.window, documents)
  },
  editor_windows: (_args: unknown, context: CallContext) => ({
    current: context.window ? (labelOf(context.window) ?? null) : null,
    windows: editorWindowSummaries()
  }),
  /**
   * Sends a tab to another editor window, or to a new one when `label` is null; the page that
   * asks closes its tab once this returns.
   */
  move_tab_to_window: (
    { label, move }: { label: string | null; move: unknown },
    context: CallContext
  ) => {
    const parsed = v.safeParse(TabMove, move)
    if (!parsed.success) throw new Error('Malformed tab move')
    const target = label === null ? openEditorWindow() : windowByLabel(label)
    if (!target || !isEditorWindow(target) || target === context.window)
      throw new Error('No editor window to move the tab to')
    moves.queue(target, parsed.output)
    emit(target.webContents, TAB_MOVES_EVENT)
    if (target.isMinimized()) target.restore()
    target.focus()
  },
  take_tab_moves: (_args: unknown, context: CallContext) =>
    context.window ? moves.take(context.window) : []
}
