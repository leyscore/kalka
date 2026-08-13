import { computed, shallowReactive } from 'vue'

import type { ReferenceImagePresentation } from '@/app/ai/reference-image/types'

const attachments = shallowReactive(new Map<string, ReferenceImagePresentation[]>())

export function visibleUserMessageText(messageId: string, text: string): string {
  const attachment = attachments.get(messageId)?.[0]
  return attachment?.displayText ?? text
}

export function referenceImagesForMessage(messageId: string) {
  return computed(() => attachments.get(messageId) ?? [])
}

export function addReferenceImagePresentation(attachment: ReferenceImagePresentation): void {
  const previous = attachments.get(attachment.messageId)
  if (previous) {
    for (const staleAttachment of previous) URL.revokeObjectURL(staleAttachment.previewURL)
  }
  attachments.set(attachment.messageId, [attachment])
}

export function clearReferenceImagePresentations(): void {
  for (const messageAttachments of attachments.values()) {
    for (const attachment of messageAttachments) URL.revokeObjectURL(attachment.previewURL)
  }
  attachments.clear()
}
