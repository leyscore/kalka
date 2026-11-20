import { describe, expect, test } from 'bun:test'

import { handoffFile, handoffOpener } from '@/app/shell/document-handoff'

import { asDouble } from '#tests/helpers/doubles'

const opener = {}
const file = new File([new Uint8Array([1, 2, 3])], 'shop.fig')

function message(data: unknown, origin = 'https://kalka.design', source: unknown = opener) {
  return asDouble<MessageEvent>({ data, origin, source })
}

describe('handoffFile', () => {
  test('takes the file the opener posts from kalka.design', () => {
    expect(handoffFile(message({ type: 'kalka:open-file', file }), opener)).toBe(file)
  })

  test('ignores another site, another window, and other messages', () => {
    expect(
      handoffFile(message({ type: 'kalka:open-file', file }, 'https://evil.example'), opener)
    ).toBeNull()
    expect(
      handoffFile(message({ type: 'kalka:open-file', file }, 'https://kalka.design', {}), opener)
    ).toBeNull()
    expect(handoffFile(message({ type: 'kalka:open-file', file: 'shop.fig' }), opener)).toBeNull()
    expect(handoffFile(message({ type: 'other', file }), opener)).toBeNull()
  })
})

describe('handoffOpener', () => {
  test('takes an opener from another origin, whose window has no Object prototype here', () => {
    const crossOrigin = Object.create(null) as Record<string, unknown>
    crossOrigin.postMessage = () => undefined
    expect(handoffOpener(crossOrigin)).toBe(crossOrigin)
  })

  test('takes no opener when there is none or it cannot be posted to', () => {
    expect(handoffOpener(null)).toBeNull()
    expect(handoffOpener({})).toBeNull()
  })
})
