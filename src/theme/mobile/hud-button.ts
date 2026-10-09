import { tv } from 'tailwind-variants'

export const hudButton = tv({
  slots: {
    base: 'border border-glass-strong-border bg-glass-strong text-surface shadow-(--toolbar-shadow) backdrop-blur-[28px] backdrop-saturate-150 hover:bg-float active:bg-hover',
    icon: 'size-3.5 shrink-0'
  },
  variants: { iconOnly: { true: { base: 'size-8 p-0' }, false: {} } }
})
