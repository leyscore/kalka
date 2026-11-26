import { useLocalStorage } from '@vueuse/core'
import { ref } from 'vue'

/** Whether the keyboard shortcuts panel is open, as Figma's Help › Keyboard shortcuts. */
export const shortcutsHelpOpen = ref(false)

export function openShortcutsHelp(): void {
  shortcutsHelpOpen.value = true
}

export function toggleShortcutsHelp(): void {
  shortcutsHelpOpen.value = !shortcutsHelpOpen.value
}

/**
 * The shortcuts this person has pressed, by the id the panel lists them under, so the panel
 * highlights them as Figma does. It stays in this browser only.
 */
export const usedShortcuts = useLocalStorage<string[]>('kalka:used-shortcuts', [])

export function markShortcutUsed(id: string): void {
  if (!usedShortcuts.value.includes(id)) usedShortcuts.value = [...usedShortcuts.value, id]
}
