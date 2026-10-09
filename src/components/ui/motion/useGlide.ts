import { onScopeDispose, watch, type Ref } from 'vue'

import { attachGlide, type GlideOptions } from './glide'

/** Attaches a gliding pill to a container while it is mounted. */
export function useGlide(
  container: Readonly<Ref<HTMLElement | null | undefined>>,
  options: GlideOptions
) {
  let detach: (() => void) | null = null
  watch(
    container,
    (element) => {
      detach?.()
      detach = element ? attachGlide(element, options) : null
    },
    { immediate: true, flush: 'post' }
  )
  onScopeDispose(() => detach?.())
}
