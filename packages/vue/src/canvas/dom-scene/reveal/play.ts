import type { DomSceneProjector } from '#vue/canvas/dom-scene/projector'
import type { RevealStep } from '#vue/canvas/dom-scene/reveal/plan'

/** A step whose layer is not drawn yet, such as a new artboard still loading, waits this long. */
const PENDING_TIMEOUT_MS = 1000
/**
 * A new layer stays hidden at most this long waiting for its reveal. The hiding is an animation
 * that ends by itself then, so nothing stays hidden whatever happens to the reveal.
 */
export const HOLD_TIMEOUT_MS = 4000
/** The highlight that hides characters not typed yet, in each artboard document. */
const UNWRITTEN_HIGHLIGHT = 'kalka-unwritten'
const UNWRITTEN_STYLE_ATTR = 'data-kalka-unwritten'
const APPEAR_EASING = 'cubic-bezier(0.2, 0, 0, 1)'

interface Pending {
  step: RevealStep
  /** When the step starts, on the `performance.now()` clock. */
  start: number
}

interface Typing {
  element: Element
  texts: Text[]
  total: number
  range: Range
  highlight: Highlight
  start: number
  duration: number
}

/** A new layer kept hidden until its reveal starts. */
interface Hold {
  /** When it shows anyway, on the `performance.now()` clock. */
  until: number
  element: Element | null
  animation: Animation | null
}

type HighlightScope = Window & typeof globalThis

/** The artboard document's highlight registry, where the browser supports it. */
function highlightScope(element: Element): HighlightScope | null {
  const view = element.ownerDocument.defaultView
  if (!view) return null
  const scope = view as HighlightScope
  // Older engines lack the Custom Highlight API: text there is wiped in instead.
  return typeof scope.Highlight === 'function' && 'highlights' in scope.CSS ? scope : null
}

/** Text nodes come from the artboard's own realm, so `instanceof Text` would not match them. */
function isText(node: Node): node is Text {
  return node.nodeType === Node.TEXT_NODE
}

function textNodes(element: Element): Text[] {
  const walker = element.ownerDocument.createTreeWalker(element, NodeFilter.SHOW_TEXT)
  const nodes: Text[] = []
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (isText(node)) nodes.push(node)
  }
  return nodes
}

/**
 * Replays agent edits on the DOM scene: layers appear, text types itself out. Everything is
 * done with animations and highlights on the drawn elements; no layer, text, or geometry
 * changes, so layout reads back exactly what the document holds.
 */
export class RevealPlayer {
  private pending: Pending[] = []
  private readonly typing = new Set<Typing>()
  private readonly held = new Map<string, Hold>()

  constructor(private readonly projector: DomSceneProjector) {}

  get busy(): boolean {
    return this.pending.length > 0 || this.typing.size > 0 || this.held.size > 0
  }

  /** Layers kept hidden now, until their reveal starts or they are released. */
  get holding(): ReadonlySet<string> {
    return new Set(this.held.keys())
  }

  /**
   * Keeps new layers hidden from the moment they are drawn, so an edit's layers do not show
   * before their reveal plays them in. Each shows by itself after `HOLD_TIMEOUT_MS`.
   */
  hold(ids: Iterable<string>, now = performance.now()): void {
    for (const id of ids) {
      if (!this.held.has(id))
        this.held.set(id, { until: now + HOLD_TIMEOUT_MS, element: null, animation: null })
    }
  }

  /** Shows held layers now: those named, or all of them, as when the page changes. */
  release(ids?: Iterable<string>): void {
    for (const id of ids ?? [...this.held.keys()]) {
      this.held.get(id)?.animation?.cancel()
      this.held.delete(id)
    }
  }

  play(steps: readonly RevealStep[], now = performance.now()): void {
    for (const step of steps) this.pending.push({ step, start: now + step.delay })
  }

  /** Hides held layers, starts steps whose layers are drawn now and advances typing; call after each flush. */
  tick(now = performance.now()): void {
    if (this.held.size > 0) this.keepHidden(now)
    if (this.pending.length > 0) {
      this.pending = this.pending.filter((entry) => {
        const element = this.projector.elementOf(entry.step.id)
        if (!element?.isConnected) {
          if (now - entry.start < PENDING_TIMEOUT_MS) return true
          // Never drawn in time, such as on a page nobody looks at: it simply shows.
          this.release([entry.step.id])
          return false
        }
        this.begin(element, entry, now)
        return false
      })
    }
    for (const typing of this.typing) this.advance(typing, now)
  }

