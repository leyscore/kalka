import { expect, setDefaultTimeout, test } from 'bun:test'
import { mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { unzipSync } from 'fflate'
import { toUint8Array } from 'js-base64'

import { BUILTIN_IO_FORMATS, IORegistry } from '@kalka/core/io'
import { computeImageHash } from '@kalka/scene-graph/images'

import { runKalkaCLI } from '#tests/helpers/cli'
import { createRect, firstPageId, makeSceneGraph } from '#tests/helpers/scene'

setDefaultTimeout(30_000)

const io = new IORegistry(BUILTIN_IO_FORMATS)

async function createFigFixture() {
  const dir = await mkdtemp(join(tmpdir(), 'kalka-export-cli-'))
  const figPath = join(dir, 'card.fig')
  const graph = makeSceneGraph('Export Page')
  const firstFrame = graph.createNode('FRAME', firstPageId(graph), {
    name: 'First slide',
    width: 1280,
    height: 720
  })
  const rect = createRect(graph, firstFrame.id, {
    name: 'Export Card',
    x: 0,
    y: 0,
    width: 160,
    height: 80
  })
  rect.layoutMode = 'HORIZONTAL'
  rect.itemSpacing = 8
  rect.paddingLeft = 16
  rect.paddingRight = 16
  rect.paddingTop = 16
  rect.paddingBottom = 16
  rect.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1, a: 1 }, opacity: 1, visible: true }]

  const secondPage = graph.addPage('Second Page')
  const secondFrame = graph.createNode('FRAME', secondPage.id, {
    name: 'Second slide',
    width: 1280,
    height: 720
  })
  createRect(graph, secondFrame.id, {
    name: 'Second Card',
    x: 0,
    y: 0,
    width: 120,
    height: 60
  })

  const result = await io.writeDocument('fig', graph)
  await Bun.write(figPath, result.data as Uint8Array)
  return { dir, figPath }
}

test('FIG export preserves the whole document by default', async () => {
  const { dir, figPath } = await createFigFixture()
  const output = join(dir, 'whole.fig')

  const { stdout, stderr, exitCode } = await runKalkaCLI([
    'export',
    figPath,
    '--format',
    'fig',
    '--output',
    output
  ])

  expect(stderr).toBe('')
  expect(exitCode).toBe(0)
  expect(stdout).toContain('Target: whole document')

  const { graph } = await io.readDocument({
    name: output,
    data: new Uint8Array(await Bun.file(output).arrayBuffer())
  })
  expect(graph.getPages()).toHaveLength(3)
  expect(graph.getPages().map((page) => page.name)).toContain('Second Page')
})

test('FIG export warns about the CSS Figma will not show', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'kalka-export-cli-'))
  const figPath = join(dir, 'nav.fig')
  const graph = makeSceneGraph('Export Page')
  graph.createNode('FRAME', firstPageId(graph), { name: 'Menu', htmlTag: 'nav' })
  await Bun.write(figPath, (await io.writeDocument('fig', graph)).data as Uint8Array)

  const { stderr, exitCode } = await runKalkaCLI([
    'export',
    figPath,
    '--format',
    'fig',
    '--output',
    join(dir, 'out.fig')
  ])

  expect(exitCode).toBe(0)
  expect(stderr).toContain('Figma will not show HTML element tags (1 use)')
})

test('PPTX export includes slides from every page by default', async () => {
  const { dir, figPath } = await createFigFixture()
  const output = join(dir, 'whole.pptx')

  const { stdout, stderr, exitCode } = await runKalkaCLI([
    'export',
    figPath,
    '--format',
    'pptx',
    '--output',
    output
  ])

  expect(stderr).toBe('')
  expect(exitCode).toBe(0)
  expect(stdout).toContain('Target: whole document')

  const files = unzipSync(new Uint8Array(await Bun.file(output).arrayBuffer()))
  expect(files['ppt/slides/slide1.xml']).toBeDefined()
  expect(files['ppt/slides/slide2.xml']).toBeDefined()
  expect(files['ppt/slides/slide3.xml']).toBeUndefined()
})

