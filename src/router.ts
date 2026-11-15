import { createRouter, createWebHistory } from 'vue-router'

import { IS_DEMO_SITE } from './app/demo/site'
import WorkspaceView from './views/WorkspaceView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // A demo host has no home of its own: its root is the demo document.
    IS_DEMO_SITE ? { path: '/', redirect: '/demo' } : { path: '/', component: WorkspaceView },
    { path: '/storage', redirect: '/' },
    { path: '/demo', component: WorkspaceView, meta: { demo: true } },
    { path: '/share/:roomId', component: WorkspaceView }
  ]
})

export default router
