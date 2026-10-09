const switchTheme = {
  slots: {
    root: 'relative inline-flex shrink-0 cursor-pointer items-center rounded-full border border-border bg-panel-field outline-none transition-colors duration-200 hover:border-border-strong focus-visible:ring-1 focus-visible:ring-panel-focus data-[state=checked]:border-accent data-[state=checked]:bg-accent',
    thumb:
      'pointer-events-none block rounded-full bg-muted shadow-sm transition-[transform,background-color] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] data-[state=checked]:bg-white motion-reduce:transition-none'
  },
  variants: {
    size: {
      sm: { root: 'h-4 w-7 p-0.5', thumb: 'size-3 data-[state=checked]:translate-x-3' },
      md: { root: 'h-5 w-9 p-0.5', thumb: 'size-4 data-[state=checked]:translate-x-4' }
    },
    state: {
      idle: {},
      mixed: { root: 'border-accent/60 bg-accent/20', thumb: 'translate-x-1.5 bg-accent' }
    }
  },
  defaultVariants: {
    size: 'sm' as const,
    state: 'idle' as const
  }
}

export type SwitchTheme = typeof switchTheme
export default switchTheme
