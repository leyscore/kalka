import { beforeAll, describe, expect, test } from 'bun:test'

import * as v from 'valibot'

import { exportFigFile, initCodec, parseFigFile, SceneGraph, type NodeChange } from '@kalka/core'
import { materializeDocument, parseFigBuffer } from '@kalka/fig'
import {
  addAnnotation,
  addAnnotationCategory,
  addMeasurement,
  documentAnnotationCategories,
  documentComments,
  documentFrameReviews,
  setFrameDevStatus,
  type SceneNode
} from '@kalka/scene-graph'

import { readKalkaFolder, writeKalkaFolder } from '#core/io/formats/kalka'

const IDENTITY = { m00: 1, m01: 0, m02: 0, m10: 0, m11: 1, m12: 0 }

function record(overrides: Partial<NodeChange>): NodeChange {
  return {
    visible: true,
    opacity: 1,
    phase: 'CREATED',
    transform: IDENTITY,
    ...overrides
  } as NodeChange
}

function byName(graph: SceneGraph, name: string): SceneNode {
  const node = [...graph.getAllNodes()].find((candidate) => candidate.name === name)
  if (!node) throw new Error(`no layer ${name}`)
  return node
}

const ACCESSIBILITY = { sessionID: 5, localID: 1 }
const LEGAL = { sessionID: 5, localID: 9 }

/** A file as Figma writes it: annotations, a measurement, a dev status and a dev resource. */
function figmaRecords(): NodeChange[] {
  return [
    record({
      guid: { sessionID: 0, localID: 0 },
      type: 'DOCUMENT',
      name: 'Document',
      annotationCategories: {
        items: [
          { id: ACCESSIBILITY, preset: 'ACCESSIBILITY' },
          { id: LEGAL, preset: 'NONE', custom: { color: 'TEAL', label: 'Legal' } }
        ]
      }
    }),
    record({
      guid: { sessionID: 0, localID: 1 },
      parentIndex: { guid: { sessionID: 0, localID: 0 }, position: '!' },
      type: 'CANVAS',
      name: 'Page 1'
    }),
    record({
      guid: { sessionID: 1, localID: 2 },
      parentIndex: { guid: { sessionID: 0, localID: 1 }, position: '!' },
      type: 'FRAME',
      name: 'Checkout',
      size: { x: 390, y: 844 },
      sectionStatusInfo: { status: 'BUILD', description: 'Build this first' }
    }),
    record({
      guid: { sessionID: 1, localID: 3 },
      parentIndex: { guid: { sessionID: 1, localID: 2 }, position: '!' },
      type: 'ROUNDED_RECTANGLE',
      name: 'Pay',
      size: { x: 120, y: 40 },
      transform: { ...IDENTITY, m02: 20, m12: 700 },
      annotations: [
        {
          label: 'Disabled until the form is valid',
          properties: [{ type: 'WIDTH' }, { type: 'CORNER_RADIUS' }],
          categoryId: ACCESSIBILITY
        },
        { label: 'Needs the terms link', properties: [], categoryId: LEGAL }
      ],
      measurements: [
        {
          fromNode: { sessionID: 1, localID: 3 },
          toNode: { sessionID: 1, localID: 2 },
          fromNodeSide: 'LEFT',
          toSameSide: true,
          freeText: ''
        }
      ],
      developerRelatedLinks: [
        {
          nodeId: '1:3',
          fileKey: '',
          linkName: 'Ticket',
          linkUrl: 'https://tracker.example.com/42'
        },
        { nodeId: '1:3', fileKey: '', linkName: 'Bad', linkUrl: 'ftp://example.com/file' }
      ]
    })
  ]
}

