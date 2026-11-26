import * as v from 'valibot'

import type { SceneGraph } from '@kalka/scene-graph'
import { applyDocumentChanges, diffDocument } from '@kalka/scene-graph/diff'

import { call } from '@/app/platform/tauri/bridge'

import { compareForMerge, compareStates } from './compare'

/**
 * Compare changes for a document kept in Git: a version read back from a commit, and a branch
 * reviewed change by change from the version it shares with the current one.
 */

const DocumentAtSchema = v.variant('kind', [
  v.object({
    kind: v.literal('folder'),
    files: v.record(v.string(), v.instance(Uint8Array))
  }),
  v.object({ kind: v.literal('file'), data: v.instance(Uint8Array) })
])

/** The document as a commit or a branch holds it. */
export async function readGitDocument(documentPath: string, revision: string): Promise<SceneGraph> {
  const at = v.parse(DocumentAtSchema, await call('git.readAt', documentPath, revision))
  const kalka = await import('@kalka/core/io/formats/kalka')
  if (at.kind === 'folder') return kalka.readKalkaFolder(new Map(Object.entries(at.files)))
  if (documentPath.toLowerCase().endsWith('.fig')) {
    const { readFigFile } = await import('@kalka/core/io/formats/fig')
    return readFigFile(new File([new Uint8Array(at.data)], 'version.fig'))
  }
  return kalka.readKalkaArchive(at.data)
}

export async function readGitMergeBase(documentPath: string, branch: string): Promise<string> {
  return v.parse(v.string(), await call('git.mergeBase', documentPath, branch))
}

/** Compares a commit with what is on screen. */
export async function compareGitVersion(
  documentPath: string,
  hash: string,
  current: SceneGraph,
  labels: { before: string; after: string }
): Promise<void> {
  compareStates({
    before: await readGitDocument(documentPath, hash),
    after: current,
    beforeLabel: labels.before,
    afterLabel: labels.after,
    afterIsOpen: true
  })
}

interface GitBranchReview {
  documentPath: string
  branch: string
  current: SceneGraph
  labels: { branch: string; current: string }
  /** Merges the branch as Git does, then opens the folder as it is after. */
  merge: () => Promise<void>
  /** The document on screen after the merge. */
  merged: () => SceneGraph
}

/**
 * Reviews what a branch changed since it left the current one, then merges it. Git merges
 * files, so the merge takes every change; the changes left unticked are then put back as the
 * current branch had them, as edits of the document to record as a version.
 */
export async function reviewGitBranch(review: GitBranchReview): Promise<void> {
  const [base, incoming] = await Promise.all([
    readGitMergeBase(review.documentPath, review.branch).then((hash) =>
      readGitDocument(review.documentPath, hash)
    ),
    readGitDocument(review.documentPath, review.branch)
  ])
  const { writeKalkaArchive, readKalkaArchive } = await import('@kalka/core/io/formats/kalka')
  // What the current branch holds before the merge, to put back the changes left unticked.
  const before = await readKalkaArchive(await writeKalkaArchive(review.current))
  compareForMerge({
    base,
    target: review.current,
    incoming,
    targetLabel: review.labels.current,
    incomingLabel: review.labels.branch,
    afterIsOpen: false,
    merge: {
      kind: 'merge',
      otherSide: review.labels.current,
      apply: async (changes) => {
        const taken = new Set([...changes.layers, ...changes.variables].map((change) => change.id))
        // A layer taken with only some of its properties is put back for the others.
        const partly = new Map(changes.layers.map((change) => [change.id, change]))
        const branchChanges = diffDocument(base, incoming)
        const left = new Set(
          [...branchChanges.layers, ...branchChanges.variables]
            .filter((change) => !taken.has(change.id))
            .map((change) => change.id)
        )
        const narrowed = branchChanges.layers.some((change) => {
          const kept = partly.get(change.id)
          return kept !== undefined && kept.fields.length < change.fields.length
        })
        await review.merge()
        if (left.size === 0 && !narrowed) return []
        const graph = review.merged()
        const back = diffDocument(graph, before)
        const putBack = {
          layers: back.layers.flatMap((change) => {
            if (left.has(change.id)) return [change]
            const kept = partly.get(change.id)
            if (!kept) return []
            const fields = change.fields.filter((field) => !kept.fields.includes(field))
            return fields.length > 0
              ? [{ ...change, fields, moved: change.moved && !kept.moved }]
              : []
          }),
          variables: back.variables.filter((change) => left.has(change.id))
        }
        return applyDocumentChanges(graph, before, putBack)
      }
    }
  })
}
