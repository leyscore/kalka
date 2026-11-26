import { afterEach, describe, expect, test } from 'bun:test'

import { getRecoveryStore } from '@/app/document/recovery/store'
import { listDrafts } from '@/app/home/drafts'
import { duplicateDraft, duplicatePath } from '@/app/home/duplicate'

afterEach(async () => {
  await getRecoveryStore().clear()
})

describe('Duplicate on Home', () => {
  test('a kept draft gets a second draft named "<name> copy" with the same content', async () => {
    const figBytes = new Uint8Array([1, 2, 3])
    await getRecoveryStore().write({ id: 'kept', documentName: 'Poster', figBytes })
    const [draft] = await listDrafts()
    if (!draft) throw new Error('No draft')

    expect(await duplicateDraft(draft)).toBe(true)
    const drafts = await listDrafts()
    expect(drafts.map((entry) => entry.name).toSorted()).toEqual(['Poster', 'Poster copy'])
    const copy = drafts.find((entry) => entry.name === 'Poster copy')
    const snapshot = copy?.snapshotId ? await getRecoveryStore().read(copy.snapshotId) : null
    expect(snapshot?.figBytes).toEqual(figBytes)
  })

  test('a file copy is named beside it, numbered past the copies already there', async () => {
    const taken = new Set(['/designs/Poster copy.fig', '/designs/Poster copy 2.fig'])
    const copy = await duplicatePath('/designs/Poster.fig', async (path) => taken.has(path))
    expect(copy).toBe('/designs/Poster copy 3.fig')
    expect(await duplicatePath('C:\\work\\logo.pen', async () => false)).toBe(
      'C:\\work\\logo copy.pen'
    )
  })
})
