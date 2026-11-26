import { afterEach, describe, expect, test } from 'bun:test'

import { getRecoveryStore } from '@/app/document/recovery/store'
import { createEditorStore } from '@/app/editor/session'
import { listDrafts } from '@/app/home/drafts'
import { closeTab, createTab, getTabsSnapshot } from '@/app/tabs'

afterEach(async () => {
  for (const tab of getTabsSnapshot()) await closeTab(tab.id, 'discard')
  await getRecoveryStore().clear()
})

const bytes = new Uint8Array([1, 2, 3])

describe('drafts on Home', () => {
  test('lists documents recovery keeps that have no file, the last changed first', async () => {
    const store = getRecoveryStore()
    await store.write({ id: 'older', documentName: 'Older', figBytes: bytes })
    await store.write({
      id: 'poster',
      documentName: 'Poster',
      figBytes: bytes,
      sourcePath: '/p.fig'
    })
    await Bun.sleep(5)
    await store.write({ id: 'newer', documentName: 'Newer', figBytes: bytes })

    const drafts = await listDrafts()
    expect(drafts.map((draft) => [draft.name, draft.snapshotId])).toEqual([
      ['Newer', 'newer'],
      ['Older', 'older']
    ])
  })

  test('lists an open document with edits and no file once, as its tab', async () => {
    const editor = createEditorStore()
    const tab = createTab(editor)
    editor.setPageColor({ r: 0.5, g: 0.5, b: 0.5, a: 1 })
    await editor.persistRecoveryNow()

    const drafts = await listDrafts()
    expect(drafts).toHaveLength(1)
    expect(drafts[0]?.tabId).toBe(tab.id)
    expect(drafts[0]?.snapshotId).toBeUndefined()
  })

  test('leaves out an open document that has a file', async () => {
    const editor = createEditorStore()
    createTab(editor)
    editor.setPlannedFilePath('/documents/poster.fig')
    editor.setPageColor({ r: 0.5, g: 0.5, b: 0.5, a: 1 })
    expect(await listDrafts()).toEqual([])
  })
})
