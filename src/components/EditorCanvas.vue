<script setup lang="ts">
import {
  ContextMenuPortal,
  ContextMenuRoot,
  ContextMenuTrigger,
  PopoverContent,
  PopoverPortal,
  PopoverRoot
} from 'reka-ui'
import { computed, onUnmounted, ref, shallowRef, useTemplateRef, watch, type Component } from 'vue'
import IconLucideAlignHorizontalSpaceBetween from '~icons/lucide/align-horizontal-space-between'
import IconLucideAlignVerticalSpaceBetween from '~icons/lucide/align-vertical-space-between'
import IconLucidePanelBottom from '~icons/lucide/panel-bottom'
import IconLucidePanelLeft from '~icons/lucide/panel-left'
import IconLucidePanelRight from '~icons/lucide/panel-right'
import IconLucidePanelTop from '~icons/lucide/panel-top'

import { hitTestIssueMarkers } from '@kalka/core/canvas'
import {
  AUTO_LAYOUT_PADDING_EDITOR_OFFSET_X,
  AUTO_LAYOUT_PADDING_EDITOR_OFFSET_Y,
  COMPONENT_LABEL_ICON_GAP,
  COMPONENT_LABEL_ICON_SIZE,
  SECTION_TITLE_GAP,
  SECTION_TITLE_HEIGHT
} from '@kalka/core/constants'
import type { ViewportTransform } from '@kalka/core/geometry'
import { colorToCSS } from '@kalka/scene-graph/color'
import {
  autoLayoutValueAnchor,
  PlayIslands,
  domSceneVectorElement,
  toolCursor,
  useCanvas,
  useCanvasDrop,
  useCanvasInput,
  useCanvasIssueMarkers,
  useCanvasVirtualReference,
  useDomScene,
  useSVGOverlay,
  useViewportSize,
  useTextEdit,
  type AutoLayoutValueField
} from '@kalka/vue'

import { useAIChat } from '@/app/ai/chat/use'
import { useEditorStore } from '@/app/editor/active-store'
import { canvasBackgroundColor, showsKalkaCanvas } from '@/app/editor/canvas/background'
import { useBooleanOperationsCanvasKit } from '@/app/editor/canvas/booleans'
import { useCanvasCollaborationAwareness } from '@/app/editor/canvas/collaboration-awareness'
import { createCanvasContextSelection } from '@/app/editor/canvas/context-selection'
import { canvasOverlayObstacles } from '@/app/editor/canvas/obstacles'
import { workingMarks } from '@/app/presence/activity'
import { attachCanvasScene, scenePreviews } from '@/app/presence/canvas-scene'
import { useFollowView } from '@/app/presence/follow-view'
import { appRuntimeConfig } from '@/app/runtime/config'
import IssueMarkerTooltip from '@/components/design-check/IssueMarkerTooltip.vue'
import PreparationOverlay from '@/components/preparation/canvas/Overlay.vue'
import FollowFrame from '@/components/presence/FollowFrame.vue'
import AppDropOverlay from '@/components/ui/feedback/AppDropOverlay.vue'
import { motionStyles } from '@/theme/motion/styles'
import { floatingSurface } from '@/theme/overlay'

import CanvasMenu from './canvas/CanvasMenu.vue'
import CanvasLabelEditor from './canvas/labels/CanvasLabelEditor.vue'
import { canvasLabelPresentation } from './canvas/labels/presentation'
import NumberField from './inputs/NumberField.vue'

const { paneId } = defineProps<{
  paneId?: string
}>()

const store = useEditorStore()
const sceneCanvasRef = ref<HTMLCanvasElement | null>(null)
const domSceneRef = ref<HTMLElement | null>(null)
const svgOverlayRef = ref<HTMLElement | null>(null)
const domScene = appRuntimeConfig.domScene
const canvasRef = ref<HTMLCanvasElement | null>(null)

const isActivePane = computed(() => !paneId || store.activePaneId.value === paneId)
const followView = useFollowView(useTemplateRef<HTMLElement>('area'))

function activatePane() {
  if (paneId) store.setActivePane(paneId)
}

function updatePaneCursor(cx: number, cy: number) {
  if (isActivePane.value) updateCursor(cx, cy)
}

