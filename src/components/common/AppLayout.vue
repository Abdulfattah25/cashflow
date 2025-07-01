<template>
  <div class="app-layout">
    <!-- Loading Overlay -->
    <LoadingSpinner v-if="authStore.loading" />
    
    <!-- Sidebar -->
    <AppSidebar />
    
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
import { useAuthStore } from '@/stores/auth'
import AppSidebar from './AppSidebar.vue'
import AppHeader from './AppHeader.vue'
import LoadingSpinner from './LoadingSpinner.vue'

const authStore = useAuthStore()
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}
</style>
