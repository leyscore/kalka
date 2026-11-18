import { computed, ref, shallowRef, toRaw } from 'vue'

import {
  addCommentThread,
  commentPosition,
  deleteCommentThread,
  documentComments,
  findCommentThread,
  mentionedAgent,
  moveCommentThread,
  replyToComment,
  setCommentAgentState,
  setCommentResolved,
  type CommentAnchor,
  type CommentThread,
  type SceneGraph
} from '@kalka/scene-graph'

import { queueChatPrompt } from '@/app/ai/chat/queued-prompt'
import { isConfigured } from '@/app/ai/chat/storage'
import { useCollabIdentity } from '@/app/collab/identity'
import { watchFrameReviews } from '@/app/comments/reviews'
import type { EditorStore } from '@/app/editor/active-store'
import { flyToNextCreation } from '@/app/presence/fly-to-work'
import { presenceOf } from '@/app/presence/registry'
import { useLeftPanel } from '@/app/shell/left-panel/use'

/**
 * Comments in the editor: the comment mode the C key turns on, the thread open on the canvas, and
 * the requests a comment makes of the agent. Threads themselves live in the document
 * (`@kalka/scene-graph` comments), so they are saved with it and reach MCP agents too.
 */

/** The mention that asks the document's own agent, the one in its chat panel. */
export const BUILT_IN_AGENT_MENTION = 'agent'

interface CommentsState {
  /** Whether a click on the canvas pins a new comment. */
  placing: boolean
  /** Whether pins show on the canvas. */
  pinsVisible: boolean
  /** The thread open on the canvas, or a new one being written at `draft`. */
  openThreadId: string | null
  draft: CommentAnchor | null
}

const states = new WeakMap<SceneGraph, ReturnType<typeof createState>>()

/**
 * Counts changes to a graph's comments, wherever they come from: this view, an agent's MCP reply,
 * a document read from disk. Comment writes leave the design alone, so nothing else redraws.
 */
const revisions = new WeakMap<SceneGraph, ReturnType<typeof shallowRef<number>>>()

function revisionOf(reached: SceneGraph) {
  const graph = toRaw(reached)
  let revision = revisions.get(graph)
  if (!revision) {
    const counter = shallowRef(0)
    revision = counter
    revisions.set(graph, counter)
    graph.onNodeEvents({
      updated: (id, changes) => {
        if (id === graph.rootId && 'comments' in changes) counter.value++
      }
    })
  }
  return revision
}

function createState() {
  return ref<CommentsState>({
    placing: false,
    pinsVisible: true,
    openThreadId: null,
    draft: null
  })
}

/**
 * One state per document, however its editor is reached: the canvas has its tab's store, and
 * shortcuts the proxy that forwards to the active tab.
 */
function stateOf(store: EditorStore) {
  const key = toRaw(store.graph)
  let state = states.get(key)
  if (!state) {
    state = createState()
    states.set(key, state)
  }
  return state
}

/** The name people's comments and approvals carry: theirs in a room, or "You". */
export function currentPersonName(): string {
  return useCollabIdentity().name.value.trim() || 'You'
}

/** C: comment mode on or off; off also drops a comment not posted yet. */
export function toggleCommentPlacing(store: EditorStore): void {
  const state = stateOf(store)
  const placing = !state.value.placing
  state.value = {
    ...state.value,
    placing,
    pinsVisible: placing || state.value.pinsVisible,
    draft: placing ? state.value.draft : null
  }
}

/** Starts a comment on a layer, pinned at its top-right corner, as its context menu does. */
export function startCommentOn(store: EditorStore, nodeId: string): void {
  const node = store.graph.getNode(nodeId)
  if (!node) return
  let page: typeof node | undefined = node
  while (page && page.type !== 'CANVAS')
    page = page.parentId ? store.graph.getNode(page.parentId) : undefined
  if (!page) return
  const state = stateOf(store)
  state.value = {
    ...state.value,
    pinsVisible: true,
    openThreadId: null,
    draft: { pageId: page.id, nodeId, x: node.width, y: 0 }
  }
}

/** Shift+C: pins shown or hidden on the canvas. */
export function toggleCommentPins(store: EditorStore): void {
  const state = stateOf(store)
  state.value = { ...state.value, pinsVisible: !state.value.pinsVisible }
}

/** Whether comment mode is on, for the toolbar. */
export function commentPlacing(store: EditorStore): boolean {
  return stateOf(store).value.placing
}

/** Escape: leaves comment mode, or closes the open thread. Whether there was anything to leave. */
export function leaveComments(store: EditorStore): boolean {
  const state = stateOf(store)
  const { placing, draft, openThreadId } = state.value
  if (!placing && !draft && !openThreadId) return false
  state.value = { ...state.value, placing: false, draft: null, openThreadId: null }
  return true
}

/** The agents a comment can ask: the document's own, and the agents working in it now. */
export function mentionableAgents(store: EditorStore): string[] {
  const present = presenceOf(store).agents.value.map((agent) => agent.name)
  return [BUILT_IN_AGENT_MENTION, ...present.filter((name) => name !== BUILT_IN_AGENT_MENTION)]
}

/**
 * The message the document's agent is sent for a thread: what was asked, where, and how to answer,
 * so its final word lands in the thread rather than only in the chat.
 */
