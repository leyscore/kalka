import { tv } from 'tailwind-variants'

/**
 * Where an agent's work is loading: a block of the site's white glass, edged with dashes in the
 * agent's color, with a shine passing over it. Without motion the shine stays away.
 */
export const agentSkeleton = tv({
  slots: {
    root: 'pointer-events-none absolute rounded-[10px] border border-dashed bg-white/60 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.85),0_1px_3px_rgb(14_18_34/0.08)]',
    clip: 'absolute inset-0 overflow-hidden rounded-[inherit]',
    shine:
      'absolute inset-y-0 left-0 w-1/3 bg-[linear-gradient(100deg,transparent_10%,rgb(255_255_255/0.95)_45%,rgb(157_183_245/0.5)_60%,transparent_90%)] motion-safe:animate-skeleton-shine motion-reduce:hidden'
  }
})
