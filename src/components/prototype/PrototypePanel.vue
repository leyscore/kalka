<script setup lang="ts">
import { countBy } from 'es-toolkit'
import { computed, reactive, useId } from 'vue'

import {
  createPrototypeReaction,
  flowStartingPoints,
  PROTOTYPE_DEVICE_PRESETS,
  type Color,
  type Fill,
  type PrototypeReaction,
  type SceneNode
} from '@kalka/scene-graph'
import { colorToHexRaw, tryParseColor } from '@kalka/scene-graph/color'
import { orderKeyBetween } from '@kalka/scene-graph/order-keys'
import { usePrototypeMessages, useSceneComputed, useSelectionState } from '@kalka/vue'

import { useEditorStore } from '@/app/editor/active-store'
import ColorPicker from '@/components/ColorPicker/ColorPicker.vue'
import IconButton from '@/components/ui/button/IconButton.vue'
import AppInput from '@/components/ui/input/AppInput.vue'
import FillSwatch from '@/components/ui/paint/FillSwatch.vue'
import PanelItemRow from '@/components/ui/panel/PanelItemRow.vue'
import PanelSection from '@/components/ui/panel/PanelSection.vue'
import AppSelect from '@/components/ui/select/AppSelect.vue'
import AppCheckbox from '@/components/ui/toggle/AppCheckbox.vue'

import InteractionRow from './InteractionRow.vue'
import {
  overflowOptions,
  overlayPositionOptions,
  scrollBehaviorOptions,
  type ActionKind
} from './options'

/**
 * Figma's Prototype tab: the selection's interactions, a frame's flow starting point, scrolling
 * and overlay settings, and with nothing selected the page's flows and prototype settings.
 */
const store = useEditorStore()
const m = usePrototypeMessages()
const { selectedNode: node, selectedCount } = useSelectionState()
const closeOutsideId = useId()
const backgroundId = useId()

const SCREEN_TYPES = new Set<SceneNode['type']>(['FRAME', 'COMPONENT', 'COMPONENT_SET', 'INSTANCE'])
const OVERLAY_DIM = { r: 0, g: 0, b: 0, a: 0.25 }
const NO_DEVICE = 'NONE'
const PRESENT_BACKDROP = { r: 0.118, g: 0.118, b: 0.118, a: 1 }

const pageId = computed(() => store.state.currentPageId)
/** The page's prototype settings, copied out so the panel follows their edits. */
const page = useSceneComputed(() => {
  const current = store.graph.getNode(pageId.value)
  return {
    prototypeDevice: current?.prototypeDevice ? { ...current.prototypeDevice } : null,
    prototypeBackground: current?.prototypeBackground ? { ...current.prototypeBackground } : null
  }
})
const frames = useSceneComputed(() =>
  store.graph.getChildren(pageId.value).filter((child) => SCREEN_TYPES.has(child.type))
)
const flows = useSceneComputed(() => flowStartingPoints(store.graph, pageId.value))
const isScreen = computed(
  () => !!node.value && node.value.parentId === pageId.value && SCREEN_TYPES.has(node.value.type)
)
const isFrame = computed(() => !!node.value && SCREEN_TYPES.has(node.value.type))
/** A layer inside a frame, which can stay put while it scrolls. */
const inFrame = computed(() => !!node.value && node.value.parentId !== pageId.value)

/** The variants an action on this layer can change its instance or variant to. */
function variantsAround(nodeId: string): SceneNode[] {
  const sets = new Set<string>()
  store.graph.closest(nodeId, (current) => {
    let main: SceneNode | undefined = current
    while (main?.type === 'INSTANCE' && main.componentId)
      main = store.graph.getNode(main.componentId)
    const parent = main?.parentId ? store.graph.getNode(main.parentId) : undefined
    if (parent?.type === 'COMPONENT_SET') sets.add(parent.id)
    return false
  })
  return [...sets].flatMap((id) =>
    store.graph.getChildren(id).filter((child) => child.type === 'COMPONENT')
  )
}

