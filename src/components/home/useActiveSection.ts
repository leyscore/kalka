import { onMounted, onScopeDispose, ref } from 'vue'

/**
 * The home section in view as the page scrolls, for the sidebar to mark. The topmost section
 * crossing the upper third of the view wins.
 */
export function useActiveSection(ids: readonly string[]) {
  const active = ref(ids[0] ?? '')
  let observer: IntersectionObserver | null = null
  const visible = new Set<string>()

  onMounted(() => {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id)
          else visible.delete(entry.target.id)
        }
        const first = ids.find((id) => visible.has(id))
        if (first) active.value = first
      },
      { rootMargin: '0px 0px -66% 0px' }
    )
    for (const id of ids) {
      const section = document.getElementById(id)
      if (section) observer.observe(section)
    }
  })
  onScopeDispose(() => observer?.disconnect())

  return active
}
