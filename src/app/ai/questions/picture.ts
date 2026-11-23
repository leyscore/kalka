import { fromUint8Array } from 'js-base64'

import type { AgentAnswerImage, AgentQuestionImage } from '@kalka/core/figma-api'

import { prepareImageAttachment } from '@/app/ai/attachment/image/prepare'

/**
 * A picture the person sends as their answer, scaled down as chat attachments are, so the agent
 * sees it at a size models read.
 */
export async function readAnswerPicture(file: File): Promise<AgentAnswerImage> {
  const prepared = await prepareImageAttachment(file)
  return { name: file.name, mimeType: prepared.mediaType, base64: fromUint8Array(prepared.data) }
}

/** How a picked picture reads in the answer: what it shows and where it comes from. */
export function pictureAnswer(image: AgentQuestionImage): string {
  return `${image.label} (${image.link ?? image.url})`
}
