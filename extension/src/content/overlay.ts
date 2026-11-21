// The inspector drawn over the page: the hovered element's box with its margin and padding,
// its name and size, a panel with its type, colors and layout, the path to it, and, once
// clicked, a bar to copy it. Everything lives in a shadow root, so the page's styles never
// reach it and it never changes the page.
import {
  BREAKPOINTS,
  captureAtWidths,
  isBreakpointKey,
  type BreakpointKey,
  type Emulate
} from './breakpoints'
import { captureElement, type Capture, type CaptureFormat } from './capture'
import { describe, elementLabel } from './describe'
import { inlineFonts } from './fonts'
import { STYLES } from './styles'

const KALKA_BLUE = '#2F5BEA'

function make<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag)
  if (className) element.className = className
  if (text !== undefined) element.textContent = text
  return element
}

function section(title: string, rows: [string, string][]): HTMLElement {
  const block = make('div', 'sec')
  block.append(make('h3', '', title))
  for (const [key, value] of rows) {
    const row = make('div', 'kv')
    row.append(make('span', '', key), make('span', '', value))
    block.append(row)
  }
  return block
}

function swatches(colors: [string, string][]): HTMLElement {
  const block = make('div', 'sec')
  block.append(make('h3', '', 'COLORS'))
  for (const [value, role] of colors) {
    const row = make('div', 'sw')
    const chip = make('i')
    chip.style.background = value.split(' ')[0] ?? value
    row.append(chip, make('span', '', value), make('span', 'role', role))
    block.append(row)
  }
  return block
}

/** What a copy writes to the clipboard, in each format a target can read. */
interface ClipboardContent {
  html?: string
  text: string
}

/**
 * Writes a copy through a copy event, which keeps the HTML as it is. The async clipboard is the
 * fallback: Chrome rewrites the HTML it is given, dropping the `<style>` with the fonts and the
 * `<template>`s that carry the breakpoints.
 */
async function writeClipboard(content: ClipboardContent): Promise<void> {
  let written = false
  const onCopy = (event: ClipboardEvent) => {
    if (!event.clipboardData) return
    event.preventDefault()
    event.stopImmediatePropagation()
    event.clipboardData.setData('text/plain', content.text)
    if (content.html) event.clipboardData.setData('text/html', content.html)
    written = true
  }
  window.addEventListener('copy', onCopy, { capture: true })
  try {
    document.execCommand('copy')
  } finally {
    window.removeEventListener('copy', onCopy, { capture: true })
  }
  if (written) return
  const items: Record<string, Blob> = {
    'text/plain': new Blob([content.text], { type: 'text/plain' })
  }
  if (content.html) items['text/html'] = new Blob([content.html], { type: 'text/html' })
  await navigator.clipboard.write([new ClipboardItem(items)])
}

/** An element's four margin or padding widths in pixels: top, right, bottom, left. */
function edges(
  style: CSSStyleDeclaration,
  kind: 'margin' | 'padding'
): [number, number, number, number] {
  const read = (side: string) => Number.parseFloat(style.getPropertyValue(`${kind}-${side}`)) || 0
  return [read('top'), read('right'), read('bottom'), read('left')]
}

export class Inspector {
  private readonly host = make('div')
  private readonly root: ShadowRoot
  private readonly margin = make('div', 'margin')
  private readonly padding = make('div', 'padding')
  private readonly border = make('div', 'border')
  private readonly label = make('div', 'label')
  private readonly panel = make('aside', 'panel')
  private readonly crumb = make('nav', 'crumb')
  private readonly bar = make('div', 'bar')
  private readonly menu = make('div', 'menu')
  private readonly toast = make('div', 'toast')
  private hovered: Element | null = null
  private locked: Element | null = null
  private toastTimer = 0
  private readonly listeners: [EventTarget, string, EventListener, boolean][] = []
  /** The breakpoints a copy for Kalka also takes, and their buttons. */
  private breakpoints: BreakpointKey[] = []
  private readonly chips = new Map<BreakpointKey, HTMLButtonElement>()

