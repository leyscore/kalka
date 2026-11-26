import { nextTick, onMounted, ref, watch, type Ref } from 'vue'

import { useLeftPanel } from '@/app/shell/left-panel/use'

/**
 * Figma's Save to version history (Cmd+Alt+S): the history panel opens with the field that names
 * a version in focus, a Git commit's message on the desktop or a version's name elsewhere.
 */
const requested = ref(false)

export function requestNamedVersion(): void {
  requested.value = true
  useLeftPanel().show('history')
}

/** Focuses the input inside `field` whenever a named version is asked for while it shows. */
export function useNamedVersionFocus(field: Ref<HTMLElement | null>): void {
  const focus = async () => {
    if (!requested.value) return
    await nextTick()
    const input = field.value?.querySelector('input') ?? null
    if (!input) return
    requested.value = false
    input.focus()
  }
  onMounted(() => void focus())
  watch(requested, () => void focus())
}
