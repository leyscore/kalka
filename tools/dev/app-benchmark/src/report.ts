import { WORK_KINDS, type WorkBreakdown } from './breakdown'
import type { ProcessKind, MemorySnapshot } from './processes'
import type { BenchProfile } from './profiles'
import { slope, type ArtboardStepResult } from './scenarios/artboards'
import type { DocumentResult } from './scenarios/document'
import type { StartupResult } from './scenarios/startup'

export interface ProfileReport {
  profile: BenchProfile
  startup?: StartupResult
  documents?: DocumentResult[]
  artboards?: ArtboardStepResult[]
  errors: string[]
}

export interface BenchReport {
  environment: Record<string, string | number>
  documents: Record<string, { leaves: number; cards: number; artboards: number; total: number }>
  headlessImport: Record<string, { parseMs: number; heapMiB: number; nodes: number }>
  profiles: ProfileReport[]
}

const KINDS: ProcessKind[] = [
  'main',
  'renderer',
  'gpu',
  'network',
  'utility',
  'mcp-server',
  'render-host',
  'other'
]

const cell = (value: number | string | null | undefined) =>
  value === null || value === undefined ? '–' : String(value)

function table(header: string[], rows: (number | string | null | undefined)[][]): string {
  return [
    `| ${header.join(' | ')} |`,
    `| ${header.map((_, index) => (index === 0 ? '---' : '---:')).join(' | ')} |`,
    ...rows.map((row) => `| ${row.map(cell).join(' | ')} |`)
  ].join('\n')
}

/** Footprint where the OS reports it, else RSS. */
const memoryOf = (snapshot: MemorySnapshot) => snapshot.totalFootprintMiB ?? snapshot.totalRssMiB

const kindMemory = (snapshot: MemorySnapshot, kind: ProcessKind) => {
  const entry = snapshot.byKind[kind]
  return entry ? (entry.footprintMiB ?? entry.rssMiB) : 0
}

function memoryRow(label: string, snapshot: MemorySnapshot) {
  return [
    label,
    snapshot.totalFootprintMiB,
    snapshot.totalRssMiB,
    snapshot.totalCpuPercent,
    ...KINDS.map((kind) => {
      const entry = snapshot.byKind[kind]
      return entry
        ? `${entry.footprintMiB ?? entry.rssMiB}${entry.count > 1 ? ` (×${entry.count})` : ''}`
        : null
    })
  ]
}

const memoryHeader = ['State', 'Footprint MiB', 'RSS MiB', 'Idle CPU %', ...KINDS]

function workCells(work: WorkBreakdown, key: 'p50Ms' | 'p95Ms' | 'totalMs') {
  return WORK_KINDS.map((kind) => work[kind][key])
}

function startupSection(startup: StartupResult): string {
  const { median } = startup
  const lines = [
    '### Startup',
    '',
    table(
      [
        'Median of launches',
        'First window',
        'App mounted',
        'Home rendered',
        'Splash gone',
        'Empty document ready (from click)'
      ],
      [
        [
          'ms',
          median.firstWindowMs,
          median.mountedMs,
          median.homeMs,
          median.splashGoneMs,
          median.emptyDocumentMs
        ]
      ]
    ),
    ''
  ]
  if (startup.launchWithDocument)
    lines.push(
      `Launching with ${startup.launchWithDocument.name} as an argument: settled after ${startup.launchWithDocument.settledMs} ms.`,
      ''
    )
  lines.push(
    `Home reload under trace: ${startup.reload.homeMs} ms, of which the renderer's main thread was busy ${startup.reload.cost.mainThreadBusyMs} ms (module evaluation ${startup.reload.cost.evaluateModuleMs} ms, compile ${startup.reload.cost.compileMs} ms, WebAssembly compile ${startup.reload.cost.wasmCompileMs} ms).`,
    '',
    ` CanvasKit fetched at home: ${startup.page.home.canvasKitLoaded ? 'yes' : 'no'}, after an empty document: ${startup.page.emptyDocument.canvasKitLoaded ? (startup.page.emptyDocument.canvasKitHeapMiB ? `yes, ${startup.page.emptyDocument.canvasKitHeapMiB} MiB of WebAssembly memory` : 'yes') : 'no'}. Windows at idle: ${startup.windowsAtIdle}.`,
    '',
    table(
      ['Reload work', ...WORK_KINDS],
      [['total ms', ...workCells(startup.reload.work, 'totalMs')]]
    ),
    '',
    '### Memory',
    '',
    table(memoryHeader, [
      memoryRow('Home, idle', startup.memory.home),
      memoryRow('Empty document', startup.memory.emptyDocument)
    ]),
    '',
    `JS heap: home ${startup.page.home.jsHeapUsedMiB} MiB, empty document ${startup.page.emptyDocument.jsHeapUsedMiB} MiB.`,
    '',
    '### Bundle',
    '',
    table(
      ['Code', 'js MiB', 'css MiB', 'wasm MiB'],
      (['startup', 'emptyDocument', 'lazy', 'total'] as const).map((key) => [
        key,
        startup.bundle[key].js?.mib,
        startup.bundle[key].css?.mib,
        startup.bundle[key].wasm?.mib
      ])
    ),
    '',
    table(
      ['Largest files loaded at startup', 'KiB'],
      startup.bundle.largestStartup.map((file) => [file.path, Math.round(file.bytes / 1024)])
    ),
    ''
  )
  return lines.join('\n')
}