  constructor(
    private format: CaptureFormat,
    private readonly onStop: () => void,
    private readonly widths: {
      /** Shows the page at another width; without it, copies are made at the page's own. */
      emulate?: Emulate
      save?: (keys: BreakpointKey[]) => void
    } = {}
  ) {
    this.host.setAttribute('data-kalka-snapshot', '')
    this.host.style.cssText =
      'all: initial; position: fixed; inset: 0; z-index: 2147483647; pointer-events: none;'
    this.root = this.host.attachShadow({ mode: 'open' })
    const style = make('style', '', STYLES)
    this.root.append(
      style,
      this.margin,
      this.padding,
      this.border,
      this.label,
      this.panel,
      this.crumb,
      this.bar,
      this.menu,
      this.toast
    )
    this.buildBar()
  }

  start(): void {
    document.documentElement.append(this.host)
    this.on(window, 'mousemove', (event) => this.onMove(event as MouseEvent))
    this.on(window, 'pointerdown', (event) => this.swallow(event))
    this.on(window, 'mousedown', (event) => this.swallow(event))
    this.on(window, 'mouseup', (event) => this.swallow(event))
    this.on(window, 'click', (event) => this.onClick(event as MouseEvent))
    this.on(window, 'keydown', (event) => this.onKey(event as KeyboardEvent))
    this.on(window, 'scroll', () => this.draw())
    this.on(window, 'resize', () => this.draw())
    this.showToast('Hover to inspect, click to select. Esc quits.', 2600)
  }

  stop(): void {
    for (const [target, type, listener, capture] of this.listeners)
      target.removeEventListener(type, listener, capture)
    this.listeners.length = 0
    window.clearTimeout(this.toastTimer)
    this.host.remove()
    this.onStop()
  }

  setFormat(format: CaptureFormat): void {
    this.format = format
  }

  setBreakpoints(keys: readonly string[]): void {
    this.breakpoints = keys.filter(isBreakpointKey)
    for (const [key, chip] of this.chips)
      chip.setAttribute('aria-pressed', String(this.breakpoints.includes(key)))
  }

  private toggleBreakpoint(key: BreakpointKey): void {
    const keys = this.breakpoints.includes(key)
      ? this.breakpoints.filter((other) => other !== key)
      : [...this.breakpoints, key]
    this.setBreakpoints(keys)
    this.widths.save?.(this.breakpoints)
  }

  private on(target: EventTarget, type: string, listener: EventListener): void {
    target.addEventListener(type, listener, true)
    this.listeners.push([target, type, listener, true])
  }

  private ours(event: Event): boolean {
    return event.composedPath().includes(this.host)
  }

  /** The page underneath does not see the clicks that select. */
  private swallow(event: Event): void {
    if (this.ours(event)) return
    event.preventDefault()
    event.stopPropagation()
  }

  private onMove(event: MouseEvent): void {
    if (this.locked || this.ours(event)) return
    const target = document.elementFromPoint(event.clientX, event.clientY)
    if (!target || target === this.host || target === document.documentElement) return
    if (target !== this.hovered) {
      this.hovered = target
      this.draw()
    }
  }

  private onClick(event: MouseEvent): void {
    if (this.ours(event)) return
    this.swallow(event)
    this.closeMenu()
    if (this.locked) {
      this.locked = null
      this.onMove(event)
      return
    }
    if (this.hovered) this.select(this.hovered)
  }

  private select(element: Element): void {
    this.locked = element
    this.hovered = element
    this.draw()
  }

  private onKey(event: KeyboardEvent): void {
    const current = this.locked ?? this.hovered
    const command = event.metaKey || event.ctrlKey
    if (event.code === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      if (this.menu.dataset.open === 'true') this.closeMenu()
      else if (this.locked) {
        this.locked = null
        this.draw()
      } else this.stop()
      return
    }
    if (!current) return
    const moves: Record<string, () => Element | null> = {
      ArrowUp: () => (current.parentElement === document.body ? null : current.parentElement),
      ArrowDown: () => current.firstElementChild,
      ArrowLeft: () => current.previousElementSibling,
      ArrowRight: () => current.nextElementSibling
    }
    const move = moves[event.code]
    if (move) {
      event.preventDefault()
      event.stopPropagation()
      const next = move()
      if (next && next !== this.host) this.select(next)
      return
    }
    if (event.code === 'Enter' || (command && event.code === 'KeyC')) {
      event.preventDefault()
      event.stopPropagation()
      this.select(current)
      void this.copy(event.altKey ? 'html' : this.format)
    }
  }

