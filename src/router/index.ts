import { createRouter, createWebHistory } from 'vue-router'
import About from '../views/About.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'about',
      component: About
    },
    {
      path: '/about',
      name: 'about-page',
      component: About
    }
  ]
})

export default router
