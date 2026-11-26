import { beforeAll, describe, expect, test } from 'bun:test'

import { exportFigFile, initCodec, parseFigFile } from '@kalka/core'
import { createEditor } from '@kalka/core/editor'
import { readKalkaArchive, writeKalkaArchive } from '@kalka/core/io/formats/kalka'
import { parseFigBuffer } from '@kalka/fig'

function editorWithFrames() {
  const editor = createEditor()
  const pageId = editor.state.currentPageId
  const frame = editor.graph.createNode('FRAME', pageId, { name: 'Cover', width: 200, height: 100 })
  const child = editor.graph.createNode('RECTANGLE', frame.id, {})
  return { editor, frame, child }
}

describe('Set as thumbnail', () => {
  beforeAll(async () => {
    await initCodec()
  })

  test('takes a top-level frame, one undo step, and refuses a layer inside it', () => {
    const { editor, frame, child } = editorWithFrames()
    expect(editor.setThumbnailNode(child.id)).toBe(false)
    expect(editor.setThumbnailNode(frame.id)).toBe(true)
    expect(editor.graph.thumbnailNodeId).toBe(frame.id)
    editor.undo.undo()
    expect(editor.graph.thumbnailNodeId).toBeNull()
    editor.undo.redo()
    expect(editor.setThumbnailNode(null)).toBe(true)
    expect(editor.graph.thumbnailNodeId).toBeNull()
  })

  test('is kept in a Kalka folder', async () => {
    const { editor, frame } = editorWithFrames()
    editor.setThumbnailNode(frame.id)
    const restored = readKalkaArchive(await writeKalkaArchive(editor.graph))
    expect(restored.thumbnailNodeId).toBe(frame.id)
  })

  test('is written to the .fig document record and read back', async () => {
    const { editor, frame } = editorWithFrames()
    editor.setThumbnailNode(frame.id)
    const bytes = await exportFigFile(editor.graph)
    const document = parseFigBuffer(new Uint8Array(bytes).buffer).nodeChanges.find(
      (change) => change.type === 'DOCUMENT'
    )
    expect(document?.thumbnailInfo?.nodeID).toBeDefined()
    const reopened = await parseFigFile(new Uint8Array(bytes).buffer)
    const node = reopened.thumbnailNodeId ? reopened.getNode(reopened.thumbnailNodeId) : undefined
    expect(node?.name).toBe('Cover')
  })
})
