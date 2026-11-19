import {
  claudeDesignBoardDocument,
  createClaudeDesignGraph,
  expandDesignComponent,
  type ClaudeDesignProject,
  type DesignComponent,
  type DesignValues
} from '@kalka/core/io/formats/claude-design'
import { browserHTMLToSceneGraph } from '@kalka/dom-css/browser'
import type { SceneGraph } from '@kalka/scene-graph'

import { openDesignLogicSandbox } from '@/app/document/io/claude-design/sandbox'

export interface ClaudeDesignImportProgress {
  board: string
  completed: number
  total: number
}

export interface ClaudeDesignImportOptions {
  signal?: AbortSignal
  onProgress?: (progress: ClaudeDesignImportProgress) => void
}

/** What an import made and what it had to leave as written. */
export interface ClaudeDesignImportResult {
  graph: SceneGraph
  boards: number
  /** Components whose logic did not run, drawn from their defaults and placeholders. */
  staticComponents: string[]
  /** Uploads the pages name that the export does not hold. */
  missingBlobs: string[]
}

/**
 * Turns a Claude Design project into a document: each board an artboard where the canvas had it,
 * drawn by the browser from its component once holes, loops and imports are resolved, then read
 * by the HTML import.
 */
export async function claudeDesignToSceneGraph(
  project: ClaudeDesignProject,
  options: ClaudeDesignImportOptions = {}
): Promise<ClaudeDesignImportResult> {
  const { graph, pageOf } = createClaudeDesignGraph(project)
  const sandbox = openDesignLogicSandbox()
  const staticComponents = new Set<string>()
  const missingBlobs = new Set<string>()
  // The same component with the same props renders the same, wherever it is imported.
  const cache = new Map<string, Promise<DesignValues | null>>()

  const values = (name: string, component: DesignComponent, props: DesignValues) => {
    if (!component.script) return Promise.resolve(null)
    const key = `${name}\u0000${JSON.stringify(props)}`
    let pending = cache.get(key)
    if (!pending) {
      pending = sandbox.run(component.script, props).then((result) => {
        if (result === null) staticComponents.add(name)
        return result
      })
      cache.set(key, pending)
    }
    return pending
  }

  try {
    for (const [index, board] of project.boards.entries()) {
      options.signal?.throwIfAborted()
      options.onProgress?.({ board: board.title, completed: index, total: project.boards.length })
      const expanded = await expandDesignComponent(board.component, {
        component: (name) => project.components.get(name),
        values
      })
      const document = claudeDesignBoardDocument(project, board, expanded)
      for (const id of document.missingBlobs) missingBlobs.add(id)
      await browserHTMLToSceneGraph(document.html, {
        compute: { viewportWidth: board.width },
        artboardName: board.title,
        signal: options.signal,
        into: {
          graph,
          pageId: pageOf(board.pageId),
          x: board.x,
          y: board.y,
          height: board.fill ? undefined : board.height
        }
      })
      if (board.radius !== null) {
        const artboard = graph.getChildren(pageOf(board.pageId)).at(-1)
        if (artboard) graph.updateNode(artboard.id, { cornerRadius: board.radius })
      }
    }
  } finally {
    sandbox.close()
  }
  options.onProgress?.({
    board: '',
    completed: project.boards.length,
    total: project.boards.length
  })
  return {
    graph,
    boards: project.boards.length,
    staticComponents: [...staticComponents],
    missingBlobs: [...missingBlobs]
  }
}
