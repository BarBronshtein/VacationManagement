import { createRouter, createWebHistory } from 'vue-router'
import AuthView from '../views/AuthView.vue'
import DashBoardView from '../views/DashBoardView.vue'
import { isTokenExpired, useSession} from '../composables/useSession'
import { toRaw } from 'vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/auth' },
    { path: '/auth', component: AuthView },
    { path: '/app', component:()=> import('../views/DashboardView.vue'), meta: { requiresAuth: true } },
  ],
})

router.beforeEach((to) => {
  const session = useSession()
  let currentUser = toRaw(session.currentUser);
  
  console.log(session)
  if (to.meta.requiresAuth && !currentUser?.value) {
    return '/auth'
  }

  if (to.path === '/auth' && currentUser?.value && !toRaw(session.isTokenExpired())) {
    return '/app'
  }

  return true
})

export default router