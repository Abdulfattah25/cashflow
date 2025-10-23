<template>
  <div class="reset-password-container">
    <div class="container">
      <div class="row justify-content-center align-items-center min-vh-100 py-5">
        <div class="col-lg-5 col-md-7 col-sm-9">
          <div class="reset-password-card">
            <!-- Logo & Title -->
            <div class="text-center mb-4">
              <div class="logo-circle mb-3 mx-auto">
                <i class="bi bi-shield-lock-fill"></i>
              </div>
              <h2 class="fw-bold mb-2">Reset Password</h2>
              <p class="text-muted mb-0">Masukkan password baru Anda</p>
            </div>

            <!-- Error Message -->
            <div v-if="error" class="alert alert-danger alert-modern" role="alert">
              <i class="bi bi-exclamation-triangle me-2"></i>
              {{ error }}
            </div>

            <!-- Success Message -->
            <div v-if="success" class="alert alert-success alert-modern" role="alert">
              <i class="bi bi-check-circle me-2"></i>
              Password berhasil diubah! Redirecting ke login...
            </div>

            <!-- Reset Password Form -->
            <form v-if="!success" @submit.prevent="handleResetPassword" class="reset-form">
              <!-- Password Baru -->
              <div class="mb-3">
                <label class="form-label fw-semibold">Password Baru</label>
                <div class="input-wrapper">
                  <span class="input-icon">
                    <i class="bi bi-lock"></i>
                  </span>
                  <input
                    :type="showPassword ? 'text' : 'password'"
                    class="form-control form-control-modern"
                    v-model="newPassword"
                    placeholder="Masukkan password baru"
                    required
                    minlength="6"
                  />
                  <button
                    type="button"
                    class="toggle-password"
                    @click="showPassword = !showPassword"
                    tabindex="-1"
                  >
                    <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                  </button>
                </div>
                <small class="text-muted">Minimal 6 karakter</small>
              </div>

              <!-- Konfirmasi Password -->
              <div class="mb-4">
                <label class="form-label fw-semibold">Konfirmasi Password</label>
                <div class="input-wrapper">
                  <span class="input-icon">
                    <i class="bi bi-lock-fill"></i>
                  </span>
                  <input
                    :type="showConfirmPassword ? 'text' : 'password'"
                    class="form-control form-control-modern"
                    v-model="confirmPassword"
                    placeholder="Konfirmasi password baru"
                    required
                    minlength="6"
                  />
                  <button
                    type="button"
                    class="toggle-password"
                    @click="showConfirmPassword = !showConfirmPassword"
                    tabindex="-1"
                  >
                    <i :class="showConfirmPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                  </button>
                </div>
              </div>

              <!-- Submit Button -->
              <button
                type="submit"
                class="btn btn-gradient-auth w-100 py-3 mb-3 fw-semibold"
                :disabled="loading"
              >
                <span v-if="!loading">
                  <i class="bi bi-shield-check me-2"></i>
                  Reset Password
                </span>
                <span v-else>
                  <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                  Memproses...
                </span>
              </button>
            </form>

            <!-- Back to Login -->
            <div class="text-center mt-4">
              <a
                @click.prevent="handleBackToLogin"
                href="#"
                class="text-decoration-none text-primary fw-semibold"
                style="cursor: pointer"
              >
                <i class="bi bi-arrow-left me-2"></i>
                Kembali ke Login
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'

const router = useRouter()

const newPassword = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const loading = ref(false)
const error = ref('')
const success = ref(false)

