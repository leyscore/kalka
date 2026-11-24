<script setup lang="ts">
import { computed, watch } from 'vue'

import type { ViewportTransform } from '@kalka/core/geometry'
import { colorToCSS } from '@kalka/scene-graph/color'
import type { Rect } from '@kalka/scene-graph/primitives'

import { currentQuestions } from '@/app/ai/questions/queue'
import { useEditorStore } from '@/app/editor/active-store'
import { agentHasWritten, agentRootOnPage } from '@/app/presence/activity'
import { flyToPlace } from '@/app/presence/fly-to-work'
import { planGhosts, planHeight, type PlanGhost, type PlanProgress } from '@/app/presence/plan'
import { localAgentColor, presenceOf } from '@/app/presence/registry'
import type { AgentPresence } from '@/app/presence/types'
import AgentCreature from '@/components/chat/AgentCreature.vue'
import { agentGhostTheme } from '@/theme/presence/ghost'

/**
 * Where an agent's work will land, before it exists: outlines beside the page's designs, with the
 * agent's name and what it says it is doing, from the moment it says what it builds. Not while it
 * reads the document or waits on the person's answers: nothing is being generated yet. Display
 * only, and the one sign of loading on the canvas, so nothing else plays over a section.
 *
 * An agent that announced its sections with `plan_sections` shows them: dashed outlines stacked
 * where the page will be, each turning into the real section as it is built. One that announced
 * nothing gets a single outline, the size of a page before its first layer and then under what it
 * builds: never a made-up structure. The outline being built shows placeholder bars filling with
 * light and the agent's cursor on it, which glides to the next outline as each section lands.
 */
const { view, drawn } = defineProps<{
  view: { panX: number; panY: number; zoom: number; currentPageId: string }
  drawn?: ViewportTransform | null
}>()

const store = useEditorStore()
const placement = computed(() => drawn ?? view)

/** A new page's usual size and the gap to the designs beside it. */
const GHOST = { width: 1440, height: 900, gap: 80 }

const spot = computed(() => {
  void store.state.sceneVersion
  const page = store.graph.getNode(view.currentPageId)
  let right = Number.NEGATIVE_INFINITY
  let top = Number.POSITIVE_INFINITY
  for (const id of page?.childIds ?? []) {
    const node = store.graph.getNode(id)
    if (!node?.visible) continue
    right = Math.max(right, node.x + node.width)
    top = Math.min(top, node.y)
  }
  // An empty page's first design starts at its origin.
  return Number.isFinite(top) ? { x: right + GHOST.gap, y: top } : { x: 0, y: 0 }
})

const ui = agentGhostTheme()

/** Agents generating on this page: at work, and not waiting on the person's answers. */
const generating = computed(() =>
  currentQuestions.value
    ? []
    : presenceOf(store).agents.value.filter(
        (agent) =>
          agent.status !== 'idle' && (agent.pageId ?? view.currentPageId) === view.currentPageId
      )
)

/** Those with nothing on the page yet: their work gets a place of its own beside the designs. */
const waiting = computed(() =>
  generating.value.filter(
    (agent) =>
      // Generating starts once it says what it builds, after the person has answered.
      (!!agent.note || !!agent.plan?.length) &&
      !agent.cursor &&
      !(agent.working?.length ?? 0) &&
      // Once it has written, its work is where it wrote, not in a frame of its own.
      !agentHasWritten(store, agent.id)
  )
)

/** Where the nth waiting agent's page will be. */
function startOf(agent: AgentPresence): Rect {
  const index = Math.max(0, waiting.value.indexOf(agent))
  return {
    x: spot.value.x + index * (GHOST.width + GHOST.gap),
    y: spot.value.y,
    width: GHOST.width,
    height: Math.max(planHeight(agent), GHOST.height)
  }
}

/** What `agent` built so far on this page, once it wrote there. */
function progressOf(agent: AgentPresence): PlanProgress | null {
  void store.state.sceneVersion
  const root = store.graph.getNode(agentRootOnPage(store, agent.id, view.currentPageId) ?? '')
  if (!root) return null
  let built = 0
  let bottom = 0
  for (const id of root.childIds) {
    const child = store.graph.getNode(id)
    if (!child?.visible) continue
    built++
    bottom = Math.max(bottom, child.y + child.height)
  }
  return {
    root: { x: root.x, y: root.y, width: root.width, height: root.height },
    built,
    // Never over what is drawn: a page taller than its last section pushes the outline under it.
    nextY: root.y + (built > 0 ? Math.max(bottom, root.height) : 0)
  }
}

/** Every section announced and not built, in world units. */
const sections = computed<PlanGhost[]>(() =>
  generating.value.flatMap((agent) => {
    const progress = progressOf(agent)
    const waits = waiting.value.includes(agent)
    if (!progress && !waits) return []
    // With no plan, the outline shows before the first layer and then while the agent holds some.
    if (!agent.plan?.length && !waits && !(agent.working?.length ?? 0)) return []
    return planGhosts(agent, { progress, start: startOf(agent) })
  })
)

