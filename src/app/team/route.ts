/**
 * The team's pages on Home, for an administrator signed in to a Kalka server or Cloud workspace:
 * `/team/people` and `/team/settings`, each an address a link or a reload opens.
 */
export const TEAM_PAGES = ['people', 'settings'] as const
export type TeamPage = (typeof TEAM_PAGES)[number]

const TEAM_PATH = /^\/team\/(people|settings)\/?$/

export function teamPath(page: TeamPage): string {
  return `/team/${page}`
}

/** The team page a path names, or null for a path outside them. */
export function teamPageFromPath(path: string): TeamPage | null {
  const page = TEAM_PATH.exec(path)?.[1]
  return page === 'people' || page === 'settings' ? page : null
}
