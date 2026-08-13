export const REFERENCE_IMAGE_MEDIA_TYPES = ['image/png', 'image/jpeg', 'image/webp'] as const

export type ReferenceImageMediaType = (typeof REFERENCE_IMAGE_MEDIA_TYPES)[number]

export type ReferenceImageDraft = {
  file: File
  previewURL: string
}

export type ReferenceImagePresentation = {
  id: string
  messageId: string
  name: string
  mediaType: ReferenceImageMediaType
  originalWidth: number
  originalHeight: number
  previewWidth: number
  previewHeight: number
  previewURL: string
  displayText: string
}

export type PreparedReferenceImage = {
  data: Uint8Array
  blob: Blob
  mediaType: ReferenceImageMediaType
  originalWidth: number
  originalHeight: number
  width: number
  height: number
}
