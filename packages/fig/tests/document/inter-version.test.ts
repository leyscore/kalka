import { expect, test } from 'bun:test'

import { materializeDocument, materializeFigFragment } from '@kalka/fig'
import type { NodeChange } from '@kalka/kiwi/fig/codec'

const guid = (localID: number) => ({ sessionID: 0, localID })

const records: NodeChange[] = [
  { guid: guid(0), type: 'DOCUMENT' },
  { guid: guid(1), type: 'CANVAS', parentIndex: { guid: guid(0), position: '!' } },
  {
    guid: guid(2),
    type: 'TEXT',
    name: 'Title',
    parentIndex: { guid: guid(1), position: '!' },
    fontName: { family: 'Inter', style: 'Regular', postscript: 'Inter-Regular' }
  }
]

test('a document or a paste from Figma keeps the Inter Figma lays text out with', () => {
  expect(materializeDocument(records).graph.interVersion).toBe('3.19')
  expect(materializeFigFragment(records).graph.interVersion).toBe('3.19')
})
