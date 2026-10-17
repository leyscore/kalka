import { describe, expect, test } from 'bun:test'

import {
  colorsIn,
  cssValueMatches,
  declaredValue,
  textMatches
} from '#core/tools/read/find/values'

const tolerance = { color: 1, number: 0.01 }

describe('cssValueMatches', () => {
  test('a color matches in every notation', () => {
    for (const declared of [
      '#2F5BEA',
      '#2f5bea',
      'rgb(47, 91, 234)',
      'rgb(47 91 234)',
      'hsl(226.1 81.6% 55.1%)',
      'oklch(0.5334 0.221 265.79)'
    ]) {
      expect(cssValueMatches(declared, '#2F5BEA', tolerance)).toBe(true)
    }
    expect(cssValueMatches('#2F5BEB', '#2F5BEA', tolerance)).toBe(true)
    expect(cssValueMatches('#2F5BF0', '#2F5BEA', tolerance)).toBe(false)
    expect(cssValueMatches('#2F5BF0', '#2F5BEA', { color: 8, number: 0 })).toBe(true)
  })

  test('alpha counts', () => {
    expect(cssValueMatches('rgba(47, 91, 234, 0.5)', '#2F5BEA80', tolerance)).toBe(true)
    expect(cssValueMatches('rgba(47, 91, 234, 0.5)', '#2F5BEA', tolerance)).toBe(false)
    expect(cssValueMatches('#2F5BEA', 'rgb(47 91 234 / 100%)', tolerance)).toBe(true)
  })

  test('a color matches inside compound values', () => {
    expect(cssValueMatches('1px solid #2f5bea', '#2F5BEA', tolerance)).toBe(true)
    expect(
      cssValueMatches('0px 4px 8px 0px rgba(0, 0, 0, 0.25), 0 0 1px #2F5BEA', '#2F5BEA', tolerance)
    ).toBe(true)
    expect(
      cssValueMatches('linear-gradient(90deg, #FFFFFF 0%, #2F5BEA 100%)', '#2f5bea', tolerance)
    ).toBe(true)
    expect(colorsIn('1px solid #000000')).toHaveLength(1)
  })

  test('lengths compare in pixels', () => {
    expect(cssValueMatches('16px', '16', tolerance)).toBe(true)
    expect(cssValueMatches('1rem', '16px', tolerance)).toBe(true)
    expect(cssValueMatches('16px 16px', '16px', tolerance)).toBe(true)
    expect(cssValueMatches('16px 8px', '16px', tolerance)).toBe(false)
    expect(cssValueMatches('16px 8px', '16px 8px', tolerance)).toBe(true)
    expect(cssValueMatches('16.004px', '16px', tolerance)).toBe(true)
    expect(cssValueMatches('100%', '100px', tolerance)).toBe(false)
  })

  test('other values compare as text, and wildcards match the whole value', () => {
    expect(cssValueMatches('Center', 'center', tolerance)).toBe(true)
    expect(cssValueMatches('"Inter", sans-serif', 'inter', tolerance)).toBe(true)
    expect(cssValueMatches('blur(4px)', 'blur(*)', tolerance)).toBe(true)
    expect(cssValueMatches('blur(4px)', 'blur', tolerance)).toBe(false)
  })
})

describe('textMatches', () => {
  test('substring without wildcards, whole-text glob with them', () => {
    expect(textMatches('Button Primary', 'button')).toBe(true)
    expect(textMatches('Button Primary', 'Button*')).toBe(true)
    expect(textMatches('Button Primary', '*primary')).toBe(true)
    expect(textMatches('Button Primary', 'Primary*')).toBe(false)
    expect(textMatches('Icon/24', 'Icon/2?')).toBe(true)
    expect(textMatches('a.b', 'a?b')).toBe(true)
    expect(textMatches('axb', 'a.b')).toBe(false)
  })
})

describe('declaredValue', () => {
  test('reads longhands from the shorthands a layer declares', () => {
    expect(declaredValue({ padding: '4px 8px 12px 16px' }, 'padding-left')).toBe('16px')
    expect(declaredValue({ padding: '4px 8px' }, 'padding-bottom')).toBe('4px')
    expect(declaredValue({ 'padding-inline': '8px' }, 'padding-right')).toBe('8px')
    expect(declaredValue({ gap: '8px 16px' }, 'column-gap')).toBe('16px')
    expect(declaredValue({ 'border-radius': '8px' }, 'border-top-left-radius')).toBe('8px')
    expect(declaredValue({ 'padding-left': '2px', padding: '4px' }, 'padding-left')).toBe('2px')
    expect(declaredValue({}, 'padding-left')).toBeUndefined()
  })
})