test('FIG export requires an explicit page for a partial archive', async () => {
  const { dir, figPath } = await createFigFixture()
  const output = join(dir, 'page.fig')

  const { stderr, exitCode } = await runKalkaCLI([
    'export',
    figPath,
    '--format',
    'fig',
    '--page',
    'Second Page',
    '--output',
    output
  ])

  expect(stderr).toBe('')
  expect(exitCode).toBe(0)

  const { graph } = await io.readDocument({
    name: output,
    data: new Uint8Array(await Bun.file(output).arrayBuffer())
  })
  expect(graph.getPages().map((page) => page.name)).toEqual(['Second Page'])
})

test('export CLI writes HTML with inline styles by default', async () => {
  const { dir, figPath } = await createFigFixture()
  const output = join(dir, 'card.html')

  const { stderr, exitCode } = await runKalkaCLI([
    'export',
    figPath,
    '--format',
    'html',
    '--output',
    output
  ])

  expect(stderr).toBe('')
  expect(exitCode).toBe(0)

  const html = await Bun.file(output).text()
  // Editor data stays out of exported files.
  expect(html).not.toContain('data-kalka-node-id')
  expect(html).toContain('style=')
  expect(html).toContain('display: flex')
})

test('export CLI can write HTML styles as Tailwind classes', async () => {
  const { dir, figPath } = await createFigFixture()
  const output = join(dir, 'card-tailwind.html')

  const { stderr, exitCode } = await runKalkaCLI([
    'export',
    figPath,
    '--format',
    'html',
    '--css',
    'tailwind',
    '--output',
    output
  ])

  expect(stderr).toBe('')
  expect(exitCode).toBe(0)

  const html = await Bun.file(output).text()
  // Editor data stays out of exported files.
  expect(html).not.toContain('data-kalka-node-id')
  expect(html).toContain('class="')
  expect(html).toContain('flex')
  expect(html).not.toContain('style=')
})

test('export CLI writes Tailwind JSX for a page', async () => {
  const { dir, figPath } = await createFigFixture()
  const output = join(dir, 'card.jsx')

  const { stderr, exitCode } = await runKalkaCLI([
    'export',
    figPath,
    '--format',
    'jsx',
    '--style',
    'tailwind',
    '--output',
    output
  ])

  expect(stderr).toBe('')
  expect(exitCode).toBe(0)
  const jsx = await Bun.file(output).text()
  expect(jsx).toStartWith('<div data-name="First slide" className="')
  expect(jsx).toContain(
    '<div data-name="Export Card" className="flex absolute top-0 left-0 p-4 items-start gap-2'
  )
  expect(jsx).not.toContain('Second Card')
})

test('export CLI can write standalone HTML', async () => {
  const { dir, figPath } = await createFigFixture()
  const output = join(dir, 'card-standalone.html')

  const { stderr, exitCode } = await runKalkaCLI([
    'export',
    figPath,
    '--format',
    'html',
    '--html',
    'standalone',
    '--output',
    output
  ])

  expect(stderr).toBe('')
  expect(exitCode).toBe(0)

  const html = await Bun.file(output).text()
  expect(html).toContain('<!doctype html>')
  expect(html).not.toContain('data-kalka-html')
  // A single exported layer flows; only what sits in a free layout is placed.
  expect(html).not.toContain('.kalka-canvas')
  expect(html).not.toContain('@tailwindcss/browser@4')
})

test('export CLI indents standalone HTML and can write its reset as a file', async () => {
  const { dir, figPath } = await createFigFixture()
  const output = join(dir, 'card-reset.html')

  const { stderr, exitCode } = await runKalkaCLI([
    'export',
    figPath,
    '--format',
    'html',
    '--html',
    'standalone',
    '--reset',
    'file',
    '--output',
    output
  ])

  expect(stderr).toBe('')
  expect(exitCode).toBe(0)
  const html = await Bun.file(output).text()
  const reset = await Bun.file(join(dir, 'card-reset.assets', 'reset.css')).text()
  expect(html).toStartWith('<!doctype html>\n<html>\n  <head>')
  expect(html).toContain('<link rel="stylesheet" href="card-reset.assets/reset.css">')
  expect(html).not.toContain('box-sizing')
  expect(reset).toContain('  box-sizing: border-box;')
})

