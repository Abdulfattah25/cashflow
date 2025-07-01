<template>
  <div class="app-layout">
    <!-- Loading Overlay -->
    <LoadingSpinner v-if="authStore.loading" />
    
    <!-- Mobile Overlay -->
    <div 
      v-if="sidebarOpen" 
      class="sidebar-overlay d-lg-none" 
      @click="closeSidebar"
    ></div>
    
    <!-- Sidebar -->
    <AppSidebar :class="{ 'mobile-show': sidebarOpen }" />
    
    <!-- Header -->
    <AppHeader />
    
    <!-- Main Content -->
    <main class="main-content">
      <div class="container-fluid">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, provide, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import AppSidebar from './AppSidebar.vue'
import AppHeader from './AppHeader.vue'
import LoadingSpinner from './LoadingSpinner.vue'

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
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1040;
}
</style>