function documentsSection(documents: DocumentResult[]): string {
  const lines = [
    '### Opening documents',
    '',
    table(
      [
        'Document',
        'Import ms',
        'First render ms',
        'Total ms',
        'Parse (worker) ms',
        'Main JS ms',
        'Style ms',
        'Layout ms',
        'Heap at import MiB',
        'Footprint MiB',
        'JS heap MiB',
        'Iframes',
        'DOM nodes'
      ],
      documents.map((doc) => [
        doc.name,
        doc.open.importMs,
        doc.open.firstRenderMs,
        doc.open.totalMs,
        doc.open.work.worker.totalMs,
        doc.open.work.js.totalMs,
        doc.open.work.style.totalMs,
        doc.open.work.layout.totalMs,
        doc.heapAtImportMiB,
        memoryOf(doc.memory),
        doc.page.jsHeapUsedMiB,
        doc.page.artboardIframes,
        doc.page.domNodes
      ])
    ),
    '',
    table(
      memoryHeader,
      documents.map((doc) => memoryRow(doc.name, doc.memory))
    ),
    ''
  ]
  for (const doc of documents) {
    if (!doc.gestures) continue
    lines.push(
      `### Gestures: ${doc.name} (display frame ${doc.gestures.refreshMs.toFixed(2)} ms)`,
      '',
      table(
        [
          'Gesture',
          'took',
          'p50 ms',
          'p95 ms',
          'max ms',
          'dropped',
          'dropped %',
          'long tasks',
          'input→frame p95',
          'artboard layouts/input',
          'artboard dirty objects p50 / of',
          'artboard full layouts',
          'artboard style elements p50',
          'editor layouts/input',
          'editor dirty objects p50 / of'
        ],
        doc.gestures.results.map((result) => [
          result.gesture,
          result.took ? 'yes' : 'NO',
          result.frames.p50Ms,
          result.frames.p95Ms,
          result.frames.maxMs,
          result.frames.droppedFrames,
          result.frames.droppedRatio === null
            ? null
            : Math.round(result.frames.droppedRatio * 1000) / 10,
          result.frames.longTasks,
          result.frames.inputToFrameP95Ms,
          result.rendering.artboards.layoutsPerInput,
          `${cell(result.rendering.artboards.layoutDirtyObjectsP50)} / ${cell(result.rendering.artboards.layoutTotalObjectsMax)}`,
          result.rendering.artboards.fullLayouts,
          result.rendering.artboards.styleElementsP50,
          result.rendering.editor.layoutsPerInput,
          `${cell(result.rendering.editor.layoutDirtyObjectsP50)} / ${cell(result.rendering.editor.layoutTotalObjectsMax)}`
        ])
      ),
      '',
      table(
        ['Per frame p50 / p95 ms', ...WORK_KINDS],
        doc.gestures.results.map((result) => [
          result.gesture,
          ...WORK_KINDS.map(
            (kind) => `${cell(result.perFrame[kind].p50Ms)} / ${cell(result.perFrame[kind].p95Ms)}`
          )
        ])
      ),
      ''
    )
    lines.push(
      table(
        ['Most main-thread self time', 'events (kind, ms over the gesture)'],
        doc.gestures.results.map((result) => [
          result.gesture,
          (result.perFrame.topMainThread ?? [])
            .slice(0, 4)
            .map((entry) => `${entry.name} (${entry.kind}, ${entry.ms})`)
            .join(', ')
        ])
      ),
      ''
    )
    if (doc.gestures.skipped.length) lines.push(`Skipped: ${doc.gestures.skipped.join('; ')}`, '')
  }
  return lines.join('\n')
}

