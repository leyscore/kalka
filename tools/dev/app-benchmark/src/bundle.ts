import { readdir, stat } from 'node:fs/promises'
import { extname, join, relative } from 'node:path'

import type { Page } from '@playwright/test'

import { toMiB } from './stats'

export interface BuiltFile {
  /** Path inside the built app, as the page requests it (`assets/router-x.js`). */
  path: string
  bytes: number
}

const CODE = new Set(['.js', '.css', '.wasm'])

/** The renderer's code files in the built app: scripts, styles and WebAssembly. */
export async function builtFiles(dist: string): Promise<BuiltFile[]> {
  const files: BuiltFile[] = []
  async function walk(dir: string) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name)
      if (entry.isDirectory()) await walk(path)
      else if (CODE.has(extname(entry.name)))
        files.push({ path: relative(dist, path), bytes: (await stat(path)).size })
    }
  }
  await walk(dist)
  return files
}

/** Paths, relative to the app's origin, of every resource the page fetched so far. */
export async function loadedPaths(page: Page): Promise<string[]> {
  return page.evaluate(() =>
    performance
      .getEntriesByType('resource')
      .map((entry) => new URL(entry.name).pathname.replace(/^\//, ''))
      .concat(
        [...document.querySelectorAll<HTMLScriptElement>('script[src]')].map((script) =>
          new URL(script.src).pathname.replace(/^\//, '')
        ),
        [
          ...document.querySelectorAll<HTMLLinkElement>(
            'link[rel="stylesheet"], link[rel="modulepreload"]'
          )
        ].map((link) => new URL(link.href).pathname.replace(/^\//, ''))
      )
  )
}

export interface BundleKind {
  files: number
  mib: number
}

export interface BundleReport {
  /** All code in the build, by extension. */
  total: Record<string, BundleKind>
  /** Code the home screen loaded, by extension. */
  startup: Record<string, BundleKind>
  /** Code an empty document added on top of the home screen. */
  emptyDocument: Record<string, BundleKind>
  /** Code nothing loaded by then: fetched lazily, when a feature needs it. */
  lazy: Record<string, BundleKind>
  largestStartup: BuiltFile[]
  largestLazy: BuiltFile[]
}

function byKind(files: readonly BuiltFile[]): Record<string, BundleKind> {
  const kinds: Record<string, BundleKind> = {}
  for (const file of files) {
    const kind = (kinds[extname(file.path).slice(1)] ??= { files: 0, mib: 0 })
    kind.files += 1
    kind.mib += file.bytes
  }
  for (const kind of Object.values(kinds)) kind.mib = toMiB(kind.mib)
  return kinds
}

const largest = (files: readonly BuiltFile[], count: number) =>
  [...files].sort((a, b) => b.bytes - a.bytes).slice(0, count)

/** Splits the build into what startup loaded, what an empty document added, and the rest. */
export function bundleReport(
  files: readonly BuiltFile[],
  home: readonly string[],
  emptyDocument: readonly string[]
): BundleReport {
  const atHome = new Set(home)
  const atDocument = new Set(emptyDocument)
  const startup = files.filter((file) => atHome.has(file.path))
  const added = files.filter((file) => !atHome.has(file.path) && atDocument.has(file.path))
  const lazy = files.filter((file) => !atHome.has(file.path) && !atDocument.has(file.path))
  return {
    total: byKind(files),
    startup: byKind(startup),
    emptyDocument: byKind(added),
    lazy: byKind(lazy),
    largestStartup: largest(startup, 12),
    largestLazy: largest(lazy, 8)
  }
}
