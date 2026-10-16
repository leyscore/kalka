import type { NodeType } from '@kalka/scene-graph'

/** The folder format's version, written to `project.json`; a newer one is refused. */
export const KALKA_FORMAT_VERSION = 1

/** The value of `project.json`'s `format` field, which tells a Kalka folder from other JSON. */
export const KALKA_FORMAT_ID = 'kalka'

export const PROJECT_FILE = 'project.json'
export const STYLES_FILE = 'styles.css'
export const PAGES_DIR = 'pages'
export const TOKENS_FILE = 'design-system/tokens.json'
export const TOKENS_CSS_FILE = 'design-system/tokens.css'
export const IMAGES_DIR = 'assets/images'

/** Editor data a page's HTML carries on each layer, beside the CSS that draws it. */
export const ATTR = {
  id: 'data-kalka-id',
  type: 'data-kalka-type',
  name: 'data-kalka-name',
  locked: 'data-kalka-locked',
  internal: 'data-kalka-internal',
  /** Fields CSS cannot hold, as JSON; they win over what the CSS says. */
  props: 'data-kalka-props',
  /** On a `<template>`: the layer whose children it holds, for a layer drawn as one SVG. */
  childrenOf: 'data-kalka-children-of',
  page: 'data-kalka-page'
} as const

/** Every node type a layer can have; the type test below keeps it complete. */
export const LAYER_TYPES = [
  'FRAME',
  'RECTANGLE',
  'ROUNDED_RECTANGLE',
  'ELLIPSE',
  'TEXT',
  'LINE',
  'STAR',
  'POLYGON',
  'VECTOR',
  'BOOLEAN_OPERATION',
  'GROUP',
  'SECTION',
  'COMPONENT',
  'COMPONENT_SET',
  'INSTANCE',
  'CONNECTOR',
  'SHAPE_WITH_TEXT'
] as const satisfies readonly Exclude<NodeType, 'CANVAS'>[]

export type LayerType = (typeof LAYER_TYPES)[number]

// Fails to compile when NodeType gains a member the list above lacks.
const LAYER_TYPES_COMPLETE: Exclude<NodeType, 'CANVAS'> extends LayerType ? true : never = true
void LAYER_TYPES_COMPLETE
