<template>
  <div class="min-vh-100 d-flex align-items-center justify-content-center bg-light">
    <div class="container-fluid px-3">
      <div class="row justify-content-center">
        <div class="col-12 col-sm-10 col-md-6 col-lg-4">
          <div class="card shadow-lg border-0 login-card">
            <div class="card-body p-3 p-sm-4">
              <!-- Logo & Title -->
              <div class="text-center mb-4">
                <i class="bi bi-wallet2 text-primary logo-icon"></i>
                <h2 class="mt-2 mb-1 h4">Welcome Back</h2>
                <p class="text-muted small">Sign in to your account</p>
              </div>

              <!-- Error Alert -->
              <div v-if="authStore.error" class="alert alert-danger py-2 error-alert" role="alert">
                <i class="bi bi-exclamation-triangle me-2"></i>
                <small>{{ authStore.error }}</small>
              </div>

              <!-- Login Form -->
              <form @submit.prevent="handleLogin" novalidate>
                <!-- Email Field -->
                <div class="mb-3">
                  <label for="email" class="form-label small fw-medium">Email</label>
                  <div class="input-group">
                    <span class="input-group-text bg-light border-end-0">
                      <i class="bi bi-envelope text-muted"></i>
                    </span>
                    <input
                      id="email"
                      v-model="form.email"
                      type="email"
                      class="form-control form-control-lg border-start-0 px-2"
                      :class="{
                        'is-invalid': validation.email.error,
                        'is-valid': validation.email.valid && form.email,
                      }"
                      placeholder="Enter your email"
                      required
                      :disabled="authStore.loading"
                      @blur="validateEmail"
                      @input="clearEmailError"
                    />
                  </div>
                  <div v-if="validation.email.error" class="invalid-feedback d-block">
                    <small>{{ validation.email.message }}</small>
                  </div>
                </div>

                <!-- Password Field -->
                <div class="mb-3">
                  <label for="password" class="form-label small fw-medium">Password</label>
                  <div class="input-group">
                    <span class="input-group-text bg-light border-end-0">
                      <i class="bi bi-lock text-muted"></i>
                    </span>
                    <input
                      id="password"
                      v-model="form.password"
                      :type="showPassword ? 'text' : 'password'"
                      class="form-control form-control-lg border-start-0 border-end-0 px-2"
                      :class="{
                        'is-invalid': validation.password.error,
                        'is-valid': validation.password.valid && form.password,
                      }"
                      placeholder="Enter your password"
                      required
                      :disabled="authStore.loading"
                      @blur="validatePassword"
                      @input="clearPasswordError"
                      @keyup.enter="handleLogin"
                    />
                    <button
                      type="button"
                      class="input-group-text bg-light border-start-0 password-toggle"
                      @click="showPassword = !showPassword"
                      :disabled="authStore.loading"
                    >
                      <i
                        :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"
                        class="text-muted"
                      ></i>
                    </button>
                  </div>
                  <div v-if="validation.password.error" class="invalid-feedback d-block">
                    <small>{{ validation.password.message }}</small>
                  </div>
                </div>

                <!-- Remember Me -->
                <div class="mb-4 form-check">
                  <input
                    id="remember"
                    v-model="form.remember"
                    type="checkbox"
                    class="form-check-input"
                    @change="handleRememberChange"
                  />
                  <label class="form-check-label small" for="remember"> Remember my email </label>
                </div>

                <!-- Submit Button -->
                <button
                  type="submit"
                  class="btn btn-primary btn-lg w-100 mb-3 py-2 submit-btn"
                  :disabled="authStore.loading || !isFormValid"
                >
                  <span
                    v-if="authStore.loading"
                    class="spinner-border spinner-border-sm me-2"
                  ></span>
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
                class="btn btn-outline-primary btn-lg w-100 py-1 register-btn"
              >
                Create Account
              </router-link>
            </div>
          </div>

          <!-- Footer -->
          <div class="text-center mt-3">
            <small class="text-muted"> © 2025 CashFlow App. All rights reserved. </small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// Form state
