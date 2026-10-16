import { DesignTokens, tokenStylesheet } from '@kalka/dom-css/export'
import type { SceneGraph } from '@kalka/scene-graph'

/** What the variables stylesheet and the names in layer styles depend on. */
function variablesFingerprint(graph: SceneGraph): string {
  return JSON.stringify([[...graph.variables.values()], [...graph.variableCollections.values()]])
}

/**
 * The document's variables as real CSS custom properties on the canvas. Layers are projected
 * with `var(--name)` through {@link references}; each artboard carries the stylesheet that
 * defines them, every mode included, so a variable edit restyles every layer that uses it.
 */
export class CanvasTokens {
  references: DesignTokens
  #fingerprint = ''
  #names = ''
  #generation = 0

  constructor(
    private readonly getGraph: () => SceneGraph,
    private readonly onStylesheet: (css: string) => void,
    /** Layers name variables in their CSS, so a renamed one re-projects them. */
    private readonly onRenamed: () => void
  ) {
    this.references = new DesignTokens(getGraph())
  }

  /** Rebuilds the references and the stylesheet when the variables changed. */
  sync(): void {
    const graph = this.getGraph()
    const fingerprint = variablesFingerprint(graph)
    if (fingerprint === this.#fingerprint) return
    this.#fingerprint = fingerprint
    this.references = new DesignTokens(graph)
    const names = JSON.stringify([...this.references.names])
    const renamed = this.#names !== '' && names !== this.#names
    this.#names = names
    if (renamed) this.onRenamed()
    void this.#applyStylesheet(graph, ++this.#generation)
  }

  async #applyStylesheet(graph: SceneGraph, generation: number): Promise<void> {
    const { css } = await tokenStylesheet(graph, { format: 'css' })
    // A later change already asked for a newer stylesheet.
    if (generation === this.#generation) this.onStylesheet(css)
  }
}
