import { tv } from 'tailwind-variants'

/** A person's photo or pixel creature, in the avatar stack, presence lists, and mobile HUD. */
export const avatar = tv({
  base: 'shrink-0 rounded-full bg-panel-secondary object-cover [image-rendering:pixelated]',
  variants: {
    size: { sm: 'size-6', md: 'size-7' },
    bordered: { true: 'border-2 border-panel', false: '' },
    following: { true: 'ring-2 ring-white/40', false: '' },
    /** A collaborator's avatar, which follows them when clicked. */
    interactive: { true: 'cursor-pointer transition-all', false: '' }
  },
  compoundVariants: [{ following: true, bordered: true, class: 'border-white' }],
  defaultVariants: { size: 'sm', bordered: false, following: false, interactive: false }
})
