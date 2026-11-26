import { describe, expect, test } from 'bun:test'

import { ref } from 'vue'

import type { EditorCommandId } from '@kalka/vue'

import { buildCanvasContextMenu } from '#vue/editor/menu-model/canvas'
import type { CanvasMenuOptions } from '#vue/editor/menu-model/canvas'

interface MenuSelection {
  isIcon?: boolean
  isInstance?: boolean
  selectedCount?: number
  missingMain?: boolean
}

/** The canvas menu's command ids for a selection. */
function menuIds({
  isIcon = false,
  isInstance = false,
  selectedCount = 1,
  missingMain = false
}: MenuSelection) {
  const menu = buildCanvasContextMenu({
    commandMenuItem: (id: EditorCommandId) => ({
      id,
      label: id,
      disabled: id === 'selection.restoreMainComponent' && !missingMain
    }),
    otherPages: [],
    moveSelectionToPage: (pageId: string) => pageId,
    selection: {
      hasSelection: ref(true),
      selectedCount: ref(selectedCount),
      isGroup: ref(false),
      isComponent: ref(false),
      isInstance: ref(isInstance),
      isIcon: ref(isIcon),
      canCreateComponentSet: ref(false),
      canCreateSlot: ref(false)
    } as CanvasMenuOptions['selection'],
    t: { moveToPage: 'Move to page' }
  })
  return menu.flatMap((item) => (item.separator ? [] : [item.id]))
}

describe('canvas menu for icons', () => {
  test('offers Detach icon only for icons', () => {
    expect(menuIds({ isIcon: true })).toContain('selection.detachIcon')
    expect(menuIds({})).not.toContain('selection.detachIcon')
  })
})

describe('canvas menu for components and instances', () => {
  test('offers Create multiple components for several layers', () => {
    expect(menuIds({ selectedCount: 2 })).toContain('selection.createMultipleComponents')
    expect(menuIds({})).not.toContain('selection.createMultipleComponents')
  })

  test('offers the instance commands, or Restore main component once the main is gone', () => {
    const linked = menuIds({ isInstance: true })
    expect(linked).toContain('selection.pushChangesToMainComponent')
    expect(linked).toContain('selection.resetAllChanges')
    expect(linked).not.toContain('selection.restoreMainComponent')
    const orphan = menuIds({ isInstance: true, missingMain: true })
    expect(orphan).toContain('selection.restoreMainComponent')
    expect(orphan).not.toContain('selection.goToMainComponent')
  })
})
