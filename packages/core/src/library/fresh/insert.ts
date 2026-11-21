import type { Color, SceneGraph, SceneNode } from '@kalka/scene-graph'

import type { FigmaAPI } from '#core/figma-api'
import { materializeLibraryAsset } from '#core/library/materialize'

import { freshLibraryRevision } from './build'
import { findFreshComponent } from './catalog'
import { COLOR_ROLES, type ColorRole } from './colors'

export interface InsertFreshInput {
  assetKey: string
  parentId?: string
  insertIndex?: number
  x?: number
  y?: number
  /** Variant and text property values by property name. */
  properties?: Readonly<Record<string, string>>
}

export interface InsertedFresh {
  id: string
  name: string
  componentId: string
  /** The instance's properties after insertion, by name. */
  properties: Record<string, string>
  /** The colour roles a live shader took from the document's variables. */
  recolored: ColorRole[]
}

/** The document's colour for each role it names, by the CSS name its variable gets. */
async function documentRoleColors(graph: SceneGraph): Promise<Partial<Record<ColorRole, Color>>> {
  const { variableCSSNames } = await import('@kalka/dom-css/export')
  const names = variableCSSNames(graph.variables.values())
  const colors: Partial<Record<ColorRole, Color>> = {}
  for (const [id, name] of names) {
    const role = name.replace(/^color-/, '')
    if (!(role in COLOR_ROLES) || !name.startsWith('color-')) continue
    const color = graph.resolveColorVariable(id)
    if (color) colors[role as ColorRole] = color
  }
  return colors
}

function blend(a: Color, b: Color): Color {
  return { r: (a.r + b.r) / 2, g: (a.g + b.g) / 2, b: (a.b + b.b) / 2, a: 1 }
}

/**
 * Gives the instance's live shaders the document's accent, ground and ink, which shaders cannot
 * read from CSS. The colours are instance overrides, so the main component keeps its own.
 */
async function recolorShaders(graph: SceneGraph, instance: SceneNode): Promise<ColorRole[]> {
  const layers = [instance, ...graph.flattenTree(instance.id).map((entry) => entry.node)].filter(
    (node) => node.shader
  )
  if (layers.length === 0) return []
  const roles = await documentRoleColors(graph)
  const used = (['accent', 'ground', 'ink'] as const).filter((role) => roles[role])
  if (used.length === 0) return []
  for (const layer of layers) {
    const shader = layer.shader
    if (!shader) continue
    const colors = [...shader.colors]
    if (roles.accent) colors[0] = roles.accent
    if (roles.ground) colors[1] = roles.ground
    if (roles.ink && colors.length > 2) colors[2] = roles.ink
    if (roles.accent && roles.ground && colors.length > 3)
      colors[3] = blend(roles.accent, roles.ground)
    graph.updateNode(layer.id, { shader: { ...shader, colors } })
  }
  return used
}

/** The instance's values by property name: its variant's, read from its main, and its texts. */
function instanceProperties(graph: SceneGraph, instanceId: string): Record<string, string> {
  const instance = graph.getNode(instanceId)
  const main = instance?.componentId ? graph.getNode(instance.componentId) : undefined
  const variant = Object.fromEntries(
    (main?.name ?? '')
      .split(',')
      .map((pair) => pair.split('=').map((part) => part.trim()))
      .filter((pair): pair is [string, string] => pair.length === 2)
  )
  const texts = Object.fromEntries(
    graph
      .flattenTree(instanceId)
      .map((entry) => entry.node)
      .filter((node) => node.type === 'TEXT' && node.componentPropertyReferences.length > 0)
      .map((node) => [node.name, node.text])
  )
  return { ...variant, ...texts }
}

/** The instance's property keys (`Label#12:3`) by the names people use (`Label`). */
function propertyKeys(names: string[]): Map<string, string> {
  return new Map(names.map((key) => [key.split('#')[0] ?? key, key]))
}

/**
 * Inserts an instance of a built-in Fresh component: the definition is copied into the document
 * as library components are, then the instance takes the given variant and text values and its
 * shaders the document's colours.
 */
export async function insertFreshComponent(
  figma: FigmaAPI,
  input: InsertFreshInput
): Promise<InsertedFresh> {
  const graph = figma.graph
  if (input.parentId && !graph.getNode(input.parentId))
    throw new Error(`Parent "${input.parentId}" not found`)
  const revision = await freshLibraryRevision()
  const materialized = materializeLibraryAsset(graph, revision, input.assetKey)
  const component = figma.getNodeById(materialized.componentId)
  if (!component) throw new Error(`Component of "${input.assetKey}" not found`)
  const instance = component.createInstance()
  const parentId = input.parentId ?? figma.currentPageId
  graph.reparentNode(instance.id, parentId)
  if (input.insertIndex !== undefined) graph.insertChildAt(instance.id, parentId, input.insertIndex)
  if (input.x !== undefined) instance.x = input.x
  if (input.y !== undefined) instance.y = input.y

  const keys = propertyKeys(Object.keys(instance.componentProperties))
  const requested = Object.entries(input.properties ?? {})
  const unknown = requested.filter(([name]) => !keys.has(name)).map(([name]) => name)
  if (unknown.length > 0) {
    instance.remove()
    throw new Error(
      `Unknown properties: ${unknown.join(', ')}. ${input.assetKey} has ${[...keys.keys()].join(', ') || 'none'}`
    )
  }
  if (requested.length > 0) {
    instance.setProperties(
      Object.fromEntries(requested.map(([name, value]) => [keys.get(name) ?? name, value]))
    )
  }
  const definition = findFreshComponent(input.assetKey)
  if (definition) instance.name = definition.name
  const node = graph.getNode(instance.id)
  const recolored = node ? await recolorShaders(graph, node) : []
  return {
    id: instance.id,
    name: instance.name,
    componentId: instance.mainComponent?.id ?? materialized.componentId,
    properties: instanceProperties(graph, instance.id),
    recolored
  }
}
