/**
 * The library arm: Kalka's current agent with Kalka Fresh available, against the current agent
 * alone (the cached `baseline-reviewed` pages). Same anti-slop catalogue, same frame, same review
 * step and the same blind judge; the only differences are the design guide's Kalka Fresh section
 * and a search tool the agent may call before it writes.
 *
 *   bun src/library-run.ts build|review|duel|report [--briefs a,b] [--parallel 3]
 */
import { spawn } from 'node:child_process'
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import * as v from 'valibot'

import { RUNS_DIR, ask, fenced, ledgerTotal, pool } from './llm'
import { JUDGE_SYSTEM, baselinePrompt, baselineReviewPrompt, judgePrompt, type Brief } from './prompts'
import { closeBrowser } from './render'
import { loadBriefs, readMetrics, writeRaw } from './run'

const KALKA = '/Users/beleyd/Developer/Kalka/public/kalka/.claude/worktrees/fresh-component-library'
const PROMPTS = join(KALKA, 'packages/core/src/tools/prompts')
const DESIGN_GUIDE = readFileSync(join(PROMPTS, 'design-guide.md'), 'utf8').trim()
const ANTI_SLOP = readFileSync(join(PROMPTS, 'anti-slop.md'), 'utf8').trim()
const LEDGER = join(RUNS_DIR, 'ledger.jsonl')

export const LIBRARY_SYSTEM = `You are Kalka's design agent. Kalka is a design editor whose canvas is real HTML and CSS.

${DESIGN_GUIDE}

# Anti-slop catalogue

${ANTI_SLOP}

# This session

Nobody is available to answer ask_user: decide, and keep your assumptions to yourself. Follow the process above in your head (understand, references, direction, system, skeleton, sections, check), then make the single write_html call that draws the whole first draft. Before it you may call search_library_components; insert_library_component is not available here, so to use a Kalka Fresh component write its html into your page yourself, keep data-fresh="<asset_key>" on its root element, and adapt it. Its colours read the custom properties --color-ground, --color-ink, --color-accent, --color-muted and --color-line, so define those in :root from your palette if you use one; a live data-shader layer takes them too. Reply with exactly the HTML you pass to write_html, in one \`\`\`html block and nothing else: a complete document with one <style> block holding the variables and the classes, then the semantic HTML. Web fonts may be loaded with a Google Fonts <link>. No JavaScript.`

const Reply = v.object({ result: v.string(), is_error: v.boolean(), total_cost_usd: v.number(), num_turns: v.optional(v.number()) })

function home(brief: Brief) {
  return join(RUNS_DIR, brief.id)
}

/** One generation through the CLI with the Fresh search server as its only tool. */
function generate(brief: Brief): Promise<string> {
  const dir = join(home(brief), 'library')
  mkdirSync(dir, { recursive: true })
  const raw = join(dir, 'raw.txt')
  if (existsSync(raw)) return Promise.resolve(readFileSync(raw, 'utf8'))
  const log = join(dir, 'calls.jsonl')
  const config = JSON.stringify({
    mcpServers: { fresh: { command: 'bun', args: [join(import.meta.dir, 'fresh-mcp.ts')], env: { FRESH_LOG: log } } }
  })
  const args = ['-p', '--model', 'sonnet', '--system-prompt', LIBRARY_SYSTEM, '--strict-mcp-config', '--mcp-config', config, '--setting-sources', '', '--no-session-persistence', '--output-format', 'json', '--tools', '', '--allowedTools', 'mcp__fresh__search_library_components', '--max-turns', '8']
  return new Promise((resolve, reject) => {
    const env = { ...process.env }
    for (const key of ['CLAUDECODE', 'CLAUDE_CODE_ENTRYPOINT', 'CLAUDE_CODE_CHILD_SESSION']) delete env[key]
    const started = Date.now()
    const child = spawn('claude', args, { cwd: dir, env })
    let out = ''
    let err = ''
    child.stdout.on('data', (chunk: Buffer) => (out += chunk.toString()))
    child.stderr.on('data', (chunk: Buffer) => (err += chunk.toString()))
    child.on('error', reject)
    child.on('close', (code) => {
      const parsed = v.safeParse(v.pipe(v.string(), v.parseJson(), Reply), out)
      if (code !== 0 || !parsed.success || parsed.output.is_error) return reject(new Error(`library ${brief.id}: ${code} ${err.slice(0, 300)} ${out.slice(0, 300)}`))
      appendFileSync(LEDGER, `${JSON.stringify({ at: new Date().toISOString(), label: `library:${brief.id}`, model: 'sonnet', cost: parsed.output.total_cost_usd, turns: parsed.output.num_turns, seconds: Math.round((Date.now() - started) / 1000) })}\n`)
      writeFileSync(raw, parsed.output.result)
      resolve(parsed.output.result)
    })
    child.stdin.end(baselinePrompt(brief))
  })
}

type Options = { briefs: Brief[]; parallel: number }

