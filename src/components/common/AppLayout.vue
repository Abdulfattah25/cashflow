<template>
  <div class="app-layout">
    <!-- Loading Overlay - Only show for initial auth or critical operations -->
    <LoadingSpinner v-if="authStore.loading && !authStore.initialized" class="loading-spinner" />

    <!-- Mobile Overlay -->
    <div v-if="sidebarOpen" class="sidebar-overlay d-lg-none" @click="closeSidebar"></div>

    <!-- Sidebar (Desktop) -->
    <AppSidebar class="d-none d-lg-block" />

    <!-- Mobile Sidebar -->
    <AppSidebar
      v-if="sidebarOpen"
      class="d-lg-none position-fixed"
      :class="{ 'mobile-show': sidebarOpen }"
    />

    <!-- Header -->
    <AppHeader />

    <!-- Main Content Area -->
    <main class="main-content">
      <div class="container-fluid h-100">
        <div class="content-wrapper">
          <slot />
        </div>
      </div>
    </main>

    <!-- Bottom Navigation (Mobile Only) -->
    <BottomNav class="d-lg-none" />
  </div>
</template>

<script setup>
import { ref, provide, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import AppSidebar from './AppSidebar.vue'
import AppHeader from './AppHeader.vue'
import LoadingSpinner from './LoadingSpinner.vue'
import BottomNav from './BottomNav.vue'

const authStore = useAuthStore()
const sidebarOpen = ref(false)

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const closeSidebar = () => {
  sidebarOpen.value = false
}

provide('toggleSidebar', toggleSidebar)

const handleResize = () => {
  if (window.innerWidth >= 992) {
    sidebarOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  position: relative;
  overflow-x: hidden;
}

.main-content {
  flex: 1;
  margin-left: 0;
  transition: margin-left 0.3s ease;
  padding-top: var(--header-height, 70px);
  min-height: 100vh;
}

@media (min-width: 992px) {
  .app-layout {
    flex-direction: row;
  }

  .main-content {
    margin-left: var(--sidebar-width, 250px);
    margin-top: 0;
    padding-top: var(--header-height, 70px);
    padding-left: 1rem;
    padding-right: 1.5rem;
    padding-bottom: 1rem;
    min-height: 100vh;
  }
}

@media (min-width: 992px) {
  .app-layout {
    flex-direction: row;
  }

  .main-content {
    margin-left: 150px;
    margin-top: 0;
    padding-top: 35px;
    padding-left: 0;
    padding-right: 1.5rem;
    padding-bottom: 1rem;
    min-height: 100vh;
  }
}

@media (min-width: 1400px) {
  .main-content {
    padding-left: 0;
    padding-right: 2rem;
  }
}

@media (max-width: 767.98px) {
  .main-content {
    min-height: calc(100vh - var(--header-height, 70px) - var(--bottom-nav-height, 64px));
    padding-left: 0.5rem;
    padding-right: 0.5rem;
    padding-bottom: 1.4rem;
    padding-top: 2.2rem;
    margin-left: 0;
  }

  .app-layout {
    padding-bottom: 0;
  }
}

.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1040;
  backdrop-filter: blur(2px);
}

.main-content .container-fluid {
  max-width: none;
  padding-left: 0;
  padding-right: 0;
}

:deep(.loading-spinner) {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
}

.main-content {
  overflow-y: auto;
  overflow-x: hidden;
}

.content-wrapper {
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

:deep(.card) {
  margin-bottom: 1.5rem;
}

:deep(.row) {
  margin-bottom: 1rem;
}

@media (max-width: 991.98px) {
  .position-fixed {
    top: 0;
    left: 0;
    height: 100vh;
    z-index: 1041;
  }
}

[data-bs-theme='dark'] .app-layout {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
}

.main-content {
  will-change: margin-left;
}

.sidebar-overlay {
  will-change: opacity;
}
</style>
