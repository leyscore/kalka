import type { Component } from 'vue'

/** One place in the sidebar: Home, a list of files, a team page or a section of Settings. */
export interface ShellSidebarItem {
  id: string
  label: string
  icon?: Component
  /** A count beside the label, such as the files in a list. */
  count?: number
}

/** A titled run of places, such as the file lists or the team's pages. */
export interface ShellSidebarGroup {
  id: string
  /** Shown above the group; none for the first, unlabeled one. */
  label?: string
  items: ShellSidebarItem[]
}

/** Where the work lives: this computer, a Kalka server or a Kalka Cloud workspace. */
export interface ShellWorkspace {
  name: string
  detail?: string
  mark?: string
}

/** The person at the foot of the sidebar, leading to their account and settings. */
export interface ShellAccount {
  name: string
  /** Under the name; none when the name already says where the button leads. */
  detail?: string
  initials: string
}

export interface ShellSidebarProps {
  workspace: ShellWorkspace
  groups: ShellSidebarGroup[]
  /** The place shown beside the sidebar. */
  selected?: string
  account?: ShellAccount
  label: string
}

/** Two letters for an avatar: the first and last names' initials, or a single name's first two. */
export function initialsOf(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter((part) => part.length > 0)
  const letters =
    parts.length > 1 ? `${parts[0]?.[0]}${parts.at(-1)?.[0]}` : name.trim().slice(0, 2)
  return letters.toUpperCase() || 'K'
}
