import type { ShortcutDefinition } from '@/app/shell/keyboard/registry'
import { createVectorMenuActions } from '@/app/shell/menu/vector-actions'

/**
 * Figma's Vector keys for the points chosen in a path being edited. ⌘J is also the AI panel's
 * key, so it joins only while a path is being edited (`toggle-ai` in the registry); Shift+Delete
 * outside a path deletes as Delete does.
 */
export function vectorShortcutDefinitions(): ShortcutDefinition[] {
  const heal: ShortcutDefinition['run'] = ({ store, actions }) => {
    if (store.state.nodeEditState) createVectorMenuActions(store)['vector.delete-and-heal']()
    else actions.smartDelete(false)
  }
  return [
    {
      id: 'vector.smooth-join',
      keys: '$mod+Shift+KeyJ',
      run: ({ store }) => createVectorMenuActions(store)['vector.smooth-join']()
    },
    { id: 'vector.delete-and-heal', keys: ['Shift+Backspace', 'Shift+Delete'], run: heal }
  ]
}

/** ⌘J: Join selection in a path being edited, the AI panel everywhere else. */
export const joinOrToggleAI: ShortcutDefinition['run'] = ({ store, actions }) => {
  if (store.state.nodeEditState) createVectorMenuActions(store)['vector.join']()
  else actions.toggleAI()
}
