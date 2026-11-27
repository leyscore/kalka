import { shallowRef } from 'vue'

export interface LibraryReviewRequest {
  libraryId: string
  assetKey: string
  instanceIds: string[]
  initialInstanceId: string
}

export const libraryReviewRequest = shallowRef<LibraryReviewRequest | null>(null)

export function openLibraryReview(request: LibraryReviewRequest): void {
  libraryReviewRequest.value = request
}

export function closeLibraryReview(): void {
  libraryReviewRequest.value = null
}

/** Documents whose library updates were already announced, so a tab switch does not repeat it. */
const announcedUpdates = new WeakSet<object>()

/** Whether a document's library updates are yet to be announced, marking them announced. */
export function announceLibraryUpdatesOnce(document: object): boolean {
  if (announcedUpdates.has(document)) return false
  announcedUpdates.add(document)
  return true
}
