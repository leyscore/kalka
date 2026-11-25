import { omit } from 'es-toolkit/object'

import type { Fill, SceneGraph, SceneNode } from '@kalka/scene-graph'
import { copyFill, copyFills } from '@kalka/scene-graph/copy'
import { parseSVGPath } from '@kalka/scene-graph/parse-path'

import {
  makeBooleanSourcePath,
  makeStrokeOutlinePath,
  nodeHasVisibleStroke,
  nodePathTransform
} from './boolean'
import type { SkiaRenderer } from './renderer'

export type VectorFlattenProps = Pick<
  SceneNode,
  'name' | 'x' | 'y' | 'width' | 'height' | 'fills' | 'vectorNetwork'
>

type NodePathFactory = (
  renderer: SkiaRenderer,
  graph: SceneGraph,
  node: SceneNode
) => ReturnType<typeof makeBooleanSourcePath>

function nodesToVectorProps(
  renderer: SkiaRenderer,
  graph: SceneGraph,
  nodes: SceneNode[],
  makeNodePath: NodePathFactory
): VectorFlattenProps | null {
  const path = new renderer.ck.PathBuilder()
  for (const node of nodes) {
    const nodePath = makeNodePath(renderer, graph, node)
    if (!nodePath) {
      path.delete()
      return null
    }
    path.addPath(nodePath, nodePathTransform(renderer, node))
    nodePath.delete()
  }

  const bounds = path.getBounds()
  if (bounds[2] <= bounds[0] || bounds[3] <= bounds[1]) {
    path.delete()
    return null
  }

  path.transform(renderer.ck.Matrix.translated(-bounds[0], -bounds[1]))
  const immutablePath = path.detachAndDelete()
  const vectorNetwork = parseSVGPath(immutablePath.toSVGString())
  immutablePath.delete()

  return {
    name: 'Flatten',
    x: bounds[0],
    y: bounds[1],
    width: bounds[2] - bounds[0],
    height: bounds[3] - bounds[1],
    fills: copyFills(nodes[0].fills),
    vectorNetwork
  }
}

export function flattenNodesToVectorProps(
  renderer: SkiaRenderer,
  graph: SceneGraph,
  nodes: SceneNode[]
): VectorFlattenProps | null {
  return nodesToVectorProps(renderer, graph, nodes, (r, g, node) =>
    makeBooleanSourcePath(r, node, g)
  )
}

function firstVisibleStrokeNode(graph: SceneGraph, nodes: SceneNode[]): SceneNode | null {
  for (const node of nodes) {
    if (nodeHasVisibleStroke(node)) return node
    const children = node.childIds.flatMap((id) => {
      const child = graph.getNode(id)
      return child?.visible ? [child] : []
    })
    const found = firstVisibleStrokeNode(graph, children)
    if (found) return found
  }
  return null
}

/** The outline of a stroke is filled with the stroke's paints, as Figma's Outline stroke does. */
function strokePaintsAsFills(graph: SceneGraph, nodes: SceneNode[]): Fill[] {
  const source = firstVisibleStrokeNode(graph, nodes)
  if (!source) return []
  return source.strokes
    .filter((stroke) => stroke.visible && stroke.weight > 0)
    .map((stroke) => copyFill(omit(stroke, ['weight', 'align', 'cap', 'join', 'dashPattern'])))
}

export function outlineStrokeNodesToVectorProps(
  renderer: SkiaRenderer,
  graph: SceneGraph,
  nodes: SceneNode[]
): VectorFlattenProps | null {
  const props = nodesToVectorProps(renderer, graph, nodes, (r, g, node) =>
    makeStrokeOutlinePath(r, node, g)
  )
  if (!props) return null
  return { ...props, fills: strokePaintsAsFills(graph, nodes) }
}
