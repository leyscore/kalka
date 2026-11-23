import { describe, expect, test } from 'bun:test'

import { pageRoot, PROPERTIES, pseudoText, webFontLink } from '../src/content/capture'
import { foldTranslation, hideFaded, statesOrigin, unplaced } from '../src/content/declarations'
import { hexColor } from '../src/content/describe'
import { inlineImages } from '../src/content/images'

describe('hexColor', () => {
  test('writes an opaque computed color as hex', () => {
    expect(hexColor('rgb(27, 36, 64)')).toBe('#1B2440')
  })

  test('keeps a translucent color with its alpha as a percentage', () => {
    expect(hexColor('rgba(47, 91, 234, 0.5)')).toBe('#2F5BEA 50%')
  })

  test('leaves values it cannot read unchanged', () => {
    expect(hexColor('color(display-p3 1 0 0)')).toBe('color(display-p3 1 0 0)')
  })
})

describe('pseudoText', () => {
  test('reads the quoted text a pseudo-element draws', () => {
    expect(pseudoText('"from "')).toBe('from ')
  })

  test('treats a pseudo-element without content as absent', () => {
    expect(pseudoText('none')).toBeNull()
    expect(pseudoText('normal')).toBeNull()
  })

  test('keeps an empty string for decorative pseudo-elements', () => {
    expect(pseudoText('""')).toBe('')
  })
})

describe('webFontLink', () => {
  test('links a Google Fonts stylesheet, whose rules the page cannot read', () => {
    expect(
      webFontLink('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap')
    ).toBe(
      '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&amp;display=swap">'
    )
  })

  test('leaves out stylesheets from other sites and inline ones', () => {
    expect(webFontLink('https://cdn.example.com/site.css')).toBeNull()
    expect(webFontLink(null)).toBeNull()
  })
})

describe('foldTranslation', () => {
  test('moves a translated element by its offsets, where the page draws it', () => {
    expect(
      foldTranslation(
        'position: absolute; left: 720px; top: 860px; transform: matrix(1, 0, 0, 1, -17, 0); transform-origin: 17px 20px'
      )
    ).toBe('position: absolute; left: 703px; top: 860px')
  })

  test('moves the right and bottom offsets the other way', () => {
    expect(
      foldTranslation(
        'position: relative; left: 0px; top: 0px; right: 0px; bottom: 10px; transform: matrix(1, 0, 0, 1, 5, -5)'
      )
    ).toBe('position: relative; left: 5px; top: -5px; right: -5px; bottom: 15px')
  })

  test('keeps transforms that do more than move, and elements offsets do not move', () => {
    const rotated = 'position: absolute; left: 0px; top: 0px; transform: matrix(0, 1, -1, 0, 0, 0)'
    expect(foldTranslation(rotated)).toBe(rotated)
    const inFlow = 'position: static; transform: matrix(1, 0, 0, 1, 10, 0)'
    expect(foldTranslation(inFlow)).toBe(inFlow)
    const percent = 'position: absolute; left: 50%; top: 0px; transform: matrix(1, 0, 0, 1, -17, 0)'
    expect(foldTranslation(percent)).toBe(percent)
  })
})

describe('hideFaded', () => {
  test('pastes an element faded out to nothing as a hidden layer', () => {
    expect(hideFaded('display: block; opacity: 0')).toBe('display: block; visibility: hidden')
  })

  test('leaves a translucent element as it is', () => {
    expect(hideFaded('display: block; opacity: 0.5')).toBe('display: block; opacity: 0.5')
  })
})

describe('pageRoot', () => {
  test('the page’s own root is copied as a plain box, which pasted markup can hold', () => {
    expect(pageRoot('body')).toBe(true)
    expect(pageRoot('html')).toBe(true)
    expect(pageRoot('main')).toBe(false)
    expect(pageRoot('div')).toBe(false)
  })
})

describe('unplaced', () => {
  test('a root the page pinned or placed is not placed in its own copy', () => {
    for (const position of ['fixed', 'absolute', 'sticky']) {
      const freed = unplaced(position)
      expect(freed).toContain('position: relative')
      expect(freed).toContain('left: auto')
      expect(freed).toContain('top: auto')
    }
  })

  test('a root in the flow keeps its own position', () => {
    expect(unplaced('static')).toEqual([])
    expect(unplaced('relative')).toEqual([])
  })
})

describe('inlineImages', () => {
  test('carries each image once as a data URL, however many copies show it', async () => {
    const loaded: string[] = []
    const html = await inlineImages(
      '<img src="https://cdn.example.com/a.jpg?w=1&amp;h=2"><template><img alt="" src="https://cdn.example.com/a.jpg?w=1&amp;h=2"></template>',
      async (url) => {
        loaded.push(url)
        return 'data:image/jpeg;base64,AAAA'
      }
    )
    expect(loaded).toEqual(['https://cdn.example.com/a.jpg?w=1&h=2'])
    expect(html).toBe(
      '<img src="data:image/jpeg;base64,AAAA"><template><img alt="" src="data:image/jpeg;base64,AAAA"></template>'
    )
  })

  test('carries the images a style draws: a background, a mask', async () => {
    const html = await inlineImages(
      '<div style="background-image: url(&quot;https://cdn.example.com/grain.png?a=1&amp;b=2&quot;); mask-image: url(&quot;https://cdn.example.com/mask.svg&quot;)"></div><style>@font-face { src: url("https://cdn.example.com/a.woff2") }</style>',
      async (url) => `data:image/png;base64,${url.includes('grain.png?a=1&b=2') ? 'GRAIN' : 'MASK'}`
    )
    expect(html).toBe(
      '<div style="background-image: url(&quot;data:image/png;base64,GRAIN&quot;); mask-image: url(&quot;data:image/png;base64,MASK&quot;)"></div><style>@font-face { src: url("https://cdn.example.com/a.woff2") }</style>'
    )
  })

  test('leaves an image the page cannot fetch as a link', async () => {
    const html = '<img src="https://cdn.example.com/private.png">'
    expect(await inlineImages(html, async () => null)).toBe(html)
  })
})

describe('statesOrigin', () => {
  test('states the origin of a box that something scales, turns or moves', () => {
    expect(statesOrigin(['matrix(0.5, 0, 0, 0.5, 0, 0)', 'none', 'none', 'none'])).toBe(true)
    expect(statesOrigin(['none', 'none', 'none', '0.5'])).toBe(true)
  })

  test('leaves it out for a box at rest', () => {
    expect(statesOrigin(['none', 'none', 'none', 'none'])).toBe(false)
    expect(statesOrigin(['', '', '', ''])).toBe(false)
  })
})

describe('PROPERTIES', () => {
  test('copies the areas a grid names, which its children are placed by', () => {
    expect(PROPERTIES).toContain('grid-template-areas')
    expect(PROPERTIES).toContain('grid-auto-flow')
    expect(PROPERTIES).toContain('grid-column')
  })
})
