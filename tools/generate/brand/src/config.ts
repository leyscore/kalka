import { fileURLToPath } from 'node:url'

import { resolveWorkspaceRoot } from '@kalka/package-artifacts-tools/workspace'

export const repositoryRoot = await resolveWorkspaceRoot(fileURLToPath(import.meta.url))
export const targets = ['web', 'docs', 'desktop'] as const
export type BrandTarget = (typeof targets)[number]

export const brand = {
  /** Kalka blue: the app tile. */
  background: '#2F5BEA',
  /** Paper: the K on the tile, and on dark surfaces. */
  paper: '#EFEFEC',
  /** Ink: monochrome artwork on light surfaces. */
  ink: '#121214',
  tileInset: 64,
  /** 22% of the tile, as in the brand kit. */
  tileRadius: 225,
  /** The K spans 72% of the tile in the brand kit. */
  appScale: 0.72,
  tileScale: 0.72,
  maskableScale: 0.54
} as const

export const webFiles = [
  'brand/favicon.svg',
  'brand/favicon-96x96.png',
  'favicon.ico',
  'apple-touch-icon.png',
  'brand/app-icon.svg',
  'brand/app-icon-1024.png',
  'brand/mark.svg',
  'brand/mark-dark.svg',
  'brand/mark-micro.svg',
  'brand/mark-micro-dark.svg',
  'brand/mark-mono.svg',
  'brand/mark-mono-dark.svg'
] as const

export const pwaFiles = [
  'brand/pwa-192.png',
  'brand/pwa-512.png',
  'brand/pwa-maskable-512.png'
] as const

export const desktopFiles = [
  '32x32.png',
  '128x128.png',
  '128x128@2x.png',
  'icon.png',
  'icon.icns',
  'icon.ico',
  'Square30x30Logo.png',
  'Square44x44Logo.png',
  'Square71x71Logo.png',
  'Square89x89Logo.png',
  'Square107x107Logo.png',
  'Square142x142Logo.png',
  'Square150x150Logo.png',
  'Square284x284Logo.png',
  'Square310x310Logo.png',
  'StoreLogo.png'
] as const

export function targetDirectory(target: BrandTarget): string {
  switch (target) {
    case 'web':
      return 'public'
    case 'docs':
      return 'packages/docs/public'
    case 'desktop':
      return 'desktop/icons'
  }
}

export function targetFiles(target: BrandTarget): readonly string[] {
  if (target === 'desktop') return desktopFiles
  if (target === 'web') return [...webFiles, ...pwaFiles]
  return webFiles
}