  private buildBar(): void {
    const copy = make('button', 'go')
    copy.type = 'button'
    copy.append(make('span', '', 'Copy for Kalka'), make('span', 'k', '⌘C'))
    copy.addEventListener('click', () => void this.copy('kalka'))
    const more = make('button', '', '▾')
    more.type = 'button'
    more.setAttribute('aria-label', 'More ways to copy')
    more.addEventListener('click', () => this.toggleMenu())
    const parent = make('button')
    parent.type = 'button'
    parent.append(make('span', 'k', '↑'), make('span', '', 'Parent'))
    parent.addEventListener('click', () => {
      const up = this.locked?.parentElement
      if (up && up !== document.body) this.select(up)
    })
    const quit = make('button')
    quit.type = 'button'
    quit.setAttribute('aria-label', 'Quit')
    quit.append(make('span', 'k', 'Esc'))
    quit.addEventListener('click', () => this.stop())
    this.bar.append(copy, more)
    if (this.widths.emulate) {
      // Breakpoints the copy for Kalka also takes, each pasted as a breakpoint of the artboard.
      this.bar.append(make('span', 'sep'))
      for (const { key, name, width } of BREAKPOINTS) {
        const chip = make('button', 'chip', name)
        chip.type = 'button'
        chip.title = `Also copy at ${width} px, as a ${name.toLowerCase()} breakpoint`
        chip.setAttribute('aria-pressed', 'false')
        chip.addEventListener('click', () => this.toggleBreakpoint(key))
        this.chips.set(key, chip)
        this.bar.append(chip)
      }
    }
    this.bar.append(make('span', 'sep'), parent, quit)

    const items: [string, string, () => void][] = [
      ['HTML and CSS', '⌥⌘C', () => void this.copy('html')],
      ['CSS of this element', '', () => void this.copyCSS()],
      ['Text only', '', () => void this.copyText()]
    ]
    for (const [text, keys, run] of items) {
      const item = make('button')
      item.type = 'button'
      item.append(make('span', '', text), make('small', '', keys))
      item.addEventListener('click', () => {
        this.closeMenu()
        run()
      })
      this.menu.append(item)
    }
  }

  private toggleMenu(): void {
    this.menu.dataset.open = this.menu.dataset.open === 'true' ? 'false' : 'true'
    this.draw()
  }

  private closeMenu(): void {
    this.menu.dataset.open = 'false'
  }

  /** A copy at the page's width, and at the chosen breakpoints for Kalka when it can. */
  private async captureFor(
    element: Element,
    format: CaptureFormat
  ): Promise<{ capture: Capture; widths: number[] }> {
    const emulate = this.widths.emulate
    if (format !== 'kalka' || !emulate || this.breakpoints.length === 0)
      return { capture: captureElement(element, format), widths: [] }
    // The inspector stays out of sight while the page is shown at other widths.
    this.host.style.visibility = 'hidden'
    try {
      return await captureAtWidths(element, this.breakpoints, emulate)
    } catch {
      this.showToast('Other widths could not be shown; copying at this width only.', 0)
      return { capture: captureElement(element, format), widths: [] }
    } finally {
      this.host.style.visibility = ''
      this.draw()
    }
  }

  private async copy(format: CaptureFormat): Promise<void> {
    const element = this.locked
    if (!element) return
    this.showToast(`Capturing ${elementLabel(element)}…`, 0)
    const { capture, widths } = await this.captureFor(element, format)
    const html = await inlineFonts(capture.html)
    await writeClipboard({ html, text: html })
    const what = [
      `${capture.layers} layer${capture.layers === 1 ? '' : 's'}`,
      `${capture.images} image${capture.images === 1 ? '' : 's'}`,
      `${capture.fonts.length} font${capture.fonts.length === 1 ? '' : 's'}`
    ].join(', ')
    const at = widths.length > 0 ? ` with breakpoints at ${widths.join(' and ')} px` : ''
    const tail =
      format === 'kalka'
        ? 'Paste it into any Kalka file with ⌘V.'
        : 'Paste it into any editor as HTML and CSS.'
    const replaced = capture.replaced
      ? ` ${capture.replaced} part${capture.replaced === 1 ? '' : 's'} from other sites kept as placeholders.`
      : ''
    this.showToast(`Copied ${what}${at}. ${tail}${replaced}`, 5000, true)
  }

