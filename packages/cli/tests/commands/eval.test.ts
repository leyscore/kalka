import { describe, expect, setDefaultTimeout, test } from 'bun:test'
import { mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import * as v from 'valibot'

import { CLI_ENTRY, FIXTURES } from '#cli-tests/helpers/paths'

setDefaultTimeout(120_000)

async function cli(args: string[], stdin?: string) {
  const proc = Bun.spawn([process.execPath, CLI_ENTRY, ...args], {
    stdin: stdin === undefined ? 'ignore' : new TextEncoder().encode(stdin),
    stdout: 'pipe',
    stderr: 'pipe'
  })
  const [stdout, stderr] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text()
  ])
  return { stdout: stdout.trim(), stderr: stderr.trim(), exitCode: await proc.exited }
}

describe('eval CLI', () => {
  test('measures the text a script writes, its line breaks and wrapping included', async () => {
    const script = `
      await figma.loadFontAsync({ family: 'Inter', style: 'Regular' })
      const line = figma.createText()
      line.characters = 'one'
      const lines = figma.createText()
      lines.characters = 'one\\ntwo\\nthree'
      const paragraph = figma.createText()
      paragraph.characters = 'A paragraph that wraps over several lines'
      paragraph.resize(80, 20)
      paragraph.textAutoResize = 'HEIGHT'
      return { line: line.height, lines: lines.height, paragraph: paragraph.height }
    `
    const result = await cli(
      ['eval', join(FIXTURES, 'circle-text.fig'), '--stdin', '--json'],
      script
    )
    expect(result.exitCode).toBe(0)
    const heights = v.parse(
      v.pipe(
        v.string(),
        v.parseJson(),
        v.object({ line: v.number(), lines: v.number(), paragraph: v.number() })
      ),
      result.stdout
    )
    expect(heights.lines).toBeGreaterThan(heights.line * 2)
    expect(heights.paragraph).toBeGreaterThan(heights.line * 2)
  })

  test('saves a script’s edits laid out, though the script never read them back', async () => {
    const out = join(await mkdtemp(join(tmpdir(), 'kalka-eval-')), 'badge.fig')
    // A hugging badge whose label a property shortens: its saved width fits the new label.
    const script = `
      const badge = figma.createComponent()
      badge.name = 'Badge'
      badge.layoutMode = 'HORIZONTAL'
      badge.paddingLeft = badge.paddingRight = 10
      badge.primaryAxisSizingMode = 'AUTO'
      badge.counterAxisSizingMode = 'AUTO'
      const label = figma.createText()
      label.characters = 'Placeholder'
      badge.appendChild(label)
      const prop = badge.addComponentProperty('Label', 'TEXT', 'Placeholder')
      label.componentPropertyReferences = { characters: prop }
      const instance = badge.createInstance()
      instance.name = 'Short'
      instance.setProperties({ [prop]: '2' })
    `
    const written = await cli(
      ['eval', join(FIXTURES, 'gold-preview.fig'), '--stdin', '-o', out, '-q'],
      script
    )
    expect(written.exitCode).toBe(0)
    const read = await cli([
      'eval',
      out,
      '--json',
      '--code',
      `
        const short = figma.currentPage.findOne((n) => n.name === 'Short')
        const badge = figma.currentPage.findOne((n) => n.type === 'COMPONENT' && n.name === 'Badge')
        return [short.width < badge.width, short.children[0].width < badge.children[0].width]
      `
    ])
    const parsed = v.safeParse(v.pipe(v.string(), v.parseJson(), v.array(v.boolean())), read.stdout)
    expect(parsed.success && parsed.output).toEqual([true, true])
  })
})
