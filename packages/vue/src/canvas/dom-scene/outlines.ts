import type { EditorState } from '@kalka/core/editor'
import { LAYER_ID_ATTR } from '@kalka/dom-css/export'
import type { SceneGraph } from '@kalka/scene-graph'

import { HAIRLINE_SCALE } from './device-scale'

const OUTLINES_STYLE_ATTR = 'data-kalka-outlines'
const NODE_ATTR = LAYER_ID_ATTR
/** What the projection marks a text layer's element with. */
const TEXT_ATTR = 'data-kalka-text'
const INK = '#000'

/** What outline mode draws: every layer or the selection, and text boxes or only their glyphs. */
export interface OutlineView {
  /** The layers outlined with all they hold; every layer when null. */
  selection: ReadonlySet<string> | null
  /** Text boxes are outlined too, as Figma's object bounds. */
  objectBounds: boolean
  /** Device pixels per CSS pixel of the screen, so a line is one screen pixel wide. */
  pixelRatio: number
}

/** A layer's element; the id is quoted, so only quotes and backslashes need escaping. */
function nodeSelector(id: string): string {
  return `[${NODE_ATTR}="${id.replaceAll(/["\\]/g, '\\$&')}"]`
}

/**
 * The stylesheet that draws an artboard in Figma's outline mode: no fills, strokes, effects or
 * images, each layer a line one screen pixel wide along its edge, text as the outline of its
 * glyphs and vectors as their paths. The browser still lays everything out, so the outlines are
 * where the layers are. Empty when the artboard holds none of the outlined layers.
 */
export function outlineCSS(graph: SceneGraph, artboardId: string, view: OutlineView): string {
  const roots = view.selection
    ? [...view.selection].filter((id) => graph.closest(id, (node) => node.id === artboardId))
    : null
  if (roots?.length === 0) return ''
  const scope = roots
    ? roots.flatMap((id) => [nodeSelector(id), `${nodeSelector(id)} [${NODE_ATTR}]`]).join(',')
    : `[${NODE_ATTR}]`
  const inner = roots ? roots.map((id) => `${nodeSelector(id)} *`).join(',') : `[${NODE_ATTR}] *`
  const width = `calc(${view.pixelRatio}px / ${HAIRLINE_SCALE})`
  const rules = [
    `:is(${scope}){outline:${width} solid ${INK}!important;outline-offset:calc(-1 * ${width})!important}`,
    // What paints goes; the boxes keep their sizes, so borders stay and turn transparent.
    `:is(${scope}),:is(${inner}){background:none!important;box-shadow:none!important;filter:none!important;backdrop-filter:none!important;mix-blend-mode:normal!important;opacity:1!important;text-shadow:none!important;border-color:transparent!important;mask:none!important;-webkit-mask:none!important;color:transparent!important;-webkit-text-stroke:${width} ${INK}!important;text-decoration-color:${INK}!important}`,
    `:is(${scope},${inner}):is(path,rect,circle,ellipse,line,polyline,polygon,text,use){fill:none!important;stroke:${INK}!important;stroke-width:${width}!important;vector-effect:non-scaling-stroke}`,
    `:is(${scope},${inner}):is(img,video){object-position:-100000px -100000px!important}`,
    `:is(${scope},${inner}):is(canvas){visibility:hidden!important}`
  ]
  // Text shows its glyphs; its box only as Figma's object bounds.
  if (!view.objectBounds) rules.push(`:is(${scope})[${TEXT_ATTR}]{outline:none!important}`)
  return rules.join('\n')
}

/** Replaces the outline stylesheet of an artboard document; an empty one removes it. */
export function setArtboardOutlines(doc: Document, css: string): void {
  let style = doc.head.querySelector<HTMLStyleElement>(`style[${OUTLINES_STYLE_ATTR}]`)
  if (!css) {
    style?.remove()
    return
  }
  if (!style) {
    style = doc.createElement('style')
    style.setAttribute(OUTLINES_STYLE_ATTR, '')
    doc.head.append(style)
  }
  if (style.textContent !== css) style.textContent = css
}

/** The outline view a pane's state asks for, or null when outline mode is off. */
export function outlineView(state: EditorState, pixelRatio: number): OutlineView | null {
  if (!state.outlineMode || state.play) return null
  return {
    selection: state.outlineMode === 'selection' ? state.selectedIds : null,
    objectBounds: state.outlineObjectBounds === true,
    pixelRatio
  }
}

/**
 * What an outline view depends on, to restyle the artboards only when it changes: outlines of
 * the selection also follow the scene, which decides the artboards the selection sits in.
 */
export function outlineKey(view: OutlineView | null, sceneVersion: number): string {
  if (!view) return ''
  const selection = view.selection ? `${[...view.selection].join(',')}@${sceneVersion}` : '*'
  return `${selection}|${view.objectBounds}|${view.pixelRatio}`
}
