import { defaultPropertiesOf, type DefaultLayerProperties } from '@kalka/core/editor'
import { cssToNodeChanges } from '@kalka/dom-css/import'
import { SceneGraph, type NodeType, type SceneNode } from '@kalka/scene-graph'
import { layerCSS } from '@kalka/scene-graph/css-model'

import { appPreferences, type DefaultPropertiesCSS } from '@/app/settings/preferences/store'

type DefaultKind = keyof DefaultLayerProperties

/** The layer a kind of default is read on and written from: a rectangle, or a text. */
const KIND_TYPE: Record<DefaultKind, NodeType> = { shape: 'RECTANGLE', text: 'TEXT' }

/** A layer of the kind on a page of its own, with the defaults as its own fields. */
function scratchLayer(kind: DefaultKind, fields: Partial<SceneNode>): SceneNode {
  const graph = new SceneGraph()
  return graph.createNode(KIND_TYPE[kind], graph.getPages()[0].id, fields)
}

/** The look a kind of default gives, as the CSS a layer with it is written in. */
function defaultsToCSS(
  kind: DefaultKind,
  properties: Partial<SceneNode> | null
): Record<string, string> | null {
  return properties ? layerCSS(scratchLayer(kind, properties), undefined) : null
}

/** The look stored CSS gives, read back onto a layer of the kind. */
function defaultsFromCSS(
  kind: DefaultKind,
  css: Record<string, string> | null
): Partial<SceneNode> | null {
  if (!css) return null
  const graph = new SceneGraph()
  const layer = graph.createNode(KIND_TYPE[kind], graph.getPages()[0].id, {})
  Object.assign(layer, cssToNodeChanges(graph, layer, css))
  return defaultPropertiesOf(layer)?.properties ?? null
}

/** The defaults kept with the app preferences, for a new editor to start with. */
export function storedDefaultProperties(
  stored: DefaultPropertiesCSS = appPreferences.value.editing.defaultProperties
): DefaultLayerProperties | undefined {
  const shape = defaultsFromCSS('shape', stored.shape)
  const text = defaultsFromCSS('text', stored.text)
  return shape || text ? { shape, text } : undefined
}

/** The defaults as the CSS the app preferences keep. */
export function defaultPropertiesToCSS(defaults: DefaultLayerProperties): DefaultPropertiesCSS {
  return {
    shape: defaultsToCSS('shape', defaults.shape),
    text: defaultsToCSS('text', defaults.text)
  }
}
