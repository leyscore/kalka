/// <reference types="vite/client" />
import CanvasKitInit, { type CanvasKit } from 'canvaskit-wasm'

import { IS_BROWSER } from './constants'

let instance: Promise<CanvasKit> | null = null

/**
 * The file path a `file:` URL names, without Node's `url` module: on Windows the URL's path is
 * `/D:/…`, which is no path until the slash before the drive goes.
 */
export function filePathOfURL(url: URL): string {
  return decodeURIComponent(url.pathname).replace(/^\/([A-Za-z]:)/, '$1')
}

export interface CanvasKitOptions {
  locateFile?: (file: string) => string
}

/**
 * The one CanvasKit of this page or process, loaded by the first caller. Callers that ask while it
 * loads share that load, so the WebAssembly module is compiled and its heap allocated once.
 */
export function getCanvasKit(options?: CanvasKitOptions): Promise<CanvasKit> {
  const defaultLocate = (file: string) => {
    if (!IS_BROWSER) {
      const ckPath = import.meta.resolve('canvaskit-wasm')
      return filePathOfURL(new URL(file, ckPath))
    }
    const base = 'env' in import.meta ? import.meta.env.BASE_URL : '/'
    const prefix = base === '/' ? '' : base.replace(/\/$/, '')
    return `${prefix}/${file}`
  }

  instance ??= CanvasKitInit({
    locateFile: options?.locateFile ?? defaultLocate
  }).catch((error: unknown) => {
    // A failed load is not kept: the next caller tries again.
    instance = null
    throw error
  })
  return instance
}
