export function inputValue(e: Event): string {
  return e.target instanceof HTMLInputElement ? e.target.value : ''
}

export function inputNumberValue(e: Event): number {
  return +inputValue(e)
}

export function blurTarget(e: Event) {
  if (e.target instanceof HTMLElement) e.target.blur()
}

/**
 * Selects a field's text as it takes focus. Safari puts the caret where the click let go on the
 * mouseup after the focus, which undid the selection, so that mouseup keeps it.
 */
export function selectTarget(e: Event) {
  const input = e.target
  if (!(input instanceof HTMLInputElement)) return
  input.select()
  const keepSelection = (up: Event) => up.preventDefault()
  input.addEventListener('mouseup', keepSelection, { once: true })
  input.addEventListener('blur', () => input.removeEventListener('mouseup', keepSelection), {
    once: true
  })
}
