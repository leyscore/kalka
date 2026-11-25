function isEditableTarget(target: EventTarget | null | undefined): boolean {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    (target instanceof HTMLElement && target.isContentEditable)
  )
}

export function isButtonActivation(event: KeyboardEvent): boolean {
  if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return false
  if (event.code !== 'Enter' && event.code !== 'Space') return false
  return event.composedPath().some((target) => target instanceof HTMLButtonElement)
}

export function isEditing(event: Event) {
  return event.composedPath().some(isEditableTarget)
}

export function hasDocumentTextSelection(): boolean {
  const selection = window.getSelection()
  return selection !== null && !selection.isCollapsed && selection.toString().length > 0
}

export function isInputElement(element: EventTarget | null | undefined): boolean {
  return (
    element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement ||
    (element instanceof HTMLElement && element.isContentEditable)
  )
}

/**
 * Whether a key goes to the canvas rather than to a focused control: Tab moves through layers
 * only there, and keeps moving focus through the panels everywhere else.
 */
export function isCanvasKey(event: KeyboardEvent): boolean {
  const target = event.target
  return (
    !(target instanceof HTMLElement) ||
    target === document.body ||
    target === document.documentElement ||
    target instanceof HTMLCanvasElement
  )
}
