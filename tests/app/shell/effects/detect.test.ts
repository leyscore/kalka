import { describe, expect, test } from 'bun:test'

import { detectSoftwareRendering } from '@/app/shell/effects'

import { asDouble } from '#tests/helpers/doubles'

/** A document whose canvases offer the WebGL contexts given, and record what was asked. */
function documentWith(contexts: Partial<Record<'webgl' | 'webgl2', object>>) {
  const requests: { kind: string; caveat: unknown }[] = []
  const doc = asDouble<Document>({
    createElement: () => ({
      getContext: (
        kind: 'webgl' | 'webgl2',
        options: { failIfMajorPerformanceCaveat?: boolean }
      ) => {
        requests.push({ kind, caveat: options.failIfMajorPerformanceCaveat })
        return contexts[kind] ?? null
      }
    })
  })
  return { doc, requests }
}

describe('software rendering', () => {
  test('a machine that cannot create an accelerated WebGL context draws in software', () => {
    const { doc, requests } = documentWith({})

    expect(detectSoftwareRendering(doc)).toBe(true)
    expect(requests.every((request) => request.caveat === true)).toBe(true)
  })

  test('an accelerated context means a GPU, and the context is released', () => {
    let lost = false
    const context = {
      getExtension: () => ({
        loseContext: () => {
          lost = true
        }
      })
    }
    const { doc } = documentWith({ webgl2: context })

    expect(detectSoftwareRendering(doc)).toBe(false)
    expect(lost).toBe(true)
  })
})
