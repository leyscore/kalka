export default {
  slots: {
    root: 'flex min-w-0 items-center justify-between gap-2',
    value: 'min-w-0 select-all break-all text-surface'
  },
  variants: {
    look: {
      /** A command to run, set apart like a terminal line. */
      command: {
        root: 'rounded-lg border border-border/70 bg-input py-1.5 pr-1.5 pl-3',
        value: 'font-mono text-[11px] leading-relaxed'
      },
      /** An address or token inside a settings row. */
      plain: { value: 'text-xs' }
    }
  },
  defaultVariants: {
    look: 'command' as const
  }
}
