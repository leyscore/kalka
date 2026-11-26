import { tinykeys } from 'tinykeys'
import type { KeyBindingMap } from 'tinykeys'
import { onScopeDispose } from 'vue'

import { editorCommandMetadata } from '@kalka/vue'
import type { EditorCommandId } from '@kalka/vue'

import { askAboutSelection } from '@/app/ai/chat/ask-selection'
import {
  leaveComments,
  stopCommentPlacing,
  toggleCommentPins,
  toggleCommentPlacing
} from '@/app/comments/service'
import {
  copySelectionProperties,
  pasteClipboardProperties
} from '@/app/editor/clipboard/properties'
import { pickColorForSelection } from '@/app/editor/color/eyedropper'
import { openFind } from '@/app/editor/find/state'
import { copySelectionLink } from '@/app/editor/selection/link'
import { requestRenameSelection } from '@/app/editor/selection/rename-dialog'
import { TOOL_SHORTCUTS } from '@/app/editor/session'
import { openSettings } from '@/app/settings/open'
import { setSnappingPreference } from '@/app/settings/preferences/apply'
import { isButtonActivation, isCanvasKey, isEditing } from '@/app/shell/keyboard/focus'
import { markShortcutUsed, toggleShortcutsHelp } from '@/app/shell/keyboard/help'
import { bindSpaceHandTool } from '@/app/shell/keyboard/space-tool'
import { textShortcutDefinitions } from '@/app/shell/keyboard/text-shortcuts'
import type {
  KeyboardShortcutOptions,
  KeyboardShortcutRunOptions
} from '@/app/shell/keyboard/types'
import { showAdjacentPage } from '@/app/shell/menu/editor-actions'
import { appMenuTinykeysShortcut } from '@/app/shell/menu/shortcut'

type ShortcutAction = (options: KeyboardShortcutRunOptions) => void

export type ShortcutDefinition = {
  id: string
  keys: string | string[]
  run: ShortcutAction
  shouldPreventDefault?: (event: KeyboardEvent) => boolean
  global?: boolean
  /** Whether the shortcut also works while a canvas previews. */
  preview?: boolean
  /** Whether it works while text is being edited, as saving and opening do in Figma. */
  whileEditingText?: boolean
}

function commandShortcut(
  command: EditorCommandId,
  keys = editorCommandMetadata(command).keybinding
): ShortcutDefinition | null {
  return keys ? { id: command, keys, run: ({ runCommand }) => runCommand(command) } : null
}

function commandShortcuts(...commands: EditorCommandId[]): ShortcutDefinition[] {
  return commands.flatMap((command) => {
    const shortcut = commandShortcut(command)
    return shortcut ? [shortcut] : []
  })
}

function zoomAtViewportCenter(delta: number): ShortcutAction {
  return ({ store }) => {
    const center = store.viewportCanvasCenter()
    store.applyZoom(delta, center.x, center.y)
  }
}

function opacityBindings(): ShortcutDefinition[] {
  return ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => ({
    id: `selection-opacity-${digit}`,
    keys: digit,
    run: ({ keyEvent, actions }) => {
      if (keyEvent.metaKey || keyEvent.ctrlKey || keyEvent.altKey || keyEvent.shiftKey) return
      actions.opacityDigit(digit)
    },
    shouldPreventDefault: (event) =>
      !event.metaKey && !event.ctrlKey && !event.altKey && !event.shiftKey
  }))
}

const EDITOR_SHORTCUT_OVERLAY_SELECTOR =
  '[data-picker-content], [role="dialog"], [role="listbox"], [role="menu"]'

function originatedInOverlay(event: KeyboardEvent) {
  return event
    .composedPath()
    .some((target) => target instanceof Element && target.matches(EDITOR_SHORTCUT_OVERLAY_SELECTOR))
}

/** A popover, menu, or dialog that is open; one fading out after closing no longer counts. */
function hasOpenDismissableLayer() {
  return document.querySelector('[data-dismissable-layer]:not([data-state="closed"])') !== null
}

function shouldIgnoreShortcut(
  event: KeyboardEvent,
  options: KeyboardShortcutOptions,
  whileEditingText = false
) {
  // Text being edited on the canvas keeps its keys, except the document's own shortcuts.
  if (whileEditingText && options.store.state.editingTextId) return hasOpenDismissableLayer()
  return (
    isButtonActivation(event) ||
    hasOpenDismissableLayer() ||
    originatedInOverlay(event) ||
    isEditing(event) ||
    options.inputFocused.value ||
    !!options.store.state.editingTextId ||
    !!options.store.state.numberFieldFocused ||
    // The variables cover the canvas, so its keys must not reach layers that cannot be seen.
    options.store.state.variablesOpen
  )
}

