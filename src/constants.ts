import type { Color } from './types'
import type { Fill } from './engine/scene-graph'

export const SELECTION_COLOR = { r: 0.23, g: 0.51, b: 0.96, a: 1 } satisfies Color
export const SNAP_COLOR = { r: 1.0, g: 0.0, b: 0.56, a: 1 } satisfies Color
export const CANVAS_BG_COLOR = { r: 0.96, g: 0.96, b: 0.96, a: 1 } satisfies Color

export const DEFAULT_SHAPE_FILL: Fill = {
  type: 'SOLID',
  color: { r: 0.83, g: 0.83, b: 0.83, a: 1 },
  opacity: 1,
  visible: true
}

export const DEFAULT_FRAME_FILL: Fill = {
  type: 'SOLID',
  color: { r: 1, g: 1, b: 1, a: 1 },
  opacity: 1,
  visible: true
}

export const HANDLE_SIZE = 6
export const ROTATION_HANDLE_OFFSET = 20
export const SNAP_THRESHOLD = 5
export const DRAG_DEAD_ZONE = 4
