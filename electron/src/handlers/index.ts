import { BrowserWindow } from 'electron'

import { registerCommandHandlers } from './commands'
import { registerDialogHandlers } from './dialog'
import { registerFsHandlers } from './fs'
import { registerMCPStdioHandlers } from './mcp/stdio'
import { buildMenu } from './menu'
import { registerOAuthHandlers } from './oauth'
import { setOpenTarget } from './pending'
import { registerShellHandlers } from './shell'
import { registerSystemHandlers } from './system'
import { installQuitGuard, mainContents, registerWindowHandlers, type WindowHost } from './windows'

export { handleLink, LINK_SCHEME, queueOpenPaths, takePendingOpen } from './pending'
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
  setOpenTarget(() => mainContents() ?? BrowserWindow.getAllWindows()[0]?.webContents ?? null)
  installQuitGuard()
  buildMenu()
}
