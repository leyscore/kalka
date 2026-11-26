import { describe, expect, test } from 'bun:test'

import { SceneGraph } from '@kalka/scene-graph'

import { openRoomSession, type RoomSession } from '@/app/collab/session'
import type { ServerRole, ServerRoomTransport } from '@/app/collab/transport/server'
import {
  LOAD_DONE,
  LOAD_UPDATE,
  SERVER_LOAD,
  SERVER_PEER,
  SERVER_PENDING
} from '@/app/collab/transport/server-protocol'
import type { CollabActionReceiver } from '@/app/collab/transport/types'
import { isRecoveryKeptElsewhere } from '@/app/document/recovery/kept-elsewhere'
import { createEditorStore, type EditorStore } from '@/app/editor/session'

import { expectDefined } from '#tests/helpers/assert'

const ROOM = 'cccccccccccccccccccccccccccccccc'
const YJS_UPDATE = 'yjs-update'
const encoder = new TextEncoder()

type Connection = {
  id: string
  role: ServerRole
  receivers: Map<string, CollabActionReceiver[]>
  joinHandlers: ((peerId: string) => void)[]
  goneHandlers: (() => void)[]
  signInHandlers: ((needed: boolean) => void)[]
}

/**
 * A Kalka server's room in memory: it keeps the updates editors send, relays them, loads them
 * into each window that opens the document, and announces a version waiting to be applied, as
 * `server/src/room.ts` does.
 */
function createServerRoom() {
  const log: Uint8Array[] = []
  const connections = new Set<Connection>()
  let pending: { graph: SceneGraph; version: string } | null = null
  let versions = 0
  let takes = 0
  let nextId = 1

  const deliver = (connection: Connection, namespace: string, data: Uint8Array, from: string) => {
    const copy = data.slice()
    queueMicrotask(() => {
      for (const receive of connection.receivers.get(namespace) ?? []) receive(copy, from)
    })
  }
  const withKind = (kind: number, data: Uint8Array) => Uint8Array.of(kind, ...data)

  function join(role: ServerRole): ServerRoomTransport {
    const self: Connection = {
      id: `window-${nextId++}`,
      role,
      receivers: new Map(),
      joinHandlers: [],
      goneHandlers: [],
      signInHandlers: []
    }
    queueMicrotask(() => {
      const others = [...connections]
      connections.add(self)
      for (const handler of self.joinHandlers) handler(SERVER_PEER)
      for (const other of others) {
        for (const handler of other.joinHandlers) handler(self.id)
        for (const handler of self.joinHandlers) handler(other.id)
      }
      for (const update of log)
        deliver(self, SERVER_LOAD, withKind(LOAD_UPDATE, update), SERVER_PEER)
      if (pending) deliver(self, SERVER_PENDING, encoder.encode(pending.version), SERVER_PEER)
      deliver(self, SERVER_LOAD, Uint8Array.of(LOAD_DONE), SERVER_PEER)
    })
    return {
      server: true,
      role: () => role,
      onRole: (handler) => queueMicrotask(() => handler(role)),
      onGone: (handler) => void self.goneHandlers.push(handler),
      onSignInNeeded: (handler) => void self.signInHandlers.push(handler),
      retryNow: () => undefined,
      makeAction(namespace) {
        return [
          (data, target) => {
            if (target === SERVER_PEER) return
            if (role === 'viewer' && namespace === YJS_UPDATE) return
            for (const other of connections) {
              if (other === self || (target && other.id !== target)) continue
              deliver(other, namespace, data, self.id)
            }
            if (namespace === YJS_UPDATE && !target) log.push(data.slice())
          },
          (handler) => {
            self.receivers.set(namespace, [...(self.receivers.get(namespace) ?? []), handler])
          }
        ]
      },
      onPeerJoin: (handler) => void self.joinHandlers.push(handler),
      onPeerLeave: () => undefined,
      signalingConnected: () => connections.has(self),
      discoveryMs: 0,
      async leave() {
        connections.delete(self)
      }
    }
  }

  return {
    join,
    /** An upload over WebDAV or a restore: a version that waits, announced to open windows. */
    upload(graph: SceneGraph) {
      pending = { graph, version: `v${++versions}` }
      for (const connection of connections) {
        deliver(connection, SERVER_PENDING, encoder.encode(pending.version), SERVER_PEER)
      }
    },
    /** `GET` then `DELETE …/pending`: only the first window to take a version gets it. */
    async take(): Promise<SceneGraph | null> {
      takes += 1
      const taken = pending
      pending = null
      return taken?.graph ?? null
    },
    /** The session ended on the server: open windows must sign in to come back. */
    signOut(needed: boolean) {
      for (const connection of connections) {
        for (const handler of connection.signInHandlers) handler(needed)
      }
    },
    deleteDocument() {
      for (const connection of connections) for (const handler of connection.goneHandlers) handler()
    },
    takes: () => takes
  }
}

