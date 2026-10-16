import { renderTree } from '@kalka/core/design-jsx'
import { Text } from '@kalka/design-jsx'
import type { SceneGraph, SceneNode } from '@kalka/scene-graph'

interface TypographySample {
  name: string
  text: string
  font?: string
  fontFeatures?: SceneNode['fontFeatures']
  decoration?: Pick<
    SceneNode,
    'textDecoration' | 'textDecorationStyle' | 'textDecorationFills' | 'textDecorationThickness'
  >
}

/** These native OpenType/decoration fields are not Design JSX shorthands. */
export async function createTypographySample(
  graph: SceneGraph,
  parentId: string,
  sample: TypographySample
) {
  const result = await renderTree(
    graph,
    Text({
      name: sample.name,
      children: sample.text,
      font: sample.font ?? 'Inter',
      size: 24,
      lineHeight: 36,
      w: 'fill',
      color: '#172554'
    }),
    { parentId }
  )
  graph.updateNode(result.id, {
    fontFeatures: sample.fontFeatures ?? [],
    ...sample.decoration
  })
  return result.id
}
