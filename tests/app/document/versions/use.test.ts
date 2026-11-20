import { afterEach, describe, expect, test } from 'bun:test'

import { SceneGraph } from '@kalka/scene-graph'

import { useDocumentVersions } from '@/app/document/versions/use'
import type { EditorStore } from '@/app/editor/active-store'

import { asDouble } from '#tests/helpers/doubles'

const calls: string[] = []

/** The desktop bridge, answering git calls for a document with one change to record. */
function installBridge(failing: string | null = null) {
  const answers: Record<string, unknown> = {
    'git.status': {
      root: '/work',
      branch: 'main',
      upstream: null,
      ahead: 0,
      behind: 0,
      files: [{ path: 'poster.fig', status: 'M' }]
    },
    'git.log': [],
    'git.remote': null,
    'git.identity': { name: 'Ada', email: 'ada@example.com' }
  }
  const listeners = { addEventListener: () => undefined, removeEventListener: () => undefined }
  Object.assign(globalThis, {
    window: {
      ...listeners,
      kalkaNative: {
        call: async (name: string) => {
          calls.push(name)
          if (name === failing)
            return { ok: false, error: 'rejected: the remote has newer versions' }
          return { ok: true, value: answers[name] ?? 'abc123' }
        },
        on: () => () => undefined
      }
    }
  })
}

afterEach(() => {
  calls.length = 0
  Reflect.deleteProperty(globalThis, 'window')
})

function store(saved: boolean) {
  const state = { reloaded: 0 }
  const double = asDouble<EditorStore>({
    graph: new SceneGraph(),
    getDocumentFilePath: () => '/work/poster.fig',
    hasUnsavedChanges: () => true,
    saveFigFile: async () => saved,
    reloadFromDisk: async () => {
      state.reloaded++
    }
  })
  return { double, state }
}

describe('versions of a document with unsaved changes', () => {
  test('restoring stops when the document cannot be saved first, so its edits are kept', async () => {
    installBridge()
    const { double, state } = store(false)
    const versions = useDocumentVersions(double)
    await versions.refresh()
    const version = { hash: 'a'.repeat(40), author: 'Ada', time: 1, subject: 'First', agents: [] }
    await versions.restore(version, { before: 'Before', restored: 'Restored' })
    expect(calls).not.toContain('git.restore')
    expect(state.reloaded).toBe(0)
    expect(versions.error.value).not.toBe('')
  })

  test('recording stops when the document cannot be saved first', async () => {
    installBridge()
    const { double } = store(false)
    const versions = useDocumentVersions(double)
    await versions.refresh()
    versions.message.value = 'Hero'
    await versions.commit()
    expect(calls).not.toContain('git.commit')
    expect(versions.error.value).not.toBe('')
  })

  test('an operation that fails keeps saying why once the panel reads the repository again', async () => {
    installBridge('git.push')
    const { double } = store(true)
    const versions = useDocumentVersions(double)
    await versions.refresh()
    await versions.push()
    expect(versions.error.value).toContain('rejected')
  })
})
