import { useIntervalFn } from '@vueuse/core'
import { computed, ref, shallowRef, watch, type ComputedRef, type Ref } from 'vue'
import { IndexeddbPersistence } from 'y-indexeddb'
import * as awarenessProtocol from 'y-protocols/awareness'
import * as Y from 'yjs'

import type { SceneGraph } from '@kalka/scene-graph'
import { collaborationMessages } from '@kalka/vue'

import { shareAgentPreviews } from '@/app/collab/agent-preview'
import { useAvatar } from '@/app/collab/avatar'
import { buildRemotePeers } from '@/app/collab/awareness'
import { useCollabIdentity } from '@/app/collab/identity'
import { publishLocalAgents } from '@/app/collab/local-awareness'
import { connectCollabRoom } from '@/app/collab/room/connection'
import { deriveRoomStatus, type RoomStatus, type ServerRoomState } from '@/app/collab/room/status'
import { serverAccount, serverSessionExpired } from '@/app/collab/server/account'
import {
  renameServerDocument,
  saveServerFile,
  takePendingVersion
} from '@/app/collab/server/documents'
import { bindServerPeer } from '@/app/collab/server/peer'
import { replaceDocumentContent } from '@/app/collab/server/version'
import {
  readRoomName,
  readRoot,
  TREE_FORMAT,
  writeRoomName,
  type YNodes
} from '@/app/collab/shared-tree/fields'
import type { JoinCollabRoom } from '@/app/collab/transport'
import { isServerTransport, type ServerRole } from '@/app/collab/transport/server'
import type { RemotePeer } from '@/app/collab/types'
import { bindVariableSync, type YRecords } from '@/app/collab/variables'
import {
  bindCollabGraphEvents,
  createYjsGraphSync,
  registerYjsObservers
} from '@/app/collab/yjs-sync'
import { keepRecoveryElsewhere } from '@/app/document/recovery/kept-elsewhere'
import type { EditorStore } from '@/app/editor/active-store'
import { recordPeerActivity } from '@/app/presence/activity'
import { setPeers } from '@/app/presence/registry'
import { toast } from '@/app/shell/ui'
import { ROOM_STATUS_TICK_MS, ROOM_UNREACHABLE_MS } from '@/constants'

/** How a tab came to be in a room: by sharing its own document, or by joining someone's. */
export type RoomOrigin = 'shared' | 'joined'

/** One room, live in one tab: its document, presence, connection, and saved copy. */
export interface RoomSession {
  readonly roomId: string
  readonly store: EditorStore
  readonly origin: RoomOrigin
  readonly peers: Readonly<Ref<RemotePeer[]>>
  readonly status: ComputedRef<RoomStatus>
  /** Whether the room's document has reached this tab, from a peer or the saved copy. */
  readonly hasDocument: Readonly<Ref<boolean>>
  /**
   * The role a Kalka server gave this person in the room, which may lower their account's when
   * the file is shared to view; null in a live room, which has no access control, and until
   * the server answers.
   */
  readonly serverRole: Readonly<Ref<ServerRole | null>>
  updateCursor(x: number, y: number, pageId: string): void
  updateSelection(ids: string[]): void
  /** Writes the tab's whole document into the room and makes its root the room's. */
  shareDocument(): void
  /** Leaves the room and releases its connection, presence, and saved-copy handle. */
  dispose(): void
}

/** This device's saved copy of a room, so it opens before anyone else is online. */
export interface RoomSavedCopy {
  whenSynced: Promise<unknown>
  destroy(): unknown
}

export interface RoomSessionOptions {
  roomId: string
  store: EditorStore
  origin: RoomOrigin
  joinRoom?: JoinCollabRoom
  openSavedCopy?: (roomId: string, ydoc: Y.Doc) => RoomSavedCopy
  /** How long the tab tries to reach the service that introduces peers before saying it cannot. */
  unreachableMs?: number
  /** How often the tab rechecks its connection while it waits for the file. */
  tickMs?: number
  /**
   * For a server room: takes the version uploaded outside Kalka that waits to be applied, or
   * null when another window took it or there is nothing to apply.
   */
  takePendingVersion?: (roomId: string) => Promise<SceneGraph | null>
  /** For a server room: saves the document as a Kalka file on the server. */
  saveServerFile?: (roomId: string, store: EditorStore) => Promise<void>
  /** For a server room: gives the server document its new name. */
  renameServerDocument?: (roomId: string, name: string) => Promise<void>
  /** Tells a viewer that the edit they just made was put back. */
  onViewOnlyEdit?: () => void
}