export function agentRequestPrompt(store: EditorStore, thread: CommentThread): string {
  const layer = thread.anchor.nodeId ? store.graph.getNode(thread.anchor.nodeId) : undefined
  const where = layer
    ? `on the layer "${layer.name}" (${layer.id})`
    : `at the point (${Math.round(thread.anchor.x)}, ${Math.round(thread.anchor.y)}) of page ${thread.anchor.pageId}`
  const conversation = thread.messages
    .map((message) => `${message.author.name}: ${message.text}`)
    .join('\n')
  return [
    `A comment ${where} asks you for something (thread ${thread.id}):`,
    conversation,
    'Do what it asks on the canvas. Then answer in the thread with reply_to_comment { thread_id, text }, in a sentence or two saying what you changed; if you need a decision first, ask it there instead and stop.'
  ].join('\n\n')
}

export function useComments(store: EditorStore) {
  /**
   * The state of the document open now. Opening a file replaces the editor's graph, so the state
   * is looked up again rather than kept from when this view was made.
   */
  const state = computed<CommentsState>({
    get: () => {
      void store.state.sceneVersion
      watchFrameReviews(store.graph)
      return stateOf(store).value
    },
    set: (next) => {
      stateOf(store).value = next
    }
  })
  const identity = useCollabIdentity()
  const { show } = useLeftPanel()
  const threads = computed(() => {
    void store.state.sceneVersion
    void revisionOf(store.graph).value
    return documentComments(store.graph)
  })
  const pageThreads = computed(() =>
    threads.value.filter((thread) => thread.anchor.pageId === store.state.currentPageId)
  )
  const openCount = computed(() => threads.value.filter((thread) => !thread.resolved).length)
  const openThread = computed(() =>
    state.value.openThreadId ? findCommentThread(store.graph, state.value.openThreadId) : undefined
  )

  function author() {
    return { kind: 'person' as const, name: identity.name.value.trim() || 'You' }
  }

  /** Comments changed: the document has unsaved changes, though the design did not. */
  function changed() {
    store.requestRefresh()
  }

  /** Asks the document's agent through its chat, which answers in the thread. */
  function askBuiltInAgent(thread: CommentThread) {
    setCommentAgentState(store.graph, thread.id, 'working')
    changed()
    const latest = thread.messages.at(-1)
    queueChatPrompt(store, agentRequestPrompt(store, thread), {
      displayText: latest?.text ?? '',
      nodes: thread.anchor.nodeId
        ? [store.graph.getNode(thread.anchor.nodeId)]
            .filter((node) => node !== undefined)
            .map((node) => ({ id: node.id, name: node.name, type: node.type }))
        : []
    })
    show('ai')
  }

  /**
   * Hands a request for the document's agent to its chat. With no agent set up, the request waits
   * on the pin, where an agent connected over MCP takes it with its next call.
   */
  function dispatch(thread: CommentThread | undefined) {
    // Whoever takes the request, what it makes for it comes into view as it lands.
    if (thread?.agent?.state === 'waiting') flyToNextCreation(store)
    if (
      thread?.agent?.state === 'waiting' &&
      thread.agent.name === BUILT_IN_AGENT_MENTION &&
      isConfigured.value
    )
      askBuiltInAgent(thread)
  }

  return {
    state,
    threads,
    pageThreads,
    openCount,
    openThread,
    position: (thread: CommentThread) => commentPosition(store.graph, thread),
    setPlacing(placing: boolean) {
      state.value = { ...state.value, placing, draft: placing ? state.value.draft : null }
    },
    togglePins() {
      state.value = { ...state.value, pinsVisible: !state.value.pinsVisible }
    },
    startDraft(anchor: CommentAnchor) {
      state.value = { ...state.value, draft: anchor, openThreadId: null, pinsVisible: true }
    },
    cancelDraft() {
      state.value = { ...state.value, draft: null }
    },
    open(id: string | null) {
      state.value = { ...state.value, openThreadId: id, draft: null }
    },
    /** Posts the draft as a new thread, asking an agent it mentions. */
    post(text: string): CommentThread | null {
      const anchor = state.value.draft
      if (!anchor || !text.trim()) return null
      const agent = mentionedAgent(text, mentionableAgents(store))
      const thread = addCommentThread(store.graph, anchor, author(), text, { agent })
      state.value = { ...state.value, draft: null, openThreadId: thread.id, placing: false }
      changed()
      dispatch(thread)
      return thread
    },
    reply(id: string, text: string) {
      if (!text.trim()) return
      const agent = mentionedAgent(text, mentionableAgents(store))
      const thread = replyToComment(store.graph, id, author(), text, { agent })
      changed()
      dispatch(thread)
    },
    resolve(id: string, resolved: boolean) {
      setCommentResolved(store.graph, id, resolved, author().name)
      changed()
    },
    /** Asks the agent again after it stopped. */
    retry(id: string) {
      const thread = setCommentAgentState(store.graph, id, 'waiting')
      changed()
      dispatch(thread)
    },
    move(id: string, anchor: CommentAnchor) {
      moveCommentThread(store.graph, id, anchor)
      changed()
    },
    remove(id: string) {
      deleteCommentThread(store.graph, id)
      if (state.value.openThreadId === id) state.value = { ...state.value, openThreadId: null }
      changed()
    }
  }
}

export type CommentsController = ReturnType<typeof useComments>
