import { attachGlide } from '@/components/ui/motion/glide'
import { glidePills } from '@/theme/motion/glide'

const MENUS = '[role="menu"], [role="listbox"]'

/**
 * Every menu and list box the app opens gets a highlight that glides to the item under the pointer or the
 * keyboard, instead of each item lighting up on its own. Menus portal into the body as they open,
 * so one observer there reaches them all.
 */
export function installMenuGlide(root: HTMLElement = document.body): () => void {
  const attached = new Map<HTMLElement, () => void>()

  function attach(menu: HTMLElement) {
    if (attached.has(menu)) return
    attached.set(
      menu,
      attachGlide(menu, {
        items: '[role^="menuitem"], [role="option"]',
        active: '[data-highlighted]',
        pillClass: glidePills.hover
      })
    )
  }

  function scan(node: Node) {
    if (!(node instanceof HTMLElement)) return
    if (node.matches(MENUS)) attach(node)
    for (const menu of node.querySelectorAll<HTMLElement>(MENUS)) attach(menu)
  }

  const observer = new MutationObserver((records) => {
    for (const record of records) {
      for (const node of record.addedNodes) scan(node)
      for (const node of record.removedNodes) {
        for (const [menu, detach] of attached) {
          if (node === menu || node.contains(menu)) {
            detach()
            attached.delete(menu)
          }
        }
      }
    }
  })
  observer.observe(root, { childList: true, subtree: true })
  scan(root)
  return () => {
    observer.disconnect()
    for (const detach of attached.values()) detach()
    attached.clear()
  }
}
