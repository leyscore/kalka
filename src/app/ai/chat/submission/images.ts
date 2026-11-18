import type { FileUIPart } from 'ai'
import { fromUint8Array } from 'js-base64'

import { analyzeAttachedImages } from '@/app/ai/attachment/image/analyze'
import { prepareImageAttachment } from '@/app/ai/attachment/image/prepare'
import type { ImageAttachmentDraft } from '@/app/ai/attachment/image/types'
import { resolveAIModelRole } from '@/app/ai/models/store'
import type { EditorStore } from '@/app/editor/active-store'

/** Whether the chat talks to a coding agent, which reads images itself, rather than a model. */
function designAgentReadsImages(): boolean {
  return resolveAIModelRole('design')?.connection.providerID.startsWith('acp:') === true
}

/**
 * Prepares a message's images for the chat. A coding agent gets the images themselves, as
 * files; a model gets what the Vision model found in them, since it may not read images.
 */
export async function prepareSubmittedImages(
  editor: EditorStore,
  text: string,
  images: ImageAttachmentDraft[],
  agentReadsImages: () => boolean = designAgentReadsImages
) {
  const prepared = await Promise.all(images.map((image) => prepareImageAttachment(image.file)))
  if (agentReadsImages()) {
    const files: FileUIPart[] = prepared.map((image, index) => ({
      type: 'file',
      mediaType: image.mediaType,
      filename: images[index]?.file.name,
      url: `data:${image.mediaType};base64,${fromUint8Array(image.data)}`
    }))
    return { prepared, findings: null, files }
  }
  const findings = await analyzeAttachedImages(editor, text, prepared)
  return { prepared, findings, files: [] }
}
