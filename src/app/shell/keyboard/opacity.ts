import { useEventListener } from '@vueuse/core'

import type { useEditorCommands } from '@open-pencil/vue'

import type { EditorStore } from '@/app/editor/active-store'
import { isEditing } from '@/app/shell/keyboard/focus'

type OpacityShortcutOptions = {
  store: EditorStore
  setOpacityTarget: ReturnType<typeof useEditorCommands>['setOpacityTarget']
  runCommand: ReturnType<typeof useEditorCommands>['runCommand']
}

const DIGIT_OPACITY = {
  Digit0: 1,
  Digit1: 0.1,
  Digit2: 0.2,
  Digit3: 0.3,
  Digit4: 0.4,
  Digit5: 0.5,
  Digit6: 0.6,
  Digit7: 0.7,
  Digit8: 0.8,
  Digit9: 0.9
} as const

export function bindOpacityKeys({ store, setOpacityTarget, runCommand }: OpacityShortcutOptions) {
  useEventListener(window, 'keydown', (e: KeyboardEvent) => {
    if (isEditing(e)) return
    if (store.state.editingTextId) return
    if (store.state.numberFieldFocused) return
    if (e.metaKey || e.ctrlKey || e.altKey) return
    if (store.state.selectedIds.size === 0) return

    if (!(e.code in DIGIT_OPACITY)) return
    const opacity: number = DIGIT_OPACITY[e.code as keyof typeof DIGIT_OPACITY]

    e.preventDefault()
    setOpacityTarget(opacity)
    runCommand('selection.setOpacity')
  })
}
