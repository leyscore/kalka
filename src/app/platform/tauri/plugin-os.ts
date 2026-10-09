import { native } from './bridge'

const PLATFORMS: Record<string, string> = { darwin: 'macos', win32: 'windows', linux: 'linux' }

export function platform(): string {
  const value = native().platform
  return PLATFORMS[value] ?? value
}

export function version(): string {
  return native().systemVersion
}

const ARCHITECTURES: Record<string, string> = { arm64: 'aarch64', x64: 'x86_64' }

export function arch(): string {
  const value = native().arch
  return ARCHITECTURES[value] ?? value
}