/** Layers of the selection's screen that scroll to can bring into view. */
function screenLayers(nodeId: string): SceneNode[] {
  const screenId = store.graph.closest(nodeId, (current) => current.parentId === pageId.value)?.id
  if (!screenId) return []
  const found: SceneNode[] = []
  const walk = (id: string) => {
    for (const child of store.graph.getChildren(id)) {
      if (found.length >= 200) return
      found.push(child)
      walk(child.id)
    }
  }
  walk(screenId)
  return found
}

function destinations(kind: ActionKind) {
  const current = node.value
  if (!current) return []
  let layers = frames.value
  if (kind === 'CHANGE_TO') layers = variantsAround(current.id)
  else if (kind === 'SCROLL_TO') layers = screenLayers(current.id)
  return labelDuplicates(layers)
}

/** Layers by name; layers sharing a name are numbered in order, so a list tells them apart. */
function labelDuplicates(layers: readonly SceneNode[]) {
  const counts = countBy(layers, (layer) => layer.name)
  const seen = new Map<string, number>()
  return layers.map((layer) => {
    if (counts[layer.name] === 1) return { value: layer.id, label: layer.name }
    const nth = (seen.get(layer.name) ?? 0) + 1
    seen.set(layer.name, nth)
    return { value: layer.id, label: `${layer.name} (${nth})` }
  })
}

function setReactions(reactions: PrototypeReaction[]) {
  if (node.value) store.setReactions(node.value.id, reactions)
}

function addInteraction() {
  if (!node.value) return
  setReactions([...node.value.reactions, createPrototypeReaction()])
}

function updateInteraction(index: number, reaction: PrototypeReaction) {
  if (!node.value) return
  setReactions(node.value.reactions.map((current, at) => (at === index ? reaction : current)))
}

function removeInteraction(index: number) {
  if (!node.value) return
  setReactions(node.value.reactions.filter((_, at) => at !== index))
}

function update(changes: Partial<SceneNode>, label: string) {
  if (node.value) store.updateNodeWithUndo(node.value.id, changes, label)
}

function addStartingPoint() {
  const last = flows.value.at(-1)?.startingPoint.position ?? null
  update(
    {
      prototypeStartingPoint: {
        name: m.value.flowName({ count: String(flows.value.length + 1) }),
        description: '',
        position: orderKeyBetween(last, null)
      }
    },
    'Add starting point'
  )
}

/** The flow's name or description being typed, set on change so typing is one undo step. */
const drafts = reactive<{ name?: string; description?: string }>({})

function commitStartingPoint(field: 'name' | 'description') {
  const current = node.value?.prototypeStartingPoint
  const value = drafts[field]
  drafts[field] = undefined
  if (current && value !== undefined)
    update({ prototypeStartingPoint: { ...current, [field]: value } }, 'Edit starting point')
}

function present(startId: string) {
  store.stopPlay()
  store.startPlay({ startId })
}

const deviceOptions = computed(() => [
  { value: NO_DEVICE, label: m.value.none },
  ...PROTOTYPE_DEVICE_PRESETS.map((preset) => ({ value: preset.id, label: preset.name }))
])

/** The presenter's backdrop, Figma's dark grey until one is chosen. */
const prototypeBackground = computed<Color>(
  () => page.value.prototypeBackground ?? { ...PRESENT_BACKDROP }
)
const backgroundFill = computed<Fill>(() => ({
  type: 'SOLID',
  color: prototypeBackground.value,
  opacity: 1,
  visible: true
}))

function setBackground(color: Color) {
  store.updateNodeWithUndo(
    pageId.value,
    { prototypeBackground: { ...color, a: 1 } },
    'Change prototype background'
  )
}