const getRenderState = paneId ? () => store.getPaneRenderState(paneId) : undefined
/** This pane's view: its pan, zoom, page, and whether it previews. */
const paneView = computed(() => (paneId ? store.getPaneRenderState(paneId) : store.state))
/** What the DOM scene shows behind the artboards; Skia draws the page color itself. */
const pageBackground = computed(() =>
  showsKalkaCanvas.value ? 'var(--color-design-canvas)' : colorToCSS(store.state.pageColor)
)
const onViewportResize = (width: number, height: number) => {
  if (paneId) store.resizePane(paneId, width, height)
  if (isActivePane.value) store.setViewportSize(width, height)
}

const { updateCursor } = useCanvasCollaborationAwareness(store)
const { selectAtContextPoint } = createCanvasContextSelection(canvasRef, store)

const shouldSuspendRender = () =>
  store.state.preparation !== null &&
  store.state.preparation.kind !== 'font-retry' &&
  store.state.preparation.phase !== 'preparing-render'

/** The pan and zoom of the scene's last drawn frame, which preview islands follow. */
const drawnView = shallowRef<ViewportTransform | null>(null)

if (domScene) {
  let presented = false
  const scene = useDomScene(domSceneRef, store, {
    getRenderState,
    vectorElement: domSceneVectorElement(store),
    onPresented: ({ sceneVersion }) => {
      store.preparationController.acknowledgePresentation(sceneVersion)
      if (presented) return
      presented = true
      // Ready once the page shows and the overlay's labels have their font.
      void svgOverlay?.fontsReady.then(() => {
        store.markCanvasReady()
        // Tests and the navigation benchmark wait for this, as they did for the Skia surface.
        if (canvasRef.value) canvasRef.value.dataset.ready = '1'
        return undefined
      })
    },
    // What agents are still writing draws over the document, in every pane.
    previews: () => scenePreviews(store)
  })
  onUnmounted(attachCanvasScene(store, scene))
  // Over the DOM scene, nothing on screen is drawn by Skia: the canvas element only takes input.
  // CanvasKit loads when a feature needs it, such as a boolean operation, which draws its saved
  // geometry until then and its computed outline once it has loaded.
  onUnmounted(store.onCanvasKitReady(() => scene.redrawBooleanOperations()))
  useBooleanOperationsCanvasKit(store)
  // Browser tests load it with the canvas, as every editor did before it loaded on demand: the
  // headless test browser crashes now and then when it reloads a page that never loaded it.
  if (appRuntimeConfig.test) void store.loadCanvasKit()
  useViewportSize(canvasRef, onViewportResize)
} else {
  useCanvas(sceneCanvasRef, store, {
    layer: 'scene',
    onFrame: (view) => {
      drawnView.value = view
    },
    sceneRenderer: appRuntimeConfig.sceneRenderer,
    onReady: store.markCanvasReady,
    shouldSuspendRender,
    showRulers: false,
    getRenderState,
    onViewportResize,
    onPresented: ({ sceneVersion }) =>
      store.preparationController.acknowledgePresentation(sceneVersion),
    onPresentation: (colorSpace) => {
      store.state.canvasPresentation = colorSpace
    }
  })
}
const canvasHitTests = domScene
  ? null
  : useCanvas(canvasRef, store, {
      layer: 'overlays',
      get showRulers() {
        return appRuntimeConfig.showRulers && store.state.showRulers && paneView.value.play === null
      },
      getOverlayObstacles: () => canvasOverlayObstacles(canvasRef.value),
      shouldSuspendRender,
      getRenderState,
      onViewportResize
    })
// Editor chrome over the DOM scene: everything but the text caret moves from the overlay canvas.
const svgOverlay = domScene
  ? useSVGOverlay(svgOverlayRef, store, {
      getRenderState,
      showRulers: () =>
        appRuntimeConfig.showRulers && store.state.showRulers && paneView.value.play === null,
      getOverlayObstacles: () => canvasOverlayObstacles(canvasRef.value),
      getCanvasColor: canvasBackgroundColor,
      // Layers agents are still building, with their names.
      getAgentWork: (pageId) => workingMarks(store, pageId)
    })
  : null
// Over the DOM scene, names are hit tested where the SVG overlay drew them.
const labelHits = svgOverlay ?? canvasHitTests
if (!labelHits) throw new Error('The canvas has neither an SVG overlay nor a Skia overlay')

