import { describe, expect, test } from 'bun:test'

import {
  exportHTMLBundle,
  replaceDataImages,
  replaceHTMLDataImages,
  sceneNodeToDesignDocument
} from '@kalka/dom-css/export'
import { SceneGraph, type Fill } from '@kalka/scene-graph'
import { computeImageHash } from '@kalka/scene-graph/images'

/** A GIF header of 20 × 10 pixels, which is all the projection reads. */
const GIF = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 20, 0, 10, 0, 0, 0])
/** The start of a JPEG, which the projection still embeds as `image/png`. */
const JPEG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 16, 0x4a, 0x46, 0x49, 0x46])

function imageFill(imageHash: string, fields: Partial<Fill> = {}): Fill {
  return {
    type: 'IMAGE',
    imageHash,
    imageScaleMode: 'FILL',
    color: { r: 0, g: 0, b: 0, a: 1 },
    opacity: 1,
    visible: true,
    ...fields
  }
}

/** A frame holding a picture per fill, with the images stored under their names. */
function pictures(images: Record<string, Uint8Array>, fills: Fill[]) {
  const graph = new SceneGraph()
  for (const [hash, bytes] of Object.entries(images)) graph.images.set(hash, bytes)
  const frame = graph.createNode('FRAME', graph.getPages()[0].id, {
    name: 'Gallery',
    width: 400,
    height: 200
  })
  for (const [index, fill] of fills.entries()) {
    graph.createNode('RECTANGLE', frame.id, {
      name: `Picture ${index + 1}`,
      x: index * 100,
      width: 80,
      height: 40,
      fills: [fill]
    })
  }
  const document = {
    ...sceneNodeToDesignDocument(graph, frame.id, { includeSourceIds: false }),
    sourceGraph: graph
  }
  return document
}

function text(content: string | Uint8Array | undefined): string {
  return typeof content === 'string' ? content : ''
}

describe('HTML bundle images', () => {
  test('stay embedded by default', async () => {
    const { files } = await exportHTMLBundle(pictures({ gif: GIF }, [imageFill('gif')]))
    expect(files).toHaveLength(1)
    expect(text(files[0].content)).toContain('src="data:image/png;base64,')
  })

  test('external assets link each image once, named by its content', async () => {
    const document = pictures({ gif: GIF, jpeg: JPEG }, [
      imageFill('gif'),
      imageFill('gif'),
      imageFill('jpeg')
    ])
    const { files } = await exportHTMLBundle(document, {
      assets: 'external',
      assetBasePath: 'card.assets'
    })
    const html = text(files[0].content)
    const gif = `card.assets/images/${computeImageHash(GIF)}.gif`
    const jpeg = `card.assets/images/${computeImageHash(JPEG)}.jpg`

    expect(html).not.toContain('data:image/')
    expect(html.match(new RegExp(`src="${gif}"`, 'g'))).toHaveLength(2)
    expect(html).toContain(`src="${jpeg}"`)
    expect(files.slice(1)).toEqual([
      { path: gif, content: GIF },
      { path: jpeg, content: JPEG }
    ])
  })

  test('a standalone page links background images from its stylesheet folder', async () => {
    const document = pictures({ gif: GIF }, [imageFill('gif', { imageScaleMode: 'TILE' })])
    const { files } = await exportHTMLBundle(document, {
      html: 'standalone',
      assets: 'external',
      assetBasePath: 'My page.assets'
    })
    const page = text(files.find((file) => file.path === 'index.html')?.content)
    const css = text(files.find((file) => file.path === 'My page.assets/kalka.css')?.content)
    const name = `${computeImageHash(GIF)}.gif`

    expect(page).toContain('<link rel="stylesheet" href="My%20page.assets/kalka.css">')
    expect(`${page}${css}`).not.toContain('data:image/')
    expect(css).toContain(`url("images/${name}")`)
    expect(files.map((file) => file.path)).toContain(`My page.assets/images/${name}`)
  })

  test('a fragment escapes a folder name it links images in', async () => {
    const { files } = await exportHTMLBundle(pictures({ gif: GIF }, [imageFill('gif')]), {
      assets: 'external',
      assetBasePath: 'Card #1.assets'
    })
    expect(text(files[0].content)).toContain(
      `src="Card%20%231.assets/images/${computeImageHash(GIF)}.gif"`
    )
  })
})

describe('embedded image replacement', () => {
  const png = 'data:image/png;base64,iVBORw0KGgo='

  test('replaces images in attributes and style rules but not in text', () => {
    const html = `<style>.a{background:url("${png}")}</style><p style="background-image: url(&quot;${png}&quot;)">${png}</p><img src="${png}">`
    const replaced = replaceHTMLDataImages(html, () => 'image.png')
    expect(replaced).toBe(
      `<style>.a{background:url("image.png")}</style><p style="background-image: url(&quot;image.png&quot;)">${png}</p><img src="image.png">`
    )
  })

  test('keeps SVG written as text, and images the replacer declines', () => {
    const svg =
      'url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%2F%3E")'
    expect(replaceDataImages(svg, () => 'image.svg')).toBe(svg)
    expect(replaceDataImages(`url("${png}")`, () => undefined)).toBe(`url("${png}")`)
  })
})
