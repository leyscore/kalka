import { beforeAll, describe, expect, test } from 'bun:test'

import { expectDefined } from '#core-tests/helpers/assert'
import { fontManager } from '#core/text/fonts'

import { FigmaAPI } from '@kalka/core/figma-api'
import { SceneGraph } from '@kalka/scene-graph'

// Recorded with the same script in live Figma on 2026-10-07, Inter Regular. Line metrics round
// differently by up to a pixel.

beforeAll(async () => {
  fontManager.markLoaded(
    'Inter',
    'Regular',
    expectDefined(await fontManager.fetchBundledFont('/Inter-Regular.ttf'), 'bundled Inter font')
  )
})

function text() {
  const figma = new FigmaAPI(new SceneGraph())
  return figma.createText() as ReturnType<FigmaAPI['createText']> & TextNode
}

function size(node: { width: number; height: number }) {
  return [node.width, node.height]
}

describe('plugin text sizing', () => {
  // Figma gives empty text the height of a line; the browser lays an empty block out at none.
  test.failing('new text is empty, 12px, and one line tall', () => {
    const node = text()
    expect(node.textAutoResize).toBe('WIDTH_AND_HEIGHT')
    expect(node.fontSize).toBe(12)
    expect(size(node)).toEqual([0, 15])
  })

  test('new text sizes itself to its content', () => {
    const node = text()
    // The browser keeps fractions of a pixel that Figma rounds.
    const near = (width: number, height: number) => {
      expect(node.width).toBeCloseTo(width, 0)
      expect(node.height).toBeCloseTo(height, 0)
    }
    node.characters = 'Hello'
    near(29, 15)
    node.characters = 'Hello world, a longer line of text'
    near(180, 15)
    node.characters = 'Hello'
    node.fontSize = 24
    near(58, 29)
  })

  test('resizing text fixes its size', () => {
    const node = text()
    // Read through a call, so the assignment below does not narrow what TypeScript expects.
    const mode = (): string => node.textAutoResize
    node.characters = 'Hello'
    node.resize(200, 50)
    expect(mode()).toBe('NONE')
    expect(size(node)).toEqual([200, 50])

    node.textAutoResize = 'HEIGHT'
    node.resize(100, 10)
    expect(mode()).toBe('NONE')
    node.characters = 'Hello there, this wraps across lines'
    expect(size(node)).toEqual([100, 10])
  })
})
