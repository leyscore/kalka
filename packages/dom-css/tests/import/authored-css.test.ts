import { expect, test } from 'bun:test'

import { htmlToSceneGraph } from '#dom-css/index'

const HTML =
  '<div style="display:flex;gap:12px;width:320px;height:80px;padding:1rem;cursor:pointer;transition:opacity 200ms"></div>'

async function importedRow(keepAuthoredCSS: boolean) {
  const graph = await htmlToSceneGraph(HTML, { keepAuthoredCSS })
  const [row] = graph.getPages().flatMap((page) => graph.getChildren(page.id))
  if (!row) throw new Error('Nothing imported')
  return row
}

test('an import keeps the CSS its author wrote that the fields do not give back', async () => {
  const row = await importedRow(true)
  expect(row.layoutMode).toBe('HORIZONTAL')
  expect(row.itemSpacing).toBe(12)
  expect(row.paddingTop).toBe(16)
  expect(row.style).toEqual({ padding: '1rem', cursor: 'pointer', transition: 'opacity 200ms' })
})

test('without it, an import keeps fields only', async () => {
  expect((await importedRow(false)).style).toEqual({})
})
