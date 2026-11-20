import { describe, expect, test } from 'bun:test'

import { UndoManager } from '@kalka/scene-graph'

const noop = () => undefined
const step = (label: string, coalesceKey?: string) => ({
  label,
  forward: noop,
  inverse: noop,
  coalesceKey
})

describe('following the steps a person records', () => {
  test('lists the steps recorded meanwhile, leaving out agent steps', () => {
    const undo = new UndoManager()
    undo.push(step('Before'))
    const following = undo.followSteps()
    const move = step('Move')
    undo.push(move)
    undo.pushStep(step('Agent'))
    expect(following.stop()).toEqual([move])
  })

  test('keeps a step that later changes of the same kind extend', () => {
    const undo = new UndoManager()
    const following = undo.followSteps()
    undo.push(step('Nudge', 'nudge'))
    undo.push(step('Nudge', 'nudge'))
    const steps = following.stop()
    expect(steps).toHaveLength(1)
    expect(steps?.[0]).toBe(undo.peekUndo())
  })

  test('gives up once history is undone or a step from before is extended', () => {
    const undo = new UndoManager()
    undo.push(step('Before', 'nudge'))
    const undone = undo.followSteps()
    undo.undo()
    expect(undone.stop()).toBeNull()

    undo.redo()
    const extended = undo.followSteps()
    undo.push(step('Nudge', 'nudge'))
    expect(extended.stop()).toBeNull()
  })

  test('replays steps without recording them', () => {
    const undo = new UndoManager()
    const order: string[] = []
    const entry = (label: string) => ({
      label,
      forward: () => order.push(`do ${label}`),
      inverse: () => order.push(`undo ${label}`)
    })
    undo.replaySteps([entry('a'), entry('b')], 'inverse')
    undo.replaySteps([entry('a'), entry('b')], 'forward')
    expect(order).toEqual(['undo b', 'undo a', 'do a', 'do b'])
    expect(undo.canUndo).toBe(false)
  })
})