describe('.fig handoff round trip', () => {
  beforeAll(async () => {
    await initCodec()
  })

  test('reads Figma annotations, measurements, dev status and dev resources', () => {
    const { graph } = materializeDocument(figmaRecords())
    const pay = byName(graph, 'Pay')
    const checkout = byName(graph, 'Checkout')
    const [annotation, legal, measurement] = documentComments(graph)
    expect(annotation.anchor.nodeId).toBe(pay.id)
    expect(annotation.messages[0].text).toBe('Disabled until the form is valid')
    expect(annotation.annotation).toEqual({
      category: 'accessibility',
      properties: ['width', 'cornerRadius']
    })
    // A category of the file's own comes with its label and colour.
    expect(documentAnnotationCategories(graph)).toEqual([
      { id: 'category-5-9', label: 'Legal', color: 'teal' }
    ])
    expect(legal.annotation?.category).toBe('category-5-9')
    expect(measurement.measurement).toEqual({
      toNodeId: checkout.id,
      side: 'left',
      toSameSide: true
    })
    expect(documentFrameReviews(graph)).toEqual([
      { nodeId: checkout.id, status: 'ready', by: 'Figma', at: 0, description: 'Build this first' }
    ])
    expect(pay.devResources).toEqual([{ name: 'Ticket', url: 'https://tracker.example.com/42' }])
  })

  test('writes them onto their layers and reads Kalka’s own back once', async () => {
    const graph = new SceneGraph()
    const [page] = graph.getPages()
    const frame = graph.createNode('FRAME', page.id, { name: 'Card', width: 300, height: 200 })
    const button = graph.createNode('RECTANGLE', frame.id, {
      name: 'Button',
      x: 24,
      y: 140,
      width: 100,
      height: 36,
      devResources: [{ name: '', url: 'https://storybook.example.com/button' }]
    })
    const author = { kind: 'person' as const, name: 'Ada' }
    const review = addAnnotationCategory(graph, 'Review', 'pink')
    addAnnotation(graph, button.id, author, { label: 'Primary action', properties: ['height'] })
    addAnnotation(graph, button.id, author, { label: 'Check copy', category: review.id })
    addMeasurement(graph, button.id, author, { toNodeId: frame.id, side: 'left', toSameSide: true })
    setFrameDevStatus(graph, frame.id, 'completed', 'Ada', { now: 5000 })

    const bytes = await exportFigFile(graph)
    const records = parseFigBuffer(bytes.buffer as ArrayBuffer).nodeChanges
    const written = records.find((nc) => nc.name === 'Button')
    expect(written?.annotations?.[0]).toMatchObject({
      label: 'Primary action',
      properties: [{ type: 'HEIGHT' }]
    })
    // The document lists Figma's presets and its own category, which the annotation names.
    const categories = records.find((nc) => nc.type === 'DOCUMENT')?.annotationCategories
    const custom = v
      .parse(
        v.object({
          items: v.array(
            v.object({
              id: v.object({ sessionID: v.number(), localID: v.number() }),
              preset: v.string(),
              custom: v.optional(v.object({ color: v.string(), label: v.string() }))
            })
          )
        }),
        categories
      )
      .items.find((item) => item.custom)
    expect(custom?.custom).toEqual({ color: 'PINK', label: 'Review' })
    expect(written?.annotations?.[1]?.categoryId).toEqual(custom?.id)
    expect(written?.measurements?.[0]).toMatchObject({ fromNodeSide: 'LEFT', toSameSide: true })
    expect(written?.developerRelatedLinks?.[0]?.linkUrl).toBe(
      'https://storybook.example.com/button'
    )
    expect(records.find((nc) => nc.name === 'Card')?.sectionStatusInfo?.status).toBe('COMPLETED')

    // Kalka's file keeps its own threads: the records' copies are not brought in again.
    const read = await parseFigFile(bytes.buffer as ArrayBuffer)
    expect(documentComments(read)).toEqual(documentComments(graph))
    expect(documentFrameReviews(read)).toEqual(documentFrameReviews(graph))
    expect(documentAnnotationCategories(read)).toEqual([review])
    expect(byName(read, 'Button').devResources).toEqual(button.devResources)
  })

  test('a Kalka folder keeps dev resources', async () => {
    const graph = new SceneGraph()
    const [page] = graph.getPages()
    graph.createNode('FRAME', page.id, {
      name: 'Card',
      devResources: [{ name: 'Docs', url: 'https://docs.example.com' }]
    })
    const files = await writeKalkaFolder(graph)
    const read = readKalkaFolder(new Map(files.map((file) => [file.path, file.content])))
    expect(byName(read, 'Card').devResources).toEqual([
      { name: 'Docs', url: 'https://docs.example.com' }
    ])
  })
})
