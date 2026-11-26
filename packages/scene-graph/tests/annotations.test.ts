import { describe, expect, test } from 'bun:test'

import * as v from 'valibot'

import {
  addAnnotation,
  addMeasurement,
  annotationPropertiesFor,
  annotationPropertyValue,
  canHaveDevStatus,
  commentThreadsSchema,
  devStatusTargetsOf,
  documentComments,
  documentFrameReviews,
  inheritedDevResources,
  isDevResourceURL,
  isHandoffThread,
  layerHandoffThreads,
  markChangedFramesForReview,
  measurementSpan,
  SceneGraph,
  setCommentResolved,
  setFrameDevStatus,
  updateAnnotation
} from '@kalka/scene-graph'

const person = { kind: 'person' as const, name: 'Ada' }

function page() {
  const graph = new SceneGraph()
  const [first] = graph.getPages()
  const frame = graph.createNode('FRAME', first.id, {
    name: 'Card',
    x: 100,
    y: 50,
    width: 200,
    height: 120
  })
  const button = graph.createNode('RECTANGLE', frame.id, {
    name: 'Button',
    x: 20,
    y: 70,
    width: 80,
    height: 30,
    cornerRadius: 6,
    fills: [{ type: 'SOLID', color: { r: 1, g: 0, b: 0, a: 1 }, opacity: 1, visible: true }]
  })
  return { graph, page: first, frame, button }
}

describe('annotations', () => {
  test('an annotation is a comment thread on its layer, never resolved', () => {
    const { graph, button } = page()
    const thread = addAnnotation(graph, button.id, person, {
      label: ' Opens the checkout ',
      category: 'interaction',
      properties: ['cornerRadius', 'fills']
    })
    expect(thread).not.toBeNull()
    expect(thread?.messages[0].text).toBe('Opens the checkout')
    expect(thread?.annotation).toEqual({
      category: 'interaction',
      properties: ['cornerRadius', 'fills']
    })
    expect(thread && isHandoffThread(thread)).toBe(true)
    expect(layerHandoffThreads(graph, button.id)).toHaveLength(1)
    setCommentResolved(graph, thread?.id ?? '', true, 'Ada')
    expect(documentComments(graph)[0].resolved).toBe(false)
  })

  test('pinned properties show their current value, the way CSS writes it', () => {
    const { graph, button } = page()
    expect(annotationPropertyValue(graph, button, 'fills')).toBe('#FF0000')
    expect(annotationPropertyValue(graph, button, 'cornerRadius')).toBe('6px')
    expect(annotationPropertyValue(graph, button, 'width')).toBe('80px')
    graph.updateNode(button.id, { width: 96 })
    expect(annotationPropertyValue(graph, graph.getNode(button.id) ?? button, 'width')).toBe('96px')
    // Text properties only on text, auto layout ones only with auto layout.
    expect(annotationPropertiesFor(button)).not.toContain('fontSize')
    expect(annotationPropertiesFor(button)).not.toContain('itemSpacing')
  })

  test('edits change the note, category and properties in Figma order', () => {
    const { graph, button } = page()
    const thread = addAnnotation(graph, button.id, person, { label: 'a' })
    updateAnnotation(graph, thread?.id ?? '', {
      label: 'b',
      category: 'accessibility',
      properties: ['opacity', 'width']
    })
    let [stored] = documentComments(graph)
    expect(stored.messages[0].text).toBe('b')
    expect(stored.annotation).toEqual({
      category: 'accessibility',
      properties: ['width', 'opacity']
    })
    updateAnnotation(graph, stored.id, { category: null })
    ;[stored] = documentComments(graph)
    expect(stored.annotation?.category).toBeUndefined()
  })

  test('stored annotations and measurements read back, unknown properties dropped', () => {
    const { graph, frame, button } = page()
    addAnnotation(graph, button.id, person, { properties: ['width'] })
    addMeasurement(graph, button.id, person, { toNodeId: frame.id, side: 'left', toSameSide: true })
    const [annotation, measurement] = structuredClone(documentComments(graph))
    const stored = [
      { ...annotation, annotation: { properties: ['width', 'sparkle'] } },
      measurement
    ]
    const parsed = v.parse(commentThreadsSchema, stored)
    expect(parsed[0].annotation?.properties).toEqual(['width'])
    expect(parsed[1].measurement).toEqual({ toNodeId: frame.id, side: 'left', toSameSide: true })
  })
})

