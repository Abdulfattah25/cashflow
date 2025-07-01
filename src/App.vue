<template>
  <div id="app">
    <!-- Loading Overlay -->
    <LoadingSpinner 
      v-if="authStore.loading && !authStore.user" 
      overlay 
      text="Loading..." 
    />
    
    <!-- Router View -->
    <router-view v-else />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const authStore = useAuthStore()

onMounted(async () => {
  await authStore.initAuth()
})
</script>

<style>
#app {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
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

/* Responsive adjustments */
@media (max-width: 991.98px) {
  .main-content {
    margin-left: 0 !important;
  }
}
</style>