const noSavedCopy = () => ({ whenSynced: Promise.resolve(), destroy: () => undefined })

async function settle() {
  for (let round = 0; round < 30; round++) {
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 0)
    })
  }
}

function newStore(name = 'Imported') {
  const store = createEditorStore(new SceneGraph())
  store.state.documentName = name
  return store
}

/** A document with one page holding one rectangle, as a `.kalka` file would bring. */
function uploadedGraph(layerName: string, layerId = 'uploaded:card') {
  const graph = new SceneGraph()
  const page = expectDefined(graph.getPages()[0], 'page')
  graph.createNodeWithId(layerId, 'RECTANGLE', page.id, { name: layerName })
  return graph
}

function layerNames(store: EditorStore) {
  return store.graph
    .getPages()
    .flatMap((page) => store.graph.getChildren(page.id).map((node) => node.name))
}

async function withServer(
  run: (
    open: (
      role: ServerRole,
      saveFile?: () => Promise<void>
    ) => { session: RoomSession; store: EditorStore },
    server: ReturnType<typeof createServerRoom>,
    renames: readonly string[],
    notices: { readonly viewOnly: number }
  ) => Promise<void>
) {
  const server = createServerRoom()
  const renames: string[] = []
  const notices = { viewOnly: 0 }
  const opened: { session: RoomSession; store: EditorStore }[] = []
  try {
    await run(
      (role, saveFile = async () => undefined) => {
        const store = newStore()
        const session = openRoomSession({
          roomId: ROOM,
          store,
          origin: 'joined',
          openSavedCopy: noSavedCopy,
          joinRoom: () => server.join(role),
          takePendingVersion: () => server.take(),
          saveServerFile: saveFile,
          renameServerDocument: async (_roomId, name) => {
            renames.push(name)
          },
          onViewOnlyEdit: () => {
            notices.viewOnly += 1
          }
        })
        opened.push({ session, store })
        return { session, store }
      },
      server,
      renames,
      notices
    )
  } finally {
    for (const { session, store } of opened) {
      session.dispose()
      store.preparationController.dispose()
    }
  }
}

