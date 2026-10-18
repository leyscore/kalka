import { execFile } from 'node:child_process'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { promisify } from 'node:util'

import type { ElectronApplication } from '@playwright/test'
import * as v from 'valibot'

import { pause, round, toMiB } from './stats'

const run = promisify(execFile)

/** A process of the running app, as the OS lists it. */
export interface PsRow {
  pid: number
  ppid: number
  rssKiB: number
  command: string
}

/** Parses `ps -A -o pid=,ppid=,rss=,command=`. */
export function parsePs(output: string): PsRow[] {
  return output.split('\n').flatMap((line) => {
    const match = line.trim().match(/^(\d+)\s+(\d+)\s+(\d+)\s+(.*)$/)
    if (!match) return []
    return [
      { pid: Number(match[1]), ppid: Number(match[2]), rssKiB: Number(match[3]), command: match[4] }
    ]
  })
}

/** `root` and every process it started, at any depth. */
export function descendants(rows: readonly PsRow[], root: number): PsRow[] {
  const children = new Map<number, PsRow[]>()
  for (const row of rows) children.set(row.ppid, [...(children.get(row.ppid) ?? []), row])
  const found: PsRow[] = []
  const queue = rows.filter((row) => row.pid === root)
  while (queue.length) {
    const row = queue.shift()
    if (!row) break
    found.push(row)
    queue.push(...(children.get(row.pid) ?? []))
  }
  return found
}

export type ProcessKind =
  | 'main'
  | 'renderer'
  | 'gpu'
  | 'network'
  | 'utility'
  | 'mcp-server'
  | 'render-host'
  | 'other'

/** What a process is, from Electron's own metrics type when it has one, else its command line. */
export function classifyProcess(
  row: PsRow,
  electronType: string | undefined,
  utilityName?: string
): ProcessKind {
  if (/render-host\.js/.test(row.command)) return 'render-host'
  if (/mcp[/\\](index|stdio)\.js/.test(row.command)) return 'mcp-server'
  switch (electronType) {
    case 'Browser':
      return 'main'
    case 'Tab':
      return 'renderer'
    case 'GPU':
      return 'gpu'
    case 'Utility':
      return utilityName === 'Network Service' ? 'network' : 'utility'
    default:
      return /--type=renderer/.test(row.command) ? 'renderer' : 'other'
  }
}

const FootprintSchema = v.looseObject({
  processes: v.array(v.looseObject({ pid: v.number(), footprint: v.number() })),
  'total footprint': v.optional(v.number())
})

/** macOS physical footprint per process (what Activity Monitor calls Memory), and their total. */
async function footprints(
  pids: number[]
): Promise<{ perPid: Map<number, number>; total: number | null }> {
  if (process.platform !== 'darwin' || pids.length === 0) return { perPid: new Map(), total: null }
  const dir = await mkdtemp(join(tmpdir(), 'kalka-footprint-'))
  try {
    const file = join(dir, 'footprint.json')
    await run('footprint', [
      ...pids.flatMap((pid) => ['-p', String(pid)]),
      '--noCategories',
      '-f',
      'bytes',
      '-j',
      file
    ])
    const parsed = v.safeParse(
      v.pipe(v.string(), v.parseJson(), FootprintSchema),
      await readFile(file, 'utf8')
    )
    if (!parsed.success) return { perPid: new Map(), total: null }
    return {
      perPid: new Map(parsed.output.processes.map((entry) => [entry.pid, entry.footprint])),
      total: parsed.output['total footprint'] ?? null
    }
  } catch {
    return { perPid: new Map(), total: null }
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}

export interface ProcessSample {
  pid: number
  kind: ProcessKind
  rssMiB: number
  /** macOS physical footprint; null elsewhere. */
  footprintMiB: number | null
  cpuPercent: number | null
  command: string
}

export interface MemorySnapshot {
  processes: ProcessSample[]
  totalRssMiB: number
  /** CPU of all processes Electron knows, in percent of one core, over two idle seconds. */
  totalCpuPercent: number
  /** Sum of physical footprints, shared memory counted once; macOS only. */
  totalFootprintMiB: number | null
  byKind: Partial<
    Record<ProcessKind, { count: number; rssMiB: number; footprintMiB: number | null }>
  >
}

/** How long idle CPU is averaged over. */
const CPU_WINDOW_MS = 2000

const AppMetricSchema = v.array(
  v.looseObject({
    pid: v.number(),
    type: v.string(),
    name: v.optional(v.string()),
    cpu: v.optional(v.looseObject({ percentCPUUsage: v.optional(v.number()) }))
  })
)

/** Memory of every process the app runs: Electron's own and the children it started. */
export async function sampleMemory(app: ElectronApplication): Promise<MemorySnapshot> {
  const root = app.process().pid
  if (root === undefined) throw new Error('The app has no process id')
  const readMetrics = async () =>
    v.parse(
      AppMetricSchema,
      await app.evaluate(({ app: electronApp }) =>
        electronApp.getAppMetrics().map((metric) => ({
          pid: metric.pid,
          type: metric.type,
          name: metric.name,
          cpu: { percentCPUUsage: metric.cpu.percentCPUUsage }
        }))
      )
    )
  // CPU usage counts since the previous reading: read once, wait, and keep the second.
  await readMetrics()
  await pause(CPU_WINDOW_MS)
  const metrics = await readMetrics()
  const byPid = new Map(metrics.map((metric) => [metric.pid, metric]))
  const { stdout } = await run('ps', ['-A', '-o', 'pid=,ppid=,rss=,command='], {
    maxBuffer: 16 * 1024 * 1024
  })
  const rows = descendants(parsePs(stdout), root)
  const { perPid, total } = await footprints(rows.map((row) => row.pid))
  const processes = rows.map((row): ProcessSample => {
    const metric = byPid.get(row.pid)
    const footprint = perPid.get(row.pid)
    return {
      pid: row.pid,
      kind: classifyProcess(row, metric?.type, metric?.name),
      rssMiB: toMiB(row.rssKiB * 1024),
      footprintMiB: footprint === undefined ? null : toMiB(footprint),
      cpuPercent: metric?.cpu?.percentCPUUsage ?? null,
      command: row.command.slice(0, 160)
    }
  })
  const byKind: MemorySnapshot['byKind'] = {}
  for (const sample of processes) {
    const entry = (byKind[sample.kind] ??= { count: 0, rssMiB: 0, footprintMiB: null })
    entry.count += 1
    entry.rssMiB = toMiB((entry.rssMiB + sample.rssMiB) * 1024 * 1024)
    if (sample.footprintMiB !== null)
      entry.footprintMiB = toMiB(((entry.footprintMiB ?? 0) + sample.footprintMiB) * 1024 * 1024)
  }
  return {
    processes,
    totalRssMiB: toMiB(processes.reduce((sum, sample) => sum + sample.rssMiB, 0) * 1024 * 1024),
    totalCpuPercent:
      round(processes.reduce((sum, sample) => sum + (sample.cpuPercent ?? 0), 0)) ?? 0,
    totalFootprintMiB: total === null ? null : toMiB(total),
    byKind
  }
}