function bindShortcut(
  bindings: KeyBindingMap,
  keys: string | string[],
  run: (event: KeyboardEvent) => void
) {
  for (const key of Array.isArray(keys) ? keys : [keys]) bindings[key] = run
}

function bindToolShortcuts(bindings: KeyBindingMap, options: KeyboardShortcutRunOptions) {
  for (const [code, tool] of Object.entries(TOOL_SHORTCUTS)) {
    if (!tool) continue
    bindings[code] = (event: KeyboardEvent) => {
      event.preventDefault()
      options.spaceTool.resetToolBeforeSpace()
      stopCommentPlacing(options.store)
      options.store.setTool(tool)
      markShortcutUsed(`tool:${code}`)
    }
  }
}

/**
 * Every key the editor binds outside the tools, nudging and the clipboard. The keyboard shortcuts
 * panel lists these, so a key added here shows there too.
 */
export function editorShortcutDefinitions(): ShortcutDefinition[] {
  return [
    ...commandShortcuts(
      'selection.createComponent',
      'selection.detachInstance',
      'selection.createComponentSet',
      'selection.toggleMask',
      'selection.toggleVisibility',
      'selection.toggleLock',
      'selection.flipHorizontal',
      'selection.flipVertical',
      'selection.selectMatchingLayers'
    ),
    {
      id: 'copy-properties',
      keys: appMenuTinykeysShortcut('copy-properties') ?? '$mod+Alt+KeyC',
      run: ({ store }) => void copySelectionProperties(store)
    },
    {
      id: 'paste-properties',
      keys: appMenuTinykeysShortcut('paste-properties') ?? '$mod+Alt+KeyV',
      run: ({ store }) => void pasteClipboardProperties(store)
    },
    { id: 'pick-color', keys: 'KeyI', run: ({ store }) => void pickColorForSelection(store) },
    {
      id: 'copy-link',
      keys: appMenuTinykeysShortcut('copy-link') ?? '$mod+KeyL',
      run: ({ store }) => void copySelectionLink(store)
    },
    {
      id: 'export-selection-png',
      keys: appMenuTinykeysShortcut('export-selection') ?? '$mod+Shift+KeyE',
      run: ({ actions }) => actions.exportSelectionPNG(),
      whileEditingText: true
    },
    {
      id: 'save-as',
      keys: appMenuTinykeysShortcut('save-as') ?? '$mod+Shift+KeyS',
      run: ({ store }) => void store.saveFigFileAs(),
      whileEditingText: true
    },
    ...commandShortcuts('selection.ungroup', 'edit.redo'),
    {
      id: 'toggle-preview',
      keys: appMenuTinykeysShortcut('toggle-preview') ?? '$mod+Alt+Enter',
      run: ({ actions }) => actions.togglePlay(),
      preview: true
    },
    {
      id: 'keyboard-shortcuts',
      // Figma's ⌃⇧?, and ⌘/ which people try first.
      keys: ['Control+Shift+Slash', '$mod+Slash'],
      run: () => toggleShortcutsHelp(),
      global: true
    },
    {
      id: 'ask-about-selection',
      keys: 'Slash',
      run: () => askAboutSelection()
    },
    {
      id: 'toggle-comment-mode',
      keys: 'KeyC',
      run: ({ store }) => toggleCommentPlacing(store)
    },
    {
      id: 'toggle-comment-pins',
      keys: 'Shift+KeyC',
      run: ({ store }) => toggleCommentPins(store)
    },
    {
      id: 'toggle-rulers',
      keys: 'Shift+KeyR',
      run: ({ store }) => {
        store.state.showRulers = !store.state.showRulers
        store.requestRepaint()
      }
    },
    {
      id: 'toggle-multiplayer-cursors',
      keys: '$mod+Alt+Backslash',
      run: ({ store }) => {
        store.state.showRemoteCursors = !store.state.showRemoteCursors
        store.requestRepaint()
      }
    },
    // Figma's keys, matched by key position since Shift turns ' into ".
    {
      id: 'toggle-pixel-grid',
      keys: 'Shift+Quote',
      run: ({ store }) => {
        store.state.showPixelGrid = store.state.showPixelGrid === false
        store.requestRepaint()
      }
    },
    {
      id: 'toggle-pixel-grid-snap',
      keys: '$mod+Shift+Quote',
      run: ({ store }) =>
        setSnappingPreference('pixelGrid', !store.state.snappingPreferences.pixelGrid)
    },
    {
      id: 'toggle-ui',
      keys: appMenuTinykeysShortcut('toggle-ui') ?? '$mod+Backslash',
      run: ({ actions }) => actions.toggleUI(),
      whileEditingText: true
    },
    { id: 'toggle-ai', keys: '$mod+KeyJ', run: ({ actions }) => actions.toggleAI() },
    {
      id: 'open-settings',
      keys: appMenuTinykeysShortcut('settings') ?? '$mod+Comma',
      run: () => openSettings(),
      global: true
    },
    {
      id: 'zoom-in',
      keys: [appMenuTinykeysShortcut('zoom-in') ?? '$mod+Equal', '$mod+Shift+Equal'],
      run: zoomAtViewportCenter(-100),
      global: true
    },
    {
      id: 'zoom-out',
      keys: appMenuTinykeysShortcut('zoom-out') ?? '$mod+Minus',
      run: zoomAtViewportCenter(100),
      global: true
    },
    { id: 'zoom-next-frame', keys: 'KeyN', run: ({ store }) => store.zoomToAdjacentFrame(1) },
    {
      id: 'zoom-previous-frame',
      keys: 'Shift+KeyN',
      run: ({ store }) => store.zoomToAdjacentFrame(-1)
    },
    { id: 'previous-page', keys: 'PageUp', run: () => showAdjacentPage(-1) },
    { id: 'next-page', keys: 'PageDown', run: () => showAdjacentPage(1) },
    {
      id: 'zoom-in-unmodified',
      keys: 'Shift+Equal',
      run: zoomAtViewportCenter(-100)
    },
    {
      id: 'zoom-out-unmodified',
      keys: 'Minus',
      run: zoomAtViewportCenter(100)
    },
    {
      id: 'close-tab',
      keys: appMenuTinykeysShortcut('close') ?? '$mod+KeyW',
      run: ({ closeActiveTab }) => closeActiveTab(),
      whileEditingText: true
    },
    {
      id: 'new-tab',
      keys: ['$mod+KeyN', '$mod+KeyT'],
      run: ({ createTab }) => createTab(),
      whileEditingText: true
    },
    // Figma's ⌘F wins over the browser's find, in text being edited and in fields too.
    {
      id: 'find',
      keys: appMenuTinykeysShortcut('find') ?? '$mod+KeyF',
      run: () => {
        if (!hasOpenDismissableLayer()) openFind()
      },
      shouldPreventDefault: () => !hasOpenDismissableLayer(),
      global: true
    },
    {
      id: 'rename-selection',
      keys: appMenuTinykeysShortcut('selection.rename') ?? '$mod+KeyR',
      run: ({ store }) => requestRenameSelection(store)
    },
    ...commandShortcuts(
      'edit.undo',
      'view.zoom100',
      'view.zoomFit',
      'view.zoomSelection',
      'selection.duplicate',
      'selection.selectAll',
      'selection.selectInverse'
    ),
    {
      id: 'save',
      keys: appMenuTinykeysShortcut('save') ?? '$mod+KeyS',
      run: ({ store }) => void store.saveFigFile(),
      whileEditingText: true
    },
    {
      id: 'open-file',
      keys: appMenuTinykeysShortcut('open') ?? '$mod+KeyO',
      run: ({ openFileDialog }) => openFileDialog(),
      whileEditingText: true
    },
    ...commandShortcuts(
      'selection.group',
      'selection.frameSelection',
      'selection.booleanUnion',
      'selection.booleanSubtract',
      'selection.booleanIntersect',
      'selection.booleanExclude',
      'selection.flatten',
      'selection.outlineStroke',
      'selection.distributeHorizontal',
      'selection.distributeVertical'
    ),
    // Figma's Option+A, H, D, W, V and S, which the Arrange menu shows. Matched by key position:
    // Option turns the letter into another character on macOS.
    ...(
      [
        ['align-left', 'Alt+KeyA', 'horizontal', 'min'],
        ['align-center', 'Alt+KeyH', 'horizontal', 'center'],
        ['align-right', 'Alt+KeyD', 'horizontal', 'max'],
        ['align-top', 'Alt+KeyW', 'vertical', 'min'],
        ['align-middle', 'Alt+KeyV', 'vertical', 'center'],
        ['align-bottom', 'Alt+KeyS', 'vertical', 'max']
      ] as const
    ).map(([id, keys, axis, align]): ShortcutDefinition => ({
      id,
      keys,
      run: ({ store }) => store.alignNodes([...store.state.selectedIds], axis, align)
    })),
    ...textShortcutDefinitions(),
    {
      id: 'toggle-auto-layout',
      keys: 'Shift+KeyA',
      run: ({ actions }) => actions.toggleAutoLayout()
    },
    ...commandShortcuts(
      'selection.resizeToFit',
      'selection.swapFillAndStroke',
      'selection.removeFill',
      'selection.removeStroke'
    ),
    {
      id: 'collapse-layers',
      // Option+L, by key position: Option turns the letter into another character on macOS.
      keys: 'Alt+KeyL',
      run: ({ store }) => store.collapseLayers()
    },
    ...commandShortcuts(
      'selection.bringForward',
      'selection.bringToFront',
      'selection.sendBackward',
      'selection.sendToBack'
    ),
    { id: 'delete-backspace', keys: 'Backspace', run: ({ actions }) => actions.smartDelete(false) },
    { id: 'delete', keys: 'Delete', run: ({ actions }) => actions.smartDelete(false) },
    { id: 'delete-alt', keys: 'Alt+Delete', run: ({ actions }) => actions.smartDelete(true) },
    { id: 'enter', keys: 'Enter', run: ({ actions }) => actions.confirmOrEditSelection() },
    {
      id: 'select-parent',
      keys: ['Shift+Enter', 'Backslash'],
      run: ({ actions }) => actions.selectParent()
    },
    ...(
      [
        ['Tab', 1],
        ['Shift+Tab', -1]
      ] as const
    ).map(([keys, step]): ShortcutDefinition => ({
      id: `select-sibling-${step}`,
      keys,
      run: ({ actions, keyEvent }) => {
        if (isCanvasKey(keyEvent) && actions.selectSibling(step)) keyEvent.preventDefault()
      },
      shouldPreventDefault: () => false
    })),
    {
      id: 'escape',
      keys: 'Escape',
      // Comment mode and an open thread close before the selection does.
      run: ({ actions, store }) => {
        if (!leaveComments(store)) actions.escapeOrDeselect()
      },
      preview: true
    },
    ...opacityBindings()
  ]
}

