import { createHomeTab, getTabsSnapshot, switchTab } from '@/app/tabs'

import { homeFilesTab, type HomeFilesTab } from './files-tab'

/** Shows Home on one of its lists of files, in its own tab or a new one. */
export function showHomeFiles(list: HomeFilesTab): void {
  homeFilesTab.value = list
  const home = getTabsSnapshot().find((tab) => tab.kind === 'home')
  if (home) switchTab(home.id)
  else createHomeTab()
}
