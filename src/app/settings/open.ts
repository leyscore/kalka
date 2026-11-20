import { ref } from 'vue'

export type SettingsSection =
  | 'general'
  | 'ai'
  | 'usage'
  | 'diagnostics'
  | 'mcp'
  | 'tools'
  | 'media'
  | 'storage'
  | 'server'

/** Settings is a page of its own at `/settings/<section>`; `route.ts` keeps the address in step. */
export const settingsOpen = ref(false)
export const settingsSection = ref<SettingsSection>('general')

type SettingsNavigationRequest = (action: () => void) => void
let requestNavigation: SettingsNavigationRequest | null = null

export function registerSettingsNavigation(request: SettingsNavigationRequest) {
  requestNavigation = request
  return () => {
    if (requestNavigation === request) requestNavigation = null
  }
}

export function openSettings(section?: SettingsSection): void {
  if (settingsOpen.value && (!section || section === settingsSection.value)) return
  const open = () => {
    if (section) settingsSection.value = section
    settingsOpen.value = true
  }
  if (settingsOpen.value && requestNavigation) requestNavigation(open)
  else open()
}

export const SETTINGS_SECTIONS: readonly SettingsSection[] = [
  'general',
  'ai',
  'usage',
  'diagnostics',
  'mcp',
  'tools',
  'media',
  'storage',
  'server'
]

export function isSettingsSection(value: string): value is SettingsSection {
  return SETTINGS_SECTIONS.some((section) => section === value)
}

/** Closes Settings, asking first when a section holds unsaved edits. */
export function closeSettings(): void {
  if (!settingsOpen.value) return
  const close = () => {
    settingsOpen.value = false
  }
  if (requestNavigation) requestNavigation(close)
  else close()
}
