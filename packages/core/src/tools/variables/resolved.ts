import {
  getSharedStyles,
  modesDefaultFirst,
  type Effect,
  type Fill,
  type LayoutGrid,
  type SceneGraph,
  type SceneNode,
  type SharedStyleKind,
  type SharedStyleType,
  type Variable,
  type VariableValue
} from '@kalka/scene-graph'
import { colorToHex8 } from '@kalka/scene-graph/color'

/**
 * Variables and styles as Figma's MCP tools report them: names with values written as strings,
 * colors as hex (`#RRGGBB`, or `#RRGGBBAA` when translucent), aliases followed to their value.
 */

function round(value: number): number {
  return Math.round(value * 100) / 100
}

export function formatVariableValue(value: VariableValue | undefined): string {
  if (value === undefined) return ''
  if (typeof value === 'object') return 'aliasId' in value ? '' : colorToHex8(value)
  return typeof value === 'number' ? String(round(value)) : String(value)
}

/** A variable's value in each mode of its collection, by mode name, default mode first. */
export function variableValuesByMode(
  graph: SceneGraph,
  variable: Variable
): Record<string, string> {
  const collection = graph.variableCollections.get(variable.collectionId)
  if (!collection) return {}
  return Object.fromEntries(
    modesDefaultFirst(collection).map((mode) => [
      mode.name,
      formatVariableValue(graph.resolveVariable(variable.id, mode.modeId))
    ])
  )
}

function paintValue(fill: Fill): string {
  if (fill.type === 'SOLID') return colorToHex8(fill.color, fill.color.a * fill.opacity)
  if (fill.type.startsWith('GRADIENT_') && fill.gradientStops) {
    const stops = fill.gradientStops.map(
      (stop) => `${colorToHex8(stop.color)} ${round(stop.position * 100)}%`
    )
    return `${fill.type}(${stops.join(', ')})`
  }
  return fill.type
}

function textStyleValue(node: SceneNode): string {
  const parts = [
    `family: ${node.fontFamily}`,
    `weight: ${node.fontWeight}`,
    `size: ${round(node.fontSize)}`,
    `lineHeight: ${node.lineHeight === null ? 'auto' : round(node.lineHeight)}`,
    `letterSpacing: ${round(node.letterSpacing)}`
  ]
  if (node.italic) parts.push('italic: true')
  return `Font(${parts.join(', ')})`
}

function effectValue(effect: Effect): string {
  if (effect.type === 'DROP_SHADOW' || effect.type === 'INNER_SHADOW') {
    return `Effect(type: ${effect.type}, color: ${colorToHex8(effect.color)}, offset: (${round(effect.offset.x)}, ${round(effect.offset.y)}), radius: ${round(effect.radius)}, spread: ${round(effect.spread)})`
  }
  return `Effect(type: ${effect.type}, radius: ${round(effect.radius)})`
}

function gridValue(grid: LayoutGrid): string {
  const parts = [`pattern: ${grid.pattern ?? 'GRID'}`]
  if (grid.count !== undefined) parts.push(`count: ${grid.count}`)
  if (grid.sectionSize !== undefined) parts.push(`size: ${round(grid.sectionSize)}`)
  if (grid.gutterSize !== undefined) parts.push(`gutter: ${round(grid.gutterSize)}`)
  if (grid.offset !== undefined) parts.push(`offset: ${round(grid.offset)}`)
  return `Grid(${parts.join(', ')})`
}

/** A shared style with its definition layer and value. */
export interface ResolvedStyle {
  id: string
  name: string
  type: SharedStyleType
  value: string
}

/** Stroke styles share the `FILL` type and definitions with fill styles, so one kind covers both. */
const STYLE_KINDS = ['fill', 'text', 'effect', 'grid'] as const satisfies SharedStyleKind[]

/** Every shared style the document defines, by the ID layers reference it with. */
export function documentStyles(graph: SceneGraph): Map<string, ResolvedStyle> {
  const styles = new Map<string, ResolvedStyle>()
  for (const kind of STYLE_KINDS) {
    for (const style of getSharedStyles(graph, kind)) {
      const definition = graph.getNode(style.nodeId)
      if (!definition || styles.has(style.id)) continue
      styles.set(style.id, {
        id: style.id,
        name: style.name,
        type: style.type,
        value: styleValue(definition, style.type)
      })
    }
  }
  return styles
}

/** The value a shared style's definition layer holds, written as Figma's tools write it. */
function styleValue(definition: SceneNode, type: SharedStyleType): string {
  if (type === 'TEXT') return textStyleValue(definition)
  if (type === 'EFFECT') {
    return definition.effects
      .filter((effect) => effect.visible)
      .map(effectValue)
      .join(', ')
  }
  if (type === 'GRID') return definition.layoutGrids.map(gridValue).join(', ')
  return definition.fills
    .filter((fill) => fill.visible)
    .map(paintValue)
    .join(', ')
}
