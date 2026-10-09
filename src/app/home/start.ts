import { openDemoDocument } from '@/app/demo/document'
import { offerTourOnFirstDocument } from '@/app/onboarding/tour'
import { openBrowserFileFromURL } from '@/app/shell/menu/files'
import { createDocumentInCurrentTab } from '@/app/tabs'

/** Sizes a new design can start from, in CSS pixels. */
export const FRAME_PRESETS = [
  { id: 'desktop', width: 1440, height: 900 },
  { id: 'laptop', width: 1280, height: 800 },
  { id: 'tablet', width: 834, height: 1194 },
  { id: 'mobile', width: 390, height: 844 },
  { id: 'social', width: 1080, height: 1350 }
] as const
export type FramePresetID = (typeof FRAME_PRESETS)[number]['id']

/** A new document that starts with one frame of the preset's size, in view and selected. */
export async function startWithFrame(name: string, width: number, height: number): Promise<void> {
  const { store } = createDocumentInCurrentTab()
  await store.canvasReady
  store.createFrameFromPreset({ name, width, height })
  store.zoomToSelection()
  offerTourOnFirstDocument()
}

export function startBlank(): void {
  createDocumentInCurrentTab()
  offerTourOnFirstDocument()
}

export async function startWithSample(): Promise<void> {
  const { store } = createDocumentInCurrentTab()
  await openDemoDocument(store)
  offerTourOnFirstDocument()
}

/** HTML pasted on the home screen, opened as a new document of editable layers. */
export async function startWithHTML(html: string, documentName: string): Promise<void> {
  const { store } = createDocumentInCurrentTab()
  await store.importDOMText(html, { documentName })
}

/** A full https link, or null for anything else. */
export function parseDocumentURL(text: string): URL | null {
  try {
    const url = new URL(text.trim())
    return url.protocol === 'https:' ? url : null
  } catch {
    return null
  }
}

export function startFromURL(url: URL): Promise<void> {
  return openBrowserFileFromURL(url, { credentials: 'omit' })
}
