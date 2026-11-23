import { fromUint8Array } from 'js-base64'

import type { AgentAnswerImage, AgentQuestionImage } from '@kalka/core/figma-api'

import { prepareImageAttachment } from '@/app/ai/attachment/image/prepare'

/**
 * A picture the person sends as their answer, scaled down as chat attachments are, so the agent
 * sees it at a size models read.
 */
export async function readAnswerPicture(file: File): Promise<AgentAnswerImage> {
  const prepared = await prepareImageAttachment(file)
  return {
    name: file.name,
    mimeType: prepared.mediaType,
    base64: fromUint8Array(prepared.data)
  }
}

/** The longer side of a picked reference the agent sees: enough to read a layout, small enough for several. */
const REFERENCE_PICTURE_EDGE = 1024

/** How long a picked reference may take to download before the answer goes without it. */
const REFERENCE_PICTURE_TIMEOUT_MS = 10_000

/**
 * An offered picture the person picked, downloaded and scaled down so the agent sees it as well
 * as reads its name. Null when the host refuses it or it is not a PNG, JPEG or WebP image: the
 * answer still names it.
 */
export async function readPickedPicture(
  image: AgentQuestionImage
): Promise<AgentAnswerImage | null> {
  try {
    const response = await fetch(image.url, {
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      signal: AbortSignal.timeout(REFERENCE_PICTURE_TIMEOUT_MS)
    })
    if (!response.ok || !response.url.startsWith('https://')) return null
    const blob = await response.blob()
    const file = new File([blob], image.label, {
      type: blob.type.split(';')[0]?.trim() ?? ''
    })
    const prepared = await prepareImageAttachment(file, REFERENCE_PICTURE_EDGE)
    return {
      name: image.label,
      mimeType: prepared.mediaType,
      base64: fromUint8Array(prepared.data)
    }
  } catch {
    return null
  }
}

/** How a picked picture reads in the answer: what it shows and where it comes from. */
export function pictureAnswer(image: AgentQuestionImage): string {
  return `${image.label} (${image.link ?? image.url})`
}
