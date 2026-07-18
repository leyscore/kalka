import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { parseFigFile } from '@open-pencil/core'
import type { ParseFigFileOptions, SceneGraph, SceneNode } from '@open-pencil/core'

import { collectAllNodes } from './fig-traversal'

export const FIXTURES = resolve(import.meta.dir, '../fixtures')

export const VALID_NODE_TYPES = new Set<string>([
  'CANVAS',
  'FRAME',
  'RECTANGLE',
  'ROUNDED_RECTANGLE',
  'ELLIPSE',
  'TEXT',
  'LINE',
  'STAR',
  'POLYGON',
  'VECTOR',
  'GROUP',
  'SECTION',
  'COMPONENT',
  'COMPONENT_SET',
  'INSTANCE',
  'BOOLEAN_OPERATION',
  'CONNECTOR',
  'SHAPE_WITH_TEXT'
])

export function readFixtureBytes(name: string): Uint8Array {
  return readFileSync(resolve(FIXTURES, name))
}

export async function parseFixture(
  name: string,
  options?: ParseFigFileOptions
): Promise<SceneGraph> {
  const bytes = readFixtureBytes(name)
  return parseFigFile(bytes.buffer as ArrayBuffer, options)
}

export async function parseGoldPreviewFixture(): Promise<{
  graph: SceneGraph
  allNodes: SceneNode[]
}> {
  const graph = await parseFixture('gold-preview.fig')
  return { graph, allNodes: collectAllNodes(graph) }
}
