import { app } from 'electron'

import { emit } from '../ipc'
import { registerCommandHandlers } from './commands'
import { registerDialogHandlers } from './dialog'
import { registerFsHandlers } from './fs'
import { registerGitHandlers } from './git'
import { registerMCPStdioHandlers } from './mcp/stdio'
import { buildMenu, refreshWindowMenu } from './menu'
import { registerOAuthHandlers } from './oauth'
import { setOpenTarget } from './pending'
import { registerShellHandlers } from './shell'
import { registerSystemHandlers } from './system'
import { registerUpdaterHandlers } from './updater'
import {
  editorWindows,
  frontEditorContents,
  installQuitGuard,
  onEditorsChanged,
  openEditorWindow,
  registerWindowHandlers,
  type WindowHost
} from './windows'

export { handleLink, LINK_SCHEME, queueOpenPaths, takePendingOpen } from './pending'
export { titleBarOptions, trackTitleBar } from './title-bar'
export { frontEditor, openEditorWindow, track } from './windows'

export function registerHandlers(host: WindowHost): void {
  registerWindowHandlers(host)
  registerFsHandlers()
  registerDialogHandlers()
  registerSystemHandlers()
  registerShellHandlers()
  registerCommandHandlers()
  registerMCPStdioHandlers()
  registerOAuthHandlers()
  registerGitHandlers()
  registerUpdaterHandlers()
  // Only an editor takes documents and links, the one in front; another window, such as
  // Software Update, would drop them.
  setOpenTarget({
    notify: (event, payload) => {
      const editor = frontEditorContents()
      if (!editor) return false
      emit(editor, event, payload)
      return true
    },
    openEditor: () => {
      if (app.isReady() && editorWindows().length === 0) openEditorWindow()
    }
  })
  installQuitGuard()
  onEditorsChanged(refreshWindowMenu)
  buildMenu()
}
