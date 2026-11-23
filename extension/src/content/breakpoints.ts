// Copies an element at several page widths, so Kalka pastes it as an artboard with a breakpoint
// for each: the page is shown at each width in turn, as a narrower screen would show it, and the
// element is copied there. Every copy has the same elements in the same order, those the page
// hides at a width written as hidden, so Kalka pairs the layers of each breakpoint by position.
import { captureElement, type Capture } from './capture'
import type { ReadFiles } from './data-url'
import { readHiddenSheets } from './hidden-sheets'
import type { Shots } from './shots'

/** The widths Kalka's Design panel offers as breakpoints. */
export const BREAKPOINTS = [
  { key: 'tablet', name: 'Tablet', width: 810 },
  { key: 'phone', name: 'Phone', width: 390 }
] as const

export type BreakpointKey = (typeof BREAKPOINTS)[number]['key']

export function isBreakpointKey(value: unknown): value is BreakpointKey {
  return BREAKPOINTS.some((breakpoint) => breakpoint.key === value)
}

/** Shows the page at a width, or at its own width again for null. */
export type Emulate = (width: number | null) => Promise<void>

/** Lets the page lay itself out again, and its scripts react to the new width. */
async function settle(): Promise<void> {
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  })
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 150)
  })
}

/** The elements of a subtree the page shows at the current width. */
function shown(root: Element): Set<Element> {
  const out = new Set<Element>()
  const visit = (element: Element) => {
    if (getComputedStyle(element).display === 'none') return
    out.add(element)
    for (const child of element.children) visit(child)
  }
  visit(root)
  return out
}

/** The template that carries a narrower copy inside the widest one's HTML. */
function template(width: number, name: string, html: string): string {
  return `<template data-kalka-breakpoint="${width}" data-kalka-name="${name}">${html}</template>`
}

/**
 * Copies an element at the page's own width and at each breakpoint narrower than it. The page
 * is always given its own width back, also when showing it at another one fails.
 */
export async function captureAtWidths(
  element: Element,
  keys: readonly BreakpointKey[],
  emulate: Emulate,
  shots?: Shots,
  read?: ReadFiles
): Promise<{ capture: Capture; widths: number[] }> {
  await readHiddenSheets(read)
  const own = window.innerWidth
  const breakpoints = BREAKPOINTS.filter(
    (breakpoint) => keys.includes(breakpoint.key) && breakpoint.width < own
  )
  if (breakpoints.length === 0)
    return { capture: captureElement(element, 'kalka', { shots }), widths: [] }
  // Elements the page shows at any of the widths, so each copy holds them all.
  const keep = shown(element)
  const copies: string[] = []
  try {
    for (const { width } of breakpoints) {
      await emulate(width)
      await settle()
      for (const visible of shown(element)) keep.add(visible)
    }
    for (const { width, name } of breakpoints) {
      await emulate(width)
      await settle()
      copies.push(template(width, name, captureElement(element, 'kalka', { keep }).html))
    }
  } finally {
    await emulate(null)
    await settle()
  }
  // The page's own width is the one the screen shows: only that copy takes its pictures.
  const capture = captureElement(element, 'kalka', { keep, shots })
  return {
    capture: { ...capture, html: capture.html + copies.join('') },
    widths: breakpoints.map((breakpoint) => breakpoint.width)
  }
}
