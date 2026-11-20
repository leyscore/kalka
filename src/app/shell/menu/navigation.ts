import type { Router } from 'vue-router'

import { filesPath } from '@/app/home/files-route'

/** Home on the storage workspace's list, at its address. */
export function openStorageWorkspace(router: Router): void {
  void router
    .push(filesPath('storage'))
    .then(() => import('@/app/tabs'))
    .then(({ showNewTab }) => showNewTab())
}
