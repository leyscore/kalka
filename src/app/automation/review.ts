import { reviewedFrameOf, type SceneGraph } from '@kalka/scene-graph'

/**
 * Visual review for agents: the artboards an agent changed and has not looked at since. Agents
 * that check their work with a screenshot catch what reading the tree misses, such as text that
 * wraps, a layer pushed out of place or a class that did not apply, so every write result names
 * what is still unseen until the agent looks.
 */

/** Tools whose result shows the agent how layers look. */
const LOOKING_TOOLS = new Set(['get_screenshot', 'diff_visual', 'export_image'])

const unseen = new WeakMap<SceneGraph, Map<string, Set<string>>>()

function unseenOf(graph: SceneGraph, session: string): Set<string> {
  let sessions = unseen.get(graph)
  if (!sessions) {
    sessions = new Map()
    unseen.set(graph, sessions)
  }
  let ids = sessions.get(session)
  if (!ids) {
    ids = new Set()
    sessions.set(session, ids)
  }
  return ids
}

/** The agent of `session` changed `nodeIds`, so their artboards need another look. */
export function noteAgentWrites(
  graph: SceneGraph,
  session: string,
  nodeIds: readonly string[]
): void {
  const ids = unseenOf(graph, session)
  for (const id of nodeIds) {
    const artboard = reviewedFrameOf(graph, id)
    if (artboard) ids.add(artboard)
  }
}

function lookedAt(args: Record<string, unknown>): string[] {
  const ids: string[] = []
  for (const key of ['id', 'from', 'to']) if (typeof args[key] === 'string') ids.push(args[key])
  if (Array.isArray(args.ids))
    ids.push(...args.ids.filter((id): id is string => typeof id === 'string'))
  return ids
}

/**
 * The agent of `session` ran `tool`: a look at a layer counts for its artboard, and a look at a
 * page, or at the current page with no id, for every artboard on it.
 */
export function noteAgentLook(
  graph: SceneGraph,
  session: string,
  tool: string,
  args: Record<string, unknown>,
  currentPageId: string
): void {
  if (!LOOKING_TOOLS.has(tool)) return
  const ids = unseenOf(graph, session)
  const targets = lookedAt(args)
  for (const target of targets.length > 0 ? targets : [currentPageId]) {
    const node = graph.getNode(target)
    if (node?.type === 'CANVAS') {
      for (const child of node.childIds) ids.delete(child)
      continue
    }
    const artboard = reviewedFrameOf(graph, target)
    if (artboard) ids.delete(artboard)
  }
}

/** What the agent of `session` changed and has not seen yet, for its next write result. */
export function reviewReminder(graph: SceneGraph, session: string): string | null {
  const ids = unseenOf(graph, session)
  for (const id of ids) if (!graph.getNode(id)) ids.delete(id)
  if (ids.size === 0) return null
  const named = [...ids].map((id) => `"${graph.getNode(id)?.name ?? id}" (${id})`)
  return `Not looked at since you changed it: ${named.join(', ')}. Call get_screenshot on each and judge it: does it fit its frame, is the spacing deliberate (tight inside groups, generous between), does the hierarchy read, is the contrast enough, is it aligned, is the content real? Fix what fails before you move on or finish.`
}

/** Sessions that said what they are doing with `set_status`. */
const announced = new Set<string>()

/** The agent of `session` ran `tool`; `set_status` with some text counts as announcing. */
export function noteAgentStatus(
  session: string,
  tool: string,
  args: Record<string, unknown>
): void {
  if (tool === 'set_status' && typeof args.text === 'string' && args.text.trim())
    announced.add(session)
}

/** Sessions that announced their sections with `plan_sections`, or were already asked to. */
const planned = new Set<string>()

/** The agent of `session` ran `tool`; `plan_sections` with some sections counts as planning. */
export function noteAgentPlan(session: string, tool: string, args: Record<string, unknown>): void {
  if (tool === 'plan_sections' && Array.isArray(args.sections) && args.sections.length > 0)
    planned.add(session)
}

/**
 * For a session that starts a page without announcing its sections, the nudge to announce them,
 * said once: `written` are the layers its call wrote, and a page starts with a top-level one.
 */
export function planReminder(
  graph: SceneGraph,
  session: string,
  written: readonly string[]
): string | null {
  if (planned.has(session)) return null
  const startsPage = written.some((id) => {
    const parentId = graph.getNode(id)?.parentId
    return !!parentId && graph.getNode(parentId)?.type === 'CANVAS'
  })
  if (!startsPage) return null
  planned.add(session)
  return 'You started a page without announcing its sections. Call plan_sections now with every section in order, the ones you already built included, each with a short name and its approximate height: the canvas shows those to come as outlines, so the person sees the whole page coming.'
}

/** For a session that edits without saying what it is doing, the nudge to say it. */
export function statusReminder(session: string): string | null {
  if (announced.has(session)) return null
  return 'You have not said what you are working on. Call set_status with a few words, such as "Composing the hero, warm editorial style": it shows by your name on the canvas. Update it when your focus moves on.'
}
