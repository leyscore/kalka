import { afterEach, beforeEach, describe, expect, test } from 'bun:test'

import { clearInMemoryClipboardHTML, setInMemoryClipboardHTML } from '@/app/editor/clipboard/memory'
import { readClipboardHTML, type ClipboardReader } from '@/app/editor/clipboard/read'

import { asDouble } from '#tests/helpers/doubles'

const DESIGN = '<span data-buffer="<!--(figma)AAAA(/figma)-->"></span>'
const LAST_COPY = '<span data-buffer="<!--(figma)BBBB(/figma)-->"></span>'

function item(types: Record<string, string>): ClipboardItem {
  return asDouble<ClipboardItem>({
    types: Object.keys(types),
    getType: async (type: string) => new Blob([types[type] ?? ''], { type })
  })
}

beforeEach(() => setInMemoryClipboardHTML(LAST_COPY))
afterEach(() => clearInMemoryClipboardHTML())

describe('readClipboardHTML', () => {
  test('reads design layers from the system clipboard', async () => {
    expect(await readClipboardHTML({ read: async () => [item({ 'text/html': DESIGN })] })).toBe(
      DESIGN
    )
  })

  test('a readable clipboard without design layers is not replaced by the last copy', async () => {
    const clipboard = { read: async () => [item({ 'text/plain': 'copied elsewhere' })] }
    expect(await readClipboardHTML(clipboard)).toBeNull()
  })

  test('asks the browser for the HTML as written, which keeps the design data', async () => {
    let options: Parameters<ClipboardReader['read']>[0]
    const clipboard: ClipboardReader = {
      read: async (readOptions) => {
        options = readOptions
        return [item({ 'text/html': DESIGN })]
      }
    }
    await readClipboardHTML(clipboard)
    expect(options).toEqual({ unsanitized: ['text/html'] })
  })

  test('takes the last copy when the clipboard kept only its text', async () => {
    setInMemoryClipboardHTML(LAST_COPY, 'Frame 1')
    const clipboard = {
      read: async () => [item({ 'text/html': '<meta charset="utf-8">', 'text/plain': 'Frame 1' })]
    }
    expect(await readClipboardHTML(clipboard)).toBe(LAST_COPY)
  })

  test('falls back to the last copy when the clipboard cannot be read', async () => {
    const clipboard = {
      read: async (): Promise<ClipboardItem[]> => {
        throw new Error('Read permission denied')
      }
    }
    expect(await readClipboardHTML(clipboard)).toBe(LAST_COPY)
  })
})