const handleResetPassword = async () => {
  error.value = ''

  // Validasi
  if (newPassword.value.length < 6) {
    error.value = 'Password minimal 6 karakter'
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    error.value = 'Password tidak cocok'
    return
  }

  loading.value = true

  try {
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword.value,
    })

    if (updateError) throw updateError

    success.value = true

    if (window.showToast) {
      window.showToast('Password berhasil diubah!', 'success')
    }

    // Logout user setelah berhasil reset password
    await supabase.auth.signOut()

    // Tunggu sebentar untuk memastikan logout selesai dan state ter-update
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Redirect ke landing page (bukan dashboard)
    // Gunakan window.location untuk force reload dan clear semua state
    setTimeout(() => {
      window.location.href = '/'
    }, 1500)
  } catch (err) {
    error.value = err.message || 'Gagal mereset password'
    if (window.showToast) {
      window.showToast(error.value, 'danger')
    }
  } finally {
    loading.value = false
  }
}

// Handle back to login - logout session first
const handleBackToLogin = async () => {
  try {
    // Logout untuk menghapus session recovery
    await supabase.auth.signOut()
    router.push('/')
  } catch (err) {
    console.error('Error signing out:', err)
    router.push('/')
  }
}

// Check if we have a valid session from the reset link
onMounted(async () => {
  try {
    // Check for recovery token in URL hash
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const accessToken = hashParams.get('access_token')
    const type = hashParams.get('type')

    // If this is a recovery link, give Supabase time to process the session
    if (type === 'recovery' && accessToken) {
      // Wait a bit for Supabase to automatically set the session from hash
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    // Verify we have a valid session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      error.value = 'Link reset password tidak valid atau sudah kadaluarsa'
      setTimeout(() => {
        router.push('/')
      }, 3000)
    } else {
      // Clear the hash from URL for cleaner UX
      if (window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname)
      }
    }
  } catch (err) {
    console.error('Error checking session:', err)
    error.value = 'Terjadi kesalahan. Silakan coba lagi.'
  }
})
</script>

<style scoped>
/* Container dengan gradient sama seperti landing page */
.reset-password-container {
  min-height: 100vh;
  background: var(--gradient-green);
  display: flex;
  align-items: center;
  padding: 2rem 1rem;
}

/* Card dengan glass morphism effect */
.reset-password-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  padding: 3rem 2.5rem;
  width: 100%;
}

/* Logo circle dengan gradient */
.logo-circle {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: var(--gradient-green);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2.5rem;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 15px 40px rgba(102, 126, 234, 0.6);
  }
}

/* Typography */
h2 {
  color: #2d3748;
  font-size: 1.75rem;
}

.text-muted {
  color: #718096 !important;
}

/* Modern alerts */
.alert-modern {
  border-radius: 12px;
  border: none;
  padding: 1rem 1.25rem;
  font-size: 0.95rem;
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

/* Form styling */
.reset-form {
  margin-top: 2rem;
}

.form-label {
  color: #4a5568;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

/* Input wrapper with icon */
.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 1rem;
  color: #667eea;
  z-index: 10;
  font-size: 1.1rem;
}

.form-control-modern {
  padding: 0.875rem 1rem 0.875rem 3rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  background: white;
}

.form-control-modern:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
  outline: none;
}

.form-control-modern::placeholder {
  color: #a0aec0;
}

/* Toggle password button */
.toggle-password {
  position: absolute;
  right: 1rem;
  background: none;
  border: none;
  color: #718096;
  cursor: pointer;
  padding: 0.5rem;
  z-index: 10;
  transition: color 0.2s ease;
}

.toggle-password:hover {
  color: #667eea;
}

.toggle-password:focus {
  outline: none;
}

.btn-gradient-auth:active:not(:disabled) {
  transform: translateY(0);
}

.btn-gradient-auth:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Back to login link */
.text-primary {
  color: #667eea !important;
  transition: all 0.2s ease;
}

.text-primary:hover {
  color: #764ba2 !important;
  transform: translateX(-5px);
  display: inline-block;
}

/* Responsive */
@media (max-width: 576px) {
  .reset-password-card {
    padding: 2rem 1.5rem;
    border-radius: 20px;
  }

  .logo-circle {
    width: 75px;
    height: 75px;
    font-size: 2rem;
  }

  h2 {
    font-size: 1.5rem;
  }
}

/* Loading spinner animation */
.spinner-border {
  animation: spin 0.75s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
