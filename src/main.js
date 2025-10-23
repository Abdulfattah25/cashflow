import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Import CSS
import './assets/main.css'

// PWA Registration
import { registerSW } from 'virtual:pwa-register'

// Register Service Worker
const updateSW = registerSW({
  onNeedRefresh() {
    // Show prompt to user for update
    if (confirm('New content available. Reload to update?')) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    // Optional: Show notification that app is ready for offline use
    if (window.showToast) {
      window.showToast('Aplikasi siap digunakan offline!', 'success')
    }
  },
  onRegistered() {
    // Service Worker registered successfully (silent)
  },
  onRegisterError() {
    // Service Worker registration failed (silent in production)
  },
})

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
