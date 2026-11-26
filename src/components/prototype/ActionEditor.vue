<script setup lang="ts">
import { computed, ref, useId } from 'vue'

import {
  createNodeAction,
  createPrototypeTransition,
  customEasing,
  easingSpring,
  type PrototypeAction,
  type PrototypeEasingType,
  type PrototypeExpression,
  type PrototypeTransition,
  type Vector
} from '@kalka/scene-graph'
import { usePrototypeMessages, useSceneComputed } from '@kalka/vue'

import { useEditorStore } from '@/app/editor/active-store'
import NumberField from '@/components/inputs/NumberField.vue'
import AppButton from '@/components/ui/button/AppButton.vue'
import IconButton from '@/components/ui/button/IconButton.vue'
import AppInput from '@/components/ui/input/AppInput.vue'
import PanelItemRow from '@/components/ui/panel/PanelItemRow.vue'
import AppSelect from '@/components/ui/select/AppSelect.vue'
import AppCheckbox from '@/components/ui/toggle/AppCheckbox.vue'

import EasingEditor from './EasingEditor.vue'
import ExpressionField from './ExpressionField.vue'
import {
  actionOptions,
  animationOptions,
  directionOptions,
  DIRECTIONAL,
  easingOptions,
  type ActionKind,
  type AnimationKind
} from './options'

/**
 * One action of an interaction, as Figma's action editor shows it: what it does, then its
 * destination and animation, the variable or mode it sets, or a conditional's blocks, each with
 * its condition and its own actions edited the same way. Every change replaces the action.
 */
const { action, destinations, removable } = defineProps<{
  action: PrototypeAction
  /** Layers each kind of action can go to, as options. */
  destinations: (kind: ActionKind) => { value: string; label: string }[]
  /** Shows a remove button, for an action among others. */
  removable?: boolean
}>()
const emit = defineEmits<{ update: [action: PrototypeAction]; remove: [] }>()
const m = usePrototypeMessages()
const store = useEditorStore()
const newTabId = useId()
const matchId = useId()
const preserveId = useId()

const variableOptions = useSceneComputed(() =>
  [...store.graph.variables.values()].map((variable) => ({
    value: variable.id,
    label: variable.name
  }))
)
const collections = useSceneComputed(() => [...store.graph.variableCollections.values()])
const collectionOptions = computed(() =>
  collections.value.map((collection) => ({ value: collection.id, label: collection.name }))
)
function modeOptions(collectionId: string | null) {
  const collection = collections.value.find((candidate) => candidate.id === collectionId)
  return (collection?.modes ?? []).map((mode) => ({ value: mode.modeId, label: mode.name }))
}

function kindOf(current: PrototypeAction): ActionKind {
  return current.type === 'NODE' ? current.navigation : current.type
}

function setKind(kind: ActionKind) {
  if (kind === 'BACK' || kind === 'CLOSE') return emit('update', { type: kind })
  if (kind === 'URL') return emit('update', { type: 'URL', url: '', openInNewTab: true })
  if (kind === 'SET_VARIABLE')
    return emit('update', { type: 'SET_VARIABLE', variableId: null, value: null })
  if (kind === 'SET_VARIABLE_MODE') {
    const [collection] = collections.value
    return emit('update', {
      type: 'SET_VARIABLE_MODE',
      collectionId: collection?.id ?? null,
      modeId: collection?.modes[0]?.modeId ?? null
    })
  }
  if (kind === 'CONDITIONAL')
    return emit('update', {
      type: 'CONDITIONAL',
      blocks: [{ condition: defaultCondition(), actions: [] }]
    })
  const node = createNodeAction(null, kind)
  if (action.type === 'NODE') node.transition = action.transition
  // Change to and scroll to need a destination of their own kind.
  const keep =
    action.type === 'NODE' &&
    destinations(kind).some((option) => option.value === action.destinationId)
  node.destinationId = keep && action.type === 'NODE' ? action.destinationId : null
  emit('update', node)
}

/** An overlay that opens where it is told: Figma's Manual position, from the triggering layer. */
function manualOverlay(current: PrototypeAction): boolean {
  if (current.type !== 'NODE' || current.navigation !== 'OVERLAY' || !current.destinationId)
    return false
  return store.graph.getNode(current.destinationId)?.overlayPositionType === 'MANUAL'
}

