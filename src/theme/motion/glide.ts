/**
 * Pills that glide between list items: a soft hover highlight, and an active pill that slides to
 * the chosen item. The easing settles like a light spring without overshooting.
 */
const glideMotion =
  'transition-[transform,width,height,opacity] duration-[280ms] ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none'

export const glidePills = {
  /** A hover highlight in menus, lists, and navigation. */
  hover: `rounded-md bg-(--pill-hover-bg) ${glideMotion}`,
  /** The pill behind the active item of a panel's tabs or a segmented control. */
  active: `rounded-md bg-(--pill-active-bg) shadow-(--pill-active-shadow) ${glideMotion}`,
  /** The chosen option of a segmented control: a raised chip in the track. */
  segment: `rounded-md bg-(--pill-active-bg) shadow-(--pill-active-shadow) ${glideMotion}`,
  /** The current place in a page's navigation, such as Home's sidebar: a roomier chip. */
  navActive: `rounded-[9px] bg-(--pill-active-bg) shadow-(--pill-active-shadow) ${glideMotion}`,
  /** The hover highlight in that navigation. */
  navHover: `rounded-[9px] bg-(--pill-hover-bg) ${glideMotion}`,
  /** The accent pill behind the active tool. */
  accent: `rounded-[9px] bg-accent ${glideMotion}`
} as const
