import type { Rect } from '@kalka/scene-graph/primitives'

import type { AgentPresence } from './types'

/** How tall the outline of "whatever comes next" is when the agent announced no sections. */
export const NEXT_SECTION_HEIGHT = 360

/** A section that does not exist yet, drawn as an outline where it will be, in world units. */
export interface PlanGhost extends Rect {
  key: string
  agentId: string
  /** Its place in the agent's plan, or -1 for the unnamed outline of an agent with no plan. */
  index: number
  name: string
  /** The one the agent builds now, or one further down the page. */
  state: 'next' | 'later'
}

/** What the agent already built on the page: its top-level layer and how many sections it has. */
export interface PlanProgress {
  /** The page being built, in world units. */
  root: Rect
  /** Sections of it that exist. */
  built: number
  /**
   * Where the next section starts: under everything the page shows, its own background included
   * when that runs lower than its last section, or at the top of an empty page.
   */
  nextY: number
}

/**
 * The outlines to draw for one agent: the sections it announced and has not built, stacked from
 * where the next one starts. Before it wrote anything they stack at `start`, where its page will
 * be. An agent that announced nothing gets no invented structure: one unnamed outline, the size
 * of its page at `start` before its first layer, then under what it builds.
 *
 * `retouching` is an agent whose last edit only changed layers already on its page: no section is
 * being drawn, so none is the 'next' one, and one that announced nothing gets no outline.
 */
export function planGhosts(
  agent: Pick<AgentPresence, 'id' | 'plan'>,
  place: { progress: PlanProgress | null; start: Rect; retouching?: boolean }
): PlanGhost[] {
  const plan = agent.plan ?? []
  const { progress, start } = place
  const retouching = !!place.retouching && !!progress
  if (plan.length === 0) {
    if (retouching) return []
    const next = progress
      ? {
          x: progress.root.x,
          y: progress.nextY,
          width: progress.root.width,
          height: NEXT_SECTION_HEIGHT
        }
      : start
    return [
      { key: `${agent.id}:next`, agentId: agent.id, index: -1, name: '', state: 'next', ...next }
    ]
  }
  const built = Math.min(progress?.built ?? 0, plan.length)
  const x = progress?.root.x ?? start.x
  const width = progress?.root.width ?? start.width
  let y = progress?.nextY ?? start.y
  return plan.slice(built).map((section, offset) => {
    const ghost: PlanGhost = {
      key: `${agent.id}:${built + offset}`,
      agentId: agent.id,
      index: built + offset,
      name: section.name,
      state: offset === 0 && !retouching ? 'next' : 'later',
      x,
      y,
      width,
      height: section.height
    }
    y += section.height
    return ghost
  })
}

/** How tall the announced sections are together, for the place a page takes before it exists. */
export function planHeight(agent: Pick<AgentPresence, 'plan'>): number {
  return (agent.plan ?? []).reduce((total, section) => total + section.height, 0)
}