const form = reactive({
  email: '',
  password: '',
  remember: false,
})

const showPassword = ref(false)

// Validation state
const validation = reactive({
  email: {
    error: false,
    valid: false,
    message: '',
  },
  password: {
    error: false,
    valid: false,
    message: '',
  },
})

// Computed
const isFormValid = computed(() => {
  return validation.email.valid && validation.password.valid && form.email && form.password
})

// Remember Me functionality
const REMEMBER_KEY = 'cashflow_remember_email'

const loadRememberedData = () => {
  const remembered = localStorage.getItem(REMEMBER_KEY)
  if (remembered) {
    try {
      const data = JSON.parse(remembered)
      form.email = data.email || ''
      form.remember = true
      if (form.email) {
        validateEmail()
      }
    } catch (error) {
      console.error('Error loading remembered data:', error)
      localStorage.removeItem(REMEMBER_KEY)
    }
  }
}

const saveRememberedData = () => {
  if (form.remember && form.email) {
    localStorage.setItem(
      REMEMBER_KEY,
      JSON.stringify({
        email: form.email,
        timestamp: Date.now(),
      }),
    )
  } else {
    localStorage.removeItem(REMEMBER_KEY)
  }
}

const handleRememberChange = () => {
  if (!form.remember) {
    localStorage.removeItem(REMEMBER_KEY)
  }
}

// Validation methods
const validateEmail = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!form.email) {
    validation.email.error = true
    validation.email.valid = false
    validation.email.message = 'Email is required'
  } else if (!emailRegex.test(form.email)) {
    validation.email.error = true
    validation.email.valid = false
    validation.email.message = 'Please enter a valid email address'
  } else {
    validation.email.error = false
    validation.email.valid = true
    validation.email.message = ''
  }
}

const validatePassword = () => {
  if (!form.password) {
    validation.password.error = true
    validation.password.valid = false
    validation.password.message = 'Password is required'
  } else if (form.password.length < 6) {
    validation.password.error = true
    validation.password.valid = false
    validation.password.message = 'Password must be at least 6 characters'
  } else {
    validation.password.error = false
    validation.password.valid = true
    validation.password.message = ''
  }
}

const clearEmailError = () => {
  if (validation.email.error) {
    validation.email.error = false
    validation.email.message = ''
  }
}

const clearPasswordError = () => {
  if (validation.password.error) {
    validation.password.error = false
    validation.password.message = ''
  }
}

// Methods
const handleLogin = async () => {
  // Validate all fields before submit
  validateEmail()
  validatePassword()

  if (!isFormValid.value) {
    return
  }

  try {
    // Save remember me data before login attempt
    saveRememberedData()

    await authStore.signIn(form.email, form.password)
    router.push('/')
  } catch (error) {
    console.error('Login error:', error)
  }
}

// Lifecycle
onMounted(() => {
  loadRememberedData()
})
</script>

<style scoped>
.login-card {
  border-radius: 1rem;
  transition: transform 0.2s ease-in-out;
}

.login-card:hover {
  transform: translateY(-2px);
}

.logo-icon {
  font-size: 2.5rem;
  transition: color 0.3s ease;
}

.submit-btn {
  transition: all 0.3s ease;
  border-radius: 0.5rem;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(13, 110, 253, 0.3);
}

.register-btn {
  transition: all 0.3s ease;
  border-radius: 0.5rem;
}

.register-btn:hover {
  transform: translateY(-1px);
}

.password-toggle {
  transition: all 0.2s ease;
}

.password-toggle:hover:not(:disabled) {
  background-color: #f8f9fa;
}

.error-alert {
  border-radius: 0.5rem;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.form-control {
  transition: all 0.2s ease;
}

.form-control:focus {
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.15);
}

.invalid-feedback {
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Mobile responsiveness */
@media (max-width: 576px) {
  .login-card {
    margin: 1rem;
  }

  .logo-icon {
    font-size: 2rem;
  }
}
</style>
