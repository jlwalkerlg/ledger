import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/:pathMatch(.*)*',
      component: () => import('./pages/NotFoundPage.vue'),
    },
    {
      path: '/',
      component: () => import('./pages/HomePage.vue'),
    },
    {
      path: '/backup',
      component: () => import('./pages/HomePageBackup.vue'),
    },
  ],
})

export default router
