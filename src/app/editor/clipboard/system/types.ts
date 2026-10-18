import type { ClipboardPayload, CopyOptions } from '@kalka/core/editor'
import type { Vector } from '@kalka/scene-graph/primitives'

import type { EditorStore } from '@/app/editor/active-store'
export type { ClipboardPayload } from '@kalka/core/editor'

export interface SystemClipboard {
  copy(store: EditorStore, options?: CopyOptions): Promise<boolean>
  paste(store: EditorStore, cursorPos?: Vector): Promise<boolean>
}

export type BrowserClipboardReadResult =
  | { available: false }
  | { available: true; html: string | null; text: string | null }

export interface BrowserClipboardIO {
  write(payload: Promise<ClipboardPayload>): Promise<boolean>
  read(): Promise<BrowserClipboardReadResult>
}
