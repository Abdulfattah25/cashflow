<template>
  <div>
    <LandingPage @show-auth="showAuthModal = true" />
    <AuthModal
      v-if="showAuthModal"
      @close-modal="closeAuthModal"
      @auth-success="handleAuthSuccess"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import LandingPage from '@/components/landing/LandingPage.vue'
import AuthModal from '@/components/auth/AuthModal.vue'

const router = useRouter()
const showAuthModal = ref(false)

const closeAuthModal = () => {
  showAuthModal.value = false
}

const handleAuthSuccess = () => {
  showAuthModal.value = false
  // Redirect to dashboard after successful authentication
  router.push('/dashboard')
}
</script>

<style scoped>
/* No additional styles needed - components have their own styles */
</style>