describe('measurements', () => {
  test('a measurement follows its layers and stops at a deleted one', () => {
    const { graph, frame, button } = page()
    const inset = addMeasurement(graph, button.id, person, {
      toNodeId: frame.id,
      side: 'left',
      toSameSide: true
    })
    const size = addMeasurement(graph, button.id, person, {
      toNodeId: button.id,
      side: 'left',
      toSameSide: false
    })
    if (!inset || !size) throw new Error('no measurement')
    expect(measurementSpan(graph, inset)?.distance).toBe(20)
    expect(measurementSpan(graph, size)?.distance).toBe(80)
    graph.updateNode(button.id, { x: 35 })
    expect(measurementSpan(graph, inset)?.distance).toBe(35)
    const span = measurementSpan(graph, inset)
    expect(span?.from.y).toBe(span?.to.y)
    graph.deleteNode(frame.id)
    expect(measurementSpan(graph, inset)).toBeNull()
  })
})

describe('dev status', () => {
  test('sections and frames at the top of a page or a section take a status', () => {
    const { graph, page: first, frame, button } = page()
    const section = graph.createNode('SECTION', first.id, { name: 'Flow' })
    const inSection = graph.createNode('FRAME', section.id, { name: 'Screen' })
    const nested = graph.createNode('FRAME', inSection.id, { name: 'Row' })
    expect(canHaveDevStatus(graph, frame.id)).toBe(true)
    expect(canHaveDevStatus(graph, section.id)).toBe(true)
    expect(canHaveDevStatus(graph, inSection.id)).toBe(true)
    expect(canHaveDevStatus(graph, nested.id)).toBe(false)
    expect(canHaveDevStatus(graph, button.id)).toBe(false)
    expect(devStatusTargetsOf(graph, nested.id)).toEqual([inSection.id, section.id])
  })

  test('an edit inside marks ready frames and sections as changed, never completed ones', () => {
    const { graph, page: first, frame, button } = page()
    const section = graph.createNode('SECTION', first.id, { name: 'Flow' })
    const screen = graph.createNode('FRAME', section.id, { name: 'Screen' })
    const label = graph.createNode('TEXT', screen.id, { name: 'Label' })
    setFrameDevStatus(graph, section.id, 'ready', 'Ada', { description: ' Build first ' })
    setFrameDevStatus(graph, screen.id, 'ready', 'Ada')
    setFrameDevStatus(graph, frame.id, 'completed', 'Ada')
    markChangedFramesForReview(graph, [label.id, button.id])
    const statuses = Object.fromEntries(
      documentFrameReviews(graph).map((review) => [review.nodeId, review.status])
    )
    expect(statuses).toEqual({
      [section.id]: 'review',
      [screen.id]: 'review',
      [frame.id]: 'completed'
    })
    expect(documentFrameReviews(graph)[0].description).toBe('Build first')
    setFrameDevStatus(graph, frame.id, null, 'Ada')
    expect(documentFrameReviews(graph).some((review) => review.nodeId === frame.id)).toBe(false)
  })
})

describe('dev resources', () => {
  test('only web links are kept', () => {
    expect(isDevResourceURL('https://example.com/ticket/1')).toBe(true)
    expect(isDevResourceURL('http://localhost:3000')).toBe(true)
    expect(isDevResourceURL('ftp://example.com/file')).toBe(false)
    expect(isDevResourceURL('https://exa mple.com')).toBe(false)
    expect(isDevResourceURL('example.com')).toBe(false)
  })

  test('an instance lists its main component links as inherited', () => {
    const { graph, page: first } = page()
    const main = graph.createNode('COMPONENT', first.id, {
      name: 'Button',
      devResources: [{ name: 'Storybook', url: 'https://storybook.example.com/button' }]
    })
    const instance = graph.createInstance(main.id, first.id)
    if (!instance) throw new Error('no instance')
    expect(inheritedDevResources(graph, instance).map((entry) => entry.from.id)).toEqual([main.id])
  })
})