  private async copyCSS(): Promise<void> {
    if (!this.locked) return
    const capture = captureElement(this.locked, 'html')
    const css = /\.k1 \{ ([^}]*) \}/.exec(capture.html)?.[1] ?? ''
    await writeClipboard({ text: css.split('; ').join(';\n') + ';' })
    this.showToast('Copied the CSS of this element.', 3000, true)
  }

  private async copyText(): Promise<void> {
    if (!(this.locked instanceof HTMLElement)) return
    await writeClipboard({ text: this.locked.innerText })
    this.showToast('Copied the text.', 3000, true)
  }

  private showToast(message: string, duration: number, done = false): void {
    window.clearTimeout(this.toastTimer)
    this.toast.textContent = message
    this.toast.dataset.done = String(done)
    this.toast.dataset.open = 'true'
    if (duration > 0) {
      this.toastTimer = window.setTimeout(() => {
        this.toast.dataset.open = 'false'
      }, duration)
    }
  }

  /** Draws the margin, border and padding boxes around an element and returns its box. */
  private drawBoxes(element: Element): DOMRect {
    const box = element.getBoundingClientRect()
    const style = getComputedStyle(element)
    const [mt, mr, mb, ml] = edges(style, 'margin')
    const [pt, pr, pb, pl] = edges(style, 'padding')
    // Margins and padding are drawn as borders, so the element itself stays readable.
    Object.assign(this.margin.style, {
      left: `${box.left - ml}px`,
      top: `${box.top - mt}px`,
      width: `${box.width + ml + mr}px`,
      height: `${box.height + mt + mb}px`,
      borderWidth: `${mt}px ${mr}px ${mb}px ${ml}px`
    })
    const frame = {
      left: `${box.left}px`,
      top: `${box.top}px`,
      width: `${box.width}px`,
      height: `${box.height}px`
    }
    Object.assign(this.border.style, { ...frame, borderColor: KALKA_BLUE })
    Object.assign(this.padding.style, { ...frame, borderWidth: `${pt}px ${pr}px ${pb}px ${pl}px` })
    return box
  }

  private draw(): void {
    const element = this.locked ?? this.hovered
    const visible = Boolean(element)
    for (const part of [
      this.margin,
      this.padding,
      this.border,
      this.label,
      this.panel,
      this.crumb
    ]) {
      part.dataset.open = String(visible)
    }
    this.bar.dataset.open = String(Boolean(this.locked))
    for (const { key, width } of BREAKPOINTS) {
      const chip = this.chips.get(key)
      if (chip) chip.hidden = width >= window.innerWidth
    }
    if (!this.locked) this.closeMenu()
    if (!element) return

    const box = this.drawBoxes(element)
    this.border.dataset.locked = String(Boolean(this.locked))

    const info = describe(element)
    this.label.textContent = ''
    this.label.append(make('span', '', info.label), make('span', 'dim', info.size))
    const labelBelow = box.top - 30 < 4
    const labelTop = labelBelow ? Math.min(box.bottom + 6, window.innerHeight - 70) : box.top - 30
    Object.assign(this.label.style, { left: `${Math.max(4, box.left)}px`, top: `${labelTop}px` })

    this.panel.textContent = ''
    const head = make('div', 'head')
    head.append(
      make('b', '', info.label),
      make('span', 'dim', this.locked ? 'Selected' : 'Click to select')
    )
    this.panel.append(
      head,
      section('TYPOGRAPHY', info.typography),
      swatches(info.colors),
      section('LAYOUT', info.layout),
      section('INSIDE', info.inside)
    )

    this.crumb.textContent = ''
    const path: Element[] = []
    for (
      let node: Element | null = element;
      node && node !== document.documentElement;
      node = node.parentElement
    ) {
      path.unshift(node)
    }
    for (const [index, node] of path.entries()) {
      if (index > 0) this.crumb.append(make('span', 'dim', '›'))
      const step = make('button', node === element ? 'on' : '', elementLabel(node))
      step.type = 'button'
      step.addEventListener('click', () => this.select(node))
      this.crumb.append(step)
    }
    this.crumb.append(make('span', 'keys', '↑ parent  ↓ child  ← → siblings  Esc quit'))

    if (this.locked) {
      // Under the element, after the label when the label sits there too; above it near the bottom.
      const offset = labelBelow ? 36 : 12
      const below = box.bottom + offset + 48 < window.innerHeight - 50
      const top = below ? box.bottom + offset : Math.max(8, box.top - (labelBelow ? 56 : 90))
      Object.assign(this.bar.style, { left: `${Math.max(8, box.left)}px`, top: `${top}px` })
      Object.assign(this.menu.style, {
        left: `${Math.max(8, box.left) + 120}px`,
        top: `${top + 48}px`
      })
    }
  }
}
