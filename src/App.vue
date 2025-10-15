<template>
  <div id="app">
    <div
      v-if="loading"
      class="d-flex justify-content-center align-items-center"
      style="height: 100vh"
    >
      <div class="text-center">
        <div class="spinner-border text-primary mb-3" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p>Memuat aplikasi...</p>
      </div>
    </div>

    <div v-else>
      <div v-if="!authStore.isAuthenticated" class="landing-container">
        <LandingPage @show-auth="showAuthModal" />
        <AuthModal
          v-if="showAuth"
          @auth-success="handleAuthSuccess"
          @close-modal="handleCloseModal"
        />
      </div>

      <AppLayout v-else-if="authStore.isAuthenticated">
        <router-view />
      </AppLayout>

      <div
        id="toastContainer"
        aria-live="polite"
        aria-atomic="true"
        class="position-fixed top-0 end-0 p-3"
        style="z-index: 9999"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCategories } from '@/composables/useCategories'
import { useTransactions } from '@/composables/useTransactions'
import { supabase } from '@/lib/supabase'
import LandingPage from '@/components/landing/LandingPage.vue'
import AuthModal from '@/components/auth/AuthModal.vue'
import AppLayout from '@/components/common/AppLayout.vue'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(true)
const showAuth = ref(false)

const showAuthModal = () => {
  showAuth.value = true
}

const handleAuthSuccess = () => {
  showAuth.value = false
  router.push('/')
  setTimeout(() => {
    showToast('Login berhasil', 'success')
  }, 100)
}

const handleCloseModal = () => {
  showAuth.value = false
}

const initializeApp = async () => {
  try {
    // Initialize auth and wait for completion
    await authStore.initAuth()

    // Set up auth state change listener (but don't duplicate initAuth)
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await authStore.fetchUserProfile(session.user)
        showAuth.value = false
        // Only redirect if not already on an auth-required page
        if (!router.currentRoute.value.meta.requiresAuth) {
          router.push('/')
        }
        setTimeout(() => showToast('Login berhasil', 'success'), 500)
      }

      if (event === 'SIGNED_OUT') {
        // Clear categories cache on logout
        const { clearCache } = useCategories()
        clearCache()

        // Only redirect if currently on an auth-required page
        if (router.currentRoute.value.meta.requiresAuth) {
          router.push('/')
        }
        setTimeout(() => showToast('Logout berhasil', 'info'), 500)
      }
    })
  } catch (error) {
    console.error('App initialization error:', error)
    showToast('Gagal memuat aplikasi', 'danger')
  } finally {
    // Ensure loading is set to false after auth is fully initialized
    loading.value = false
  }
}

const showToast = (() => {
  let lastToastTime = 0
  let lastToastMessage = ''
  const TOAST_COOLDOWN = 1000
  const MESSAGE_COOLDOWN = 5000

  return (message, variant = 'info', delay = 4000) => {
    const now = Date.now()

    if (lastToastMessage === message && now - lastToastTime < MESSAGE_COOLDOWN) {
      return
    }

    if (now - lastToastTime < TOAST_COOLDOWN) {
      return
    }

    lastToastTime = now
    lastToastMessage = message

    try {
      const container = document.getElementById('toastContainer')
      if (!container) return

      const existingToasts = container.children.length
      if (existingToasts >= 3) {
        while (container.children.length >= 3) {
          container.removeChild(container.firstChild)
        }
      }

      const toastEl = document.createElement('div')
      toastEl.className = `toast align-items-center text-bg-${variant} border-0`
      toastEl.setAttribute('role', 'alert')
      toastEl.innerHTML = `
        <div class="d-flex">
          <div class="toast-body">${message}</div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>`

      container.appendChild(toastEl)
      const toast = new window.bootstrap.Toast(toastEl, { delay })
      toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove())
      toast.show()
    } catch (error) {
      console.error('Toast error:', error)
    }
  }
})()

// Watch for route changes to handle landing page visibility
watch(
  () => authStore.user,
  (newUser) => {
    if (!newUser && router.currentRoute.value.meta.requiresAuth) {
      router.push('/')
    }
  },
)

// Setup global realtime subscriptions
const setupGlobalRealtime = () => {
  console.log('Setting up global realtime subscriptions...')
  const { setupRealtime: setupTransactionsRealtime } = useTransactions()
  const { setupRealtime: setupCategoriesRealtime } = useCategories()

  // Setup realtime for all data sources
  setupTransactionsRealtime()
  setupCategoriesRealtime()

  console.log('Global realtime subscriptions active')
}

// Cleanup global realtime subscriptions
const cleanupGlobalRealtime = () => {
  console.log('Cleaning up global realtime subscriptions...')
  const { cleanupRealtime: cleanupTransactions } = useTransactions()
  const { cleanupRealtime: cleanupCategories } = useCategories()

  cleanupTransactions()
  cleanupCategories()
}

onMounted(() => {
  initializeApp()

  // Setup global realtime when user is authenticated
  watch(
    () => authStore.isAuthenticated,
    (isAuth) => {
      if (isAuth) {
        // Setup realtime after short delay to ensure user data is loaded
        setTimeout(() => {
          setupGlobalRealtime()
        }, 1000)
      } else {
        cleanupGlobalRealtime()
      }
    },
    { immediate: true },
  )

  // Network status listeners
  const onOffline = () => showToast('Koneksi internet terputus', 'warning')
  const onOnline = () => showToast('Kembali online', 'success')
  window.addEventListener('offline', onOffline)
  window.addEventListener('online', onOnline)

  // Cleanup on unmount
  window.__netListeners = { onOffline, onOnline }
})

// Expose showToast globally for components
window.showToast = showToast
</script>

<style>
#app {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* Reduce global header height for tighter spacing */
:root {
  --header-height: 56px;
}

@media (max-width: 575.98px) {
  :root {
    --header-height: 52px;
  }
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Landing page styles */
.landing-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Toast container positioning */
#toastContainer {
  position: fixed !important;
  top: 1rem !important;
  right: 1rem !important;
  z-index: 9999 !important;
}

/* Global toast styling */
.toast {
  backdrop-filter: blur(10px);
  border-radius: 0.75rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

/* Responsive adjustments */
@media (max-width: 991.98px) {
  .main-content {
    margin-left: 0 !important;
  }

  #toastContainer {
    top: 0.5rem !important;
    right: 0.5rem !important;
    left: 0.5rem !important;
    width: auto !important;
  }
}
</style>
