import { describe, expect, test } from 'bun:test'

import type { LanguageModel } from 'ai'

import { SceneGraph } from '@open-pencil/scene-graph'

import {
  analyzeReferenceImage,
  designMessageWithReferenceFindings,
  type ReferenceImageAnalysisDependencies
} from '@/app/ai/reference-image/analyze'
import { validateReferenceImageFile } from '@/app/ai/reference-image/prepare'
import type { PreparedReferenceImage } from '@/app/ai/reference-image/types'
import type { EditorStore } from '@/app/editor/session/create'

const reference: PreparedReferenceImage = {
  data: new Uint8Array([4, 5, 6]),
  blob: new Blob(),
  mediaType: 'image/png',
  originalWidth: 1600,
  originalHeight: 900,
  width: 1280,
  height: 720
}

describe('reference image analysis', () => {
  test('rejects unsupported and oversized source files', () => {
    expect(
      validateReferenceImageFile(new File(['x'], 'reference.gif', { type: 'image/gif' }))
    ).toBe('Choose a PNG, JPEG, or WebP image.')
    expect(
      validateReferenceImageFile(
        new File([new Uint8Array(20 * 1024 * 1024 + 1)], 'reference.png', {
          type: 'image/png'
        })
      )
    ).toBe('Reference images must be 20 MB or smaller.')
  })

  test('sends bounded images only to Vision and returns text findings', async () => {
    const graph = new SceneGraph()
    const page = graph.getPages()[0]
    const frame = graph.createNode('FRAME', page.id, { width: 2560, height: 1600 })
    const requests: unknown[] = []
    const store = {
      graph,
      state: { currentPageId: page.id, selectedIds: new Set([frame.id]) },
      renderExportImage: async () => new Uint8Array([1, 2, 3])
    } as EditorStore
    const dependencies: ReferenceImageAnalysisDependencies = {
      createRuntime: async () =>
        ({
          kind: 'direct',
          model: {} as LanguageModel,
          role: {
            requestedRole: 'vision',
            profile: { maxOutputTokens: 8000, reasoningEffort: 'low' },
            connection: { providerID: 'openrouter' }
          }
        }) as never,
      inspect: async (options) => {
        requests.push(options)
        return { text: 'Use a tighter grid and stronger heading contrast.' } as never
      }
    }

    const findings = await analyzeReferenceImage(
      store,
      'Match this layout',
      reference,
      dependencies
    )

    expect(findings).toBe('Use a tighter grid and stronger heading contrast.')
    const request = requests[0] as {
      providerOptions?: unknown
      messages: Array<{ content: Array<{ type: string; data?: Uint8Array }> }>
    }
    expect(request.providerOptions).toEqual({ openrouter: { reasoning: { effort: 'low' } } })
    expect(request.messages[0]?.content.map((part) => part.type)).toEqual(['text', 'file', 'file'])
    expect(request.messages[0]?.content[1]?.data).toEqual(reference.data)
  })

  test('passes textual findings rather than image data to Design', () => {
    const message = designMessageWithReferenceFindings(
      'Match this layout',
      'reference.png',
      'Use a 12-column grid.'
    )

    expect(message).toContain('Match this layout')
    expect(message).toContain('Use a 12-column grid.')
    expect(message).not.toContain('base64')
  })
})
