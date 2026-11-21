export default {
  slots: {
    root: 'relative flex min-w-0 items-center justify-between gap-2',
    value: 'min-w-0 select-all break-all text-surface',
    copy: 'shrink-0'
  },
  variants: {
    look: {
      /** A command to run, set apart like a terminal line. */
      command: {
        root: 'rounded-[7px] border border-hairline bg-panel-field py-1.5 pr-9 pl-3',
        value: 'font-mono text-[11px] leading-relaxed',
        /** In the block's top corner, so a long command keeps its width. */
        copy: 'absolute top-1 right-1'
      },
      /** An address or token inside a settings row. */
      plain: { value: 'text-xs' }
    }
  },
  defaultVariants: {
    look: 'command' as const
  }
}