const {
  cursorOverride,
  canvasLabelEdit,
  updateCanvasLabelEdit,
  commitCanvasLabelEdit,
  cancelCanvasLabelEdit,
  autoLayoutValueEdit,
  updateAutoLayoutValueEdit,
  commitAutoLayoutValueEdit,
  cancelAutoLayoutValueEdit,
  cleanupInteractions
} = useCanvasInput(
  canvasRef,
  store,
  labelHits.hitTestSectionTitle,
  labelHits.hitTestComponentLabel,
  labelHits.hitTestFrameTitle,
  updatePaneCursor,
  activatePane,
  () => isActivePane.value
)

watch(isActivePane, (active) => {
  if (!active) cleanupInteractions()
})
onUnmounted(cleanupInteractions)

const hitTestDrawnIssueMarker = svgOverlay
  ? (x: number, y: number) => hitTestIssueMarkers(svgOverlay.issueMarkers(), x, y)
  : (x: number, y: number) => canvasHitTests?.hitTestIssueMarker(x, y) ?? null

const { activeTab: propertiesTab } = useAIChat()
const { detailMarker: hoveredIssueMarker, cursor: issueMarkerCursor } = useCanvasIssueMarkers(
  canvasRef,
  store,
  {
    hitTest: hitTestDrawnIssueMarker,
    onHover: (marker) => store.designCheck.highlightMarker(marker?.nodeIds ?? null),
    onActivate: (marker) => {
      activatePane()
      propertiesTab.value = 'lint'
      // An edge pin leads to its nearest issue; a marker opens every layer it covers.
      const nodeIds = marker.direction ? marker.nodeIds.slice(0, 1) : marker.nodeIds
      store.designCheck.openMarker(nodeIds)
      if (marker.direction) store.revealNodes(nodeIds)
    }
  }
)

// Over the DOM scene, text is edited in the page itself; the hidden textarea is the canvas's.
if (!domScene) useTextEdit(canvasRef, store, { isEnabled: () => isActivePane.value })
const { isDraggingOver } = useCanvasDrop(canvasRef, store, activatePane)

const valueFieldIcons = {
  paddingTop: IconLucidePanelTop,
  paddingRight: IconLucidePanelRight,
  paddingBottom: IconLucidePanelBottom,
  paddingLeft: IconLucidePanelLeft
} satisfies Record<Exclude<AutoLayoutValueField, 'itemSpacing'>, Component>

const canvasLabelEditNode = computed(() => {
  const edit = canvasLabelEdit.value
  return edit ? store.graph.getNode(edit.nodeId) : null
})
const canvasLabelEditAnchor = computed(() => {
  const node = canvasLabelEditNode.value
  if (!node) return null
  const origin = store.graph.getAbsolutePosition(node.id)
  const { zoom, panX, panY } = store.state
  const kind = canvasLabelEdit.value?.kind
  // The canvas starts an upright label on a whole screen pixel; the field starts on the same one.
  const abs = {
    x: (Math.round(origin.x * zoom + panX) - panX) / zoom,
    y: (Math.round(origin.y * zoom + panY) - panY) / zoom
  }
  // A component's name starts after its diamond, which keeps its screen size at any zoom.
  if (kind === 'component-label')
    return { x: abs.x + (COMPONENT_LABEL_ICON_SIZE + COMPONENT_LABEL_ICON_GAP) / zoom, y: abs.y }
  // A section inside another draws its title inside its top-left corner instead of above it.
  const nested = node.parentId && store.graph.closest(node.parentId, (n) => n.type === 'SECTION')
  if (kind === 'section-title' && nested) {
    const inset = SECTION_TITLE_GAP / zoom
    return {
      x: abs.x + inset,
      y: abs.y + inset + (SECTION_TITLE_HEIGHT + SECTION_TITLE_GAP) / zoom
    }
  }
  return { x: abs.x, y: abs.y }
})
const canvasLabelEditReference = useCanvasVirtualReference(canvasRef, store, canvasLabelEditAnchor)
const canvasLabelEditPresentation = computed(() =>
  canvasLabelPresentation(store, canvasLabelEditNode.value ?? null, canvasLabelEdit.value?.kind)
)

const valueEditorAnchor = computed(() => {
  const edit = autoLayoutValueEdit.value
  return edit ? autoLayoutValueAnchor(store, edit.nodeId, edit.field, edit.gap) : null
})
const valueEditorReference = useCanvasVirtualReference(canvasRef, store, valueEditorAnchor)
const valueEditorIcon = computed(() => {
  const edit = autoLayoutValueEdit.value
  if (!edit) return IconLucidePanelTop
  if (edit.field !== 'itemSpacing') return valueFieldIcons[edit.field]
  return store.graph.getNode(edit.nodeId)?.layoutMode === 'VERTICAL'
    ? IconLucideAlignVerticalSpaceBetween
    : IconLucideAlignHorizontalSpaceBetween
})

