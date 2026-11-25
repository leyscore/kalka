import { describe, expect, test } from 'bun:test'

import { FRESH_LIBRARY_ID, FRESH_LIBRARY_REVISION, MemoryLibraryCatalog } from '@kalka/core/library'
import { SceneGraph } from '@kalka/scene-graph'

import { createEditorStore } from '@/app/editor/session'
import { BuiltinLibraryCatalog } from '@/app/libraries/catalog/builtin'
import { LibraryService, libraryAssetId } from '@/app/libraries/service'

describe('built-in libraries', () => {
  test('come first in the catalog, resolve to the built revision and refuse publishing', async () => {
    const catalog = new BuiltinLibraryCatalog(new MemoryLibraryCatalog())
    const [fresh] = await catalog.listLibraries()
    expect(fresh).toMatchObject({
      libraryId: FRESH_LIBRARY_ID,
      latestRevisionId: FRESH_LIBRARY_REVISION
    })
    const revision = await catalog.getRevision(FRESH_LIBRARY_ID, 'any-older-revision')
    expect(revision.manifest.revisionId).toBe(FRESH_LIBRARY_REVISION)
    expect(
      catalog.publishRevision({ libraryId: FRESH_LIBRARY_ID, name: 'x', graph: new SceneGraph() })
    ).rejects.toThrow('cannot be published to')
  })

  test('can be enabled and dragged from like a published library', async () => {
    const editor = createEditorStore(new SceneGraph())
    const service = new LibraryService(new MemoryLibraryCatalog())
    await service.enable(editor, FRESH_LIBRARY_ID)
    await service.refresh(editor)
    expect(service.enabledAssets.value.some((asset) => asset.asset.key === 'mesh-field')).toBe(true)
    const placed = await service.insertComponent({
      libraryId: FRESH_LIBRARY_ID,
      assetKey: 'ticker-band'
    })
    expect(editor.graph.getNode(placed.id)?.type).toBe('INSTANCE')
  })

  test('bring an enabled asset dropped from the assets panel into the document', async () => {
    const editor = createEditorStore(new SceneGraph())
    const service = new LibraryService(new MemoryLibraryCatalog())
    await service.enable(editor, FRESH_LIBRARY_ID)
    await service.refresh(editor)
    const componentId = await service.materializeEnabledAsset(
      editor,
      libraryAssetId(FRESH_LIBRARY_ID, 'ticker-band')
    )
    expect(editor.graph.getNode(componentId ?? '')?.type).toBe('COMPONENT')
    expect(
      await service.materializeEnabledAsset(editor, libraryAssetId(FRESH_LIBRARY_ID, 'missing'))
    ).toBeNull()
  })
})
