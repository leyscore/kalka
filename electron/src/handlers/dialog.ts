import { dialog, type OpenDialogOptions as ElectronOpenOptions } from 'electron'

import { registerAll, type CallContext } from '../ipc'

interface Filter {
  name: string
  extensions: string[]
}

export const dialogHandlers = {
  async open(
    context: CallContext,
    options: {
      title?: string
      filters?: Filter[]
      defaultPath?: string
      multiple?: boolean
      directory?: boolean
    }
  ) {
    const properties: ElectronOpenOptions['properties'] = [
      options.directory ? 'openDirectory' : 'openFile'
    ]
    if (options.multiple) properties.push('multiSelections')
    if (options.directory) properties.push('createDirectory')
    const settings: ElectronOpenOptions = {
      title: options.title,
      defaultPath: options.defaultPath,
      filters: options.filters,
      properties
    }
    const result = context.window
      ? await dialog.showOpenDialog(context.window, settings)
      : await dialog.showOpenDialog(settings)
    if (result.canceled || result.filePaths.length === 0) return null
    return options.multiple ? result.filePaths : result.filePaths[0]
  },
  async save(
    context: CallContext,
    options: { title?: string; filters?: Filter[]; defaultPath?: string }
  ) {
    const settings = {
      title: options.title,
      defaultPath: options.defaultPath,
      filters: options.filters
    }
    const result = context.window
      ? await dialog.showSaveDialog(context.window, settings)
      : await dialog.showSaveDialog(settings)
    return result.canceled || !result.filePath ? null : result.filePath
  },
  /** Resolves to the clicked button's label, as Tauri's message dialog does. */
  async message(
    context: CallContext,
    text: string,
    options: {
      title?: string
      kind?: 'info' | 'warning' | 'error'
      okLabel?: string
      buttons?: { yes?: string; no?: string; ok?: string; cancel?: string }
    }
  ) {
    const set = options.buttons ?? { ok: options.okLabel ?? 'OK' }
    const labels = [set.yes, set.ok, set.no, set.cancel].filter((label): label is string => !!label)
    const settings = {
      type: options.kind ?? 'info',
      title: options.title,
      message: text,
      buttons: labels,
      defaultId: 0,
      cancelId: set.cancel ? labels.indexOf(set.cancel) : labels.length - 1,
      noLink: true
    }
    const { response } = context.window
      ? await dialog.showMessageBox(context.window, settings)
      : await dialog.showMessageBox(settings)
    return labels[response] ?? set.cancel ?? ''
  }
}

export function registerDialogHandlers(): void {
  registerAll(dialogHandlers, 'dialog')
}
