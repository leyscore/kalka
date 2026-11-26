import type { VNode } from 'vue'

import type { BlendMode, SceneNode } from '@kalka/scene-graph'

import type { CornerGeometryKey, CornerRadiusKey } from '#vue/controls/appearance/types'
import type { MixedValue } from '#vue/controls/node-props/use'

export interface AppearanceControlsActions {
  updateProp(key: string, value: number): void
  commitProp(key: string, value: number, previous: number): void
  setBlendMode(value: BlendMode): void
  /** Shows a blend mode on the selection while it is hovered; `null` takes it away. */
  previewBlendMode(value: BlendMode | null): void
  toggleVisibility(): void
  toggleIndependentCorners(): void
  updateUniformRadius(value: number): void
  commitUniformRadius(): void
  updateCornerProp(key: CornerGeometryKey, value: number): void
  commitCornerProp(key: CornerGeometryKey, value: number, previous: number): void
  /** Previews a polygon's sides or a star's points; `commitPointCount` records the change. */
  updatePointCount(value: number): void
  commitPointCount(value: number): void
  /** Previews a star's inner radius as a percentage of its outer one. */
  updateStarRatio(percent: number): void
  commitStarRatio(percent: number): void
}

export interface AppearanceControlsRootSlotProps {
  node: SceneNode | null
  isMulti: boolean
  active: boolean
  hasCornerRadius: boolean
  independentCorners: MixedValue<boolean>
  showIndependentCorners: boolean
  cornerRadiusValue: MixedValue<number>
  cornerRadiusBindingPaths: Array<CornerRadiusKey | 'cornerRadius'>
  cornerSmoothingPercent: MixedValue<number>
  opacityPercent: MixedValue<number>
  blendModeValue: MixedValue<BlendMode>
  visibilityState: 'visible' | 'hidden' | 'mixed'
  /** Every selected layer is a polygon or a star, which shows Count. */
  hasPointCount: boolean
  /** Every selected layer is a star, which shows Ratio. */
  hasStarRatio: boolean
  pointCountValue: MixedValue<number>
  starRatioPercent: MixedValue<number>
  actions: AppearanceControlsActions
}

export interface AppearanceControlsRootSlots {
  /** Complete selection-derived appearance state and mutation actions. */
  default(props: AppearanceControlsRootSlotProps): VNode[]
}
