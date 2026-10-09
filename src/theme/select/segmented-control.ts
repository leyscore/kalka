const segmentedControlTheme = {
  slots: {
    root: 'inline-flex items-center gap-0.5 rounded-lg bg-track p-[3px]',
    item: 'flex h-6 min-w-max flex-auto cursor-pointer items-center justify-center gap-1 rounded-md text-muted outline-none transition-colors duration-150 hover:text-surface focus-visible:ring-1 focus-visible:ring-panel-focus data-[state=on]:text-surface disabled:cursor-not-allowed disabled:opacity-50'
  },
  variants: {
    size: {
      sm: { item: 'px-1.5 text-[11px]' },
      md: { item: 'px-2 text-[11px]' },
      /** A panel's own switch, such as File and Assets: roomier, with the chosen label in bold. */
      lg: {
        root: 'rounded-[9px]',
        item: 'h-[26px] rounded-[7px] px-2.5 text-xs font-medium data-[state=on]:font-semibold'
      },
      touch: { item: 'h-10 min-w-10 px-2 text-xs' }
    }
  },
  defaultVariants: {
    size: 'sm' as const
  }
}

export type SegmentedControlTheme = typeof segmentedControlTheme
export default segmentedControlTheme