export function registerKeyboardShortcuts(options: KeyboardShortcutOptions) {
  const spaceTool = bindSpaceHandTool(options.inputFocused, options.store)
  const runOptions = (event: KeyboardEvent): KeyboardShortcutRunOptions => ({
    ...options,
    keyEvent: event,
    spaceTool
  })

  const shortcuts = editorShortcutDefinitions()

  const bindings: KeyBindingMap = {}
  const globalBindings: KeyBindingMap = {}
  const textEditingKeys = new Set(
    shortcuts
      .filter((shortcut) => shortcut.whileEditingText)
      .flatMap((shortcut) => [shortcut.keys].flat())
  )
  /** Keys that keep working while a canvas previews; everything else would edit the design. */
  const previewKeys = new Set(
    shortcuts.filter((shortcut) => shortcut.preview).flatMap((shortcut) => [shortcut.keys].flat())
  )
  bindToolShortcuts(bindings, runOptions(new KeyboardEvent('keydown')))

  for (const shortcut of shortcuts) {
    bindShortcut(shortcut.global ? globalBindings : bindings, shortcut.keys, (event) => {
      shortcut.run(runOptions(event))
      markShortcutUsed(shortcut.id)
      if (shortcut.shouldPreventDefault?.(event) ?? true) event.preventDefault()
    })
  }

  const unsubscribeEditor = tinykeys(
    window,
    Object.fromEntries(
      Object.entries(bindings).map(([keys, handler]) => [
        keys,
        (event: KeyboardEvent) => {
          if (shouldIgnoreShortcut(event, options, textEditingKeys.has(keys))) return
          if (options.store.state.play && !previewKeys.has(keys)) return
          handler(event)
        }
      ])
    ),
    { capture: true }
  )

  const unsubscribeGlobal = tinykeys(window, globalBindings, { capture: true })

  onScopeDispose(() => {
    unsubscribeEditor()
    unsubscribeGlobal()
  })
}
