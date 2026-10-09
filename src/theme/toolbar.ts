const toolbarTheme = {
  slots: {
    button:
      'flex size-9 cursor-pointer items-center justify-center border-none bg-transparent text-label transition-[background-color,color,box-shadow,scale] duration-150 outline-none focus-visible:ring-1 focus-visible:ring-panel-focus active:scale-[0.94] motion-reduce:active:scale-100',
    icon: 'size-4',
    flyoutGroup: 'flex items-center',
    flyoutTrigger:
      'flex h-9 w-3.5 cursor-pointer items-center justify-center border-none bg-transparent text-faint transition-colors outline-none data-[state=open]:text-surface focus-visible:ring-1 focus-visible:ring-panel-focus',
    flyoutTriggerIcon: 'size-2.5',
    flyoutContent: '',
    flyoutItem: '',
    flyoutItemIndicator: 'flex size-3.5 shrink-0 items-center justify-center',
    flyoutItemIcon: 'size-3.5',
    flyoutItemLabel: 'flex-1',
    navigationAction:
      'flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border bg-panel text-muted shadow-sm outline-none select-none focus-visible:ring-1 focus-visible:ring-panel-focus disabled:pointer-events-none',
    navigationIcon: 'size-3.5',
    action:
      'flex size-8 cursor-pointer items-center justify-center rounded-[6px] border-none bg-transparent text-muted transition-colors outline-none select-none active:bg-hover active:text-surface focus-visible:ring-1 focus-visible:ring-panel-focus',
    actionIcon: 'size-4'
  },
  variants: {
    active: {
      // On desktop a pill glides behind the active tool (DesktopToolbar); mobile paints its own.
      true: {
        button: 'text-white'
      },
      false: {}
    },
    mobile: {
      true: {
        button: 'size-8 rounded-[6px] text-muted select-none',
        flyoutTrigger:
          'h-8 w-3 rounded-[6px] text-muted select-none active:bg-hover active:text-surface'
      },
      false: {
        button: 'rounded-[9px]',
        flyoutTrigger: 'rounded-md hover:text-surface'
      }
    },
    disabled: {
      true: {
        navigationAction: 'pointer-events-none'
      },
      false: {}
    }
  },
  compoundVariants: [
    {
      active: false,
      mobile: true,
      class: {
        button: 'active:bg-hover'
      }
    },
    {
      active: false,
      mobile: false,
      class: {
        button: 'hover:text-surface'
      }
    },
    {
      active: true,
      mobile: true,
      class: {
        button: 'bg-accent shadow-[0_2px_8px_-1px] shadow-accent/50'
      }
    }
  ],
  defaultVariants: {
    active: false,
    mobile: false,
    disabled: false
  }
}

export type ToolbarTheme = typeof toolbarTheme
export default toolbarTheme
