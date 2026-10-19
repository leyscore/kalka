/** Whether an element takes part in its parent's flow, so that its box moves its siblings'. */
function isInFlow(element: Element): boolean {
  const position = element.ownerDocument.defaultView?.getComputedStyle(element).position
  return position !== 'absolute' && position !== 'fixed'
}

/**
 * The layer elements whose boxes the patched layers can have moved: each patched layer and what
 * is inside it, widened to its parent while it sits in its parent's flow, as in auto layout,
 * where it pushes its siblings and sizes its parent. A layer placed absolutely moves nothing
 * outside itself. Null when that reaches the artboard's root, which is then read whole.
 *
 * `elementFor` gives a patched layer's element, or its closest drawn parent's when it has none.
 */
export function measureScopes(
  root: Element,
  patched: Iterable<string>,
  elementFor: (id: string) => Element | null,
  layerAttr: string
): Element[] | null {
  const scopes = new Set<Element>()
  for (const id of patched) {
    let element = elementFor(id)
    if (!element) return null
    while (element !== root && isInFlow(element)) {
      const parent: Element | null | undefined = element.parentElement?.closest(`[${layerAttr}]`)
      if (!parent) return null
      element = parent
    }
    if (element === root) return null
    scopes.add(element)
  }
  return [...scopes].filter(
    (scope) => ![...scopes].some((other) => other !== scope && other.contains(scope))
  )
}
