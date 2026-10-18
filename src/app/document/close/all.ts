import type { ClosableDocument, DocumentsCloseChoice } from './controller'
import { requestDocumentClose, requestDocumentsClose } from './prompt'

interface OpenDocument extends ClosableDocument {
  state: { documentName: string }
  persistRecoveryNow(): Promise<void>
  discardRecovery(): Promise<void>
}

export interface CloseAllPrompts<D extends OpenDocument> {
  /** Asks about one document, as closing its tab does. */
  confirm: (document: D, documentName: string) => ReturnType<typeof requestDocumentClose>
  /** Asks once when several documents have unsaved changes. */
  chooseMany: (documentNames: string[]) => Promise<DocumentsCloseChoice>
  /** Shows the document a review is about to ask for, such as by switching to its tab. */
  reveal?: (document: D) => void
}

const defaultPrompts: CloseAllPrompts<OpenDocument> = {
  confirm: requestDocumentClose,
  chooseMany: requestDocumentsClose
}

async function saveAll(documents: OpenDocument[]): Promise<boolean> {
  for (const document of documents) {
    // An untitled document opens the Save picker; cancelling it stops the close.
    if (!(await document.saveFigFile()) || document.hasUnsavedChanges()) return false
  }
  return true
}

/**
 * Approves closing every open document. One unsaved document asks as its tab would; several
 * ask once, offering Save All, Review (each in turn) and Discard All, as macOS apps do on Quit.
 */
export async function confirmAllDocuments<D extends OpenDocument>(
  getDocuments: () => D[],
  prompts: CloseAllPrompts<D> = defaultPrompts
): Promise<boolean> {
  const documents = getDocuments()
  const discarded = new Set<D>()
  function canClose() {
    const current = getDocuments()
    return (
      current.length === documents.length &&
      current.every(
        (document) =>
          documents.includes(document) && (discarded.has(document) || !document.hasUnsavedChanges())
      )
    )
  }

  const unsaved = documents.filter((document) => document.hasUnsavedChanges())
  if (unsaved.length > 1) {
    const choice = await prompts.chooseMany(unsaved.map((document) => document.state.documentName))
    if (choice === 'cancel') return false
    if (choice === 'discard-all') for (const document of unsaved) discarded.add(document)
    if (choice === 'save-all' && !(await saveAll(unsaved))) return false
  }

  for (const document of documents) {
    if (discarded.has(document)) continue
    if (document.hasUnsavedChanges()) prompts.reveal?.(document)
    const choice = await prompts.confirm(document, document.state.documentName)
    if (choice === 'cancel') return false
    if (choice === 'discard') discarded.add(document)
  }
  if (!canClose()) return false
  for (const document of documents) {
    if (discarded.has(document)) await document.discardRecovery()
    else await document.persistRecoveryNow()
  }
  return canClose()
}
