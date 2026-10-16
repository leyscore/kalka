import type { SceneGraph, SceneNode } from '@kalka/scene-graph'

/** CSS a Kalka document uses that Figma cannot show. */
export type FigmaLossKind =
  | 'class-rules'
  | 'breakpoints'
  | 'mode-conditions'
  | 'token-expressions'
  | 'shaders'
  | 'html-tags'
  | 'right-to-left'
  | 'kept-css'

export interface FigmaLoss {
  kind: FigmaLossKind
  /** The CSS it stands for, as a developer would name it. */
  css: string
  /** The layers, variables or collections that use it. */
  count: number
}

const CSS: Record<FigmaLossKind, string> = {
  'class-rules': 'class rules (.name { … })',
  breakpoints: '@media (max-width) breakpoints',
  'mode-conditions': '@media and attribute mode switches',
  'token-expressions': 'calc() and clamp() values',
  shaders: 'shader backgrounds',
  'html-tags': 'HTML element tags',
  'right-to-left': 'direction: rtl',
  'kept-css': 'CSS kept beside the layers’ fields, such as width: 50% or transition'
}

const LAYER_CHECKS: [FigmaLossKind, (node: SceneNode) => boolean][] = [
  ['class-rules', (node) => node.cssClasses.length > 0 || node.htmlClasses.length > 0],
  ['breakpoints', (node) => node.responsiveSource !== null],
  ['shaders', (node) => node.shader !== null],
  ['html-tags', (node) => node.htmlTag !== null],
  ['right-to-left', (node) => node.layoutDirection === 'RTL' || node.textDirection === 'RTL'],
  ['kept-css', (node) => Object.keys(node.style).length > 0]
]

/**
 * What a `.fig` export keeps only for Kalka: written as plugin data, so Kalka reads it back from
 * the file, while Figma draws the layers without it. Empty when Figma shows everything.
 */
export function figmaLosses(graph: SceneGraph): FigmaLoss[] {
  const counts = new Map<FigmaLossKind, number>()
  const add = (kind: FigmaLossKind) => counts.set(kind, (counts.get(kind) ?? 0) + 1)
  for (const node of graph.getAllNodes())
    for (const [kind, uses] of LAYER_CHECKS) if (uses(node)) add(kind)
  for (const collection of graph.variableCollections.values())
    if (collection.modeAttribute || collection.modes.some((mode) => mode.condition))
      add('mode-conditions')
  for (const variable of graph.variables.values())
    if (variable.expressions && Object.keys(variable.expressions).length > 0)
      add('token-expressions')
  return (Object.keys(CSS) as FigmaLossKind[]).flatMap((kind) => {
    const count = counts.get(kind)
    return count ? [{ kind, css: CSS[kind], count }] : []
  })
}
