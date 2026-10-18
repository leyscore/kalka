const layerTreeTheme = {
  slots: {
    viewport: 'scrollbar-thin h-full overflow-y-auto px-2 pb-2',
    row: 'group/row relative flex w-full cursor-pointer items-center gap-[7px] rounded-[7px] border-none bg-transparent pr-1.5 text-left text-xs text-subtle transition-colors duration-75',
    disclosure:
      'flex w-4 shrink-0 cursor-pointer items-center justify-center text-current transition-transform',
    disclosurePlaceholder: 'w-4 shrink-0',
    icon: 'size-[13px] shrink-0',
    label: 'min-w-0 flex-1 truncate',
    actions: 'flex shrink-0 items-center gap-0.5',
    action:
      'flex size-4 items-center justify-center rounded text-current outline-none hover:bg-surface/10 focus-visible:ring-1 focus-visible:ring-panel-focus',
    actionIcon: 'size-3',
    dropIndicator: 'pointer-events-none absolute bg-accent',
    renameRow: 'group/row relative flex w-full items-center gap-[7px] pr-1.5 text-xs text-surface',
    renameIcon: 'size-[13px] shrink-0 text-faint',
    renameInput:
      'min-w-0 flex-1 rounded border border-accent bg-input px-1 py-0 text-xs text-surface outline-none'
  },
  variants: {
    selected: {
      true: { row: 'bg-row-selected font-semibold text-row-selected-text' },
      false: { row: 'bg-transparent' }
    },
    focused: {
      true: {},
      false: {}
    },
    dragging: {
      true: { row: 'opacity-30' },
      false: {}
    },
    visible: {
      true: {},
      false: {}
    },
    component: {
      true: { icon: 'text-component' },
      false: {}
    },
    slot: {
      true: { icon: 'text-slot opacity-100', label: 'text-slot' },
      false: {}
    },
    expanded: {
      true: { disclosure: 'rotate-90' },
      false: { disclosure: 'rotate-0' }
    },
    // Hidden actions take no room, so a narrow panel spends its width on the layer's name.
    actionsVisible: {
      true: {},
      false: {
        actions: 'hidden group-hover/row:flex group-focus-within/row:flex'
      }
    },
    actionActive: {
      true: { actionIcon: 'opacity-100' },
      false: {
        actionIcon: 'opacity-0 group-hover/row:opacity-70 group-focus-within/row:opacity-70'
      }
    },
    childDropTarget: {
      true: {
        row: 'bg-row-selected/60 text-surface'
      },
      false: {}
    },
    dropPosition: {
      child: {
        dropIndicator: 'inset-y-1 rounded border border-accent bg-accent/10'
      },
      above: { dropIndicator: 'top-0 h-0.5' },
      below: { dropIndicator: 'bottom-0 h-0.5' }
    }
  },
  compoundVariants: [
    // Unselected icons recede; a selected row takes its own color, softer once the tree loses focus.
    { selected: false, component: false, slot: false, class: { icon: 'text-faint' } },
    {
      selected: true,
      focused: false,
      class: { row: 'bg-row-selected/70' }
    },
    // A hidden layer dims while its name still reads at 4.5:1. Once selected, fading the row would
    // fade its highlight too, so only the icon dims.
    { visible: false, selected: false, class: { row: 'opacity-65' } },
    { visible: false, selected: true, class: { icon: 'opacity-50' } }
  ],
  defaultVariants: {
    selected: false,
    focused: false,
    dragging: false,
    visible: true,
    component: false,
    slot: false,
    expanded: false,
    actionsVisible: true,
    actionActive: false,
    childDropTarget: false
  }
}

export type LayerTreeTheme = typeof layerTreeTheme
export default layerTreeTheme
