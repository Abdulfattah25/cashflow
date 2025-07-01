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
                <h2 class="mt-2 mb-1">Create Account</h2>
                <p class="text-muted">Join us to manage your finances</p>
              </div>

              <!-- Success Alert -->
              <div v-if="showSuccess" class="alert alert-success" role="alert">
                <i class="bi bi-check-circle me-2"></i>
                Account created successfully! Please check your email to verify your account.
              </div>

              <!-- Error Alert -->
              <div v-if="authStore.error" class="alert alert-danger" role="alert">
                <i class="bi bi-exclamation-triangle me-2"></i>
                {{ authStore.error }}
              </div>

              <!-- Register Form -->
              <form @submit.prevent="handleRegister" v-if="!showSuccess">
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
                      minlength="6"
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
                  <div class="form-text">Password must be at least 6 characters long.</div>
                </div>

                <div class="mb-3">
                  <label for="confirmPassword" class="form-label">Confirm Password</label>
                  <div class="input-group">
                    <span class="input-group-text">
                      <i class="bi bi-lock-fill"></i>
                    </span>
                    <input
                      id="confirmPassword"
                      v-model="form.confirmPassword"
                      :type="showConfirmPassword ? 'text' : 'password'"
                      class="form-control"
                      placeholder="Confirm your password"
                      required
                      :disabled="authStore.loading"
                      :class="{ 'is-invalid': form.confirmPassword && form.password !== form.confirmPassword }"
                    >
                    <button
                      type="button"
                      class="btn btn-outline-secondary"
                      @click="showConfirmPassword = !showConfirmPassword"
                    >
                      <i :class="showConfirmPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                    </button>
                  </div>
                  <div v-if="form.confirmPassword && form.password !== form.confirmPassword" class="invalid-feedback">
                    Passwords do not match.
                  </div>
                </div>

                <div class="mb-3 form-check">
                  <input
                    id="terms"
                    v-model="form.acceptTerms"
                    type="checkbox"
                    class="form-check-input"
                    required
                  >
                  <label class="form-check-label" for="terms">
                    I agree to the <a href="#" class="text-primary">Terms of Service</a> and <a href="#" class="text-primary">Privacy Policy</a>
                  </label>
                </div>

                <button
                  type="submit"
                  class="btn btn-primary w-100 mb-3"
                  :disabled="authStore.loading || !isFormValid"
                >
                  <span v-if="authStore.loading" class="spinner-border spinner-border-sm me-2"></span>
                  {{ authStore.loading ? 'Creating Account...' : 'Create Account' }}
                </button>
              </form>

              <!-- Login Link -->
              <div class="text-center" v-if="!showSuccess">
                <small class="text-muted">Already have an account?</small>
                <router-link to="/login" class="btn btn-outline-primary w-100 mt-2">
                  Sign In
                </router-link>
              </div>

              <!-- Back to Login (after success) -->
              <div class="text-center" v-else>
                <router-link to="/login" class="btn btn-primary w-100">
                  Back to Login
                </router-link>
              </div>
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
import { ref, reactive, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

// Form state
const form = reactive({
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false
})

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const showSuccess = ref(false)

// Computed
const isFormValid = computed(() => {
  return form.email && 
         form.password && 
         form.password.length >= 6 && 
         form.password === form.confirmPassword && 
         form.acceptTerms
})

// Methods
const handleRegister = async () => {
  if (!isFormValid.value) return

  try {
    await authStore.signUp(form.email, form.password)
    showSuccess.value = true
    
    // Reset form
    Object.assign(form, {
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false
    })
  } catch (error) {
    console.error('Registration error:', error)
  }
}
</script>
