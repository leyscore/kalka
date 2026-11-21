import type { ProjectFont, SceneGraph } from '@kalka/scene-graph'

import { fontManager, type FontManager } from '#core/text/fonts'

/** Each file's bytes as the buffer fonts load from, made once, so a file registers once. */
const buffers = new WeakMap<Uint8Array, ArrayBuffer>()

function bufferOf(data: Uint8Array): ArrayBuffer {
  let buffer = buffers.get(data)
  if (!buffer) {
    buffer =
      data.byteOffset === 0 && data.byteLength === data.buffer.byteLength
        ? (data.buffer as ArrayBuffer)
        : data.slice().buffer
    buffers.set(data, buffer)
  }
  return buffer
}

/** The files each manager loaded already, by family, so loading them again does nothing. */
const registered = new WeakMap<FontManager, Map<string, WeakSet<Uint8Array>>>()

function registeredFiles(manager: FontManager, family: string): WeakSet<Uint8Array> {
  let families = registered.get(manager)
  if (!families) registered.set(manager, (families = new Map()))
  let files = families.get(family)
  if (!files) families.set(family, (files = new WeakSet()))
  return files
}

/** Loads one family a document carries, so its text draws with it before anything else. */
export function registerProjectFont(font: ProjectFont, manager: FontManager = fontManager): void {
  const files = registeredFiles(manager, font.family)
  for (const face of font.faces) {
    if (files.has(face.data)) continue
    files.add(face.data)
    manager.registerProjectFace(font.family, {
      weight: face.weight,
      style: face.style,
      data: bufferOf(face.data),
      ...(face.unicodeRange ? { unicodeRange: face.unicodeRange } : {})
    })
  }
}

/**
 * Loads every font a document carries. Registering the same files again does nothing, so it is
 * called each time a document's fonts are needed rather than tracked by its callers.
 */
export function registerProjectFonts(graph: SceneGraph, manager: FontManager = fontManager): void {
  for (const font of graph.fonts.values()) registerProjectFont(font, manager)
}
