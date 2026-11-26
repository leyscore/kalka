import type { OutlineMode, PixelPreview } from '@kalka/core/canvas'

/** The view state Figma's outline, mask outline, frame outline and pixel preview options set. */
export interface ViewOptionsState {
  outlineMode?: OutlineMode | null
  outlineHiddenLayers?: boolean
  outlineObjectBounds?: boolean
  showMaskOutlines?: boolean
  showFrameOutlines?: boolean
  pixelPreview?: PixelPreview | null
}

interface ViewOptionsStore {
  state: ViewOptionsState
  requestRepaint(): void
}

type ViewOption = {
  checked(state: ViewOptionsState): boolean
  set(state: ViewOptionsState, value: boolean): void
}

function outlineMode(mode: OutlineMode): ViewOption {
  return {
    checked: (state) => state.outlineMode === mode,
    set: (state, value) => {
      if (value) state.outlineMode = mode
      else if (state.outlineMode === mode) state.outlineMode = null
    }
  }
}

/** One choice of Figma's View › Pixel preview: off, 1x or 2x; choosing it is the only way out. */
function pixelPreview(scale: PixelPreview | null): ViewOption {
  return {
    checked: (state) => (state.pixelPreview ?? null) === scale,
    set: (state, value) => {
      if (value) state.pixelPreview = scale
    }
  }
}

function flag(
  key: 'outlineHiddenLayers' | 'outlineObjectBounds' | 'showMaskOutlines' | 'showFrameOutlines'
): ViewOption {
  return {
    checked: (state) => state[key] === true,
    set: (state, value) => {
      state[key] = value
    }
  }
}

/** Figma's View › Outlines, Mask outlines, Frame outlines and Pixel preview, by menu item. */
const VIEW_OPTIONS: Record<string, ViewOption> = {
  'view-outlines-all': outlineMode('all'),
  'view-outlines-selection': outlineMode('selection'),
  'view-outlines-hidden': flag('outlineHiddenLayers'),
  'view-outlines-bounds': flag('outlineObjectBounds'),
  'view-mask-outlines': flag('showMaskOutlines'),
  'view-frame-outlines': flag('showFrameOutlines'),
  'view-pixel-preview-off': pixelPreview(null),
  'view-pixel-preview-1x': pixelPreview('1x'),
  'view-pixel-preview-2x': pixelPreview('2x')
}

/** Whether a view option of the menu is on; undefined for an item that is not one. */
export function viewOptionChecked(id: string, state: ViewOptionsState): boolean | undefined {
  return VIEW_OPTIONS[id]?.checked(state)
}

/** Turns a view option of the menu on or off; undefined for an item that is not one. */
export function viewOptionSetter(
  id: string,
  store: ViewOptionsStore
): ((value: boolean) => void) | undefined {
  const option = VIEW_OPTIONS[id]
  if (!option) return undefined
  return (value) => {
    option.set(store.state, value)
    store.requestRepaint()
  }
}

/** Each view option's menu action, which toggles it. */
export function createViewMenuActions(store: ViewOptionsStore): Record<string, () => void> {
  return Object.fromEntries(
    Object.entries(VIEW_OPTIONS).map(([id, option]) => [
      id,
      () => viewOptionSetter(id, store)?.(!option.checked(store.state))
    ])
  )
}
