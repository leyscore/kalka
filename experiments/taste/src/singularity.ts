/**
 * The singularity score: how far a draft sits from the page a model draws when nobody directs
 * it. The reference population is the "plain" condition (same briefs, bare prompt, two models),
 * always leaving out the pages of the brief being scored, so a draft is never compared with a
 * page about its own subject. Two views are combined: the style vector read from the DOM, and a
 * CLIP embedding of the first screen. No label and no judge is involved.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import * as v from 'valibot'

import type { Surface } from './genome'
import { RUNS_DIR } from './llm'

const Metrics = v.object({ vector: v.array(v.number()) })
const Embeddings = v.record(v.string(), v.array(v.number()))

export type Member = { brief: string; surface: Surface; vector: number[]; embedding: number[] | null }

export function loadEmbeddings(): Record<string, number[]> {
  const file = join(RUNS_DIR, 'embeddings.json')
  if (!existsSync(file)) return {}
  const parsed = v.safeParse(v.pipe(v.string(), v.parseJson(), Embeddings), readFileSync(file, 'utf8'))
  return parsed.success ? parsed.output : {}
}

export function loadPopulation(briefs: { id: string; surface: Surface }[]): Member[] {
  const embeddings = loadEmbeddings()
  const members: Member[] = []
  for (const brief of briefs) {
    const dir = join(RUNS_DIR, brief.id)
    if (!existsSync(dir)) continue
    for (const name of readdirSync(dir).filter((entry) => entry.startsWith('plain-'))) {
      const file = join(dir, name, 'metrics.json')
      if (!existsSync(file)) continue
      const parsed = v.safeParse(v.pipe(v.string(), v.parseJson(), Metrics), readFileSync(file, 'utf8'))
      if (!parsed.success) continue
      members.push({
        brief: brief.id,
        surface: brief.surface,
        vector: parsed.output.vector,
        embedding: embeddings[join(dir, name, 'fold.jpg')] ?? null
      })
    }
  }
  return members
}

const mean = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1)
const deviation = (values: number[]) => {
  const centre = mean(values)
  return Math.sqrt(mean(values.map((value) => (value - centre) ** 2)))
}
const cosineDistance = (a: number[], b: number[]) => {
  let dot = 0
  let na = 0
  let nb = 0
  for (let index = 0; index < a.length; index++) {
    dot += a[index] * b[index]
    na += a[index] ** 2
    nb += b[index] ** 2
  }
  return 1 - dot / (Math.sqrt(na * nb) || 1)
}
function centroid(vectors: number[][]): number[] {
  return vectors[0].map((_, index) => mean(vectors.map((vector) => vector[index])))
}

export type Singularity = { dom: number; clip: number | null; clipDistance: number | null; score: number }

/** Mean capped z-distance on the style vector, 0 (the average page) to 100 (far on every axis). */
export function domDistance(vector: number[], reference: number[][], scale: number[][]): number {
  if (reference.length < 3) return 0
  const parts = vector.map((value, index) => {
    const centre = mean(reference.map((member) => member[index]))
    // The spread comes from every plain page: a surface with few pages has no stable spread of its own.
    const spread = deviation(scale.map((member) => member[index])) || 1
    return Math.min(Math.abs(value - centre) / spread, 3)
  })
  return (100 * mean(parts)) / 3
}

export function singularity(
  draft: { brief: string; surface: Surface; vector: number[]; embedding: number[] | null },
  population: Member[]
): Singularity {
  const reference = population.filter((member) => member.surface === draft.surface && member.brief !== draft.brief)
  const dom = domDistance(
    draft.vector,
    reference.map((member) => member.vector),
    population.map((member) => member.vector)
  )
  const embedded = reference.flatMap((member) => (member.embedding ? [member.embedding] : []))
  if (!draft.embedding || embedded.length < 3) return { dom, clip: null, clipDistance: null, score: dom }
  const centre = centroid(embedded)
  const own = cosineDistance(draft.embedding, centre)
  // How far plain pages themselves sit from a centroid they are not part of.
  const spread = embedded.map((vector, index) =>
    cosineDistance(vector, centroid(embedded.filter((_, other) => other !== index)))
  )
  const z = (own - mean(spread)) / (deviation(spread) || 1)
  const clip = Math.max(0, Math.min(100, 50 + 15 * z))
  return { dom, clip, clipDistance: own, score: 0.5 * dom + 0.5 * clip }
}

/** Mean pairwise distance inside a set of drafts: the diversity of what a condition produces. */
export function spread(vectors: number[][], scale: number[][]): number {
  if (vectors.length < 2) return 0
  const deviations = scale[0].map((_, index) => deviation(scale.map((member) => member[index])) || 1)
  const distances: number[] = []
  for (let a = 0; a < vectors.length; a++)
    for (let b = a + 1; b < vectors.length; b++)
      distances.push(mean(vectors[a].map((value, index) => Math.min(Math.abs(value - vectors[b][index]) / deviations[index], 3))))
  return mean(distances)
}

export function embeddingSpread(vectors: number[][]): number {
  const distances: number[] = []
  for (let a = 0; a < vectors.length; a++)
    for (let b = a + 1; b < vectors.length; b++) distances.push(cosineDistance(vectors[a], vectors[b]))
  return mean(distances)
}
