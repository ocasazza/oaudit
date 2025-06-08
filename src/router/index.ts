import { createRouter, createWebHistory } from 'vue-router'
import About from '../views/About.vue'
import Settings from '../views/Settings.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: About,
      meta: {
        title: 'Home',
        breadcrumb: 'Home',
        showInNav: true,
        icon: '🏠',
        order: 1
      }
    },
    {
      path: '/about',
      name: 'about',
      component: About,
      meta: {
        title: 'About',
        breadcrumb: 'About',
        showInNav: true,
        icon: 'ℹ️',
        order: 2
      }
    },
    {
      path: '/settings',
      name: 'settings',
      component: Settings,
      meta: {
        title: 'Settings',
        breadcrumb: 'Settings',
        showInNav: true,
        icon: '⚙️',
        order: 3
      }
    }
  ]
})

export default router
