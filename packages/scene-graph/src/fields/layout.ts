import type { SceneNode } from '../types'

/** How a frame lays out its children: auto layout and its grid tracks. */
export const AUTO_LAYOUT_FIELDS = [
  'layoutMode',
  'layoutDirection',
  'layoutWrap',
  'primaryAxisAlign',
  'counterAxisAlign',
  'counterAxisAlignContent',
  'primaryAxisSizing',
  'counterAxisSizing',
  'itemSpacing',
  'counterAxisSpacing',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'strokesIncludedInLayout',
  'gridTemplateColumns',
  'gridTemplateRows',
  'gridColumnGap',
  'gridRowGap'
] as const satisfies readonly (keyof SceneNode)[]

/** Size limits a layer keeps however it is resized. */
export const SIZE_CONSTRAINT_FIELDS = [
  'minWidth',
  'maxWidth',
  'minHeight',
  'maxHeight'
] as const satisfies readonly (keyof SceneNode)[]