  destroy(): void {
    for (const typing of this.typing) this.finishTyping(typing)
    this.pending = []
    this.release()
  }

  /** Hides each held layer as it is drawn, again when it is redrawn as a new element. */
  private keepHidden(now: number): void {
    for (const [id, hold] of this.held) {
      if (now >= hold.until) {
        this.release([id])
        continue
      }
      const element = this.projector.elementOf(id)
      if (!element?.isConnected || element === hold.element) continue
      hold.animation?.cancel()
      hold.element = element
      // Without fill the hiding lasts only while it runs, so it ends by itself at `until`.
      hold.animation = element.animate([{ opacity: 0 }, { opacity: 0 }], {
        duration: hold.until - now
      })
    }
  }

  private begin(element: Element, { step, start }: Pending, now: number): void {
    // Shown again before reading its style, so the reveal fades it to its real opacity.
    this.release([step.id])
    const delay = Math.max(0, start - now)
    if (step.kind === 'type' && this.beginTyping(element, step, now + delay)) return
    this.appear(element, step, delay, step.kind === 'type')
  }

  /** Fades and wipes the layer in, or only wipes text where it cannot type. */
  private appear(element: Element, step: RevealStep, delay: number, wipeOnly: boolean): void {
    const style = element.ownerDocument.defaultView?.getComputedStyle(element)
    // A layer clipped by its own shape keeps that clip; it only fades in.
    const clips = style && style.clipPath !== 'none' && style.clipPath !== ''
    const opacity = style?.opacity ?? '1'
    const keyframes: Keyframe[] = wipeOnly
      ? [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }]
      : [
          { opacity: 0, ...(clips ? {} : { clipPath: 'inset(0 100% 0 0)' }) },
          { opacity, ...(clips ? {} : { clipPath: 'inset(0 0 0 0)' }) }
        ]
    element.animate(keyframes, {
      duration: step.duration,
      delay,
      easing: wipeOnly ? 'linear' : APPEAR_EASING,
      fill: 'backwards'
    })
  }

  private beginTyping(element: Element, step: RevealStep, start: number): boolean {
    const scope = highlightScope(element)
    const texts = textNodes(element)
    const total = texts.reduce((sum, text) => sum + text.length, 0)
    const first = texts.at(0)
    const last = texts.at(-1)
    if (!scope || !first || !last || total === 0) return false
    const doc = element.ownerDocument
    if (!doc.head.querySelector(`style[${UNWRITTEN_STYLE_ATTR}]`)) {
      const sheet = doc.createElement('style')
      sheet.setAttribute(UNWRITTEN_STYLE_ATTR, '')
      sheet.textContent = `::highlight(${UNWRITTEN_HIGHLIGHT}){color:transparent;text-decoration-color:transparent;text-shadow:none}`
      doc.head.append(sheet)
    }
    let highlight = scope.CSS.highlights.get(UNWRITTEN_HIGHLIGHT)
    if (!highlight) {
      highlight = new scope.Highlight()
      scope.CSS.highlights.set(UNWRITTEN_HIGHLIGHT, highlight)
    }
    const range = doc.createRange()
    range.setStart(first, 0)
    range.setEnd(last, last.length)
    highlight.add(range)
    this.typing.add({
      element,
      texts,
      total,
      range,
      highlight,
      start,
      duration: step.duration
    })
    return true
  }

  /** Moves the hidden range past the characters typed by now. */
  private advance(typing: Typing, now: number): void {
    const { texts, total, range, element } = typing
    const last = texts.at(-1)
    // Rebuilt by the projector meanwhile: the new text shows whole.
    if (!last || !element.isConnected || !texts.every((text) => element.contains(text))) {
      this.finishTyping(typing)
      return
    }
    const t = (now - typing.start) / typing.duration
    if (t >= 1) {
      this.finishTyping(typing)
      return
    }
    let remaining = Math.max(0, Math.floor(total * t))
    for (const text of texts) {
      if (remaining <= text.length) {
        range.setStart(text, remaining)
        break
      }
      remaining -= text.length
    }
  }

  private finishTyping(typing: Typing): void {
    typing.highlight.delete(typing.range)
    this.typing.delete(typing)
  }
}
