import type { Component } from 'vue'
import IconArrow from '~icons/hugeicons/arrow-up-right-01'
import IconCircle from '~icons/hugeicons/circle'
import IconComponentSet from '~icons/hugeicons/component'
import IconComponent from '~icons/hugeicons/diamond'
import IconFrame from '~icons/hugeicons/frame'
import IconGrid from '~icons/hugeicons/grid3x3'
import IconGroup from '~icons/hugeicons/group'
import IconHand from '~icons/hugeicons/hand'
import IconColumns from '~icons/hugeicons/layout-3-column'
import IconSection from '~icons/hugeicons/layout-grid'
import IconMinus from '~icons/hugeicons/minus'
import IconMousePointer from '~icons/hugeicons/mouse-pointer'
import IconVariableWidth from '~icons/hugeicons/paint-brush-02'
import IconPenTool from '~icons/hugeicons/pen-tool-01'
import IconPencil from '~icons/hugeicons/pencil'
import IconScale from '~icons/hugeicons/resize-02'
import IconRows from '~icons/hugeicons/rows-3'
import IconShapeBuilder from '~icons/hugeicons/shapes'
import IconSmile from '~icons/hugeicons/smile'
import IconSquare from '~icons/hugeicons/square'
import IconSlot from '~icons/hugeicons/square-dashed'
import IconStar from '~icons/hugeicons/star'
import IconTriangle from '~icons/hugeicons/triangle'
import IconType from '~icons/hugeicons/type'

import { readIcon, slotPropertyId, type SceneNode } from '@kalka/scene-graph'

import type { Tool } from '@/app/editor/session'

export const toolIcons: Record<Tool, Component> = {
  SELECT: IconMousePointer,
  FRAME: IconFrame,
  SECTION: IconSection,
  RECTANGLE: IconSquare,
  ELLIPSE: IconCircle,
  LINE: IconMinus,
  ARROW: IconArrow,
  POLYGON: IconTriangle,
  STAR: IconStar,
  PEN: IconPenTool,
  PENCIL: IconPencil,
  SCALE: IconScale,
  SHAPE_BUILDER: IconShapeBuilder,
  VARIABLE_WIDTH: IconVariableWidth,
  TEXT: IconType,
  HAND: IconHand
}

export const NODE_ICONS: Partial<Record<string, typeof IconSquare>> = {
  SECTION: IconSection,
  ELLIPSE: IconCircle,
  FRAME: IconFrame,
  GROUP: IconGroup,
  COMPONENT: IconComponent,
  COMPONENT_SET: IconComponentSet,
  INSTANCE: IconComponent,
  LINE: IconMinus,
  TEXT: IconType,
  VECTOR: IconPenTool,
  RECTANGLE: IconSquare
}

export const AUTO_LAYOUT_ICONS: Partial<Record<string, typeof IconSquare>> = {
  VERTICAL: IconRows,
  HORIZONTAL: IconColumns,
  GRID: IconGrid
}

export const COMPONENT_TYPES = new Set(['COMPONENT', 'COMPONENT_SET', 'INSTANCE'])

export { IconFrame, IconSquare }

/** The glyph for a layer: its kind, or a slot or icon frame. A component keeps its own glyph. */
export function nodeIcon(node: {
  type: string
  layoutMode: string
  slot?: boolean
  icon?: boolean
}) {
  if (node.slot) return IconSlot
  if (node.icon && node.type === 'FRAME') return IconSmile
  if (node.type === 'FRAME' && node.layoutMode !== 'NONE')
    return AUTO_LAYOUT_ICONS[node.layoutMode] ?? IconFrame
  return NODE_ICONS[node.type] ?? IconSquare
}

/**
 * `nodeIcon` for a scene node, which carries slot and icon identity in its data. Reads only the
 * fields the glyph depends on, so a reactive copy of a layer moving under a drag leaves it alone.
 */
export function sceneNodeIcon(node: SceneNode) {
  return nodeIcon({
    type: node.type,
    layoutMode: node.layoutMode,
    slot: !!slotPropertyId(node),
    icon: !!readIcon(node)
  })
}
