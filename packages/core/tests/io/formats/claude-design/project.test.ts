import { describe, expect, test } from 'bun:test'
import { zipSync } from 'fflate'

import {
  claudeDesignBoardDocument,
  claudeDesignFilesFromZip,
  createClaudeDesignGraph,
  expandDesignComponent,
  isClaudeDesignProject,
  readClaudeDesignProject,
  type ClaudeDesignFile
} from '#core/io/formats/claude-design'

const encoder = new TextEncoder()
const JPEG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3])

function component(body: string, script = '', head = ''): string {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Board</title>
<script src="./support.js"></script>${head}</head><body><x-dc>${body}</x-dc>${script}</body></html>`
}

function files(entries: Record<string, string | Uint8Array>): ClaudeDesignFile[] {
  return Object.entries(entries).map(([path, content]) => ({
    path,
    content: typeof content === 'string' ? encoder.encode(content) : content
  }))
}

const CANVAS = JSON.stringify({
  v: 3,
  title: 'Spring menu',
  pages: [
    { id: 'web', name: 'Web' },
    { id: 'print', name: 'Print' }
  ],
  boards: {
    'Main.dc.html': { x: 0, y: 0, w: 1440, h: 900, title: 'Home', expand: 'fill' },
    'Poster.dc.html': { x: 1520, y: 0, w: 600, h: 800, page: 'print', radius: 12 },
    'Broken.dc.html': { x: 'left', y: 0, w: 10, h: 10 },
    'Gone.dc.html': { x: 0, y: 0, w: 10, h: 10 }
  },
  order: ['Poster.dc.html', 'Main.dc.html'],
  notes: {
    flows: { x: 0, y: -300, text: 'Flows', kind: 'title1', maxW: 1840 },
    idea: { x: 2200, y: 0, text: 'Try a darker hero', w: 200, fill: 'blue' },
    arrow: { x: 0, y: 0, text: 'x', kind: 'arrow' }
  },
  designSystems: [{ title: 'Ember', namespace: 'ember' }]
})

function sampleProject() {
  return readClaudeDesignProject(
    files({
      'export/project/canvas.json': CANVAS,
      'export/project/support.js': '/* runtime */',
      'export/project/Main.dc.html': component('<main>{{title}}</main>'),
      'export/project/Poster.dc.html': component('<div>Poster</div>'),
      'export/project/Broken.dc.html': component('<div>Broken</div>'),
      'export/project/Card.dc.html': component(
        '<div>Card</div>',
        `<script type="text/x-dc" data-dc-script data-props='{"$preview":{"width":320,"height":200}}'></script>`
      ),
      'export/project/ds/ember/tokens.json': JSON.stringify({
        color: { brand: { $type: 'color', $value: '#ff5500' } }
      }),
      'export/project/ds/ember/tokens.css': ':root{--brand:#f50}',
      'export/_blob/abc123.jpg': JPEG
    })
  )
}

describe('readClaudeDesignProject', () => {
  test('reads the boards back to front where the canvas places them', () => {
    const project = sampleProject()
    expect(project.title).toBe('Spring menu')
    expect(project.hasRuntime).toBe(true)
    const [poster, main] = project.boards
    expect(poster).toMatchObject({
      component: 'Poster',
      title: 'Poster',
      x: 1520,
      width: 600,
      height: 800,
      pageId: 'print',
      radius: 12,
      fill: false
    })
    expect(main).toMatchObject({ component: 'Main', title: 'Home', fill: true, pageId: null })
  })

  test('shows components the index leaves out, and skips entries it cannot read', () => {
    const project = sampleProject()
    const names = project.boards.map((board) => board.component)
    expect(names).not.toContain('Gone')
    const broken = project.boards.find((board) => board.component === 'Broken')
    const card = project.boards.find((board) => board.component === 'Card')
    // Unlisted components sit in a row under the listed ones, at their preview size.
    expect(card).toMatchObject({ y: 900 + 120, width: 320, height: 200 })
    expect(broken?.y).toBe(900 + 120)
  })

  test('keeps pages, notes, uploads and design tokens', () => {
    const project = sampleProject()
    expect(project.pages.map((page) => page.name)).toEqual(['Web', 'Print'])
    expect(project.notes.map((note) => [note.id, note.title])).toEqual([
      ['flows', true],
      ['idea', false]
    ])
    expect(project.blobs.get('abc123')).toEqual(JPEG)
    expect(project.tokenFiles.map((file) => file.path)).toEqual(['ds/ember/tokens.json'])
    expect(project.texts.has('ds/ember/tokens.css')).toBe(true)
  })

  test('reads a folder of components with no index', () => {
    const project = readClaudeDesignProject(
      files({ 'Hello.dc.html': component('<p>Hi</p>'), 'notes.txt': 'x' })
    )
    expect(project.boards).toHaveLength(1)
    expect(project.boards[0]).toMatchObject({ component: 'Hello', width: 1440, height: 900 })
  })

  test('rejects files that hold no project', () => {
    expect(isClaudeDesignProject(['a/readme.md', 'b.png'])).toBe(false)
    expect(isClaudeDesignProject(['project/canvas.json'])).toBe(true)
    expect(() => readClaudeDesignProject(files({ 'readme.md': '#' }))).toThrow()
    expect(() =>
      readClaudeDesignProject(files({ 'project/canvas.json': '{"boards": 3' }))
    ).toThrow()
  })

  test('reads an exported archive', () => {
    const archive = zipSync({
      'project/canvas.json': encoder.encode(CANVAS),
      'project/Main.dc.html': encoder.encode(component('<main>Hi</main>')),
      '__MACOSX/project/._Main.dc.html': new Uint8Array([0]),
      'project/': new Uint8Array()
    })
    const read = claudeDesignFilesFromZip(archive)
    expect(read.map((file) => file.path).sort()).toEqual(['project/Main.dc.html', 'project/canvas.json'])
    expect(readClaudeDesignProject(read).boards.map((board) => board.component)).toEqual(['Main'])
  })
})

describe('claudeDesignBoardDocument', () => {
  test('inlines uploads and the project stylesheets a board links', async () => {
    const project = readClaudeDesignProject(
      files({
        'project/canvas.json': JSON.stringify({ boards: { 'Main.dc.html': { x: 0, y: 0, w: 800, h: 600 } } }),
        'project/Main.dc.html': component(
          '<img src="/_blob/abc123" alt=""><div style="background: url(\'../_blob/missing\')"></div>',
          '',
          '<link rel="stylesheet" href="ds/ember/tokens.css"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist">'
        ),
        'project/ds/ember/tokens.css': ':root{--brand:#f50}',
        '_blob/abc123': JPEG
      })
    )
    const board = project.boards[0]
    if (!board) throw new Error('No board')
    const expanded = await expandDesignComponent('Main', {
      component: (name) => project.components.get(name),
      values: async () => ({})
    })
    const document = claudeDesignBoardDocument(project, board, expanded)
    expect(document.html).toContain('src="data:image/jpeg;base64,')
    expect(document.html).toContain('<style>:root{--brand:#f50}</style>')
    expect(document.html).toContain('href="https://fonts.googleapis.com/css2?family=Geist"')
    expect(document.html).toContain('lang="fr"')
    expect(document.missingBlobs).toEqual(['missing'])
  })
})

describe('createClaudeDesignGraph', () => {
  test('makes pages, notes and variables', () => {
    const { graph, pageOf } = createClaudeDesignGraph(sampleProject())
    const pages = graph.getPages()
    expect(pages.map((page) => page.name)).toEqual(['Web', 'Print'])
    expect(pageOf('print')).toBe(pages[1]?.id ?? '')
    expect(pageOf(null)).toBe(pages[0]?.id ?? '')
    expect(pageOf('unknown')).toBe(pages[0]?.id ?? '')

    const layers = graph.getChildren(pages[0]?.id ?? '')
    const title = layers.find((node) => node.type === 'TEXT')
    expect(title).toMatchObject({ text: 'Flows', x: 0, y: -300, width: 1840 })
    const sticky = layers.find((node) => node.type === 'FRAME')
    expect(sticky).toMatchObject({ x: 2200, width: 200 })
    expect(graph.getChildren(sticky?.id ?? '')[0]?.text).toBe('Try a darker hero')

    const variables = [...graph.variables.values()]
    expect(variables.map((variable) => [variable.name, variable.type])).toEqual([
      ['color/brand', 'COLOR']
    ])
  })
})
