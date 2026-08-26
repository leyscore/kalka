import { describe, expect, test } from 'bun:test'

import { createAPI } from '../helpers'

describe('createComponentFromNode', () => {
  test('converts frame to component', () => {
    const api = createAPI()
    const frame = api.createFrame()
    frame.name = 'MyButton'
    frame.resize(200, 50)
    const child = api.createRectangle()
    child.name = 'Background'
    frame.appendChild(child)
    const frameId = frame.id

    const comp = api.createComponentFromNode(frame)
    expect(comp.type).toBe('COMPONENT')
    expect(comp.name).toBe('MyButton')
    expect(comp.width).toBe(200)
    expect(comp.height).toBe(50)
    expect(comp.children.length).toBe(1)
    expect(comp.children[0].name).toBe('Background')
    expect(api.getNodeById(frameId)).toBeNull()
  })

  test('preserves the frame own variable bindings', () => {
    const api = createAPI()
    const collection = api.createVariableCollection('Radii')
    const variable = api.createVariable('radius/md', 'FLOAT', collection.id, 8)

    const frame = api.createFrame()
    frame.name = 'Card'
    frame.resize(200, 50)
    frame.cornerRadius = 8
    api.bindVariable(frame.id, 'cornerRadius', variable.id)

    const comp = api.createComponentFromNode(frame)

    const raw = api.graph.getNode(comp.id)
    expect(raw?.boundVariables.cornerRadius).toBe(variable.id)
  })
})