function setBackgroundHex(event: Event) {
  const input = event.target instanceof HTMLInputElement ? event.target : null
  const color = input ? tryParseColor(`#${input.value.trim().replace(/^#/, '')}`) : null
  if (color) setBackground(color)
  else if (input) input.value = colorToHexRaw(prototypeBackground.value)
}

function rotateDevice() {
  const device = page.value.prototypeDevice
  if (!device) return
  store.updateNodeWithUndo(
    pageId.value,
    { prototypeDevice: { ...device, rotation: device.rotation === 'CCW_90' ? 'NONE' : 'CCW_90' } },
    'Rotate prototype device'
  )
}

function setDevice(id: string) {
  const preset = PROTOTYPE_DEVICE_PRESETS.find((candidate) => candidate.id === id)
  store.updateNodeWithUndo(
    pageId.value,
    {
      prototypeDevice: preset
        ? { presetIdentifier: preset.id, size: { ...preset.size }, rotation: 'NONE' }
        : null
    },
    'Change prototype device'
  )
}
</script>

<template>
  <div
    data-test-id="prototype-panel"
    class="scrollbar-thin flex-1 overflow-x-hidden overflow-y-auto pb-4"
  >
    <template v-if="node && selectedCount === 1">
      <PanelSection
        v-if="isScreen"
        :label="m.flowStartingPoint"
        :empty="!node.prototypeStartingPoint"
      >
        <template #actions>
          <IconButton
            v-if="!node.prototypeStartingPoint"
            :label="m.addStartingPoint"
            data-test-id="prototype-add-starting-point"
            @click="addStartingPoint"
          >
            <icon-hugeicons-plus class="size-3.5" />
          </IconButton>
          <IconButton
            v-else
            :label="m.removeStartingPoint"
            @click="update({ prototypeStartingPoint: null }, 'Remove starting point')"
          >
            <icon-hugeicons-minus class="size-3.5" />
          </IconButton>
        </template>
        <template v-if="node.prototypeStartingPoint">
          <AppInput
            size="sm"
            :aria-label="m.name"
            :model-value="drafts.name ?? node.prototypeStartingPoint.name"
            data-property="prototype-flow-name"
            @update:model-value="drafts.name = String($event)"
            @change="commitStartingPoint('name')"
          />
          <AppInput
            size="sm"
            class="mt-1"
            :aria-label="m.description"
            :placeholder="m.description"
            :model-value="drafts.description ?? node.prototypeStartingPoint.description"
            @update:model-value="drafts.description = String($event)"
            @change="commitStartingPoint('description')"
          />
        </template>
      </PanelSection>

      <PanelSection :label="m.interactions" :empty="node.reactions.length === 0">
        <template #actions>
          <IconButton
            :label="m.addInteraction"
            data-test-id="prototype-add-interaction"
            @click="addInteraction"
          >
            <icon-hugeicons-plus class="size-3.5" />
          </IconButton>
        </template>
        <p v-if="node.reactions.length === 0" class="text-[11px] text-muted">
          {{ m.noInteractions }}
        </p>
        <InteractionRow
          v-for="(reaction, index) in node.reactions"
          :key="index"
          :reaction="reaction"
          :destinations="destinations"
          @update="updateInteraction(index, $event)"
          @remove="removeInteraction(index)"
        />
      </PanelSection>

      <PanelSection v-if="isFrame || inFrame" :label="m.scrollBehavior">
        <AppSelect
          v-if="isFrame"
          :model-value="node.overflowDirection"
          :options="overflowOptions(m)"
          :label="m.overflow"
          data-property="prototype-overflow"
          @update:model-value="
            (value) => value && update({ overflowDirection: value }, 'Change scrolling')
          "
        />
        <AppSelect
          v-if="inFrame"
          class="mt-1"
          :model-value="node.scrollBehavior"
          :options="scrollBehaviorOptions(m)"
          :label="m.position"
          data-property="prototype-scroll-position"
          @update:model-value="
            (value) => value && update({ scrollBehavior: value }, 'Change scroll position')
          "
        />
      </PanelSection>

      <PanelSection v-if="isScreen" :label="m.overlay">
        <AppSelect
          :model-value="node.overlayPositionType"
          :options="overlayPositionOptions(m)"
          :label="m.position"
          data-property="prototype-overlay-position"
          @update:model-value="update({ overlayPositionType: $event }, 'Change overlay')"
        />
        <label class="flex cursor-pointer items-center gap-2 py-1 text-[11px] text-muted">
          <AppCheckbox
            :model-value="node.overlayBackgroundInteraction === 'CLOSE_ON_CLICK_OUTSIDE'"
            :ariaLabelledby="closeOutsideId"
            @update:model-value="
              update(
                {
                  overlayBackgroundInteraction: $event === true ? 'CLOSE_ON_CLICK_OUTSIDE' : 'NONE'
                },
                'Change overlay'
              )
            "
          />
          <span :id="closeOutsideId">{{ m.closeOnClickOutside }}</span>
        </label>
        <label class="flex cursor-pointer items-center gap-2 py-1 text-[11px] text-muted">
          <AppCheckbox
            :model-value="node.overlayBackground !== null"
            :ariaLabelledby="backgroundId"
            @update:model-value="
              update(
                { overlayBackground: $event === true ? { ...OVERLAY_DIM } : null },
                'Change overlay'
              )
            "
          />
          <span :id="backgroundId">{{ m.addBackground }}</span>
        </label>
      </PanelSection>
    </template>

    <template v-else-if="selectedCount === 0">
      <PanelSection :label="m.flows" :empty="flows.length === 0">
        <p v-if="flows.length === 0" class="text-[11px] text-muted">{{ m.noFlows }}</p>
        <div
          v-for="flow in flows"
          :key="flow.node.id"
          data-test-id="prototype-flow"
          class="flex items-center gap-1 py-0.5"
        >
          <icon-hugeicons-play class="size-3.5 shrink-0 text-muted" />
          <span class="min-w-0 flex-1 truncate text-[11px]">{{ flow.startingPoint.name }}</span>
          <IconButton :label="m.present" @click="present(flow.node.id)">
            <icon-hugeicons-play-circle class="size-3.5" />
          </IconButton>
        </div>
      </PanelSection>
      <PanelSection :label="m.settings">
        <PanelItemRow>
          <AppSelect
            :model-value="page.prototypeDevice?.presetIdentifier || NO_DEVICE"
            :options="deviceOptions"
            :label="m.device"
            :ui="{ trigger: 'w-auto flex-1' }"
            data-property="prototype-device"
            @update:model-value="setDevice"
          />
          <IconButton
            v-if="page.prototypeDevice"
            :label="m.rotate"
            class="shrink-0"
            data-test-id="prototype-rotate"
            :data-state="page.prototypeDevice.rotation === 'CCW_90' ? 'on' : 'off'"
            @click="rotateDevice"
          >
            <icon-hugeicons-rotate-left-01 class="size-3.5" />
          </IconButton>
        </PanelItemRow>
        <div
          class="mt-1 flex h-7 items-center gap-2 rounded-[5px] bg-input px-1.5"
          data-property="prototype-background"
        >
          <ColorPicker :color="prototypeBackground" @update="setBackground">
            <template #trigger>
              <button
                type="button"
                :aria-label="m.background"
                data-test-id="prototype-background"
                class="size-5 shrink-0 cursor-pointer rounded border-0 bg-transparent p-0"
              >
                <FillSwatch :fill="backgroundFill" class="size-full" />
              </button>
            </template>
          </ColorPicker>
          <input
            :aria-label="m.background"
            class="min-w-0 flex-1 border-none bg-transparent font-mono text-[11px] text-surface outline-none"
            :value="colorToHexRaw(prototypeBackground)"
            maxlength="6"
            @change="setBackgroundHex"
          />
        </div>
      </PanelSection>
    </template>
  </div>
</template>
