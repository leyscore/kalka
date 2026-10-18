import { describe, expect, test } from 'bun:test'

import { computeAllLayouts, SceneGraph } from '@kalka/core'
import { createEditor } from '@kalka/core/editor'

import { getNodeOrThrow } from '#tests/helpers/assert'
import { autoFrame, loadFixtureGraph, pageId } from '#tests/helpers/layout'
import { HEAVY_TEST_TIMEOUT_MS } from '#tests/helpers/test-utils'

describe('text measurement', () => {
  test(
    'opening imported fig keeps stored text bounds before CanvasKit measurement',
    async () => {
      const graph = await loadFixtureGraph('gold-preview.fig')
      const store = createEditor({ graph, skipInitialGraphSetup: true })
      const title = [...store.graph.getAllNodes()].find(
        (node) => node.type === 'TEXT' && node.text === "World's largest"
      )
      const subtitle = [...store.graph.getAllNodes()].find(
        (node) =>
          node.type === 'TEXT' &&
          node.text === 'Preline UI Figma - crafted with Tailwind CSS styles'
      )
      const description = [...store.graph.getAllNodes()].find(
        (node) =>
          node.type === 'TEXT' &&
          node.text.startsWith('Preline UI Figma is the largest free design system for Figma')
      )

      if (!title || !subtitle || !description) {
        throw new Error('Expected imported text nodes in gold-preview.fig')
      }

      expect(title.width).toBe(444)
      expect(title.height).toBe(73)
      expect(subtitle.width).toBe(439)
      expect(subtitle.height).toBe(22)
      expect(description.width).toBe(878)
      expect(description.height).toBe(60)

      await store.switchPage(store.graph.getPages()[0].id)

      expect(store.graph.getNode(title.id)?.width).toBe(444)
      expect(store.graph.getNode(title.id)?.height).toBe(73)
      expect(store.graph.getNode(subtitle.id)?.width).toBe(439)
      expect(store.graph.getNode(subtitle.id)?.height).toBe(22)
      expect(store.graph.getNode(description.id)?.width).toBe(878)
      expect(store.graph.getNode(description.id)?.height).toBe(60)
    },
    { timeout: HEAVY_TEST_TIMEOUT_MS }
  )

  test(
    'imported nested instance layout keeps hidden sibling offsets stable',
    async () => {
      const graph = await loadFixtureGraph('gold-preview.fig')
      const previewRoot = graph.getChildren(graph.getPages()[0].id)[0]
      const wysiwygEditor = graph
        .getChildren(previewRoot.id)
        .find((node) => node.name === '_WYSIWYG-editor')
      const toolbarVariant = wysiwygEditor
        ? graph
            .getChildren(wysiwygEditor.id)
            .find((node) => node.name === '_on-text-WYSIWYG-toolbar')
        : undefined
      const toolbarRow = toolbarVariant
        ? graph.getChildren(toolbarVariant.id).find((node) => node.name === 'Toolbar')
        : undefined
      const hiddenInput = toolbarRow
        ? graph.getChildren(toolbarRow.id).find((node) => node.name === 'Input')
        : undefined
      const visibleToolbar = toolbarRow
        ? graph
            .getChildren(toolbarRow.id)
            .find((node) => node.name === 'Toolbar' && node.id !== toolbarRow.id)
        : undefined

      if (!toolbarRow || !hiddenInput || !visibleToolbar) {
        throw new Error('Expected imported WYSIWYG toolbar nodes in gold-preview.fig')
      }

      expect(hiddenInput.visible).toBe(false)
      // x=8 is the Figma-exported fixture value (verified via fixture inspection 2026-05-03).
      // The old assertion of x=298 was incorrect — it was a post-layout computed value from
      // an older layout implementation. Post-layout, left-aligned HUG content retains x=8.
      expect(visibleToolbar.x).toBe(8)

      computeAllLayouts(graph, graph.getPages()[0].id)

      expect(graph.getNode(visibleToolbar.id)?.x).toBe(8)
      expect(graph.getNode(visibleToolbar.id)?.y).toBe(8)
    },
    { timeout: HEAVY_TEST_TIMEOUT_MS }
  )

  test('auto-sized text with the 100x100 default box takes the size of its text', () => {
    const graph = new SceneGraph()
    const pid = pageId(graph)

    const frame = autoFrame(graph, pid, {
      width: 300,
      height: 40,
      layoutMode: 'HORIZONTAL',
      primaryAxisSizing: 'FIXED',
      counterAxisSizing: 'FIXED',
      primaryAxisAlign: 'CENTER'
    })

    graph.createNode('TEXT', frame.id, {
      width: 100,
      height: 100,
      text: 'Test',
      fontSize: 14,
      textAutoResize: 'WIDTH_AND_HEIGHT' as const
    })

    computeAllLayouts(graph)

    const children = graph.getChildren(frame.id)
    const updatedText = children[0]
    expect(updatedText.width).toBeLessThan(100)
    expect(updatedText.width).toBeGreaterThan(0)
    expect(updatedText.height).toBeLessThan(100)
    expect(updatedText.height).toBeGreaterThan(0)
  })

  test('auto-height text keeps the height its lines take', () => {
    const graph = new SceneGraph()
    const pid = pageId(graph)

    const frame = autoFrame(graph, pid, {
      width: 269,
      height: 400,
      layoutMode: 'VERTICAL',
      primaryAxisSizing: 'FIXED',
      counterAxisSizing: 'FIXED'
    })

    graph.createNode('TEXT', frame.id, {
      width: 269,
      height: 66,
      text: 'GDP Growth Exceeds Expectations at 3.1% in Q2 Report That Nobody Expected',
      fontSize: 15,
      lineHeight: 22,
      textAutoResize: 'HEIGHT' as const
    })

    computeAllLayouts(graph)

    const children = graph.getChildren(frame.id)
    const updatedText = children[0]
    expect(updatedText.height).toBe(66)
    expect(updatedText.width).toBe(269)
  })

  test('auto-height text with the 100x100 default box wraps to its width', () => {
    const graph = new SceneGraph()
    const pid = pageId(graph)

    const frame = autoFrame(graph, pid, {
      width: 269,
      height: 400,
      layoutMode: 'VERTICAL',
      primaryAxisSizing: 'FIXED',
      counterAxisSizing: 'FIXED'
    })

    graph.createNode('TEXT', frame.id, {
      width: 100,
      height: 100,
      text: 'GDP Growth Exceeds Expectations at 3.1% in Q2 Report That Nobody Expected',
      fontSize: 15,
      lineHeight: 22,
      textAutoResize: 'HEIGHT' as const
    })

    computeAllLayouts(graph)

    const children = graph.getChildren(frame.id)
    const updatedText = children[0]
    expect(updatedText.height).toBeGreaterThan(22)
  })

  test('text with w="fill" in flex="col" stretches to parent width', () => {
    const graph = new SceneGraph()
    const pid = pageId(graph)

    const frame = autoFrame(graph, pid, {
      width: 300,
      height: 400,
      layoutMode: 'VERTICAL',
      primaryAxisSizing: 'FIXED',
      counterAxisSizing: 'FIXED',
      paddingLeft: 20,
      paddingRight: 20
    })

    const text = graph.createNode('TEXT', frame.id, {
      width: 100,
      height: 20,
      text: 'This text should fill the parent width',
      fontSize: 14,
      textAutoResize: 'HEIGHT' as const,
      layoutAlignSelf: 'STRETCH' as const
    })

    computeAllLayouts(graph)

    const updatedText = getNodeOrThrow(graph, text.id)
    // Should stretch to 300 - 20 - 20 = 260, NOT stay at 100
    expect(updatedText.width).toBe(260)
  })

  test('fixed-size text keeps its box', () => {
    const graph = new SceneGraph()
    const pid = pageId(graph)

    const frame = autoFrame(graph, pid, {
      width: 300,
      height: 100,
      layoutMode: 'HORIZONTAL',
      primaryAxisSizing: 'FIXED',
      counterAxisSizing: 'FIXED'
    })

    const text = graph.createNode('TEXT', frame.id, {
      width: 150,
      height: 40,
      text: 'Fixed text',
      fontSize: 14,
      textAutoResize: 'NONE' as const
    })

    computeAllLayouts(graph)

    const updatedText = getNodeOrThrow(graph, text.id)
    expect(updatedText.width).toBe(150)
    expect(updatedText.height).toBe(40)
  })
})
