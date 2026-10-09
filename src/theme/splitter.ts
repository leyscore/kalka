const splitterTheme = {
  slots: {
    handle:
      'group relative z-10 shrink-0 touch-none outline-none focus-visible:ring-1 focus-visible:ring-panel-focus',
    divider:
      'pointer-events-none absolute bg-border transition-colors group-data-[state=drag]:bg-accent group-data-[state=hover]:bg-accent group-focus-visible:bg-accent'
  },
  variants: {
    /**
     * `gutter` resizes floating panels from the gap between them: the handle fills the gap and its
     * line shows only while it is hovered, dragged, or focused.
     */
    gutter: {
      true: {
        divider:
          'rounded-full opacity-0 group-data-[state=drag]:opacity-100 group-data-[state=hover]:opacity-100 group-focus-visible:opacity-100'
      },
      false: {}
    },
    direction: {
      horizontal: {
        handle: '-mx-1 w-2 cursor-col-resize',
        divider: 'inset-y-0 left-1/2 w-px -translate-x-1/2'
      },
      vertical: {
        handle: '-my-1 h-2 cursor-row-resize',
        divider: 'inset-x-0 top-1/2 h-px -translate-y-1/2'
      }
    }
  },
  compoundVariants: [
    {
      gutter: true,
      direction: 'horizontal' as const,
      class: { handle: 'mx-0 w-2', divider: 'inset-y-10 w-0.5' }
    }
  ],
  defaultVariants: {
    gutter: false
  }
}

export type SplitterTheme = typeof splitterTheme
export default splitterTheme
