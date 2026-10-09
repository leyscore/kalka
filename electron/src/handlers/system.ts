import { homedir } from 'node:os'

import { app, clipboard, ClipboardItem, shell } from 'electron'

import { registerAll, type CallContext } from '../ipc'
import { markExiting } from './windows'

const EXTERNAL = /^(https?:|mailto:)/i

export function registerSystemHandlers(): void {
  registerAll(
    {
      writeText: (_context: CallContext, text: string) => clipboard.writeText(text),
      writeHtml: (_context: CallContext, html: string, text: string) =>
        clipboard.write([new ClipboardItem({ 'text/html': html, 'text/plain': text })]),
      readText: () => clipboard.readText()
    },
    'clipboard'
  )
  registerAll(
    {
      async openUrl(_context: CallContext, url: string) {
        if (!EXTERNAL.test(url)) throw new Error(`Refusing to open ${url}`)
        await shell.openExternal(url)
      },
      async openPath(_context: CallContext, path: string) {
        const error = await shell.openPath(path)
        if (error) throw new Error(error)
      },
      reveal: (_context: CallContext, path: string) => shell.showItemInFolder(path)
    },
    'opener'
  )
  registerAll(
    {
      exit(_context: CallContext, code: number) {
        markExiting()
        app.exit(code)
      },
      relaunch() {
        markExiting()
        app.relaunch()
        app.exit(0)
      }
    },
    'process'
  )
  registerAll(
    {
      homeDir: () => homedir(),
      appLocalDataDir: () => app.getPath('userData')
    },
    'path'
  )
}
