const panelHeaderTheme = {
  slots: {
    root: 'grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 px-3.5 pt-3.5 pb-1.5 text-surface',
    icon: 'flex min-h-3.5 min-w-3.5 items-center justify-center text-surface',
    title: 'min-w-0 truncate text-[13px] font-semibold text-surface',
    actions:
      'flex min-w-0 items-center justify-end gap-0.5 [&_[data-slot=icon-button]]:size-6 [&_[data-slot=icon-button]]:rounded'
  },
  variants: {
    component: {
      true: {
        icon: 'text-component',
        title: 'text-component'
      },
      false: {}
    }
  },
  defaultVariants: {
    component: false
  }
}

export type PanelHeaderTheme = typeof panelHeaderTheme
export default panelHeaderTheme