function artboardsSection(steps: ArtboardStepResult[]): string {
  const perArtboard = (pick: (step: ArtboardStepResult) => number) =>
    slope(steps.map((step) => ({ x: step.artboards, y: pick(step) })))
  return [
    '### Cost per artboard iframe (100 layers each)',
    '',
    table(
      [
        'Artboards',
        'Open ms',
        'Footprint all visible MiB',
        'Footprint one visible MiB',
        'Renderer MiB all / one',
        'JS heap MiB',
        'Pan p95 all / one ms',
        'Style+layout+paint per frame p95 all / one ms',
        'Composite per frame p95 all / one ms',
        'Dropped % all / one'
      ],
      steps.map((step) => {
        const work = (view: ArtboardStepResult['allVisible']) =>
          Math.round(
            ((view.pan.perFrame.style.p95Ms ?? 0) +
              (view.pan.perFrame.layout.p95Ms ?? 0) +
              (view.pan.perFrame.paint.p95Ms ?? 0)) *
              100
          ) / 100
        const dropped = (view: ArtboardStepResult['allVisible']) =>
          view.pan.frames.droppedRatio === null
            ? '–'
            : Math.round(view.pan.frames.droppedRatio * 1000) / 10
        return [
          step.artboards,
          step.open.totalMs,
          memoryOf(step.allVisible.memory),
          memoryOf(step.oneVisible.memory),
          `${kindMemory(step.allVisible.memory, 'renderer')} / ${kindMemory(step.oneVisible.memory, 'renderer')}`,
          step.allVisible.page.jsHeapUsedMiB,
          `${cell(step.allVisible.pan.frames.p95Ms)} / ${cell(step.oneVisible.pan.frames.p95Ms)}`,
          `${work(step.allVisible)} / ${work(step.oneVisible)}`,
          `${cell(step.allVisible.pan.perFrame.composite.p95Ms)} / ${cell(step.oneVisible.pan.perFrame.composite.p95Ms)}`,
          `${dropped(step.allVisible)} / ${dropped(step.oneVisible)}`
        ]
      })
    ),
    '',
    `Slope per added artboard: total footprint ${cell(perArtboard((step) => memoryOf(step.allVisible.memory)))} MiB all visible, ${cell(perArtboard((step) => memoryOf(step.oneVisible.memory)))} MiB one visible; renderer ${cell(perArtboard((step) => kindMemory(step.allVisible.memory, 'renderer')))} / ${cell(perArtboard((step) => kindMemory(step.oneVisible.memory, 'renderer')))} MiB; GPU process ${cell(perArtboard((step) => kindMemory(step.allVisible.memory, 'gpu')))} / ${cell(perArtboard((step) => kindMemory(step.oneVisible.memory, 'gpu')))} MiB; JS heap ${cell(perArtboard((step) => step.allVisible.page.jsHeapUsedMiB))} MiB; DOM nodes ${cell(perArtboard((step) => step.allVisible.page.domNodes))}; open ${cell(perArtboard((step) => step.open.totalMs))} ms.`,
    ''
  ].join('\n')
}

export function renderMarkdown(report: BenchReport): string {
  const env = report.environment
  const lines = [
    '# Kalka desktop benchmark',
    '',
    `${env.recordedAt} · ${env.cpu} (${env.cores} cores, ${env.memoryGiB} GiB) · ${env.platform} ${env.osRelease} · ${env.app} · ${env.runs} startup launches · ${env.settleMs} ms settle`,
    '',
    table(
      ['Generated document', 'Leaf layers', 'Cards', 'Artboards (iframes)', 'All layers'],
      Object.entries(report.documents).map(([name, counts]) => [
        name,
        counts.leaves,
        counts.cards,
        counts.artboards,
        counts.total
      ])
    ),
    '',
    table(
      ['Headless .fig import (Bun)', 'Parse ms', 'Heap MiB', 'Nodes'],
      Object.entries(report.headlessImport).map(([name, entry]) => [
        name,
        entry.parseMs,
        entry.heapMiB,
        entry.nodes
      ])
    ),
    ''
  ]
  for (const profile of report.profiles) {
    lines.push(`## Profile ${profile.profile.name}: ${profile.profile.description}`, '')
    if (profile.startup) lines.push(startupSection(profile.startup))
    if (profile.documents?.length) lines.push(documentsSection(profile.documents))
    if (profile.artboards?.length) lines.push(artboardsSection(profile.artboards))
    if (profile.errors.length)
      lines.push('Errors:', '', ...profile.errors.map((error) => `- ${error}`), '')
  }
  return `${lines.join('\n').trimEnd()}\n`
}
