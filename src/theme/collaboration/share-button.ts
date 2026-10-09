import { tv } from 'tailwind-variants'

export const shareButton = tv({
  base: 'flex h-[30px] cursor-pointer items-center gap-1.5 rounded-lg border-none px-3 text-xs font-semibold transition-[background-color,scale] duration-150 outline-none focus-visible:ring-2 focus-visible:ring-accent/50 active:scale-[0.97] motion-reduce:active:scale-100',
  variants: {
    connection: {
      idle: 'bg-accent text-white hover:bg-accent/90',
      joining:
        'animate-pulse motion-reduce:animate-none border border-[var(--color-warning-border)] bg-[var(--color-warning-bg)] text-[var(--color-warning-text)]',
      // Still a share action when connected; your avatar shows the room is live.
      connected: 'bg-accent text-white hover:bg-accent/90'
    }
  },
  defaultVariants: { connection: 'idle' }
})
