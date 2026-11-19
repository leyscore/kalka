import { app } from 'electron'

import { emit } from '../ipc'
import { registerCommandHandlers } from './commands'
import { registerDialogHandlers } from './dialog'
import { registerFsHandlers } from './fs'
import { registerGitHandlers } from './git'
import { registerMCPStdioHandlers } from './mcp/stdio'
import { buildMenu } from './menu'
import { registerOAuthHandlers } from './oauth'
import { setOpenTarget } from './pending'
import { registerShellHandlers } from './shell'
import { registerSystemHandlers } from './system'
import { registerUpdaterHandlers } from './updater'
import { installQuitGuard, mainContents, registerWindowHandlers, type WindowHost } from './windows'

export { handleLink, LINK_SCHEME, queueOpenPaths, takePendingOpen } from './pending'
export { titleBarOptions, trackTitleBar } from './title-bar'
export { track } from './windows'

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
  // Only the editor takes documents and links; another window, such as Software Update, would
  // drop them.
  setOpenTarget({
    notify: (event, payload) => {
      const editor = mainContents()
      if (!editor) return false
      emit(editor, event, payload)
      return true
    },
    openEditor: () => {
      if (app.isReady() && !mainContents()) host.createWindow()
    }
  })
  installQuitGuard()
  buildMenu()
}
