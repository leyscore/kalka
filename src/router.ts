import { createRouter, createWebHistory } from 'vue-router'

import { IS_DEMO_SITE } from './app/demo/site'
import { homeFilesTab } from './app/home/files-tab'
import WorkspaceView from './views/WorkspaceView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // A demo host has no home of its own: its root is the demo document.
    IS_DEMO_SITE ? { path: '/', redirect: '/demo' } : { path: '/', component: WorkspaceView },
    // The storage workspace is Home's Storage tab.
    {
      path: '/storage',
      redirect: () => {
        homeFilesTab.value = 'storage'
        return '/'
      }
    },
    { path: '/demo', component: WorkspaceView, meta: { demo: true } },
    { path: '/share/:roomId', component: WorkspaceView },
    // A server document's own address; the name after the id follows renames and is ignored.
    { path: '/design/:id/:slug?', component: WorkspaceView },
    // Settings is a page over the workspace, so the open documents stay as they are behind it.
    { path: '/settings/:section?', component: WorkspaceView }
  ]
})

export default router
