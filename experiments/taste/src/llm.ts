/**
 * Generation goes through the local Claude Code CLI, the same engine Kalka's own agent drives
 * over ACP, so no key is read or stored here. Every call is cached by its inputs and written to
 * a ledger with the cost the CLI reports.
 */
import { spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import * as v from 'valibot'

export const RUNS_DIR = join(import.meta.dir, '..', 'runs')
const CACHE_DIR = join(RUNS_DIR, 'cache')
const LEDGER = join(RUNS_DIR, 'ledger.jsonl')

const Reply = v.object({
  result: v.string(),
  is_error: v.boolean(),
  total_cost_usd: v.number(),
  usage: v.object({ input_tokens: v.number(), output_tokens: v.number() })
})

export type Call = {
  label: string
  system: string
  prompt: string
  model?: string
  /** Files the model must look at, all in one folder; only the Read tool is enabled, there. */
  images?: string[]
  /** Changes the cache key so the same prompt can be sampled again. */
  sample?: number
}

function run(args: string[], input: string, cwd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const env = { ...process.env }
    for (const key of ['CLAUDECODE', 'CLAUDE_CODE_ENTRYPOINT', 'CLAUDE_CODE_CHILD_SESSION']) delete env[key]
    const child = spawn('claude', args, { cwd, env })
    let out = ''
    let err = ''
    child.stdout.on('data', (chunk: Buffer) => (out += chunk.toString()))
    child.stderr.on('data', (chunk: Buffer) => (err += chunk.toString()))
    child.on('error', reject)
    child.on('close', (code) => (code === 0 ? resolve(out) : reject(new Error(`claude exited ${code}: ${err.slice(0, 400)}`))))
    child.stdin.end(input)
  })
}

export async function ask(call: Call): Promise<string> {
  mkdirSync(CACHE_DIR, { recursive: true })
  const model = call.model ?? 'sonnet'
  const imageBytes = (call.images ?? []).map((image) => createHash('sha256').update(readFileSync(image)).digest('hex')).join('')
  const key = createHash('sha256')
    .update([model, call.system, call.prompt, imageBytes, call.sample ?? 0].join('\u0000'))
    .digest('hex')
    .slice(0, 24)
  const cached = join(CACHE_DIR, `${key}.txt`)
  if (existsSync(cached)) return readFileSync(cached, 'utf8')
  const args = ['-p', '--model', model, '--system-prompt', call.system, '--strict-mcp-config', '--setting-sources', '', '--no-session-persistence', '--output-format', 'json']
  let cwd = RUNS_DIR
  if (call.images?.length) {
    cwd = join(call.images[0], '..')
    args.push('--tools', 'Read', '--allowedTools', 'Read')
  } else args.push('--tools', '')
  let lastError: unknown
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const started = Date.now()
      const raw = await run(args, call.prompt, cwd)
      const parsed = v.safeParse(v.pipe(v.string(), v.parseJson(), Reply), raw)
      if (!parsed.success || parsed.output.is_error) throw new Error(`bad reply: ${raw.slice(0, 300)}`)
      const reply = parsed.output
      appendFileSync(
        LEDGER,
        `${JSON.stringify({ at: new Date().toISOString(), label: call.label, model, cost: reply.total_cost_usd, input: reply.usage.input_tokens, output: reply.usage.output_tokens, seconds: Math.round((Date.now() - started) / 1000) })}\n`
      )
      writeFileSync(cached, reply.result)
      return reply.result
    } catch (error) {
      lastError = error
    }
  }
  throw lastError
}

/** The first HTML or JSON block of a reply, or the reply itself when it has no fence. */
export function fenced(reply: string, language: string): string {
  const match = new RegExp('```' + language + '\\s*\\n([\\s\\S]*?)\\n```').exec(reply) ?? /```\w*\s*\n([\s\S]*?)\n```/.exec(reply)
  return (match ? match[1] : reply).trim()
}

export function ledgerTotal(): { cost: number; calls: number } {
  if (!existsSync(LEDGER)) return { cost: 0, calls: 0 }
  const lines = readFileSync(LEDGER, 'utf8').split('\n').filter(Boolean)
  let cost = 0
  for (const line of lines) {
    const parsed = v.safeParse(v.pipe(v.string(), v.parseJson(), v.object({ cost: v.number() })), line)
    if (parsed.success) cost += parsed.output.cost
  }
  return { cost, calls: lines.length }
}

/** Runs tasks with a fixed number in flight: memory on this machine is limited. */
export async function pool<T>(tasks: (() => Promise<T>)[], size: number): Promise<T[]> {
  const results: T[] = new Array<T>(tasks.length)
  let next = 0
  await Promise.all(
    Array.from({ length: size }, async () => {
      while (next < tasks.length) {
        const index = next++
        results[index] = await tasks[index]()
      }
    })
  )
  return results
}
