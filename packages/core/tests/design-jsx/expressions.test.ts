import { expect, test } from 'bun:test'

import { getNodeOrThrow } from '#core-tests/helpers/assert'

import { renderJSX } from '@kalka/core/design-jsx'
import { SceneGraph } from '@kalka/scene-graph'

async function render(jsx: string) {
  const graph = new SceneGraph()
  const [root] = await renderJSX(graph, jsx)
  if (!root) throw new Error('Nothing rendered')
  return { graph, root: getNodeOrThrow(graph, root.id) }
}

test('JavaScript inside braces builds repeated and conditional content', async () => {
  const { graph, root } = await render(
    `<Frame flex="row" wrap w={300}>{Array.from({ length: 35 }, (_, i) => (
      <Frame w={36} h={36} name={i % 7 === 0 ? 'Sunday' : 'Day'} />
    ))}</Frame>`
  )
  expect(root.childIds).toHaveLength(35)
  expect(graph.getNode(root.childIds[7] ?? '')?.name).toBe('Sunday')
})

test('an arrow function called in place can hold statements', async () => {
  const { graph, root } = await render(
    `<Frame>{(() => {
      const days = ['Mo', 'Tu', 'We']
      return days.map((day) => <Text name={day}>{day}</Text>)
    })()}</Frame>`
  )
  expect(root.childIds.map((id) => graph.getNode(id)?.name)).toEqual(['Mo', 'Tu', 'We'])
})

test('a statement before the JSX fails with guidance added to the undefined name', async () => {
  const error = await render(`const days = ['Mo']
<Frame>{days.map((day) => <Text>{day}</Text>)}</Frame>`).catch((thrown: unknown) => thrown)

  if (!(error instanceof Error) || !(error.cause instanceof ReferenceError)) {
    throw new Error('Expected guidance wrapping the ReferenceError')
  }
  expect(error.message).toStartWith(error.cause.message)
  expect(error.message.length).toBeGreaterThan(error.cause.message.length)
})