function openIndexedDBCopy(roomId: string, ydoc: Y.Doc): RoomSavedCopy {
  return new IndexeddbPersistence(`op-room-${roomId}`, ydoc)
}

const VIEW_ONLY_NOTICE_MS = 4000
let lastViewOnlyNotice = 0

/** Says a viewer's edit was put back, at most every few seconds while they keep trying. */
function noticeViewOnlyEdit() {
  const now = Date.now()
  if (now - lastViewOnlyNotice < VIEW_ONLY_NOTICE_MS) return
  lastViewOnlyNotice = now
  toast.warning(collaborationMessages.get().serverViewOnlyEdit)
}

type CursorState = { x: number; y: number; pageId: string; zoom: number }

export function openRoomSession({
  roomId,
  store,
  origin,
  joinRoom,
  openSavedCopy = openIndexedDBCopy,
  unreachableMs = ROOM_UNREACHABLE_MS,
  tickMs = ROOM_STATUS_TICK_MS,
  takePendingVersion: takeVersion = takePendingVersion,
  saveServerFile: saveFile = saveServerFile,
  renameServerDocument: renameOnServer = renameServerDocument,
  onViewOnlyEdit = noticeViewOnlyEdit
}: RoomSessionOptions): RoomSession {
  const identity = useCollabIdentity()
  const avatar = useAvatar()
  const ydoc = new Y.Doc()
  const awareness = new awarenessProtocol.Awareness(ydoc)
  const ynodes: YNodes = ydoc.getMap('nodes')
  const yimages = ydoc.getMap<Uint8Array>('images')
  const meta = ydoc.getMap<unknown>('meta')
  const yvariables: YRecords = ydoc.getMap('variables')
  const ycollections: YRecords = ydoc.getMap('collections')
  const persistence = openSavedCopy(roomId, ydoc)

  const peers = shallowRef<RemotePeer[]>([])
  const hasDocument = ref(false)
  const savedCopyLoaded = ref(false)
  const openedAt = Date.now()
  const now = ref(openedAt)
  /** When the current stretch of being connected to the service that introduces peers began. */
  const connectedSince = ref<number | null>(null)
  const serverState = ref<ServerRoomState | null>(null)
  const serverRole = ref<ServerRole | null>(null)
  let suppressYjsEvents = false
  let suppressGraphSync = false
  let disposed = false

  const status = computed(() =>
    deriveRoomStatus({
      hasDocument: hasDocument.value,
      savedCopyLoaded: savedCopyLoaded.value,
      openFor: now.value - openedAt,
      connectedFor: connectedSince.value === null ? null : now.value - connectedSince.value,
      discoveryMs: connection.room.discoveryMs,
      unreachableMs,
      peerCount: peers.value.length,
      peersWithFile: peers.value.filter((peer) => peer.hasFile).length,
      server: serverState.value
    })
  )

  const sync = createYjsGraphSync({
    getStore: () => store,
    getYdoc: () => (disposed ? null : ydoc),
    getYnodes: () => (disposed ? null : ynodes),
    getYimages: () => (disposed ? null : yimages),
    setSuppressYjsEvents: (value) => {
      suppressYjsEvents = value
    }
  })

  function refreshDocument() {
    if (disposed) return
    const rootId = readRoot(meta)
    hasDocument.value = rootId !== undefined && store.graph.rootId === rootId
    // Newcomers wait for someone who has the file, so peers say whether they do.
    if (awareness.getLocalState()?.hasFile !== hasDocument.value) {
      awareness.setLocalStateField('hasFile', hasDocument.value)
    }
    // The room's name is the document's: a rename by anyone in it reaches everyone.
    const name = readRoomName(meta)
    if (hasDocument.value && name && store.state.documentName !== name) {
      store.state.documentName = name
    }
  }

  function updatePeers() {
    const next = buildRemotePeers(
      awareness.getStates() as Map<number, Record<string, unknown>>,
      awareness.clientID
    )
    peers.value = next
    setPeers(store, next)
    recordPeerActivity(store, next)
  }

  /** On a server, people appear under their account's name, not a generated one. */
  function displayName(): string {
    const account = serverAccount.value
    return account && isServerTransport(connection.room) ? account.user.name : identity.name.value
  }

  function broadcastIdentity() {
    awareness.setLocalStateField('user', {
      name: displayName(),
      color: identity.color,
      avatar: avatar.seed.value
    })
    awareness.setLocalStateField('treeFormat', TREE_FORMAT)
  }

  const unregisterYjsObservers = registerYjsObservers({
    store,
    ynodes,
    yimages,
    getSuppressYjsEvents: () => suppressYjsEvents,
    setSuppressGraphSync: (value) => {
      suppressGraphSync = value
    },
    applyYjsToGraph: (events) => {
      sync.applyYjsToGraph(events)
      refreshDocument()
    }
  })
  meta.observe(refreshDocument)
  awareness.on('change', updatePeers)

  const connection = connectCollabRoom({
    roomId,
    ydoc,
    awareness,
    updatePeersList: updatePeers,
    joinRoom
  })
  broadcastIdentity()
  const room = connection.room

  function shareDocument() {
    sync.syncAllNodesToYjs()
    variableSync.share()
    writeRoomName(meta, store.state.documentName)
    refreshDocument()
  }

  /** Puts a version uploaded outside Kalka into the room, as one edit everyone receives. */
  function applyVersion(incoming: SceneGraph) {
    if (readRoot(meta) === undefined) {
      store.replaceGraph(incoming)
      shareDocument()
      return
    }
    replaceDocumentContent(store.graph, incoming)
    variableSync.send()
    store.refreshVariables({ variables: store.graph.variables.keys() })
    store.undo.clear()
    store.requestRender()
  }

  const serverRoom = isServerTransport(room) ? room : null
  /** Whether this person may only look: a server's viewer, whose changes the server drops. */
  const isViewOnly = () => serverRoom?.role() === 'viewer'
  let loadedVersion: string | null = null
  let settling: Promise<void> = Promise.resolve()
  /** Read through a function: the session can close while a request is awaited. */
  const isOpen = () => !disposed

  /**
   * After the server's load, or a version arriving: an editor applies the waiting version, and
   * starts a document the server has nothing of, so it never waits for someone who has it.
   */
  async function settleServerDocument(version: string | null) {
    const state = serverState.value
    if (!serverRoom || !state || disposed || serverRoom.role() === 'viewer') return
    state.settling = true
    try {
      await persistence.whenSynced
      if (version && isOpen()) {
        const incoming = await takeVersion(roomId)
        if (incoming && isOpen()) applyVersion(incoming)
      }
      if (isOpen() && readRoot(meta) === undefined) shareDocument()
    } finally {
      state.settling = false
    }
  }

  function queueSettle(version: string | null) {
    settling = settling
      .then(() => settleServerDocument(version))
      .catch((error: unknown) => console.warn('[Kalka server] Could not apply a version', error))
  }

  if (serverRoom) {
    keepRecoveryElsewhere(store.state, true)
    void store.discardRecovery()
    serverState.value = { loaded: false, settling: false, gone: false, signInNeeded: false }
    serverRoom.onGone(() => {
      if (serverState.value) serverState.value.gone = true
    })
    serverRoom.onSignInNeeded((needed) => {
      if (serverState.value) serverState.value.signInNeeded = needed
    })
    serverRoom.onRole((role) => {
      serverRole.value = role
    })
  }
  const stopServerPeer = serverRoom
    ? bindServerPeer({
        room: serverRoom,
        ydoc,
        sendYjsUpdate: (update) => connection.sendYjsUpdate(update),
        saveFile: () => saveFile(roomId, store),
        onPending: (version) => {
          if (serverState.value?.loaded) queueSettle(version)
          else loadedVersion = version
        },
        onLoaded: () => {
          if (serverState.value) serverState.value.loaded = true
          queueSettle(loadedVersion)
          loadedVersion = null
        }
      })
    : undefined

  void persistence.whenSynced.then(() => {
    if (disposed) return undefined
    savedCopyLoaded.value = true
    refreshDocument()
    return undefined
  })
  // Signaling services report no events, so the tab polls while it waits for the file.
  function checkConnection() {
    now.value = Date.now()
    if (!connection.room.signalingConnected()) connectedSince.value = null
    else connectedSince.value ??= now.value
  }
  checkConnection()
  const connectionTimer = useIntervalFn(() => {
    if (!hasDocument.value) checkConnection()
  }, tickMs)

  const stopNameWatch = watch([identity.name, serverAccount, avatar.seed], broadcastIdentity)
  // Signing in, or again, lets a room that was waiting for it in at once.
  const stopSignInWatch = watch(
    () => serverAccount.value !== null && !serverSessionExpired.value,
    (signedIn) => {
      if (signedIn) serverRoom?.retryNow()
    }
  )
  // The server keeps a server document: once it is here, there is nothing left to save.
  const stopSavedWatch = watch(
    () => serverRoom !== null && hasDocument.value && store.hasUnsavedChanges(),
    (unsaved) => {
      if (unsaved) store.markDocumentSaved()
    },
    { immediate: true }
  )
  // A rename in this tab names the room's document, and the server's.
  const stopRenameWatch = watch(
    () => store.state.documentName,
    (name) => {
      if (disposed || !hasDocument.value || !name || readRoomName(meta) === name) return
      if (serverRoom?.role() === 'viewer') return
      writeRoomName(meta, name)
      if (serverRoom) {
        renameOnServer(roomId, name).catch((error: unknown) =>
          console.warn('[Kalka server] Could not rename the file', error)
        )
      }
    }
  )
  const stopZoomWatch = store.onEditorEvent('viewport:changed', (viewport) => {
    const cursor = awareness.getLocalState()?.cursor as CursorState | undefined
    if (cursor) awareness.setLocalStateField('cursor', { ...cursor, zoom: viewport.zoom })
  })
  const stopAgentSync = publishLocalAgents(store, () => awareness, identity.color)
  const stopAgentPreviews = shareAgentPreviews(store, connection)
  const variableSync = bindVariableSync({ store, ydoc, yvariables, ycollections })
  const unbindGraphEvents = bindCollabGraphEvents({
    store,
    getYdoc: () => (disposed ? null : ydoc),
    getYnodes: () => (disposed ? null : ynodes),
    getSuppressGraphSync: () => suppressGraphSync,
    syncLocalEdit: (edit) => {
      if (!isViewOnly()) {
        sync.syncLocalEdit(edit)
        return
      }
      // A viewer's edit would stay on their screen only: it is put back, and they are told why.
      suppressGraphSync = true
      try {
        sync.revertLocalEdit(edit)
        store.undo.clear()
        store.requestRender()
      } finally {
        suppressGraphSync = false
      }
      onViewOnlyEdit()
    }
  })

  return {
    roomId,
    store,
    origin,
    peers,
    status,
    hasDocument,
    serverRole,
    updateCursor(x, y, pageId) {
      awareness.setLocalStateField('cursor', { x, y, pageId, zoom: store.state.zoom })
    },
    updateSelection(ids) {
      awareness.setLocalStateField('selection', ids)
    },
    shareDocument,
    dispose() {
      if (disposed) return
      // Unbinding writes an edit still waiting to be sent, so it runs while the room is open.
      unbindGraphEvents()
      variableSync.dispose()
      disposed = true
      connectionTimer.pause()
      stopNameWatch()
      stopRenameWatch()
      stopSavedWatch()
      stopSignInWatch()
      stopZoomWatch()
      stopAgentSync()
      stopAgentPreviews()
      stopServerPeer?.()
      if (serverRoom) keepRecoveryElsewhere(store.state, false)
      meta.unobserve(refreshDocument)
      unregisterYjsObservers()
      // Destroying the awareness can emit a last change; nothing here should react to it.
      awareness.off('change', updatePeers)
      void connection.room.leave()
      awareness.destroy()
      void persistence.destroy()
      ydoc.destroy()
      peers.value = []
      setPeers(store, [])
    }
  }
}
