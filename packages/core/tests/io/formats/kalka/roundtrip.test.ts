import { describe, expect, test } from 'bun:test'

import {
  breakpointsOf,
  createBreakpoint,
  responsiveOverrides,
  SceneGraph,
  type SceneNode
} from '@kalka/scene-graph'

import {
  readKalkaArchive,
  readKalkaFolder,
  unzipKalkaFiles,
  writeKalkaArchive,
  writeKalkaFolder,
  type KalkaFile
} from '#core/io/formats/kalka'

import { graphDifferences } from './compare'
import { sampleDocument } from './sample'

function asMap(files: readonly KalkaFile[]): Map<string, Uint8Array> {
  return new Map(files.map((file) => [file.path, file.content]))
}

function text(files: readonly KalkaFile[], path: string): string {
  const file = files.find((entry) => entry.path === path)
  if (!file) throw new Error(`No ${path}`)
  return new TextDecoder().decode(file.content)
}

function nodeNamed(graph: SceneGraph, name: string): SceneNode {
  const node = [...graph.getAllNodes()].find((candidate) => candidate.name === name)
  if (!node) throw new Error(`No ${name}`)
  return node
}

describe('Kalka folder', () => {
  test('reads back the document it wrote', async () => {
    const graph = sampleDocument()
    const read = readKalkaFolder(asMap(await writeKalkaFolder(graph)))
    expect(graphDifferences(graph, read)).toEqual([])
    expect(read.getPages(true).map((page) => page.name)).toEqual([
      'Home',
      'Pricing & plans',
      'Internal Only Canvas'
    ])
    expect(nodeNamed(read, 'Shader').shader).toEqual(nodeNamed(graph, 'Shader').shader)
    expect(nodeNamed(read, 'Nav').htmlClasses).toEqual(['site-nav', 'md:px-4'])
    expect(nodeNamed(read, 'Headline').htmlTag).toBe('h1')
    expect(read.getNode(read.rootId)?.cssClasses).toEqual(graph.getNode(graph.rootId)?.cssClasses)
  })

  test('keeps the CSS a layer’s fields cannot hold', async () => {
    const graph = sampleDocument()
    const nav = nodeNamed(graph, 'Nav')
    graph.updateNode(nav.id, { style: { width: '50%', transition: 'opacity 200ms' } })
    const files = await writeKalkaFolder(graph)
    const read = readKalkaFolder(asMap(files))
    expect(nodeNamed(read, 'Nav').style).toEqual({ width: '50%', transition: 'opacity 200ms' })
    expect(graphDifferences(graph, read)).toEqual([])
  })

  test('lays the folder out as the format says', async () => {
    const files = await writeKalkaFolder(sampleDocument())
    const paths = files.map((file) => file.path)
    expect(paths).toEqual([...paths].sort())
    expect(paths).toContain('project.json')
    expect(paths).toContain('styles.css')
    expect(paths).toContain('design-system/tokens.json')
    expect(paths).toContain('design-system/tokens.css')
    expect(paths).toContain('pages/home.html')
    expect(paths).toContain('pages/pricing-plans.html')
    expect(paths.some((path) => /^assets\/images\/[0-9a-f]+\.png$/.test(path))).toBe(true)

    const home = text(files, 'pages/home.html')
    // Images are files next to the page, never data URLs.
    expect(home).not.toContain('data:image')
    expect(home).toContain('src="../assets/images/')
    expect(home).toContain('data-kalka-name="Card"')
    expect(home).toContain('hidden')
    expect(home).toContain('data-kalka-locked')
    expect(home).toContain('data-kalka-shader')
    // A layer's tag and classes are the page's own HTML, not saved props.
    expect(home).toMatch(/<nav [^>]*class="site-nav md:px-4"/)
    expect(home).toMatch(/<h1 [^>]*data-kalka-name="Headline"/)
    // Bound values read as the tokens they are.
    expect(home).toContain('var(--')

    const tokens: unknown = JSON.parse(text(files, 'design-system/tokens.json'))
    expect(tokens).toMatchObject({ 'Colors/Light': { brand: { primary: { $type: 'color' } } } })
    expect(text(files, 'design-system/tokens.css')).toContain('--')
  })

  test('writes the same bytes for the same document', async () => {
    const graph = sampleDocument()
    const first = await writeKalkaFolder(graph)
    const second = await writeKalkaFolder(graph)
    expect(second).toEqual(first)
    // And a document read back saves as it was read.
    expect(await writeKalkaFolder(readKalkaFolder(asMap(first)))).toEqual(first)
  })

  test('zips the folder as a .kalka file', async () => {
    const graph = sampleDocument()
    const archive = await writeKalkaArchive(graph)
    expect(await writeKalkaArchive(graph)).toEqual(archive)
    expect([...unzipKalkaFiles(archive).keys()].sort()).toEqual(
      (await writeKalkaFolder(graph)).map((file) => file.path)
    )
    expect(graphDifferences(graph, readKalkaArchive(archive))).toEqual([])
  })

  test('opens pages and CSS edited by hand', async () => {
    const files = asMap(await writeKalkaFolder(sampleDocument()))
    const home = new TextDecoder().decode(files.get('pages/home.html'))
    const edited = home
      .replace('padding-block: 24px', 'padding-block: 32px')
      .replace(
        '</body>',
        '  <div style="width: 200px; height: 100px; background-color: #ff0000"><p>Added by hand</p></div>\n</body>'
      )
    files.set('pages/home.html', new TextEncoder().encode(edited))
    files.set(
      'pages/about.html',
      new TextEncoder().encode('<!doctype html><body><h1>About us</h1></body>')
    )
    const graph = readKalkaFolder(files)
    expect(nodeNamed(graph, 'Card').paddingTop).toBe(32)
    const added = graph.getChildren(graph.getPages()[0].id).at(-1)
    expect(added?.width).toBe(200)
    expect(added?.fills[0]?.color).toEqual({ r: 1, g: 0, b: 0, a: 1 })
    expect(graph.getChildren(added?.id ?? '').map((node) => node.text)).toEqual(['Added by hand'])
    const about = graph.getPages().find((page) => page.name === 'about')
    expect(graph.getChildren(about?.id ?? '').map((node) => node.text)).toEqual(['About us'])
  })

  test('refuses a folder from a newer version', async () => {
    const files = asMap(await writeKalkaFolder(new SceneGraph()))
    const project = new TextDecoder().decode(files.get('project.json'))
    files.set('project.json', new TextEncoder().encode(project.replace('"version": 1', '"version": 2')))
    expect(() => readKalkaFolder(files)).toThrow('newer version')
  })

  test('keeps class rules in styles.css and only a layer’s own values inline', async () => {
    const files = await writeKalkaFolder(sampleDocument())
    const styles = text(files, 'styles.css')
    expect(styles).toContain(`.site-nav {
  background-color: #1A33CC;
  border-radius: 999px;
}`)
    expect(styles).toContain('.title {')
    const nav = /<nav [^>]*>/.exec(text(files, 'pages/home.html'))?.[0] ?? ''
    expect(nav).toContain('border-radius: 12px')
    expect(nav).not.toContain('background-color')
  })

  test('opens a class edited by hand in styles.css on every layer that has it', async () => {
    const files = asMap(await writeKalkaFolder(sampleDocument()))
    const styles = new TextDecoder().decode(files.get('styles.css'))
    files.set(
      'styles.css',
      new TextEncoder().encode(styles.replace('background-color: #1A33CC;', 'background-color: #FF0000;'))
    )
    const read = readKalkaFolder(files)
    const red = { r: 1, g: 0, b: 0, a: 1 }
    expect(nodeNamed(read, 'Nav').fills[0]).toMatchObject({ type: 'SOLID', color: red })
    const navClass = read.getNode(read.rootId)?.cssClasses.find((item) => item.name === 'site-nav')
    expect(navClass?.style.fills?.[0]).toMatchObject({ color: red })
    // The nav's own corner radius stays its own.
    expect(nodeNamed(read, 'Nav').cornerRadius).toBe(12)
  })

  test('keeps breakpoint artboards linked to their primary', async () => {
    const graph = new SceneGraph()
    const page = graph.getPages()[0]
    const desktop = graph.createNode('FRAME', page.id, { name: 'Desktop', width: 1440, height: 900 })
    graph.createNode('TEXT', desktop.id, { name: 'Title', text: 'Hi', fontSize: 76 })
    const phone = createBreakpoint(graph, desktop.id, 390, 'Phone')
    const phoneTitle = phone && graph.getChildren(phone.id)[0]
    if (!phoneTitle) throw new Error('No copy')
    graph.updateNode(phoneTitle.id, { fontSize: 40 })

    const read = readKalkaFolder(asMap(await writeKalkaFolder(graph)))
    expect(breakpointsOf(read, desktop.id).map((breakpoint) => breakpoint.width)).toEqual([390])
    const readTitle = read.getNode(phoneTitle.id)
    expect(readTitle?.responsiveSource).toBe(graph.getChildren(desktop.id)[0]?.id)
    expect(readTitle && responsiveOverrides(read, readTitle)).toEqual(['fontSize'])
  })

  test('names page files after pages in any script', async () => {
    const graph = new SceneGraph()
    for (const page of graph.getPages()) graph.deleteNode(page.id)
    for (const name of ['Français', '日本語', 'Русский', '!!!']) graph.addPage(name)
    const files = await writeKalkaFolder(graph)
    const pages = files.map((file) => file.path).filter((path) => path.startsWith('pages/'))
    expect(pages.sort()).toEqual(
      ['pages/francais.html', 'pages/page.html', 'pages/русский.html', 'pages/日本語.html'].sort()
    )
  })
})