const stages: Record<string, (options: Options) => Promise<void>> = {
  async build({ briefs, parallel }) {
    await pool(
      briefs.map((brief) => async () => {
        const dir = join(home(brief), 'library')
        if (readMetrics(dir)) return
        const reply = await generate(brief)
        await writeRaw(dir, reply, brief)
        console.log('library', brief.id)
      }),
      parallel
    )
  },

  async review({ briefs, parallel }) {
    await pool(
      briefs.map((brief) => async () => {
        const from = join(home(brief), 'library')
        const dir = join(home(brief), 'library-reviewed')
        if (readMetrics(dir) || !readMetrics(from)) return
        const html = readFileSync(join(from, 'page.html'), 'utf8')
        const reply = await ask({
          label: `library-review:${brief.id}`,
          system: LIBRARY_SYSTEM,
          prompt: baselineReviewPrompt(brief, html, ['fold.jpg', 'full.jpg']),
          images: [join(from, 'fold.jpg'), join(from, 'full.jpg')]
        })
        await writeRaw(dir, reply, brief)
        console.log('library-review', brief.id)
      }),
      parallel
    )
  },

  async duel({ briefs, parallel }) {
    await pool(
      briefs.map((brief) => async () => {
        const dir = home(brief)
        const output = join(dir, 'duel-library.json')
        if (existsSync(output) || !readMetrics(join(dir, 'library-reviewed')) || !readMetrics(join(dir, 'baseline-reviewed'))) return
        const stage = join(dir, 'duel-library')
        mkdirSync(stage, { recursive: true })
        // Which side is shown first alternates by brief, fixed in advance.
        const libraryFirst = [...brief.id].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 2 === 1
        const order = libraryFirst ? ['library-reviewed', 'baseline-reviewed'] : ['baseline-reviewed', 'library-reviewed']
        const names = ['a.jpg', 'b.jpg']
        names.forEach((name, index) => writeFileSync(join(stage, name), readFileSync(join(dir, order[index], 'fold.jpg'))))
        const reply = await ask({ label: `duel-library:${brief.id}`, system: JUDGE_SYSTEM, prompt: judgePrompt(brief, names), images: names.map((name) => join(stage, name)) })
        const parsed = v.safeParse(
          v.pipe(v.string(), v.parseJson(), v.object({ drafts: v.array(v.object({ score: v.number(), weakness: v.string() })) })),
          fenced(reply, 'json')
        )
        if (!parsed.success || parsed.output.drafts.length !== 2) return
        const [first, second] = parsed.output.drafts
        const result = { library: libraryFirst ? first : second, baseline: libraryFirst ? second : first }
        writeFileSync(output, JSON.stringify(result, null, 1))
        console.log('duel-library', brief.id, `library ${result.library.score} baseline ${result.baseline.score}`)
      }),
      parallel
    )
  },

  async report({ briefs }) {
    const rows = briefs.map((brief) => {
      const dir = home(brief)
      const calls = existsSync(join(dir, 'library', 'calls.jsonl'))
        ? readFileSync(join(dir, 'library', 'calls.jsonl'), 'utf8').split('\n').filter(Boolean).map((line) => JSON.parse(line) as { query: string; results: string[] })
        : []
      const page = existsSync(join(dir, 'library-reviewed', 'page.html')) ? readFileSync(join(dir, 'library-reviewed', 'page.html'), 'utf8') : ''
      const used = [...new Set([...page.matchAll(/data-fresh=["']([a-z0-9-]+)["']/g)].map((match) => match[1]))]
      const duel = existsSync(join(dir, 'duel-library.json')) ? (JSON.parse(readFileSync(join(dir, 'duel-library.json'), 'utf8')) as { library: { score: number; weakness: string }; baseline: { score: number; weakness: string } }) : null
      const lib = readMetrics(join(dir, 'library-reviewed'))
      const base = readMetrics(join(dir, 'baseline-reviewed'))
      return { brief: brief.id, searches: calls.map((call) => call.query), used, duel, craft: [lib?.craft.craft, base?.craft.craft], slop: [lib?.slop, base?.slop] }
    })
    writeFileSync(join(RUNS_DIR, 'library-report.json'), JSON.stringify(rows, null, 1))
    for (const row of rows) console.log(row.brief, row.used.join(',') || '-', row.duel ? `${row.duel.library.score} vs ${row.duel.baseline.score}` : 'no duel', row.searches.join(' | '))
  }
}

if (import.meta.main) {
  const [stage, ...rest] = process.argv.slice(2)
  const flag = (name: string) => {
    const index = rest.indexOf(`--${name}`)
    return index >= 0 ? rest[index + 1] : undefined
  }
  const wanted = flag('briefs')?.split(',')
  const options: Options = { briefs: loadBriefs().filter((brief) => !wanted || wanted.includes(brief.id)), parallel: Number(flag('parallel') ?? 3) }
  const order = stage === 'all' ? ['build', 'review', 'duel', 'report'] : [stage]
  try {
    for (const name of order) await stages[name](options)
  } finally {
    await closeBrowser()
    const total = ledgerTotal()
    console.log(`${total.calls} calls, $${total.cost.toFixed(2)} so far`)
  }
}
