import { call } from './bridge'

export interface DialogFilter {
  name: string
  extensions: string[]
}

export interface OpenDialogOptions {
  title?: string
  filters?: DialogFilter[]
  defaultPath?: string
  multiple?: boolean
  directory?: boolean
}

export interface SaveDialogOptions {
  title?: string
  filters?: DialogFilter[]
  defaultPath?: string
}

export type MessageDialogResult = string

export interface MessageDialogOptions {
  title?: string
  kind?: 'info' | 'warning' | 'error'
  okLabel?: string
  buttons?:
    | { yes: string; no: string; cancel: string }
    | { ok: string; cancel: string }
    | { ok: string }
}

export function open(options: OpenDialogOptions = {}): Promise<string | string[] | null> {
  return call('dialog.open', options)
}

export function save(options: SaveDialogOptions = {}): Promise<string | null> {
  return call('dialog.save', options)
}

/** Resolves to the label of the button the user clicked. */
export function message(
  text: string,
  options: MessageDialogOptions | string = {}
): Promise<MessageDialogResult> {
  return call('dialog.message', text, typeof options === 'string' ? { title: options } : options)
}

export async function ask(text: string, options: MessageDialogOptions = {}): Promise<boolean> {
  const yes = 'Yes'
  return (await message(text, { ...options, buttons: { ok: yes, cancel: 'No' } })) === yes
}
