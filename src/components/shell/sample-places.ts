import IconRecent from '~icons/hugeicons/clock-01'
import IconCloud from '~icons/hugeicons/cloud'
import IconHome from '~icons/hugeicons/home-01'

import type { ShellSidebarGroup } from './sidebar'

/** Home and two lists of files, as the shell's stories show the sidebar. */
export function samplePlaces(recentCount?: number): ShellSidebarGroup[] {
  return [
    { id: 'main', items: [{ id: 'home', label: 'Home', icon: IconHome }] },
    {
      id: 'files',
      label: 'Files',
      items: [
        { id: 'recent', label: 'Recent', icon: IconRecent, count: recentCount },
        { id: 'storage', label: 'Cloud storage', icon: IconCloud }
      ]
    }
  ]
}
