import { call } from './bridge'

export function openUrl(url: string | URL): Promise<void> {
  return call('opener.openUrl', String(url))
}

export function openPath(path: string): Promise<void> {
  return call('opener.openPath', path)
}

export function revealItemInDir(path: string): Promise<void> {
  return call('opener.reveal', path)
}
