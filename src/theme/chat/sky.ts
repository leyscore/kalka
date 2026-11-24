import { tv } from 'tailwind-variants'

/** What the agent is up to, as the chat's sky shows it. */
export type AgentBannerState = 'ready' | 'working' | 'waiting'

/**
 * The strip of sky at the top of the AI chat, where the agent lives: its pixel creature in a glass
 * tile, its name, and a line saying what it is doing. Stars and dot clouds keep to the right so
 * nothing moves behind the glass.
 */
export const chatSkyTheme = tv({
  slots: {
    decor: 'pointer-events-none absolute inset-0',
    star: 'absolute bg-(--chat-sky-star) mask-sky-star opacity-45 motion-safe:animate-star-glow',
    cloud:
      'absolute h-2.5 rounded-full bg-[radial-gradient(var(--chat-sky-cloud)_1px,transparent_1.4px)] bg-size-[5px_5px]',
    agent: 'relative flex items-center gap-[11px] px-3.5 pt-1.5 pb-4',
    tile: 'grid size-[42px] shrink-0 place-items-center rounded-xl border border-(--chat-tile-edge) glass shadow-(--chat-tile-shadow)',
    creature: 'size-[26px] motion-safe:data-[state=working]:animate-creature-bob',
    other:
      '-ml-5 grid size-7 shrink-0 place-items-center self-end rounded-lg border border-(--chat-tile-edge) bg-panel shadow-(--chat-tile-shadow)',
    otherCreature: 'size-4',
    text: 'flex min-w-0 flex-col gap-px',
    name: 'truncate font-display text-[17px] leading-[1.15] font-semibold tracking-[-0.01em] text-surface',
    status: 'flex min-w-0 items-center gap-1.5 text-[11px] text-label',
    dot: 'size-1.5 shrink-0 rounded-full bg-success data-[state=waiting]:bg-warning-action data-[state=working]:bg-link',
    statusText: 'truncate',
    progress: 'absolute inset-x-3.5 bottom-2 h-[3px] overflow-hidden rounded-full bg-surface/10',
    liquid:
      'block h-full w-full origin-left scale-x-[0.45] rounded-full bg-linear-to-r from-accent to-link motion-safe:animate-liquid-breathe'
  }
})
