// The inspector's panel: a header to drag it or dock it along the right edge, and a body that
// shows the hovered element or, while nothing is hovered, a summary of the page.
import { icon, make } from './dom'
import { readOverview, type Overview } from './overview'

/** The gap the floating panel keeps from the window's edges. */
const EDGE = 12

/** Where the panel sits: docked along the right edge, or floating at a point once dragged. */
export interface PanelLayout {
  docked: boolean
  left?: number
  top?: number
}

/** The file name an image address ends with, for its tooltip. */
function imageName(address: string): string {
  if (address.startsWith('data:')) return 'Embedded image'
  try {
    return decodeURIComponent(new URL(address).pathname.split('/').pop() ?? '') || address
  } catch {
    return address
  }
}

export class Panel {
  readonly element = make('aside', 'panel')
  readonly body = make('div', 'body')
  private readonly dock = make('button', 'icon')
  private layout: PanelLayout = { docked: false }
  private overview: Overview | null = null
  /** Whether the body shows the page summary now, so scrolling does not redraw it. */
  private showingOverview = false

  constructor(
    /** The path along the bottom, kept clear of the docked panel. */
    private readonly crumb: HTMLElement,
    private readonly actions: {
      close: () => void
      copy: (value: string) => void
      /** Remembers where the panel sits for the next time the inspector opens. */
      saveLayout?: (layout: PanelLayout) => void
    }
  ) {
    this.build()
  }

  setLayout(layout: PanelLayout): void {
    this.layout = layout
    this.place()
  }

  /** Shows the page summary, unless it is already showing. */
  showOverview(): void {
    if (!this.showingOverview) this.renderOverview()
    this.showingOverview = true
  }

  /** Empties the body for the hovered element's details. */
  clear(): void {
    this.showingOverview = false
    this.body.textContent = ''
  }

  private build(): void {
    const top = make('div', 'top')
    const grip = make('span', 'grip')
    grip.append(icon('M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01'))
    grip.title = 'Drag to move'
    const title = make('span', 'title', 'Kalka Snapshot')
    this.dock.type = 'button'
    this.dock.append(icon('M4 5h16v14H4z', 'M15 5v14'))
    this.dock.addEventListener('click', () => {
      this.layout = { ...this.layout, docked: !this.layout.docked }
      this.place()
      this.actions.saveLayout?.(this.layout)
    })
    const close = make('button', 'icon')
    close.type = 'button'
    close.setAttribute('aria-label', 'Quit')
    close.title = 'Quit (Esc)'
    close.append(icon('M18 6 6 18', 'M6 6l12 12'))
    close.addEventListener('click', () => this.actions.close())
    top.append(grip, title, this.dock, close)
    this.element.append(top, this.body)

    // Dragging the top of the floating panel moves it; the buttons there keep their clicks.
    let from: { x: number; y: number; left: number; top: number } | null = null
    top.addEventListener('pointerdown', (event) => {
      if (this.layout.docked || (event.target as Element).closest('button')) return
      const box = this.element.getBoundingClientRect()
      from = { x: event.clientX, y: event.clientY, left: box.left, top: box.top }
      top.setPointerCapture(event.pointerId)
      event.preventDefault()
    })
    top.addEventListener('pointermove', (event) => {
      if (!from) return
      this.layout = {
        docked: false,
        left: from.left + event.clientX - from.x,
        top: from.top + event.clientY - from.y
      }
      this.place()
    })
    const drop = () => {
      if (!from) return
      from = null
      this.actions.saveLayout?.(this.layout)
    }
    top.addEventListener('pointerup', drop)
    top.addEventListener('pointercancel', drop)
  }

