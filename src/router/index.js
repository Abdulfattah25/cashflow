import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/home',
      redirect: '/',
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/LoginView2.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/auth/RegisterView.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/transactions',
      name: 'transactions',
      component: () => import('@/views/TransactionView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/reports',
      name: 'reports',
      component: () => import('@/views/ReportsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/budget',
      name: 'budget',
      component: () => import('@/views/BudgetView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/goals',
      name: 'goals',
      component: () => import('@/views/GoalsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/ProfileView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('@/views/AdminView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
  ],
})

// Navigation guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Wait for auth to be fully initialized if still loading
  if (authStore.loading) {
    // Wait for loading to complete
    await new Promise((resolve) => {
      const unwatch = authStore.$subscribe(() => {
        if (!authStore.loading) {
          unwatch()
          resolve()
        }
      })
    })
  }

  // Initialize auth if not already done (but not loading)
  if (!authStore.isAuthenticated && authStore.user === null && !authStore.loading) {
    await authStore.initAuth()
  }

  // Handle authentication requirements
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // For auth-required routes, stay on landing page
    next('/')
    return
  }

  // Handle guest-only routes (redirect authenticated users)
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/')
    return
  }

  // Handle admin-only routes
  if (to.meta.requiresAdmin) {
    if (!authStore.user?.role || authStore.user.role !== 'admin') {
      // Use global toast if available, otherwise console warn
      if (window.showToast) {
        window.showToast('Akses admin diperlukan', 'danger')
      } else {
        console.warn('Admin access required')
      }
      next('/')
      return
    }
  }

  next()
})

export default router