const cursor = computed(() =>
  toolCursor(store.state.activeTool, issueMarkerCursor.value ?? cursorOverride.value)
)
</script>

<template>
  <ContextMenuRoot :modal="false">
    <ContextMenuTrigger as-child @contextmenu.capture="selectAtContextPoint">
      <div
        ref="area"
        data-test-id="canvas-area"
        :data-pane-id="paneId"
        :data-active-pane="isActivePane ? 'true' : 'false'"
        class="canvas-area relative min-h-0 min-w-0 flex-1 overflow-hidden"
        @pointerdown.capture="activatePane"
        @focusin.capture="activatePane"
        @wheel.capture="activatePane"
        @dragenter.capture="activatePane"
      >
        <div
          v-if="domScene"
          ref="domSceneRef"
          :data-pane-id="paneId"
          data-test-id="dom-scene"
          aria-hidden="true"
          class="pointer-events-none absolute inset-0 overflow-hidden"
          :style="{ background: pageBackground }"
        />
        <div
          v-if="domScene"
          ref="svgOverlayRef"
          :data-pane-id="paneId"
          data-test-id="svg-overlay"
          class="pointer-events-none absolute inset-0 overflow-hidden"
        />
        <canvas
          v-else
          ref="sceneCanvasRef"
          :data-pane-id="paneId"
          data-test-id="scene-canvas-element"
          aria-hidden="true"
          class="pointer-events-none absolute inset-0 size-full outline-none"
        />
        <canvas
          ref="canvasRef"
          :data-pane-id="paneId"
          data-test-id="canvas-element"
          tabindex="-1"
          :style="{ cursor }"
          class="absolute inset-0 block size-full touch-none outline-none"
        />
        <PlayIslands :view="paneView" :drawn="drawnView" :canvas="canvasRef" />
        <AppDropOverlay :visible="isDraggingOver" />
        <IssueMarkerTooltip :marker="hoveredIssueMarker" :canvas="canvasRef" />
        <CanvasLabelEditor
          :edit="canvasLabelEdit"
          :presentation="canvasLabelEditPresentation"
          :reference="canvasLabelEditReference"
          @update="updateCanvasLabelEdit"
          @commit="commitCanvasLabelEdit"
          @cancel="cancelCanvasLabelEdit"
        />
        <PopoverRoot :open="!!autoLayoutValueEdit">
          <PopoverPortal>
            <PopoverContent
              v-if="autoLayoutValueEdit && valueEditorReference"
              :reference="valueEditorReference"
              side="top"
              align="center"
              :side-offset="AUTO_LAYOUT_PADDING_EDITOR_OFFSET_Y"
              :align-offset="AUTO_LAYOUT_PADDING_EDITOR_OFFSET_X"
              :collision-padding="8"
              :class="['z-50 w-20 p-1', floatingSurface, motionStyles.floating]"
              data-test-id="auto-layout-value-editor"
              @keydown.escape.prevent="cancelAutoLayoutValueEdit"
              @open-auto-focus.prevent
            >
              <NumberField
                :model-value="autoLayoutValueEdit.value"
                :min="0"
                :step="1"
                data-test-id="auto-layout-value-input"
                @update:model-value="updateAutoLayoutValueEdit"
                @commit="(value: number) => commitAutoLayoutValueEdit(value)"
                @editing-change="
                  (editing: boolean) =>
                    !editing &&
                    autoLayoutValueEdit &&
                    commitAutoLayoutValueEdit(autoLayoutValueEdit.value)
                "
              >
                <template #icon>
                  <component :is="valueEditorIcon" class="size-3.5" />
                </template>
              </NumberField>
            </PopoverContent>
          </PopoverPortal>
        </PopoverRoot>
        <FollowFrame
          v-if="isActivePane && followView.label.value"
          :followed="followView.label.value"
          @stop="followView.stop"
        />
        <PreparationOverlay
          v-if="store.state.preparation && store.state.preparation.kind !== 'font-retry'"
          :preparation="store.state.preparation"
        />
      </div>
    </ContextMenuTrigger>

    <ContextMenuPortal>
      <CanvasMenu />
    </ContextMenuPortal>
  </ContextMenuRoot>
</template>
