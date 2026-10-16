import { describe, expect, test } from 'bun:test'

import { createEditor } from '@kalka/core/editor'
import type { CSSDeclarations } from '@kalka/scene-graph'

type Editor = ReturnType<typeof createEditor>

function setup(style: CSSDeclarations) {
  const editor = createEditor()
  const page = editor.graph.getPages()[0]
  const box = editor.graph.createNode('FRAME', page.id, { width: 300, height: 200 })
  const layer = editor.graph.createNode('FRAME', box.id, { x: 20, y: 20, width: 80, height: 40 })
  editor.graph.updateNode(layer.id, { style })
  editor.select([layer.id])
  return { editor, layer }
}

/**
 * Edits whose history records only the fields they set: the CSS kept as written for those fields
 * gives way, the rest stays, and undo brings back what gave way.
 */
const EDITS: [string, CSSDeclarations, keyof CSSDeclarations, (editor: Editor, id: string) => void][] =
  [
    ['opacity', { opacity: 'var(--fade)' }, 'opacity', (editor) => editor.setOpacity(0.5)],
    [
      'rotation',
      { transform: 'rotate(10deg) scale(2)' },
      'transform',
      (editor, id) => editor.rotateNodes([id], 15)
    ],
    [
      'auto layout',
      { gap: '1rem', padding: '2rem' },
      'gap',
      (editor, id) => editor.setLayoutMode(id, 'HORIZONTAL')
    ],
    [
      'nudge',
      { left: '10%', top: '5%' },
      'left',
      (editor) => {
        editor.nudgeSelected(10, 0)
        editor.flushNudge()
      }
    ]
  ]

describe('undo restores the CSS an edit let give way', () => {
  for (const [name, written, property, edit] of EDITS) {
    test(name, () => {
      const { editor, layer } = setup({ ...written, cursor: 'pointer' })
      edit(editor, layer.id)
      expect(layer.style[property]).toBeUndefined()
      expect(layer.style.cursor).toBe('pointer')

      editor.undo.undo()
      expect(layer.style).toEqual({ ...written, cursor: 'pointer' })
      editor.undo.redo()
      expect(layer.style[property]).toBeUndefined()
      editor.undo.undo()
      expect(layer.style).toEqual({ ...written, cursor: 'pointer' })
    })
  }
})
