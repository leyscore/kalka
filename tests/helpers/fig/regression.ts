import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import * as v from 'valibot'

import { parseFigFile, type SceneGraph, type SceneNode } from '@kalka/core'
import { sceneGraphToDesignDocument, serializeHTML } from '@kalka/dom-css/export'

import { testPath } from '../paths'
import { FIXTURES } from './fixtures'

/**
 * The `.fig` import regression corpus: what each page of a real file imports to, as fingerprints
 * of its layers' fields and of the HTML and CSS the canvas draws from them. The CSS model's
 * migration (PLAN.md, section 12) must leave every fingerprint as it is.
 */
export interface PageFingerprint {
  name: string
  layers: number
  fields: string
  html: string
}

const BaselineSchema = v.array(
  v.object({ name: v.string(), layers: v.number(), fields: v.string(), html: v.string() })
)

const BASELINES = testPath('integration/fig-import/baselines')

const sha = (text: string | Uint8Array) =>
  createHash('sha256').update(text).digest('hex').slice(0, 16)

function subtree(graph: SceneGraph, root: SceneNode): SceneNode[] {
  const nodes: SceneNode[] = []
  const visit = (node: SceneNode) => {
    nodes.push(node)
    for (const child of graph.getChildren(node.id)) visit(child)
  }
  visit(root)
  return nodes
}

/**
 * Layer ids come from the graph's generator, so they differ between imports; every reference
 * to a layer becomes its place in the page's traversal order instead.
 */
function fieldsFingerprint(nodes: readonly SceneNode[]): string {
  const order = new Map(nodes.map((node, index) => [node.id, `#${index}`]))
  const json = JSON.stringify(nodes, (key, value: unknown) => {
    if (key === 'id') return undefined
    if (typeof value === 'string') return order.get(value) ?? value
    if (value instanceof Uint8Array) return sha(value)
    return value
  })
  return sha(json)
}

export async function fingerprintFixture(file: string): Promise<PageFingerprint[]> {
  const data = readFileSync(join(FIXTURES, file))
  const graph = await parseFigFile(
    data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength),
    {
      populate: 'all'
    }
  )
  return graph.getPages().map((page) => {
    const nodes = subtree(graph, page)
    const document = sceneGraphToDesignDocument(graph, { rootId: page.id, includeSourceIds: false })
    return {
      name: page.name,
      layers: nodes.length,
      fields: fieldsFingerprint(nodes),
      html: sha(serializeHTML(document))
    }
  })
}

/** The committed fingerprints; `UPDATE_FIG_BASELINES=1` writes them from the current import. */
export function baselineFor(file: string, current: PageFingerprint[]): PageFingerprint[] {
  const path = join(BASELINES, `${file.replace(/\.fig$/, '')}.json`)
  if (process.env.UPDATE_FIG_BASELINES === '1') {
    writeFileSync(path, `${JSON.stringify(current, null, 2)}\n`)
    return current
  }
  if (!existsSync(path)) throw new Error(`No baseline at ${path}; run with UPDATE_FIG_BASELINES=1`)
  return v.parse(
    BaselineSchema,
    v.parse(v.pipe(v.string(), v.parseJson()), readFileSync(path, 'utf8'))
  )
}
