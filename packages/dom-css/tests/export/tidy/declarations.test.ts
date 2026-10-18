import { describe, expect, test } from 'bun:test'

import { tidyDeclarations, type DeclarationContext } from '#dom-css/export/tidy/declarations'
import type { DesignStyleDeclaration } from '#dom-css/types'

const row: DesignStyleDeclaration = { display: 'flex', width: '400px' }
const column: DesignStyleDeclaration = { display: 'flex', 'flex-direction': 'column' }

function tidy(
  style: DesignStyleDeclaration,
  parent: DesignStyleDeclaration | undefined,
  context: Partial<DeclarationContext> = {}
) {
  return tidyDeclarations(style, {
    tagName: 'div',
    classed: false,
    parent: { style: parent },
    responsive: false,
    shorthands: true,
    ...context
  })
}

describe('declarations a browser applies anyway', () => {
  test('a zero minimum goes where `auto` is zero too', () => {
    const minimums = { 'min-width': '0', 'min-height': '0' }
    // Placed freely, or in a frame without auto layout.
    expect(tidy({ position: 'absolute', ...minimums }, row)).toEqual({ position: 'absolute' })
    expect(tidy({ width: '10px', ...minimums }, { position: 'relative' })).toEqual({
      width: '10px'
    })
    // Across a flex line; along it only when the box cannot shrink from its size.
    expect(tidy({ 'flex-grow': '1', ...minimums }, row)).toEqual({
      'flex-grow': '1',
      'min-width': '0'
    })
    expect(tidy({ height: '50px', 'flex-shrink': '0', ...minimums }, column)).toEqual({
      height: '50px',
      'flex-shrink': '0'
    })
    expect(tidy({ height: '50px', ...minimums }, column)).toEqual({
      height: '50px',
      'min-height': '0'
    })
  })

  test('a minimum stays where the page around the export decides', () => {
    const style = { width: '10px', 'min-width': '0' }
    expect(tidy(style, undefined)).toEqual(style)
    expect(tidy(style, { display: 'grid' })).toEqual(style)
    expect(tidy(style, row, { responsive: true })).toEqual(style)
  })

  test('an aspect ratio goes once both sizes are fixed', () => {
    const image = { width: '28px', height: '28px', 'aspect-ratio': '28 / 28', 'flex-shrink': '0' }
    expect(tidy(image, row)).toEqual({ width: '28px', height: '28px', 'flex-shrink': '0' })
    const shrinking = { width: '28px', height: '28px', 'aspect-ratio': '1' }
    expect(tidy(shrinking, row)).toEqual(shrinking)
  })
})

describe('shorthands', () => {
  test('padding sides become one padding, a missing side zero', () => {
    expect(
      tidy(
        { display: 'flex', 'padding-top': '18px', 'padding-right': '20px', 'padding-left': '20px' },
        undefined
      )
    ).toEqual({ display: 'flex', padding: '18px 20px 0' })
    expect(tidy({ 'padding-inline': '14px', color: 'red' }, undefined)).toEqual({
      padding: '0 14px',
      color: 'red'
    })
  })

  test('tags with browser padding, and layers with classes, keep their longhands', () => {
    const style = { 'padding-top': '4px' }
    expect(tidy(style, undefined, { tagName: 'button' })).toEqual(style)
    expect(tidy(style, undefined, { classed: true })).toEqual(style)
  })

  test('growing from nothing is `flex`', () => {
    expect(tidy({ 'flex-grow': '1', 'flex-basis': '0' }, row)).toEqual({ flex: '1 1 0' })
    expect(tidy({ 'flex-grow': '1' }, row)).toEqual({ 'flex-grow': '1' })
  })

  test('a border on its sides is one border, or the one side drawn', () => {
    const sides = (top: string, bottom: string) => ({
      'border-style': 'solid',
      'border-color': 'rgba(0, 0, 0, 0.5)',
      'border-top-width': top,
      'border-right-width': '0px',
      'border-bottom-width': bottom,
      'border-left-width': '0px'
    })
    expect(tidy(sides('0px', '1px'), undefined)).toEqual({
      'border-bottom': '1px solid rgba(0, 0, 0, 0.5)'
    })
    expect(tidy(sides('2px', '1px'), undefined)).toEqual(sides('2px', '1px'))
    expect(tidy(sides('0px', '1px'), undefined, { tagName: 'input' })).toEqual(sides('0px', '1px'))
  })
})
