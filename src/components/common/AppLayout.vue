<template>
  <div class="app-layout">
    <!-- Loading Overlay -->
    <LoadingSpinner v-if="authStore.loading" class="loading-spinner" />

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
  padding: 1rem;
  transition: margin-left 0.3s ease;
  min-height: calc(100vh - var(--header-height, 56px));
}

/* Desktop layout with sidebar */
@media (min-width: 992px) {
  .app-layout {
    flex-direction: row;
  }

  .main-content {
    margin-left: 250px; /* Sidebar width */
    padding: 1.5rem;
    width: calc(100% - 250px);
  }
}

/* Tablet adjustments */
@media (min-width: 768px) and (max-width: 991.98px) {
  .main-content {
    padding: 1.25rem;
  }
}

/* Mobile adjustments */
@media (max-width: 767.98px) {
  .main-content {
    padding: 0.75rem;
    padding-bottom: 90px; /* Space for bottom nav */
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

/* Container fluid adjustments */
.main-content .container-fluid {
  max-width: none;
  padding: 0;
}

/* Loading spinner positioning */
:deep(.loading-spinner) {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
}

/* Responsive content width */
@media (min-width: 1400px) {
  .main-content {
    padding: 2rem;
  }
}

/* Ensure proper scroll behavior */
.main-content {
  overflow-y: auto;
  overflow-x: hidden;
}

/* Content wrapper for better organization */
.content-wrapper {
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

/* Ensure cards and components have proper spacing */
:deep(.card) {
  margin-bottom: 1.5rem;
}

:deep(.row) {
  margin-bottom: 1rem;
}

/* Mobile sidebar positioning */
@media (max-width: 991.98px) {
  .position-fixed {
    top: 0;
    left: 0;
    height: 100vh;
    z-index: 1041;
  }
}

/* Dark theme support */
[data-bs-theme='dark'] .app-layout {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
}

/* Performance optimizations */
.main-content {
  will-change: margin-left;
}

.sidebar-overlay {
  will-change: opacity;
}
</style>
