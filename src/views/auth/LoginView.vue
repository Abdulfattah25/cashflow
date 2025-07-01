<template>
  <div class="min-vh-100 d-flex align-items-center justify-content-center bg-light">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-4">
          <div class="card shadow">
            <div class="card-body p-4">
              <!-- Logo & Title -->
              <div class="text-center mb-4">
                <i class="bi bi-wallet2 text-primary" style="font-size: 3rem;"></i>
                <h2 class="mt-2 mb-1">Welcome Back</h2>
                <p class="text-muted">Sign in to your account</p>
              </div>

              <!-- Error Alert -->
              <div v-if="authStore.error" class="alert alert-danger" role="alert">
                <i class="bi bi-exclamation-triangle me-2"></i>
                {{ authStore.error }}
              </div>

              <!-- Login Form -->
              <form @submit.prevent="handleLogin">
                <div class="mb-3">
                  <label for="email" class="form-label">Email</label>
                  <div class="input-group">
                    <span class="input-group-text">
                      <i class="bi bi-envelope"></i>
                    </span>
                    <input
                      id="email"
                      v-model="form.email"
                      type="email"
                      class="form-control"
                      placeholder="Enter your email"
                      required
                      :disabled="authStore.loading"
                    >
                  </div>
                </div>

                <div class="mb-3">
                  <label for="password" class="form-label">Password</label>
                  <div class="input-group">
                    <span class="input-group-text">
                      <i class="bi bi-lock"></i>
                    </span>
                    <input
                      id="password"
                      v-model="form.password"
                      :type="showPassword ? 'text' : 'password'"
                      class="form-control"
                      placeholder="Enter your password"
                      required
                      :disabled="authStore.loading"
                    >
                    <button
                      type="button"
                      class="btn btn-outline-secondary"
                      @click="showPassword = !showPassword"
                    >
                      <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                    </button>
                  </div>
                </div>

                <div class="mb-3 form-check">
                  <input
                    id="remember"
                    v-model="form.remember"
                    type="checkbox"
                    class="form-check-input"
                  >
                  <label class="form-check-label" for="remember">
                    Remember me
                  </label>
                </div>

                <button
                  type="submit"
                  class="btn btn-primary w-100 mb-3"
                  :disabled="authStore.loading"
                >
                  <span v-if="authStore.loading" class="spinner-border spinner-border-sm me-2"></span>
                  {{ authStore.loading ? 'Signing in...' : 'Sign In' }}
                </button>
              </form>

              <!-- Divider -->
              <div class="text-center mb-3">
                <small class="text-muted">Don't have an account?</small>
              </div>

              <!-- Register Link -->
              <router-link
                to="/register"
                class="btn btn-outline-primary w-100"
              >
                Create Account
              </router-link>
            </div>
          </div>

          <!-- Footer -->
          <div class="text-center mt-4">
            <small class="text-muted">
              © 2024 CashFlow App. All rights reserved.
            </small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// Form state
const form = reactive({
  email: '',
  password: '',
  remember: false
})

const showPassword = ref(false)

// Methods
const handleLogin = async () => {
  try {
    await authStore.signIn(form.email, form.password)
    router.push('/')
  } catch (error) {
    console.error('Login error:', error)
  }
}
</script>
