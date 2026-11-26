import { describe, expect, test } from 'bun:test'

import { menuChecks } from '@/app/shell/menu/checked'
import {
  createViewMenuActions,
  viewOptionSetter,
  type ViewOptionsState
} from '@/app/shell/menu/view-actions'

function viewStore(state: ViewOptionsState = {}) {
  let repaints = 0
  return {
    state,
    requestRepaint: () => {
      repaints++
    },
    get repaints() {
      return repaints
    }
  }
}

describe("Figma's View › Outlines, Mask outlines and Frame outlines", () => {
  test('show outlines for everything or only the selection, one at a time', () => {
    const store = viewStore()
    const actions = createViewMenuActions(store)
    actions['view-outlines-all']?.()
    expect(store.state.outlineMode).toBe('all')
    actions['view-outlines-selection']?.()
    expect(store.state.outlineMode).toBe('selection')
    actions['view-outlines-selection']?.()
    expect(store.state.outlineMode).toBeNull()
    expect(store.repaints).toBe(3)
  })

  test('a check item sets its option to the state it shows', () => {
    const store = viewStore({ outlineMode: 'all' })
    viewOptionSetter('view-outlines-selection', store)?.(false)
    expect(store.state.outlineMode).toBe('all')
    viewOptionSetter('view-frame-outlines', store)?.(true)
    viewOptionSetter('view-mask-outlines', store)?.(true)
    expect(store.state).toMatchObject({ showFrameOutlines: true, showMaskOutlines: true })
    expect(viewOptionSetter('view-rulers', store)).toBeUndefined()
  })

  test('the native menu shows them checked', () => {
    const checks = menuChecks({
      state: {
        autosaveEnabled: false,
        showRulers: false,
        showRemoteCursors: false,
        snappingPreferences: { geometry: true, objects: true, pixelGrid: false },
        outlineMode: 'all',
        outlineHiddenLayers: true
      },
      theme: 'dark',
      designIssuesOnCanvas: false,
      profilerVisible: false
    })
    expect(checks['view-outlines-all']).toBe(true)
    expect(checks['view-outlines-selection']).toBe(false)
    expect(checks['view-outlines-hidden']).toBe(true)
    expect(checks['view-frame-outlines']).toBe(false)
  })
})