/** Bars of the placeholder in the section being drawn: widths only, never a guessed layout. */
const SKELETON_BARS = ['w-[46%]', 'w-[82%]', 'w-[64%]', 'w-[28%]']

/** Each agent's cursor, on the section it draws now. */
const cursors = computed(() => {
  const color = colorToCSS(localAgentColor(store))
  return sections.value
    .filter((section) => section.state === 'next')
    .map((section) => ({
      id: section.agentId,
      name: generating.value.find((agent) => agent.id === section.agentId)?.name ?? '',
      color,
      x: section.x + section.width * 0.42,
      y: section.y + section.height * 0.56
    }))
})

/** The name over a page that is only outlines so far. */
const badges = computed(() =>
  waiting.value.map((agent) => {
    const start = startOf(agent)
    return { id: agent.id, name: agent.name, note: agent.note ?? '', start }
  })
)

const layerStyle = computed(() => {
  const { panX, panY, zoom } = placement.value
  return {
    transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
    '--ghost-scale': String(1 / zoom)
  }
})

/** Labels need room: a section a few pixels tall on screen shows its outline only. */
const LABEL_MIN_HEIGHT = 36

function rectStyle(rect: Rect) {
  return {
    left: `${rect.x}px`,
    top: `${rect.y}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`
  }
}

/** An outline leaves by moving onto the section that was just built in its place. */
function onSectionLeave(el: Element): void {
  if (!(el instanceof HTMLElement)) return
  const root = store.graph.getNode(
    agentRootOnPage(store, el.dataset.agent ?? '', view.currentPageId) ?? ''
  )
  const visible = (root?.childIds ?? []).flatMap((id) => {
    const child = store.graph.getNode(id)
    return child?.visible ? [child] : []
  })
  const made = visible.at(Number(el.dataset.index))
  if (!root || !made) return
  // Read the box so the move starts from where the outline is.
  void el.offsetWidth
  Object.assign(
    el.style,
    rectStyle({ x: root.x + made.x, y: root.y + made.y, width: made.width, height: made.height })
  )
}

// The view goes to the outlines when a request waits on them, so the person watches the page arrive.
watch(
  () => waiting.value.at(0)?.id,
  (id) => {
    const first = waiting.value.at(0)
    if (id && first) flyToPlace(store, startOf(first))
  }
)
</script>

<template>
  <div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
    <div :class="ui.layer()" :style="layerStyle">
      <TransitionGroup
        :enter-from-class="ui.enter()"
        :leave-to-class="ui.leave()"
        @leave="onSectionLeave"
      >
        <div
          v-for="section in sections"
          :key="section.key"
          :class="ui.section()"
          data-slot="agent-ghost-section"
          :data-agent="section.agentId"
          :data-index="section.index"
          :data-state="section.state"
          :style="rectStyle(section)"
        >
          <span
            v-if="section.name && section.height * placement.zoom >= LABEL_MIN_HEIGHT"
            :class="ui.label()"
          >
            {{ section.name }}
          </span>
          <div
            v-if="section.state === 'next'"
            :class="ui.skeleton()"
            data-slot="agent-ghost-skeleton"
          >
            <div :class="ui.skeletonText()">
              <span v-for="bar in SKELETON_BARS" :key="bar" :class="[ui.bar(), bar]" />
            </div>
            <span :class="ui.block()" />
          </div>
        </div>
      </TransitionGroup>
      <div
        v-for="cursor in cursors"
        :key="cursor.id"
        :class="ui.cursor()"
        data-slot="agent-ghost-cursor"
        :style="{ left: `${cursor.x}px`, top: `${cursor.y}px` }"
      >
        <span :class="ui.cursorBob()">
          <svg :class="ui.cursorArrow()" viewBox="0 0 16 16">
            <path
              d="M2 1.5 13 7 8 8.5 6.2 13.5Z"
              :fill="cursor.color"
              stroke="#fff"
              stroke-width="1.2"
              stroke-linejoin="round"
            />
          </svg>
          <span :class="ui.cursorPill()" :style="{ background: cursor.color }">
            <span :class="ui.cursorTile()">
              <AgentCreature
                :seed="cursor.name"
                :class="ui.cursorCreature()"
                :style="{ color: cursor.color }"
              />
            </span>
            {{ cursor.name }}
          </span>
        </span>
      </div>
      <span
        v-for="badge in badges"
        :key="badge.id"
        :class="ui.badge()"
        data-slot="agent-ghost-badge"
        :style="{
          right: `${-(badge.start.x + badge.start.width)}px`,
          bottom: `${-badge.start.y}px`,
          marginBottom: `calc(6px * var(--ghost-scale))`
        }"
      >
        <span :class="ui.badgeName()">{{ badge.name }}</span>
        <span>{{ badge.note }}</span>
      </span>
    </div>
  </div>
</template>