/** The triggering layer's height: a manual overlay opens just below it until moved. */
const triggerHeight = computed(() => {
  const [id] = store.state.selectedIds
  return (id ? store.graph.getNode(id)?.height : undefined) ?? 0
})

function setOffset(change: Partial<Vector>) {
  if (action.type !== 'NODE') return
  const current = action.overlayRelativePosition ?? { x: 0, y: triggerHeight.value }
  emit('update', { ...action, overlayRelativePosition: { ...current, ...change } })
}

/** The link being typed, set on change so typing is one undo step. */
const urlDraft = ref<string | null>(null)

function commitURL() {
  if (action.type === 'URL' && urlDraft.value !== null)
    emit('update', { ...action, url: urlDraft.value.trim() })
  urlDraft.value = null
}

function animationOf(current: PrototypeAction): AnimationKind {
  return current.type === 'NODE' && current.transition ? current.transition.type : 'INSTANT'
}

function setTransition(change: (transition: PrototypeTransition) => PrototypeTransition) {
  if (action.type !== 'NODE' || !action.transition) return
  emit('update', { ...action, transition: change(action.transition) })
}

/** Custom bezier and custom spring start from the easing chosen before, as in Figma. */
function setEasing(type: PrototypeEasingType) {
  setTransition((t) => ({
    ...t,
    easing:
      type === 'CUSTOM_CUBIC_BEZIER' || type === 'CUSTOM_SPRING'
        ? customEasing(t.easing, type)
        : { type, bezier: null, spring: null }
  }))
}

function setAnimation(kind: AnimationKind) {
  if (action.type !== 'NODE') return
  if (kind === 'INSTANT') return emit('update', { ...action, transition: null })
  const transition = action.transition
    ? { ...action.transition, type: kind }
    : createPrototypeTransition(kind)
  emit('update', { ...action, transition })
}

// --- Conditionals ---------------------------------------------------------------------------

type Conditional = Extract<PrototypeAction, { type: 'CONDITIONAL' }>
type Block = Conditional['blocks'][number]

function setBlocks(blocks: Block[]) {
  if (action.type === 'CONDITIONAL') emit('update', { ...action, blocks })
}

function setBlock(index: number, block: Block) {
  if (action.type !== 'CONDITIONAL') return
  setBlocks(action.blocks.map((current, at) => (at === index ? block : current)))
}

/**
 * A new If or Else if tests the first boolean variable, as Figma starts one, or `true` in a file
 * without one; it is then typed over.
 */
function defaultCondition(): PrototypeExpression {
  const flag = [...store.graph.variables.values()].find((variable) => variable.type === 'BOOLEAN')
  if (!flag) return { type: 'VALUE', value: true }
  return {
    type: 'EXPRESSION',
    operator: 'EQUALS',
    operands: [
      { type: 'VARIABLE', variableId: flag.id },
      { type: 'VALUE', value: true }
    ]
  }
}

/** The first block is the If; a later one without a condition is the Else, which stays last. */
function isElse(index: number, block: Block): boolean {
  return index > 0 && block.condition === null
}

const hasElse = computed(
  () => action.type === 'CONDITIONAL' && action.blocks.some((block, index) => isElse(index, block))
)

function addBlock(otherwise: boolean) {
  if (action.type !== 'CONDITIONAL') return
  const blocks = [...action.blocks]
  if (otherwise) {
    if (!hasElse.value) blocks.push({ condition: null, actions: [] })
  } else
    blocks.splice(hasElse.value ? blocks.length - 1 : blocks.length, 0, {
      condition: defaultCondition(),
      actions: []
    })
  setBlocks(blocks)
}

function blockLabel(index: number, block: Block): string {
  if (index === 0) return m.value.ifLabel
  return isElse(index, block) ? m.value.elseLabel : m.value.elseIf
}

function removeBlock(index: number) {
  if (action.type !== 'CONDITIONAL') return
  setBlocks(action.blocks.filter((_, at) => at !== index))
}

function setBlockAction(blockIndex: number, actionIndex: number, next: PrototypeAction) {
  if (action.type !== 'CONDITIONAL') return
  const block = action.blocks[blockIndex]
  setBlock(blockIndex, {
    ...block,
    actions: block.actions.map((current, at) => (at === actionIndex ? next : current))
  })
}