  /** Puts the panel where its layout says, kept inside the window. */
  place(): void {
    const { docked } = this.layout
    this.element.dataset.docked = String(docked)
    const label = docked ? 'Float the panel' : 'Dock the panel to the side'
    this.dock.setAttribute('aria-label', label)
    this.dock.title = label
    this.dock.setAttribute('aria-pressed', String(docked))
    if (docked || this.layout.left === undefined || this.layout.top === undefined) {
      Object.assign(this.element.style, { left: '', top: '', right: '', maxHeight: '' })
    } else {
      const width = this.element.offsetWidth || 300
      const left = Math.min(Math.max(EDGE, this.layout.left), window.innerWidth - width - EDGE)
      const top = Math.min(Math.max(EDGE, this.layout.top), window.innerHeight - 60)
      Object.assign(this.element.style, {
        left: `${left}px`,
        top: `${top}px`,
        right: 'auto',
        maxHeight: `${Math.max(160, window.innerHeight - top - 56)}px`
      })
    }
    // The path runs the window's width, short of the docked panel.
    this.crumb.style.right = docked ? `${this.element.offsetWidth + EDGE}px` : ''
  }

  private renderOverview(): void {
    this.overview ??= readOverview()
    const { title, address, image, headings, body, colors, images } = this.overview
    this.body.textContent = ''
    const page = make('div', 'sec page')
    if (image) {
      const preview = make('img', 'preview')
      preview.alt = ''
      preview.src = image
      preview.addEventListener('error', () => preview.remove())
      page.append(preview)
    }
    page.append(make('b', '', title), make('span', 'dim', address))
    const hint = make('div', 'sec hint')
    hint.append(make('span', '', 'Hover an element to inspect it, click it to copy it into Kalka.'))
    this.body.append(page, hint)

    const fonts: [string, string | null][] = [
      ['Headings', headings],
      ['Text', body]
    ]
    const type = make('div', 'sec')
    type.append(make('h3', '', 'TYPEFACES'))
    for (const [role, family] of fonts) {
      if (!family) continue
      const row = this.copyable(role, family, family)
      // The name in its own typeface, the way the page draws it.
      const name = row.lastElementChild
      if (name instanceof HTMLElement) {
        name.className = 'face'
        name.style.fontFamily = `"${family.replace(/"/g, '')}", ui-sans-serif, system-ui, sans-serif`
      }
      type.append(row)
    }
    this.body.append(type)

    if (colors.length > 0) {
      const palette = make('div', 'sec')
      palette.append(make('h3', '', 'COLORS'))
      const grid = make('div', 'palette')
      for (const color of colors) {
        const chip = make('button', 'chip-color')
        chip.type = 'button'
        chip.style.background = color
        chip.title = `${color}, click to copy`
        chip.setAttribute('aria-label', `Copy ${color}`)
        chip.addEventListener('click', () => this.actions.copy(color))
        grid.append(chip)
      }
      palette.append(grid)
      this.body.append(palette)
    }

    if (images.length > 0) {
      const gallery = make('div', 'sec')
      gallery.append(make('h3', '', `IMAGES (${images.length})`))
      const grid = make('div', 'gallery')
      for (const address of images) {
        // Opens the image at full size in a new tab, where Chrome can save it.
        const link = make('a', 'thumb')
        link.href = address
        link.target = '_blank'
        link.rel = 'noopener noreferrer'
        const name = imageName(address)
        link.title = `${name}, click to open`
        const thumb = make('img')
        thumb.alt = name
        thumb.loading = 'lazy'
        thumb.src = address
        thumb.addEventListener('error', () => link.remove())
        link.append(thumb)
        grid.append(link)
      }
      gallery.append(grid)
      this.body.append(gallery)
    }
  }

  /** A row whose value is copied when it is clicked. */
  private copyable(key: string, shown: string, value: string): HTMLButtonElement {
    const row = make('button', 'kv copy')
    row.type = 'button'
    row.title = 'Click to copy'
    row.append(make('span', '', key), make('span', '', shown))
    row.addEventListener('click', () => this.actions.copy(value))
    return row
  }
}
