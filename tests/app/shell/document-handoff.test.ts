import { describe, expect, test } from 'bun:test'

import { handoffFile, handoffSender } from '@/app/shell/document-handoff'

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

describe('handoffSender', () => {
  test('is the tab that opened this one', () => {
    const tab = asDouble<Window>({ postMessage: () => undefined })
    const self = asDouble<Window>({ opener: tab, parent: null })
    expect(handoffSender(asDouble<Window>({ ...self, parent: self }))).toBe(tab)
  })

  test('is the page embedding this one when no tab opened it', () => {
    const page = asDouble<Window>({ postMessage: () => undefined })
    expect(handoffSender(asDouble<Window>({ opener: null, parent: page }))).toBe(page)
  })

  test('is nobody for a tab on its own', () => {
    const self = asDouble<Window>({ opener: null })
    Object.assign(self, { parent: self })
    expect(handoffSender(self)).toBeNull()
  })
})
