import { call, native } from '../bridge'

const separator = () => (native().platform === 'win32' ? '\\' : '/')

export function homeDir(): Promise<string> {
  return call<string>('path.homeDir')
}

export function appLocalDataDir(): Promise<string> {
  return call<string>('path.appLocalDataDir')
}

export async function join(...parts: string[]): Promise<string> {
  const sep = separator()
  const joined = parts.filter((part) => part !== '').join(sep)
  return joined.replace(sep === '\\' ? /[\\/]+/g : /\/+/g, sep)
}

export async function dirname(path: string): Promise<string> {
  const match = /^(.*)[\\/][^\\/]*$/.exec(path)
  if (!match) return path
  return match[1] === '' ? path.slice(0, 1) : match[1]
}

export async function basename(path: string): Promise<string> {
  return path.split(/[\\/]/).pop() ?? path
}
