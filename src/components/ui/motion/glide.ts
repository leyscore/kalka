/**
 * A pill that glides between the items of a list instead of each item lighting up on its own:
 * hover highlights that follow the pointer, and active pills that slide to the chosen item. It
 * sits under the items (see `[data-glide]` in `app.css`) and moves with transforms, so the items
 * never re-render. Reduced motion places it without animating.
 */
export interface GlideOptions {
  /** The items the pill can rest on. */
  items: string
  /** The item it rests on when nothing is hovered, such as the active tab. */
  active?: string
  /** Follow the pointer and keyboard focus. */
  hover?: boolean
  /** Classes of the pill: its color, corners, and transition. */
  pillClass: string
}

/** How long the pill lingers after its item lets go, for the next one to take it over. */
const HIDE_DELAY_MS = 80

const OBSERVED_STATE = [
  'data-state',
  'data-highlighted',
  'aria-current',
  'aria-selected',
  'data-active'
]

export function attachGlide(container: HTMLElement, options: GlideOptions): () => void {
  const pill = container.ownerDocument.createElement('span')
  pill.setAttribute('aria-hidden', 'true')
  pill.dataset.glidePill = ''
  pill.className = options.pillClass
  pill.style.cssText =
    'position:absolute;left:0;top:0;z-index:-1;pointer-events:none;opacity:0;will-change:transform'
  container.dataset.glide = ''
  if (getComputedStyle(container).position === 'static') container.style.position = 'relative'
  container.prepend(pill)

  let target: HTMLElement | null = null
  let hovered: HTMLElement | null = null
  let shown = false

  function itemAt(node: EventTarget | null): HTMLElement | null {
    if (!(node instanceof Element)) return null
    const item = node.closest<HTMLElement>(options.items)
    return item && container.contains(item) ? item : null
  }

  let hiding: ReturnType<typeof setTimeout> | undefined

  function place(item: HTMLElement | null): void {
    target = item
    clearTimeout(hiding)
    if (!item) {
      // Moving between items, the old one lets go a moment before the next takes over; the pill
      // waits so it glides there instead of vanishing and reappearing.
      hiding = setTimeout(() => {
        pill.style.opacity = '0'
        shown = false
      }, HIDE_DELAY_MS)
      return
    }
    const box = container.getBoundingClientRect()
    const rect = item.getBoundingClientRect()
    const x = rect.left - box.left - container.clientLeft + container.scrollLeft
    const y = rect.top - box.top - container.clientTop + container.scrollTop
    // Appearing, it starts where it is shown rather than gliding in from the last place it left.
    if (!shown) pill.style.transition = 'none'
    pill.style.transform = `translate(${x}px, ${y}px)`
    pill.style.width = `${rect.width}px`
    pill.style.height = `${rect.height}px`
    pill.style.opacity = '1'
    if (!shown) {
      void pill.offsetWidth
      pill.style.transition = ''
    }
    shown = true
  }

  function activeItem(): HTMLElement | null {
    if (!options.active) return null
    const item = container.querySelector<HTMLElement>(options.active)
    return item && item !== pill ? item : null
  }

  const refresh = () => place(hovered ?? activeItem())

  const onPointerMove = (event: PointerEvent) => {
    // Touch has no hover; the pill stays on the active item.
    if (event.pointerType === 'touch') return
    const item = itemAt(event.target)
    if (item === hovered) return
    hovered = item
    refresh()
  }
  const onPointerLeave = () => {
    hovered = null
    refresh()
  }
  const onFocusIn = (event: FocusEvent) => {
    const item = itemAt(event.target)
    if (!item || !item.matches(':focus-visible')) return
    hovered = item
    refresh()
  }
  const onFocusOut = () => {
    if (container.contains(container.ownerDocument.activeElement)) return
    hovered = null
    refresh()
  }

  if (options.hover) {
    container.addEventListener('pointermove', onPointerMove)
    container.addEventListener('pointerleave', onPointerLeave)
    container.addEventListener('focusin', onFocusIn)
    container.addEventListener('focusout', onFocusOut)
  }

  const mutations = new MutationObserver(() => {
    if (!hovered || !container.contains(hovered)) hovered = null
    refresh()
  })
  mutations.observe(container, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: OBSERVED_STATE
  })
  // A resize moves the items; the pill follows without gliding.
  const resizes = new ResizeObserver(() => {
    if (!target) return
    shown = false
    place(target)
  })
  // The pill scrolls with the items it sits under, so scrolling needs no update.
  resizes.observe(container)

  refresh()

  return () => {
    clearTimeout(hiding)
    mutations.disconnect()
    resizes.disconnect()
    container.removeEventListener('pointermove', onPointerMove)
    container.removeEventListener('pointerleave', onPointerLeave)
    container.removeEventListener('focusin', onFocusIn)
    container.removeEventListener('focusout', onFocusOut)
    pill.remove()
    delete container.dataset.glide
  }
}