function removeBlockAction(blockIndex: number, actionIndex: number) {
  if (action.type !== 'CONDITIONAL') return
  const block = action.blocks[blockIndex]
  setBlock(blockIndex, { ...block, actions: block.actions.filter((_, at) => at !== actionIndex) })
}

function addBlockAction(blockIndex: number) {
  if (action.type !== 'CONDITIONAL') return
  const block = action.blocks[blockIndex]
  setBlock(blockIndex, { ...block, actions: [...block.actions, createNodeAction(null)] })
}
</script>

<template>
  <div data-test-id="prototype-action" class="flex flex-col gap-1">
    <PanelItemRow>
      <AppSelect
        :model-value="kindOf(action)"
        :options="actionOptions(m)"
        :label="m.action"
        :ui="{ trigger: 'w-auto flex-1' }"
        data-property="prototype-action"
        @update:model-value="setKind"
      />
      <template v-if="removable" #rail="{ removeClass }">
        <IconButton
          :label="m.removeAction"
          :class="[removeClass, 'shrink-0']"
          @click="emit('remove')"
        >
          <icon-hugeicons-minus class="size-3.5" />
        </IconButton>
      </template>
    </PanelItemRow>

    <template v-if="action.type === 'URL'">
      <AppInput
        size="sm"
        type="url"
        :aria-label="m.url"
        placeholder="https://"
        :model-value="urlDraft ?? action.url"
        data-property="prototype-url"
        @update:model-value="urlDraft = String($event)"
        @change="commitURL"
      />
      <label class="flex cursor-pointer items-center gap-2 py-1 text-[11px] text-muted">
        <AppCheckbox
          :model-value="action.openInNewTab"
          :ariaLabelledby="newTabId"
          @update:model-value="emit('update', { ...action, openInNewTab: $event === true })"
        />
        <span :id="newTabId">{{ m.openInNewTab }}</span>
      </label>
    </template>

    <template v-else-if="action.type === 'SET_VARIABLE'">
      <AppSelect
        :model-value="action.variableId ?? ''"
        :options="variableOptions"
        :placeholder="m.none"
        :label="m.variable"
        data-property="prototype-variable"
        @update:model-value="emit('update', { ...action, variableId: $event || null })"
      />
      <ExpressionField
        :expression="action.value"
        :label="m.value"
        :placeholder="m.valuePlaceholder"
        @update="(value) => emit('update', { ...action, value })"
      />
    </template>

    <template v-else-if="action.type === 'SET_VARIABLE_MODE'">
      <AppSelect
        :model-value="action.collectionId ?? ''"
        :options="collectionOptions"
        :placeholder="m.none"
        :label="m.collection"
        data-property="prototype-collection"
        @update:model-value="
          (collectionId) =>
            emit('update', {
              ...action,
              collectionId: collectionId || null,
              modeId: modeOptions(collectionId)[0]?.value ?? null
            })
        "
      />
      <AppSelect
        :model-value="action.modeId ?? ''"
        :options="modeOptions(action.collectionId)"
        :placeholder="m.none"
        :label="m.mode"
        data-property="prototype-mode"
        @update:model-value="emit('update', { ...action, modeId: $event || null })"
      />
    </template>

    <template v-else-if="action.type === 'CONDITIONAL'">
      <div
        v-for="(block, blockIndex) in action.blocks"
        :key="blockIndex"
        data-test-id="prototype-condition-block"
        class="flex flex-col gap-1 border-l border-border pl-2"
      >
        <PanelItemRow>
          <span class="flex-1 text-[11px] font-medium text-muted">
            {{ blockLabel(blockIndex, block) }}
          </span>
          <template v-if="blockIndex > 0" #rail="{ removeClass }">
            <IconButton
              :label="m.removeBlock"
              :class="[removeClass, 'shrink-0']"
              @click="removeBlock(blockIndex)"
            >
              <icon-hugeicons-minus class="size-3.5" />
            </IconButton>
          </template>
        </PanelItemRow>
        <ExpressionField
          v-if="!isElse(blockIndex, block)"
          :expression="block.condition"
          :label="m.conditional"
          :placeholder="m.conditionPlaceholder"
          @update="(condition) => setBlock(blockIndex, { ...block, condition })"
        />
        <ActionEditor
          v-for="(nested, nestedIndex) in block.actions"
          :key="nestedIndex"
          :action="nested"
          :destinations="destinations"
          removable
          @update="(next) => setBlockAction(blockIndex, nestedIndex, next)"
          @remove="removeBlockAction(blockIndex, nestedIndex)"
        />
        <AppButton
          size="xs"
          class="self-start"
          data-test-id="prototype-add-action"
          @click="addBlockAction(blockIndex)"
        >
          <icon-hugeicons-plus-sign class="size-3" />
          {{ m.addAction }}
        </AppButton>
      </div>
      <div class="flex gap-1">
        <AppButton size="xs" data-test-id="prototype-add-else-if" @click="addBlock(false)">
          {{ m.addElseIf }}
        </AppButton>
        <AppButton
          v-if="!hasElse"
          size="xs"
          data-test-id="prototype-add-else"
          @click="addBlock(true)"
        >
          {{ m.addElse }}
        </AppButton>
      </div>
    </template>

    <template v-else-if="action.type === 'NODE'">
      <AppSelect
        :model-value="action.destinationId ?? ''"
        :options="destinations(action.navigation)"
        :placeholder="m.none"
        :label="m.destination"
        data-property="prototype-destination"
        @update:model-value="emit('update', { ...action, destinationId: $event || null })"
      />
      <PanelItemRow v-if="manualOverlay(action)" data-property="prototype-overlay-offset">
        <NumberField
          label="X"
          :aria-label="`${m.position} X`"
          :model-value="Math.round(action.overlayRelativePosition?.x ?? 0)"
          @commit="(x: number) => setOffset({ x })"
        />
        <NumberField
          label="Y"
          :aria-label="`${m.position} Y`"
          :model-value="Math.round(action.overlayRelativePosition?.y ?? triggerHeight)"
          @commit="(y: number) => setOffset({ y })"
        />
      </PanelItemRow>
      <label
        v-if="action.navigation === 'NAVIGATE'"
        class="flex cursor-pointer items-center gap-2 py-1 text-[11px] text-muted"
      >
        <AppCheckbox
          :model-value="action.preserveScrollPosition"
          :ariaLabelledby="preserveId"
          @update:model-value="
            emit('update', { ...action, preserveScrollPosition: $event === true })
          "
        />
        <span :id="preserveId">{{ m.preserveScroll }}</span>
      </label>
      <AppSelect
        :model-value="animationOf(action)"
        :options="animationOptions(m)"
        :label="m.animation"
        data-property="prototype-animation"
        @update:model-value="setAnimation"
      />
      <template v-if="action.transition">
        <AppSelect
          v-if="DIRECTIONAL.has(action.transition.type)"
          :model-value="action.transition.direction"
          :options="directionOptions(m)"
          :label="m.direction"
          data-property="prototype-direction"
          @update:model-value="(direction) => setTransition((t) => ({ ...t, direction }))"
        />
        <label
          v-if="DIRECTIONAL.has(action.transition.type)"
          class="flex cursor-pointer items-center gap-2 py-1 text-[11px] text-muted"
        >
          <AppCheckbox
            :model-value="action.transition.matchLayers"
            :ariaLabelledby="matchId"
            @update:model-value="(on) => setTransition((t) => ({ ...t, matchLayers: on === true }))"
          />
          <span :id="matchId">{{ m.matchLayers }}</span>
        </label>
        <PanelItemRow>
          <AppSelect
            :model-value="action.transition.easing.type"
            :options="easingOptions(m)"
            :label="m.easing"
            :ui="{ trigger: 'w-auto flex-1' }"
            data-property="prototype-easing"
            @update:model-value="setEasing"
          />
          <div v-if="!easingSpring(action.transition.easing)" class="w-20 shrink-0">
            <NumberField
              :aria-label="m.duration"
              suffix="ms"
              :min="1"
              :step="50"
              data-property="prototype-duration"
              :model-value="Math.round(action.transition.duration * 1000)"
              @commit="
                (value: number) =>
                  setTransition((t) => ({ ...t, duration: Math.max(1, value) / 1000 }))
              "
            />
          </div>
        </PanelItemRow>
        <EasingEditor
          v-if="
            action.transition.easing.type === 'CUSTOM_CUBIC_BEZIER' ||
            action.transition.easing.type === 'CUSTOM_SPRING'
          "
          :easing="action.transition.easing"
          @update="(easing) => setTransition((t) => ({ ...t, easing }))"
        />
      </template>
    </template>
  </div>
</template>
