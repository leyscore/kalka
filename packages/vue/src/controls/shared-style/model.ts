import { BLACK } from '@kalka/core/constants'
import {
  copyEffects,
  copyFills,
  copyLayoutGrids,
  sharedStyleRefKey,
  sharedTextStyleValues,
  type SceneNode,
  type SharedStyle,
  type SharedStyleKind
} from '@kalka/scene-graph'

function strokePaintsFromStyle(target: SceneNode, style: SceneNode): SceneNode['strokes'] {
  const fills = style.fills.filter((fill) => fill.type === 'SOLID')
  if (fills.length === 0) return target.strokes
  const fallback = target.strokes[0] ?? {
    type: 'SOLID' as const,
    color: BLACK,
    weight: 1,
    opacity: 1,
    visible: true,
    align: 'CENTER' as const
  }
  return fills.map((fill, index) => {
    const current = target.strokes[index] ?? fallback
    return {
      ...current,
      color: { ...fill.color },
      opacity: fill.opacity,
      visible: fill.visible
    }
  })
}

export function sharedStylePatch(
  kind: SharedStyleKind,
  target: SceneNode,
  styleId: string,
  style: SceneNode | null
): Partial<SceneNode> {
  const refKey = sharedStyleRefKey(kind)
  const patch: Partial<SceneNode> = { [refKey]: styleId }
  if (!style) return patch

  if (kind === 'fill') patch.fills = copyFills(style.fills)
  else if (kind === 'stroke') patch.strokes = strokePaintsFromStyle(target, style)
  else if (kind === 'effect') patch.effects = copyEffects(style.effects)
  else if (kind === 'grid') patch.layoutGrids = copyLayoutGrids(style.layoutGrids)
  else Object.assign(patch, sharedTextStyleValues(style))
  return patch
}

export function sharedStyleDetachPatch(kind: SharedStyleKind): Partial<SceneNode> {
  return { [sharedStyleRefKey(kind)]: null }
}

/** Styles filed under one folder: the part of their names before the last `/`. */
export interface SharedStyleGroup {
  /** The folder path, empty for styles at the top level. */
  folder: string
  styles: Array<SharedStyle & { label: string }>
}

/** Styles grouped by folder in the order they are listed, as Figma groups `Heading/H1`. */
export function groupSharedStyles(styles: readonly SharedStyle[]): SharedStyleGroup[] {
  const groups: SharedStyleGroup[] = []
  for (const style of styles) {
    const slash = style.name.lastIndexOf('/')
    const folder = slash > 0 ? style.name.slice(0, slash).trim() : ''
    const label = slash > 0 ? style.name.slice(slash + 1).trim() || style.name : style.name
    let group = groups.find((entry) => entry.folder === folder)
    if (!group) {
      group = { folder, styles: [] }
      groups.push(group)
    }
    group.styles.push({ ...style, label })
  }
  return groups
}
