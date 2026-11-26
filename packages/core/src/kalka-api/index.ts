import {
  BEHAVIOUR_CONTRACTS,
  BEHAVIOUR_KINDS,
  type BehaviourKind,
  type BehaviourSpec
} from '@kalka/scene-graph'

import type { FigmaAPI } from '#core/figma-api'

import {
  getBehaviour,
  makeSlot,
  setBehaviour,
  type BehaviourHandle,
  type NodeRef
} from './behaviours'
import {
  addFont,
  documentFontInfo,
  searchFonts,
  type DocumentFontInfo,
  type FontSearchResult
} from './fonts'
import {
  getStrokeDraw,
  setStrokeDraw,
  strokeDrawCatalog,
  type StrokeDraw,
  type StrokeDrawChange
} from './stroke-draw'

export { BehaviourHandle, type NodeRef } from './behaviours'
export type { StrokeDraw, StrokeDrawChange } from './stroke-draw'
export type { DocumentFontInfo, FontSearchResult } from './fonts'

/**
 * What Kalka adds to the Figma Plugin API for scripts, as the `kalka` global next to
 * `figma`: features Figma has no API for, in the same style. It edits the same document as the
 * `figma` it is made for.
 */
export class KalkaAPI {
  constructor(private readonly figma: FigmaAPI) {}

  /** The behaviour kinds, after Reka UI's primitives, with the values and parts each binds. */
  get behaviourKinds() {
    return BEHAVIOUR_KINDS.map((kind) => ({ kind, ...structuredClone(BEHAVIOUR_CONTRACTS[kind]) }))
  }

  /** The behaviour a node's main component keeps, or null; a variant reads its set's. */
  getBehaviour(node: NodeRef): BehaviourHandle | null {
    return getBehaviour(this.figma.graph, node)
  }

  /**
   * Give a main component or component set a behaviour, replacing any it has: a kind alone, or
   * a spec naming its properties and slots, such as
   * `{ kind: 'switch', values: { value: 'State' }, parts: { thumb: 'Thumb' }, states: 'Interaction' }`.
   */
  setBehaviour(node: NodeRef, spec: BehaviourKind | BehaviourSpec): BehaviourHandle {
    return setBehaviour(this.figma.graph, node, spec)
  }

  /** Make a frame of a main component a slot, as Create slot does; returns the slot's name. */
  createSlot(frame: NodeRef): string {
    return makeSlot(this.figma.graph, frame)
  }

  /** The fonts the document carries, saved with it so its text draws the same everywhere. */
  get fonts(): DocumentFontInfo[] {
    return [...this.figma.graph.fonts.values()].map(documentFontInfo)
  }

  /**
   * Open-licence families of the free font catalogue (Google Fonts and Fontsource) whose name
   * holds `query`, the closest first; an empty query lists from the start of the alphabet.
   */
  searchFonts(query: string, options: { limit?: number } = {}): Promise<FontSearchResult[]> {
    return searchFonts(this.figma.graph, query, options.limit)
  }

  /**
   * Downloads an open-licence family into the document with its licence and loads it, so text
   * set in it draws offline and for teammates. Throws, naming close families, when the catalogue
   * has none of that name.
   */
  addFont(family: string): Promise<DocumentFontInfo> {
    return addFont(this.figma.graph, family)
  }

  /** Stops carrying a family; text set in it then draws with what the computer has. */
  removeFont(family: string): boolean {
    return this.figma.graph.removeProjectFont(family)
  }

  /** Kalka's stroke width presets and brushes by type, which `setStrokeDraw` takes by name. */
  get strokeDrawCatalog() {
    return strokeDrawCatalog()
  }

  /** A vector's or line's Figma Draw stroke settings: its width profile and brush. */
  getStrokeDraw(node: NodeRef): StrokeDraw {
    return getStrokeDraw(this.figma.graph, node)
  }

  /**
   * Sets a vector's or line's width profile (a preset such as `'taper'`, points, or null) and
   * brush (`'SCATTER:stars'`, `{ type, id, gap, … }`, or null); a field left out stays.
   */
  setStrokeDraw(node: NodeRef, change: StrokeDrawChange): StrokeDraw {
    return setStrokeDraw(this.figma.graph, node, change)
  }
}
