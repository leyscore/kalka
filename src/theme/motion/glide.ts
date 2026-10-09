/**
 * Pills that glide between list items: a soft hover highlight, and an active pill that slides to
 * the chosen item. The easing settles like a light spring without overshooting.
 */
const glideMotion =
  'transition-[transform,width,height,opacity] duration-[280ms] ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none'

export const glidePills = {
  /** A hover highlight in menus, lists, and navigation. */
  hover: `rounded-md bg-hover ${glideMotion}`,
  /** The pill behind the active item of a panel's tabs or a segmented control. */
  active: `rounded-md bg-panel-field-hover shadow-sm ${glideMotion}`,
  /** The accent pill behind the active tool. */
  accent: `rounded-lg bg-accent shadow-[0_2px_10px_-2px] shadow-accent/60 ${glideMotion}`
} as const
