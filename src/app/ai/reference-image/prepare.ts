import type {
  PreparedReferenceImage,
  ReferenceImageMediaType
} from '@/app/ai/reference-image/types'
import { REFERENCE_IMAGE_MEDIA_TYPES } from '@/app/ai/reference-image/types'
import { boundedImageScale } from '@/app/ai/tools/vision'

const MAX_REFERENCE_FILE_BYTES = 20 * 1024 * 1024
const MAX_REFERENCE_PIXELS = 40_000_000
export const REFERENCE_IMAGE_MAX_EDGE = 1280

export function isReferenceImageMediaType(value: string): value is ReferenceImageMediaType {
  return REFERENCE_IMAGE_MEDIA_TYPES.some((mediaType) => mediaType === value)
}

export function validateReferenceImageFile(file: File): string | null {
  if (!isReferenceImageMediaType(file.type)) return 'Choose a PNG, JPEG, or WebP image.'
  if (file.size > MAX_REFERENCE_FILE_BYTES) return 'Reference images must be 20 MB or smaller.'
  return null
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Could not decode the reference image.'))
    image.src = url
  })
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mediaType: ReferenceImageMediaType,
  quality?: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Could not prepare the reference image.'))
      },
      mediaType,
      quality
    )
  })
}

export async function prepareReferenceImage(
  file: File,
  maxEdge = REFERENCE_IMAGE_MAX_EDGE
): Promise<PreparedReferenceImage> {
  const validationError = validateReferenceImageFile(file)
  if (validationError) throw new Error(validationError)

  const sourceURL = URL.createObjectURL(file)
  try {
    const image = await loadImage(sourceURL)
    if (image.naturalWidth * image.naturalHeight > MAX_REFERENCE_PIXELS) {
      throw new Error('Reference image dimensions are too large.')
    }
    const scale = boundedImageScale(image.naturalWidth, image.naturalHeight, maxEdge)
    if (scale <= 0) throw new Error('Reference image has invalid dimensions.')

    const width = Math.max(1, Math.round(image.naturalWidth * scale))
    const height = Math.max(1, Math.round(image.naturalHeight * scale))
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Could not prepare the reference image.')
    context.drawImage(image, 0, 0, width, height)
    if (!isReferenceImageMediaType(file.type)) {
      throw new Error('Choose a PNG, JPEG, or WebP image.')
    }
    const mediaType = file.type
    const blob = await canvasToBlob(canvas, mediaType, mediaType === 'image/png' ? undefined : 0.88)

    return {
      data: new Uint8Array(await blob.arrayBuffer()),
      blob,
      mediaType,
      originalWidth: image.naturalWidth,
      originalHeight: image.naturalHeight,
      width,
      height
    }
  } finally {
    URL.revokeObjectURL(sourceURL)
  }
}
