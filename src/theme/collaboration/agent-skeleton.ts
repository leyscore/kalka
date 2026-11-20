import { tv } from 'tailwind-variants'

/**
 * Where an agent's work is loading, in the pixel sky of kalka.design: a soft cloud of dots on a
 * 9 px grid over a 6 px grain, dense in the middle and fading at the edges, with a few patches
 * that twinkle. Kalka blue on a light backdrop, white on a dark one. It leaves by fading and
 * rising a little; without motion nothing twinkles.
 */
export const agentSkeleton = tv({
  slots: {
    root: 'pointer-events-none absolute rounded-[6px] bg-size-[9px_9px,6px_6px] [mask-image:radial-gradient(ellipse_75%_70%_at_50%_55%,#000_25%,transparent_78%)] animate-in fade-in-0 duration-150 transition-[opacity,translate] duration-[320ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] data-[leaving]:-translate-y-[3px] data-[leaving]:opacity-0',
    spark:
      'absolute bg-size-[9px_9px] opacity-0 motion-safe:animate-skeleton-twinkle motion-reduce:hidden'
  },
  variants: {
    tone: {
      light: {
        root: 'bg-[radial-gradient(circle,rgb(47_91_234/0.26)_0_2.2px,transparent_2.7px),radial-gradient(circle,rgb(47_91_234/0.1)_0_1px,transparent_1.4px)]',
        spark: 'bg-[radial-gradient(circle,rgb(47_91_234/0.55)_0_2.2px,transparent_2.7px)]'
      },
      dark: {
        root: 'bg-[radial-gradient(circle,rgb(255_255_255/0.42)_0_2.2px,transparent_2.7px),radial-gradient(circle,rgb(255_255_255/0.1)_0_1px,transparent_1.4px)]',
        spark: 'bg-[radial-gradient(circle,rgb(255_255_255/0.75)_0_2.2px,transparent_2.7px)]'
      }
    }
  },
  defaultVariants: { tone: 'light' }
})
