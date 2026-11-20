import type { Router } from 'vue-router'

import { homeFilesTab } from '@/app/home/files-tab'

export function openStorageWorkspace(router: Router): void {
  homeFilesTab.value = 'storage'
  void router
    .push('/')
    .then(() => import('@/app/tabs'))
    .then(({ showNewTab }) => showNewTab())
}
