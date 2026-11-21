import { createRouter, createWebHistory } from 'vue-router'

import { IS_DEMO_SITE } from './app/demo/site'
import WorkspaceView from './views/WorkspaceView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // A demo host has no home of its own: its root is the demo document.
    IS_DEMO_SITE ? { path: '/', redirect: '/demo' } : { path: '/', component: WorkspaceView },
    // The lists of files on Home, each with its address; `/storage` is the older one for Storage.
    { path: '/files/:list', component: WorkspaceView },
    // The team's pages, for an administrator signed in to a server or Cloud workspace.
    { path: '/team/:page', component: WorkspaceView },
    { path: '/storage', redirect: (to) => ({ path: '/files/storage', query: to.query }) },
    { path: '/demo', component: WorkspaceView, meta: { demo: true } },
    { path: '/share/:roomId', component: WorkspaceView },
    // A server document's own address; the name after the id follows renames and is ignored.
    { path: '/design/:id/:slug?', component: WorkspaceView },
    // The welcome is a page over Home, so the first workspace is already there behind it.
    { path: '/welcome', component: WorkspaceView },
    // Settings is a page over the workspace, so the open documents stay as they are behind it.
    { path: '/settings/:section?', component: WorkspaceView },
    // Anything else, such as `/files` or `/design` alone, goes to Home rather than a blank page.
    { path: '/:pathMatch(.*)*', redirect: (to) => ({ path: '/', query: to.query }) }
  ]
})

export default router
