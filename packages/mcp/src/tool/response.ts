import { Buffer } from 'node:buffer'

import * as v from 'valibot'

import { MAX_RESULT_BYTES, fail, resultTooLargeMessage } from '#mcp/result'
import type { MCPContent, MCPResult } from '#mcp/result'
import type { MCPToolScope } from '#mcp/tool/scope'

/** `_meta` key of the document a tool call ran on, for clients that read results as data. */
export const DOCUMENT_META_KEY = 'kalka/document'

/** How a tool that returns a file hands it over. */
export const FILE_DELIVERIES = ['inline', 'url'] as const
export type FileDelivery = (typeof FILE_DELIVERIES)[number]

export const fileDeliveryInput = v.optional(
  v.pipe(
    v.picklist(FILE_DELIVERIES),
    v.description(
      '"inline" (default) returns the file in the response, plus a short-lived URL when the server has one; "url" returns only the URL and metadata, which keeps the response small and allows files too large to inline'
    )
  )
)

/** The document and page the app ran a call on, as it reports them beside the result. */
const DocumentTarget = v.object({
  documentId: v.string(),
  documentName: v.string(),
  path: v.optional(v.string()),
  pageId: v.string(),
  pageName: v.string(),
  tokensHash: v.optional(v.string())
})
export type DocumentTarget = v.InferOutput<typeof DocumentTarget>

const AssetLink = v.object({ url: v.string(), mimeType: v.string(), expiresAt: v.string() })
type AssetLink = v.InferOutput<typeof AssetLink>

const FileResult = v.looseObject({ base64: v.string(), mimeType: v.string() })
type FileResult = v.InferOutput<typeof FileResult>

/**
 * The target the app reported, or null. Sharing only the selection keeps the file's path to
 * itself: the client was given layers, not a place on disk.
 */
export function documentTarget(value: unknown, scope: MCPToolScope): DocumentTarget | null {
  const parsed = v.safeParse(DocumentTarget, value)
  if (!parsed.success) return null
  if (scope === 'document') return parsed.output
  const { path: _path, ...target } = parsed.output
  return target
}

/**
 * Names the document a successful result came from, in a text block after the result, so a
 * model sees which file it read and whether the tokens changed since, and in `_meta` for programs.
 * The result's own blocks stay as they were, so clients that parse the first block still can.
 */
export function withDocument(result: MCPResult, target: DocumentTarget | null): MCPResult {
  if (!target || result.isError) return result
  return {
    ...result,
    content: [...result.content, { type: 'text', text: JSON.stringify({ target }) }],
    _meta: { ...result._meta, [DOCUMENT_META_KEY]: target }
  }
}

export function isFileResult(value: unknown): value is FileResult {
  return v.is(FileResult, value)
}

function extensionOf(mimeType: string): string {
  return mimeType.split('/')[1]?.replace('jpeg', 'jpg') ?? 'bin'
}

/** Images as image content, which clients show; anything else, a PDF, as an embedded file. */
function inlineContent(tool: string, file: FileResult): MCPContent {
  if (file.mimeType.startsWith('image/')) {
    return { type: 'image', data: file.base64, mimeType: file.mimeType }
  }
  return {
    type: 'resource',
    resource: {
      uri: `kalka://exports/${tool}.${extensionOf(file.mimeType)}`,
      mimeType: file.mimeType,
      blob: file.base64
    }
  }
}

function linkContent(tool: string, asset: AssetLink): MCPContent {
  return {
    type: 'resource_link',
    uri: asset.url,
    name: `${tool}.${extensionOf(asset.mimeType)}`,
    mimeType: asset.mimeType,
    description: `Expires ${asset.expiresAt}`
  }
}

/**
 * A file result as MCP content: the file inline unless the client asked for a URL or it is too
 * large to inline, a link to the server's copy when there is one, and the result's metadata.
 */
export function fileResult(
  tool: string,
  file: FileResult,
  assetValue: unknown,
  delivery: FileDelivery
): MCPResult {
  const { base64, mimeType, ...metadata } = file
  const parsedAsset = v.safeParse(AssetLink, assetValue)
  const asset = parsedAsset.success ? parsedAsset.output : null
  const bytes = Buffer.byteLength(base64, 'utf8')
  const tooLarge = bytes > MAX_RESULT_BYTES
  if (!asset && tooLarge) {
    return fail(
      new Error(
        resultTooLargeMessage(
          `Image from "${tool}"`,
          bytes,
          'Export a smaller region or lower the scale/resolution.'
        )
      )
    )
  }
  const details: Record<string, unknown> = { mimeType, ...metadata }
  const content: MCPContent[] = []
  if (!asset) {
    content.push(inlineContent(tool, file))
    if (delivery === 'url') {
      details.note = 'No URL: the MCP server has no TCP listener, so the file is inline'
    }
  } else {
    if (delivery === 'inline' && !tooLarge) content.push(inlineContent(tool, file))
    if (delivery === 'inline' && tooLarge) details.note = 'Too large to inline; fetch the URL'
    content.push(linkContent(tool, asset))
    details.url = asset.url
    details.expiresAt = asset.expiresAt
  }
  content.push({ type: 'text', text: JSON.stringify(details) })
  return { content }
}
