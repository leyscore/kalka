import { describe, expect, test } from 'bun:test'

import { pageRoot, PROPERTIES, pseudoText, webFontLink } from '../src/content/capture'
import { dataURLs } from '../src/content/data-url'
import {
  foldTranslation,
  hideFaded,
  statesOrigin,
  unplaced,
  unscrolled
} from '../src/content/declarations'
import { hexColor } from '../src/content/describe'
import { drawnFirst } from '../src/content/drawn-font'
import { fontURLs } from '../src/content/fonts'
import { sheetFaces } from '../src/content/hidden-sheets'
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

describe('unscrolled', () => {
  test('the page’s root loses the height and scrolling that keep it one window tall', () => {
    expect(
      unscrolled('display: block; height: 900px; overflow: auto scroll; min-height: 900px')
    ).toBe('display: block; min-height: 900px')
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

  test('takes from the extension the images their site refuses to the page', async () => {
    const asked: string[][] = []
    const html = await inlineImages(
      '<img src="https://cdn.example.com/open.png"><img src="https://cdn.example.com/closed.png?a=1&amp;b=2">',
      async (url) => (url.endsWith('open.png') ? 'data:image/png;base64,OPEN' : null),
      async (urls) => {
        asked.push(urls)
        return { 'https://cdn.example.com/closed.png?a=1&b=2': 'data:image/png;base64,CLOSED' }
      }
    )
    expect(asked).toEqual([['https://cdn.example.com/closed.png?a=1&b=2']])
    expect(html).toBe(
      '<img src="data:image/png;base64,OPEN"><img src="data:image/png;base64,CLOSED">'
    )
  })
})

describe('dataURLs', () => {
  test('asks the extension only for the files the page could not fetch', async () => {
    const asked: string[][] = []
    const files = await dataURLs(
      ['https://a.example/one.woff2', 'https://b.example/two.woff2'],
      1000,
      async (urls, kind) => {
        asked.push([kind, ...urls])
        return { 'https://b.example/two.woff2': 'data:font/woff2;base64,TWO' }
      },
      async (url) => (url.includes('one') ? 'data:font/woff2;base64,ONE' : null)
    )
    expect(asked).toEqual([['data', 'https://b.example/two.woff2']])
    expect([...files]).toEqual([
      ['https://a.example/one.woff2', 'data:font/woff2;base64,ONE'],
      ['https://b.example/two.woff2', 'data:font/woff2;base64,TWO']
    ])
  })

  test('leaves out a file larger than allowed, and all refused ones when the reading fails', async () => {
    const none = async () => null
    const large = await dataURLs(
      ['https://a.example/big.png'],
      10,
      async () => ({ 'https://a.example/big.png': `data:image/png;base64,${'A'.repeat(40)}` }),
      none
    )
    expect(large.size).toBe(0)
    const failed = await dataURLs(
      ['https://a.example/big.png'],
      10,
      async () => {
        throw new Error('no debugger')
      },
      none
    )
    expect(failed.size).toBe(0)
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

describe('fontURLs', () => {
  test('a font file is known by its rule, not by its name', () => {
    const html =
      '<style>@font-face { font-family: acumin-pro; src: url("https://use.typekit.net/af/aee3f7/31/l?subset_id=2&fvd=n5&v=3") format("woff2"), url(https://cdn.example.com/a.woff) format("woff"); }' +
      '.k-root { background-image: url("https://cdn.example.com/hero.jpg") }</style>' +
      '<div style="background-image: url(https://cdn.example.com/card.woff2)"></div>'
    expect([...fontURLs(html)]).toEqual([
      'https://use.typekit.net/af/aee3f7/31/l?subset_id=2&fvd=n5&v=3',
      'https://cdn.example.com/a.woff'
    ])
  })
})

describe('sheetFaces', () => {
  test('font rules read from a stylesheet point at its own site', () => {
    const css =
      'body{margin:0}@font-face{font-family:"Clarkson";font-weight:400;src:url(../fonts/clarkson.woff2) format("woff2")}' +
      "@media print{@font-face{font-family:Mono;src:url('/m.woff')}}"
    expect(sheetFaces(css, 'https://assets.example.com/www/styles/fonts.css')).toEqual([
      {
        family: 'Clarkson',
        rule: '@font-face{font-family:"Clarkson";font-weight:400;src:url("https://assets.example.com/www/fonts/clarkson.woff2") format("woff2")}'
      },
      {
        family: 'Mono',
        rule: '@font-face{font-family:Mono;src:url("https://assets.example.com/m.woff")}'
      }
    ])
  })
})

describe('drawnFirst', () => {
  const loaded = (family: string) =>
    family.toLowerCase() === 'wix-madefor-display-v2' ? 'wix-madefor-display-v2' : undefined
  const installed = (family: string) => family === 'Arial'
  const none = () => undefined

  test('starts with the web font the page loaded when the first family never did', () => {
    expect(drawnFirst('madefor-display, "wix-madefor-display-v2", Arial', loaded, installed)).toBe(
      '"wix-madefor-display-v2", madefor-display, Arial'
    )
  })

  test('spells a loaded family as its font face does', () => {
    expect(drawnFirst('Wix-Madefor-Display-V2, Arial', loaded, installed)).toBe(
      '"wix-madefor-display-v2", Arial'
    )
  })

  test('starts with a font of the computer when no family before it draws', () => {
    expect(drawnFirst('"Brand Sans", Arial, sans-serif', none, installed)).toBe(
      'Arial, "Brand Sans", sans-serif'
    )
  })

  test('keeps a stack whose first family draws, or that names nothing the page can draw', () => {
    expect(drawnFirst('Arial, "wix-madefor-display-v2"', loaded, installed)).toBe(
      'Arial, "wix-madefor-display-v2"'
    )
    expect(drawnFirst('"Brand Sans", sans-serif, Arial', none, installed)).toBe(
      '"Brand Sans", sans-serif, Arial'
    )
  })
})