test('export CLI precompiles Tailwind CSS for standalone Tailwind HTML', async () => {
  const { dir, figPath } = await createFigFixture()
  const output = join(dir, 'card-standalone-tailwind.html')

  const { stderr, exitCode } = await runKalkaCLI([
    'export',
    figPath,
    '--format',
    'html',
    '--html',
    'standalone',
    '--css',
    'tailwind',
    '--assets',
    'inline',
    '--output',
    output
  ])

  expect(stderr).toBe('')
  expect(exitCode).toBe(0)

  const html = await Bun.file(output).text()
  expect(html).toContain('<!doctype html>')
  expect(html).toContain('<style>')
  expect(html).toContain('class="')
  expect(html).toContain('.flex')
  expect(html).not.toContain('@tailwindcss/browser@4')
})

test('export CLI can write external standalone HTML assets', async () => {
  const { dir, figPath } = await createFigFixture()
  const output = join(dir, 'card-external.html')

  const { stderr, exitCode } = await runKalkaCLI([
    'export',
    figPath,
    '--format',
    'html',
    '--html',
    'standalone',
    '--css',
    'tailwind',
    '--assets',
    'external',
    '--output',
    output
  ])

  expect(stderr).toBe('')
  expect(exitCode).toBe(0)

  const html = await Bun.file(output).text()
  const cssPath = join(dir, 'card-external.assets', 'kalka.css')
  const css = await Bun.file(cssPath).text()
  expect(html).toContain('<link rel="stylesheet" href="card-external.assets/kalka.css">')
  expect(html).not.toContain('<style>')
  expect(css).toContain('.flex')
  expect(css).not.toContain('.op-')
})

/** A 1 × 1 PNG. */
const PIXEL = toUint8Array(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
)

async function createPhotoFixture() {
  const dir = await mkdtemp(join(tmpdir(), 'kalka-export-cli-'))
  const figPath = join(dir, 'photo.fig')
  const graph = makeSceneGraph('Export Page')
  const hash = computeImageHash(PIXEL)
  graph.images.set(hash, PIXEL)
  const photo = createRect(graph, firstPageId(graph), { name: 'Photo', width: 40, height: 40 })
  photo.fills = [
    {
      type: 'IMAGE',
      imageHash: hash,
      imageScaleMode: 'FILL',
      color: { r: 0, g: 0, b: 0, a: 1 },
      opacity: 1,
      visible: true
    }
  ]
  const result = await io.writeDocument('fig', graph)
  await Bun.write(figPath, result.data as Uint8Array)
  return { dir, figPath, hash }
}

test('export CLI links HTML images as files by default', async () => {
  const { dir, figPath, hash } = await createPhotoFixture()
  const output = join(dir, 'photo.html')

  const { stderr, exitCode } = await runKalkaCLI(['export', figPath, '-f', 'html', '-o', output])

  expect(stderr).toBe('')
  expect(exitCode).toBe(0)
  const html = await Bun.file(output).text()
  expect(html).not.toContain('data:image/png;base64')
  expect(html).toContain(`src="photo.assets/images/${hash}.png"`)
  const image = await Bun.file(join(dir, 'photo.assets', 'images', `${hash}.png`)).bytes()
  expect([...image]).toEqual([...PIXEL])
})

test('export CLI embeds HTML images with --assets inline', async () => {
  const { dir, figPath } = await createPhotoFixture()
  const output = join(dir, 'photo-inline.html')

  const { stderr, exitCode } = await runKalkaCLI([
    'export',
    figPath,
    '-f',
    'html',
    '--assets',
    'inline',
    '-o',
    output
  ])

  expect(stderr).toBe('')
  expect(exitCode).toBe(0)
  expect(await Bun.file(output).text()).toContain('src="data:image/png;base64,')
  expect(await Bun.file(join(dir, 'photo-inline.assets', 'images')).exists()).toBe(false)
})