describe('server documents', () => {
  test('a file uploaded outside Kalka opens for the first editor and reaches everyone', async () => {
    await withServer(async (open, server) => {
      server.upload(uploadedGraph('From WebDAV'))
      const first = open('editor')
      await settle()
      expect(first.session.status.value).toBe('alone')
      expect(layerNames(first.store)).toEqual(['From WebDAV'])

      const second = open('editor')
      await settle()
      expect(second.session.status.value).toBe('live')
      expect(layerNames(second.store)).toEqual(['From WebDAV'])
      expect(server.takes()).toBe(1)
    })
  })

  test('a version uploaded while the file is open replaces it for everyone', async () => {
    await withServer(async (open, server) => {
      server.upload(uploadedGraph('First version', 'uploaded:first'))
      const editor = open('editor')
      const viewer = open('viewer')
      await settle()
      expect(layerNames(viewer.store)).toEqual(['First version'])

      server.upload(uploadedGraph('Second version', 'uploaded:second'))
      await settle()
      expect(layerNames(editor.store)).toEqual(['Second version'])
      expect(layerNames(viewer.store)).toEqual(['Second version'])
      expect(editor.session.status.value).toBe('live')
    })
  })

  test('an editor starts a server document that holds nothing, so nobody waits for it', async () => {
    await withServer(async (open) => {
      const editor = open('editor')
      await settle()
      expect(editor.session.status.value).toBe('alone')
      const viewer = open('viewer')
      await settle()
      expect(viewer.session.status.value).toBe('live')
    })
  })

  test('a viewer opening an empty server document is told it is empty, not to wait for people', async () => {
    await withServer(async (open) => {
      const viewer = open('viewer')
      await settle()
      expect(viewer.session.status.value).toBe('empty')
    })
  })

  test('a document deleted on the server says so in the tab that has it open', async () => {
    await withServer(async (open, server) => {
      const editor = open('editor')
      await settle()
      server.deleteDocument()
      expect(editor.session.status.value).toBe('missing')
    })
  })

  test('someone not signed in is asked to sign in, and an open file stays open', async () => {
    await withServer(async (open, server) => {
      const editor = open('editor')
      await settle()
      server.signOut(true)
      expect(editor.session.status.value).toBe('alone')

      const store = newStore()
      let needSignIn: (needed: boolean) => void = () => undefined
      // A server that refuses the ticket: nothing loads until the person signs in.
      const signedOut: ServerRoomTransport = {
        server: true,
        role: () => null,
        onRole: () => undefined,
        onGone: () => undefined,
        onSignInNeeded: (handler) => {
          needSignIn = handler
        },
        retryNow: () => undefined,
        makeAction: () => [() => undefined, () => undefined],
        onPeerJoin: () => undefined,
        onPeerLeave: () => undefined,
        signalingConnected: () => false,
        discoveryMs: 0,
        leave: async () => undefined
      }
      const session = openRoomSession({
        roomId: 'dddddddddddddddddddddddddddddddd',
        store,
        origin: 'joined',
        openSavedCopy: noSavedCopy,
        joinRoom: () => signedOut
      })
      try {
        await settle()
        needSignIn(true)
        expect(session.status.value).toBe('signed-out')
      } finally {
        session.dispose()
        store.preparationController.dispose()
      }
    })
  })

  test('a rename reaches the server and everyone who has the file open', async () => {
    await withServer(async (open, _server, renames) => {
      const editor = open('editor')
      await settle()
      const other = open('editor')
      const viewer = open('viewer')
      await settle()
      editor.store.state.documentName = 'Pricing page v2'
      await settle()
      expect(renames).toEqual(['Pricing page v2'])
      expect(other.store.state.documentName).toBe('Pricing page v2')
      expect(viewer.store.state.documentName).toBe('Pricing page v2')
      expect(renames).toEqual(['Pricing page v2'])
    })
  })

  test("a viewer's edit is put back and they are told, while others never see it", async () => {
    await withServer(async (open, server, _renames, notices) => {
      server.upload(uploadedGraph('Shared card'))
      const editor = open('editor')
      await settle()
      const viewer = open('viewer')
      await settle()
      // The role the room gives, which the editor shows as view only.
      expect(viewer.session.serverRole.value).toBe('viewer')
      expect(editor.session.serverRole.value).toBe('editor')
      // The viewer's editor is view only up front: its drawing tools are off.
      expect(viewer.store.state.viewOnly).toBe(true)
      expect(editor.store.state.viewOnly).toBeFalsy()
      viewer.store.setTool('RECTANGLE')
      expect(viewer.store.state.activeTool).toBe('SELECT')
      const page = expectDefined(viewer.store.graph.getPages()[0], 'page')
      viewer.store.graph.createNode('RECTANGLE', page.id, { name: 'Viewer box' })
      const card = expectDefined(viewer.store.graph.getChildren(page.id)[0], 'card')
      viewer.store.graph.updateNode(card.id, { name: 'Renamed by viewer' })
      await settle()
      expect(layerNames(viewer.store)).toEqual(['Shared card'])
      expect(layerNames(editor.store)).toEqual(['Shared card'])
      expect(notices.viewOnly).toBe(1)
    })
  })

  test('a server document has nothing left to save once it is here', async () => {
    await withServer(async (open) => {
      const editor = open('editor')
      await settle()
      const page = expectDefined(editor.store.graph.getPages()[0], 'page')
      editor.store.graph.createNode('RECTANGLE', page.id, { name: 'Saved at once' })
      await settle()
      expect(editor.store.hasUnsavedChanges()).toBe(false)
    })
  })

  test('a server document leaves nothing to recover on this device while it is open', async () => {
    await withServer(async (open) => {
      const editor = open('editor')
      await settle()
      expect(isRecoveryKeptElsewhere(editor.store.state)).toBe(true)
      editor.session.dispose()
      expect(isRecoveryKeptElsewhere(editor.store.state)).toBe(false)
    })
  })

  test('the Kalka file is saved when the tab closes right after an edit', async () => {
    await withServer(async (open) => {
      let saves = 0
      const editor = open('editor', async () => {
        saves += 1
      })
      await settle()
      const page = expectDefined(editor.store.graph.getPages()[0], 'page')
      editor.store.graph.createNode('RECTANGLE', page.id, { name: 'Last edit' })
      await settle()
      expect(saves).toBe(0)
      editor.session.dispose()
      expect(saves).toBe(1)
    })
  })
})
