import { shallowRef } from 'vue'

import { IS_TAURI } from '@/constants'

import {
  confirmDocumentClose,
  type ClosableDocument,
  type CloseChoice,
  type DocumentsCloseChoice
} from './controller'

/** What the unsaved-changes dialog asks: one document, or every unsaved one before quitting. */
export type ClosePrompt =
  | { kind: 'document'; documentName: string }
  | { kind: 'documents'; documentNames: string[] }

export type ClosePromptAnswer<P extends ClosePrompt> = P extends { kind: 'document' }
  ? CloseChoice
  : DocumentsCloseChoice

export const closePrompt = shallowRef<ClosePrompt | null>(null)
let resolvePrompt: ((choice: CloseChoice | DocumentsCloseChoice) => void) | null = null
let pending = Promise.resolve()

/** Answers the open prompt; an answer the prompt does not offer counts as Cancel. */
export function answerClosePrompt(choice: CloseChoice | DocumentsCloseChoice): void {
  const prompt = closePrompt.value
  const resolve = resolvePrompt
  resolvePrompt = null
  closePrompt.value = null
  const offered =
    prompt?.kind === 'documents'
      ? choice === 'save-all' || choice === 'review' || choice === 'discard-all'
      : choice === 'save' || choice === 'discard'
  resolve?.(offered ? choice : 'cancel')
}

/** The desktop window may sit behind other apps or in the Dock when Quit asks. */
async function bringWindowForward(): Promise<void> {
  if (!IS_TAURI) return
  try {
    const { getCurrentWindow } = await import('@tauri-apps/api/window')
    const window = getCurrentWindow()
    await window.unminimize()
    await window.setFocus()
  } catch (error) {
    console.warn('[Close] Could not bring the window forward', error)
  }
}

function show<P extends ClosePrompt>(prompt: P): Promise<ClosePromptAnswer<P>> {
  return new Promise((resolve) => {
    resolvePrompt = resolve as (choice: CloseChoice | DocumentsCloseChoice) => void
    closePrompt.value = prompt
    void bringWindowForward()
  })
}

/** Runs prompts one at a time, so a tab close and Quit never share the dialog. */
function enqueue<T>(run: () => Promise<T>): Promise<T> {
  const result = pending.then(run)
  pending = result.then(
    () => undefined,
    () => undefined
  )
  return result
}

export function requestDocumentClose(document: ClosableDocument, documentName: string) {
  return enqueue(() =>
    confirmDocumentClose(document, () => show({ kind: 'document', documentName }))
  )
}

/** Asks once about several unsaved documents: save them all, review each, or discard them. */
export function requestDocumentsClose(documentNames: string[]): Promise<DocumentsCloseChoice> {
  return enqueue(() => show({ kind: 'documents', documentNames }))
}
